# Async Operations

Working with Promises and async/await in Result chains.

## AsyncResult Type

Result that resolves to a Promise:

```typescript
type AsyncResult<T, E> = Promise<Result<T, E>>
```

## Creating Async Results

### fromPromise()

Wrap Promises that might reject:

```typescript
const user = await Result.fromPromise(
  () => fetch('/api/user').then(r => r.json())
)

if (user.isOk()) {
  console.log(user.unwrap())
}
```

With custom error handling:

```typescript
type NetworkError = { type: 'network'; status?: number }

const data = await Result.fromPromise(
  () => fetch('/api/data').then(r => r.json()),
  (err): NetworkError => ({
    type: 'network',
    status: err instanceof Response ? err.status : undefined
  })
)
```

With async function:

```typescript
const result = await Result.fromPromise(async () => {
  const response = await fetch('/api/data')
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
})
```

## Async Transformations

### mapAsync()

Transform values asynchronously:

```typescript
await Result.ok(userId)
  .mapAsync(async (id) => await fetchUser(id))

// Auto-flattens if mapper returns Result
await Result.ok(input)
  .mapAsync(async (x) => {
    const result = await validate(x)
    return result ? Result.ok(x) : Result.err('invalid')
  })
```

### mapErrAsync()

Transform errors asynchronously:

```typescript
await result.mapErrAsync(async (error) => ({
  ...error,
  context: await fetchContext(),
  timestamp: Date.now()
}))
```

### mapOrAsync()

Transform with fallback:

```typescript
const value = await Result.ok(5)
  .mapOrAsync(
    async (x) => await expensiveComputation(x),
    defaultValue
  )
```

## Async Chaining

### andThenAsync()

Chain async operations:

```typescript
await Result.ok(userId)
  .andThenAsync(async (id) => {
    const user = await fetchUser(id)
    return user ? Result.ok(user) : Result.err('not found')
  })
  .then(r => r.andThenAsync(async (user) => {
    await validateUser(user)
    return Result.ok(user)
  }))
```

### orElseAsync()

Async error recovery:

```typescript
await result
  .orElseAsync(async () => await fetchFromCache())
  .then(r => r.orElseAsync(async () => await fetchFromAPI()))
```

### andAsync() / orAsync()

Work with Promises directly:

```typescript
const nextOp = asyncOperationReturningResult()

await result
  .andAsync(nextOp)       // If Ok, return Promise
  .orAsync(nextOp)        // If Err, return Promise
```

## Parallel Operations

### Multiple Independent Operations

```typescript
async function loadDashboard(userId: string) {
  const results = await Promise.all([
    fetchUser(userId),
    fetchPosts(userId),
    fetchNotifications(userId)
  ])

  return Result.all(results).map(([user, posts, notifs]) => ({
    user, posts, notifs
  }))
}
```

### Collect All Without Failing

```typescript
const settled = Result.allSettled([
  fetchUser(id),
  fetchPosts(id),
  fetchComments(id)
]).unwrap()

settled.forEach((result) => {
  if (result.status === 'ok') {
    process(result.value)
  } else {
    logError(result.reason)
  }
})
```

## Real-World Pipeline

Complex async workflow:

```typescript
async function processUserRegistration(
  formData: FormData
): AsyncResult<User, RegistrationError> {
  return Result.ok(formData)
    // Validate locally
    .andThen((data) => validateForm(data))
    
    // Check if user exists (async)
    .andThenAsync(async (data) => {
      const exists = await checkUserExists(data.email)
      return exists 
        ? Result.err({ type: 'user_exists' })
        : Result.ok(data)
    })
    
    // Hash password (async)
    .andThenAsync(async (data) => {
      const hash = await bcrypt.hash(data.password)
      return Result.ok({ ...data, password: hash })
    })
    
    // Create user in database (async)
    .andThenAsync(async (data) => {
      const user = await db.users.create(data)
      return user ? Result.ok(user) : Result.err({ type: 'db_error' })
    })
    
    // Send welcome email (side effect)
    .inspectAsync(async (user) => {
      await mailer.sendWelcomeEmail(user.email)
    })
}
```

## Retry with Exponential Backoff

```typescript
async function fetchWithRetry<T>(
  url: string,
  maxRetries: number = 3
): AsyncResult<T, Error> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const result = await Result.fromPromise(
      () => fetch(url).then(r => r.json())
    )

    if (result.isOk()) return result

    if (attempt < maxRetries - 1) {
      const delay = Math.pow(2, attempt) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  return Result.err(new Error('Max retries exceeded'))
}
```

## Error Handling with Abort Signals

```typescript
async function fetchWithTimeout(
  url: string,
  timeout: number = 5000
): AsyncResult<any, Error> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const result = await Result.fromPromise(() =>
      fetch(url, { signal: controller.signal }).then(r => r.json())
    )
    clearTimeout(id)
    return result
  } catch (error) {
    clearTimeout(id)
    return Result.err(new Error('Request timeout'))
  }
}
```

## Mixing Sync and Async

```typescript
Result.ok(data)
  .map(parseJSON)                    // Sync
  .andThenAsync(async (d) => {       // Async
    const valid = await validate(d)
    return valid ? Result.ok(d) : Result.err('invalid')
  })
  .then(r => r.mapErr(enrichError))  // Back to sync
  .then(r => r.orElseAsync(async () => {  // Async again
    return Result.ok(await fetchDefault())
  }))
```

## Common Pitfalls

### Forgetting await

```typescript
// ✗ Wrong: result is Promise<Result>, not Result
const result = operation().mapAsync(async x => x * 2)
console.log(result.unwrap())

// ✓ Correct: await to get Result
const result = await operation().mapAsync(async x => x * 2)
console.log(result.unwrap())
```

### Not returning Result

```typescript
// ✗ Wrong: andThenAsync expects Result return
.andThenAsync(async x => x * 2)

// ✓ Correct: return Result
.andThenAsync(async x => Result.ok(x * 2))
```

## Best Practices

1. Always `await` async Result methods
2. Use `fromPromise()` to wrap Promises
3. Chain with `andThenAsync()` for sequential async ops
4. Use `Promise.all()` for parallel operations
5. Add timeouts for network requests
6. Retry with backoff for flaky operations
7. Log all failures for debugging
8. Use `inspectErr()` for side effects

## Next Steps

- **[Error Handling](./error-handling.md)** — Recovery strategies
- **[Best Practices](../advanced/best-practices.md)** — General recommendations
