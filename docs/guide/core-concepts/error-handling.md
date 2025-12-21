# Error Handling

Comprehensive strategies for handling and recovering from errors.

## Core Strategies

### Fail-Fast: Stop at First Error

Use when validations are sequential and interdependent:

```typescript
// Later steps depend on earlier ones
const result = Result.all([
  validateStructure(data),
  validateReferences(data),
  validateBusiness(data)
])

if (result.isErr()) {
  return result // First error only
}

const [struct, refs, biz] = result.unwrap()
```

**When to use:**

- Validation pipelines with dependencies
- Early termination on critical failure
- Chaining with `andThen()`

### Collect All Errors

Gather all errors independently:

```typescript
// Validations are independent
const errors: ValidationError[] = []

const emailResult = validateEmail(data.email)
if (emailResult.isErr()) errors.push(emailResult.unwrapErr())

const passwordResult = validatePassword(data.password)
if (passwordResult.isErr()) errors.push(passwordResult.unwrapErr())

const ageResult = validateAge(data.age)
if (ageResult.isErr()) errors.push(ageResult.unwrapErr())

return errors.length > 0 
  ? Result.err(errors) 
  : Result.ok({ email: data.email, password: data.password, age: data.age })
```

**When to use:**

- Form validation (show all errors at once)
- Independent field validation
- Batch processing

### Status Gathering: Never Fail

Collect status of all operations:

```typescript
const settled = Result.allSettled([
  operation1(),
  operation2(),
  operation3()
]).unwrap()

// [
//   { status: 'ok', value: result1 },
//   { status: 'err', reason: errorDetails },
//   { status: 'ok', value: result3 }
// ]

const successes = settled.filter(r => r.status === 'ok')
const failures = settled.filter(r => r.status === 'err')
```

**When to use:**

- Batch processing with reporting
- Monitoring all operations
- Performance analysis

## Error Recovery

### Basic Fallback Chain

```typescript
// Try multiple sources in priority order
fetchFromCache(key)
  .orElse(() => fetchFromDatabase(key))
  .orElse(() => fetchFromAPI(key))
  .unwrapOr(defaultData)
```

### Async Fallback Chain

```typescript
async function getUserData(userId: string): AsyncResult<User, ApiError> {
  return (await fetchFromCache(userId))
    .orElseAsync(() => fetchFromDatabase(userId))
    .orElseAsync(() => fetchFromAPI(userId))
}
```

### Conditional Recovery

Recover based on error type:

```typescript
operation()
  .orElse((error) => {
    if (error.code === 404) {
      // Not found — return default
      return Result.ok(defaultValue)
    }
    if (error.code === 500) {
      // Server error — propagate
      return Result.err(error)
    }
    // Other errors — return null
    return Result.ok(null)
  })
```

### Error-Specific Fallback

```typescript
fetchUser(id)
  .orElse((error) => {
    switch (error.code) {
      case 'NOT_FOUND':
        return fetchUserFromBackup(id)
      case 'PERMISSION_DENIED':
        return Result.ok({ id: 'anonymous', name: 'Guest' })
      case 'TIMEOUT':
        return fetchUser(id) // Retry
      default:
        return Result.err(error)
    }
  })
```

## Providing Defaults

### Static Default

```typescript
const value = result.unwrapOr(defaultValue)

// Examples
const port = getPort().unwrapOr(3000)
const timeout = getTimeout().unwrapOr(5000)
const items = fetchItems().unwrapOr([])
```

### Computed Default from Error

```typescript
const value = result.unwrapOrElse((error) => {
  console.log('Error:', error)
  return defaultValue
})

// Based on error type
result.unwrapOrElse((error) => {
  if (error.code === 404) return []
  if (error.code === 500) throw error
  return defaultValue
})
```

## Logging and Inspection

Inspect errors without modifying the Result:

```typescript
operation()
  .inspectErr((error) => {
    logger.error('Operation failed:', error)
    metrics.increment('operation.error')
  })
  .orElse(() => {
    logger.info('Attempting recovery...')
    return attemptRecovery()
  })
```

## Retry with Exponential Backoff

```typescript
async function retryWithBackoff<T, E>(
  fn: () => AsyncResult<T, E>,
  maxRetries: number = 3,
  backoff: number = 1000
): AsyncResult<T, E> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const result = await fn()
    
    if (result.isOk()) {
      return result
    }

    if (attempt < maxRetries - 1) {
      const delay = backoff * Math.pow(2, attempt)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  return Result.err(...)
}
```

## Error Transformation

Add context or normalize errors:

```typescript
// Generic error loses context
fetchUser(id).mapErr(e => new Error('Failed'))

// Better: Add context
fetchUser(id).mapErr(err => ({
  ...err,
  context: { userId: id, timestamp: Date.now() }
}))

// Standard structure
result.mapErr(err => ({
  type: 'api_error',
  status: err.statusCode || 500,
  message: err.message || 'Unknown error',
  userId: id
}))
```

## Real-World Example

```typescript
async function loadUserData(userId: string): AsyncResult<UserData, AppError> {
  return (await fetchFromCache(userId))
    // Cache first
    .orElseAsync(async () => {
      // Cache miss — try database
      return fetchFromDatabase(userId)
    })
    .orElseAsync(async (dbError) => {
      // DB failure — try API with retry
      return retryWithBackoff(() => fetchFromAPI(userId))
    })
    .inspectErr((error) => {
      // Log all fallthrough errors
      logger.error('Failed to load user data', { userId, error })
    })
    .orElse(() => {
      // All sources failed — return cached default
      return Result.ok(getCachedDefault(userId))
    })
}
```

## Best Practices

1. Use `orElse()` for recoverable errors
2. Log each failure in recovery chain
3. Be specific about which errors to recover
4. Avoid infinite loops in recovery
5. Use exponential backoff for retries
6. Track failures for monitoring
7. Provide sensible defaults

## Comparison: When to Use Each Strategy

| Strategy | Best For | Example |
|----------|----------|---------|
| **Fail-Fast** | Dependent operations | Validation pipeline |
| **Collect All** | Independent validations | Form fields |
| **Status Gathering** | Batch processing | Import 100 records |
| **Fallback Chain (orElse)** | Sequential sources | Cache → DB → API |
| **Parallel Try (any)** | Multiple independent sources | Retry servers |
| **Conditional Recovery** | Error-specific handling | Retry on timeout |
| **Logging** | Debugging and monitoring | All operations |

## Next Steps

- **[Operation Chaining](./chaining.md)** — Chain operations
- **[Async Operations](./async.md)** — Work with Promises
