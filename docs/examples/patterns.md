# Common Patterns

## Error Accumulation vs. Fail-Fast

### Accumulate All Errors

Collect errors from all validations before returning:

```typescript
type ValidationError = { field: string; message: string }

function validateForm(data: FormData): Result<ValidatedForm, ValidationError[]> {
  const errors: ValidationError[] = []

  if (!data.name?.trim()) {
    errors.push({ field: 'name', message: 'Name is required' })
  }
  if (!data.email?.includes('@')) {
    errors.push({ field: 'email', message: 'Invalid email' })
  }
  if (data.age < 18) {
    errors.push({ field: 'age', message: 'Must be 18 or older' })
  }

  return errors.length > 0 ? Result.err(errors) : Result.ok(data)
}

// Usage: show all errors at once
const result = validateForm(formData)
result.match({
  ok: (validated) => submitForm(validated),
  err: (errors) => errors.forEach(e => displayError(e.field, e.message))
})
```

### Fail-Fast Pattern

Stop at the first error. Use when later validations depend on earlier ones:

```typescript
function validateUser(data: any): Result<User, ValidationError> {
  return Result.ok(data)
    .andThen((d) => validateEmail(d.email).map(() => d))
    .andThen((d) => validatePassword(d.password).map(() => d))
    .map((d) => ({ email: d.email, password: d.password }))
}

// Usage: stop and show first error
const result = validateUser(data)
if (result.isErr()) {
  showError(result.unwrapErr().message)
}
```

## Chaining Async Operations

### Sequential (One After Another)

```typescript
async function processUser(id: string): AsyncResult<ProcessedUser, Error> {
  return (await fetchUser(id))
    .andThenAsync(async (user) => {
      const profile = await enrichUserProfile(user)
      return Result.ok(profile)
    })
    .andThenAsync(async (profile) => {
      await saveToCache(profile)
      return Result.ok(profile)
    })
}
```

### Parallel (All at Once)

```typescript
interface UserDashboard {
  user: User
  posts: Post[]
  followers: User[]
}

async function loadDashboard(userId: string): AsyncResult<UserDashboard, Error> {
  const results = await Promise.all([
    fetchUser(userId),
    fetchPosts(userId),
    fetchFollowers(userId)
  ])

  return Result.all(results).map(([user, posts, followers]) => ({
    user,
    posts,
    followers
  }))
}
```

## Retry Logic

```typescript
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; delayMs?: number } = {}
): AsyncResult<T, Error> {
  const maxRetries = options.maxRetries ?? 3
  const delayMs = options.delayMs ?? 1000

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const result = await Result.fromPromise(fn)

    if (result.isOk()) {
      return result
    }

    if (attempt < maxRetries - 1) {
      const backoff = delayMs * Math.pow(2, attempt)
      await new Promise((resolve) => setTimeout(resolve, backoff))
    }
  }

  return Result.err(new Error('Max retries exceeded'))
}

// Usage
const result = await fetchWithRetry(() => fetch('/api/data').then(r => r.json()), {
  maxRetries: 3,
  delayMs: 500
})
```

## Error Recovery with Fallbacks

```typescript
async function getUserData(userId: string): AsyncResult<User, Error> {
  return (await fetchUser(userId))
    .orElseAsync(() => {
      console.log('Primary failed, trying cache...')
      return getFromCache(userId)
    })
    .orElseAsync(() => {
      console.log('Cache failed, trying backup API...')
      return fetchUserFromBackup(userId)
    })
}

// Usage: Try primary → cache → backup
const result = await getUserData('123')
result.match({
  ok: (user) => console.log('Got user:', user),
  err: (error) => console.error('All sources failed:', error)
})
```

## Batch Processing

```typescript
async function processMany<T, E>(
  items: string[],
  processor: (id: string) => AsyncResult<T, E>
): Promise<{ success: T[]; errors: E[] }> {
  const results = await Promise.all(items.map(processor))
  const [success, errors] = Result.partition(results)
  
  return { success, errors }
}

// Usage
const { success, errors } = await processMany(
  ['1', '2', '3', 'invalid'],
  (id) => fetchUser(id)
)

console.log(`Processed: ${success.length} success, ${errors.length} failed`)
```

## Custom Error Types

```typescript
type ApiError = 
  | { type: 'not_found'; resource: string }
  | { type: 'validation'; field: string; message: string }
  | { type: 'unauthorized' }

async function fetchUser(id: string): AsyncResult<User, ApiError> {
  const response = await fetch(`/api/users/${id}`)

  if (response.status === 404) {
    return Result.err({ type: 'not_found', resource: 'user' })
  }
  if (response.status === 401) {
    return Result.err({ type: 'unauthorized' })
  }
  if (!response.ok) {
    return Result.err({ type: 'validation', field: 'id', message: 'Invalid' })
  }

  return Result.ok(await response.json())
}

// Usage with exhaustive checking
const result = await fetchUser('123')
result.match({
  ok: (user) => renderUser(user),
  err: (error) => {
    switch (error.type) {
      case 'not_found':
        showNotFound(error.resource)
        break
      case 'unauthorized':
        redirectToLogin()
        break
      case 'validation':
        showFieldError(error.field, error.message)
        break
    }
  }
})
```

## Side Effects with `inspect`

Use `inspect` or `inspectAsync` to run code without changing the result:

```typescript
const result = await fetchUser('123')
  .inspect((user) => {
    console.log('Fetched user:', user)
  })
  .inspectAsync(async (user) => {
    await logToAnalytics(user.id)
  })
  .map((user) => user.email)

// The result still contains the email, not the user object
```

## Mapping Error Types

Transform errors when passing through layers:

```typescript
type DomainError = { code: string; message: string }

async function getUserEmail(id: string): AsyncResult<string, DomainError> {
  return (await fetchUser(id))
    .map((user) => user.email)
    .mapErr((apiError) => ({
      code: 'USER_FETCH_FAILED',
      message: String(apiError)
    }))
}
```
