# Validation & Access

Methods for checking Result state and extracting values.

## State Checking

### `isOk()`

Checks if Result is Ok variant.

```typescript
isOk(): this is Ok<T, never>
```

**Examples:**

```typescript
const result = Result.ok(42)
if (result.isOk()) {
  console.log(result.unwrap()) // 42
}

// Type guard
function process(result: ResultType<number, string>) {
  if (result.isOk()) {
    // TypeScript knows result is Ok<number>
    const value: number = result.unwrap()
  }
}
```

### `isErr()`

Checks if Result is Err variant.

```typescript
isErr(): this is Err<never, E>
```

**Examples:**

```typescript
const result = Result.err('failed')
if (result.isErr()) {
  console.log(result.unwrapErr()) // 'failed'
}

// Type guard
function handle(result: ResultType<User, ApiError>) {
  if (result.isErr()) {
    // TypeScript knows result is Err<ApiError>
    logError(result.unwrapErr())
  }
}
```

### `isOkAnd(predicate)`

Checks if Ok AND value satisfies predicate.

```typescript
isOkAnd(predicate: (value: T) => boolean): this is Ok<T, never>
```

**Examples:**

```typescript
Result.ok(10).isOkAnd((x) => x > 5)  // true
Result.ok(3).isOkAnd((x) => x > 5)   // false
Result.err('fail').isOkAnd((x) => x > 5) // false

// Conditional handling
if (result.isOkAnd((user) => user.isActive)) {
  // User exists AND is active
  console.log('Active user')
}

// Complex validation
if (result.isOkAnd((value) => 
  value > 0 && value < 100 && value % 2 === 0
)) {
  console.log('Valid even number')
}
```

### `isErrAnd(predicate)`

Checks if Err AND error satisfies predicate.

```typescript
isErrAnd(predicate: (error: E) => boolean): this is Err<never, E>
```

**Examples:**

```typescript
const err = Result.err(new Error('not found'))
err.isErrAnd((e) => e.message.includes('not')) // true

// Checking error type
if (result.isErrAnd((e) => e.code === 404)) {
  console.log('Resource not found')
}

// Error filtering
if (result.isErrAnd((e) => e.severity === 'critical')) {
  alertAdmin(result.unwrapErr())
}
```

## Value Access

### `ok` property

Read-only property for safe value access.

```typescript
readonly ok: T | null
```

**Examples:**

```typescript
const result = Result.ok(42)
console.log(result.ok) // 42

const error = Result.err('fail')
console.log(error.ok) // null

// Safe access without throwing
const value = result.ok ?? defaultValue
```

### `err` property

Read-only property for safe error access.

```typescript
readonly err: E | null
```

**Examples:**

```typescript
const result = Result.err('failed')
console.log(result.err) // 'failed'

const success = Result.ok(42)
console.log(success.err) // null

// Safe error logging
if (result.err) {
  logger.error(result.err)
}
```

### `unwrap()`

Extracts success value or throws.

```typescript
unwrap(): T
```

**Throws:** Error if called on Err

**Examples:**

```typescript
Result.ok(42).unwrap() // 42
Result.err('fail').unwrap() // ❌ throws Error

// After checking
if (result.isOk()) {
  const value = result.unwrap() // Safe
}

// In tests
expect(result.unwrap()).toBe(42)
```

### `unwrapErr()`

Extracts error value or throws.

```typescript
unwrapErr(): E
```

**Throws:** Error if called on Ok

**Examples:**

```typescript
Result.err('failed').unwrapErr() // 'failed'
Result.ok(42).unwrapErr() // ❌ throws Error

// After checking
if (result.isErr()) {
  const error = result.unwrapErr() // Safe
  handleError(error)
}
```

### `expect(message)`

Extracts value with custom error message.

```typescript
expect(message: string): T
```

**Throws:** Error with custom message if Err

**Examples:**

```typescript
Result.ok(42).expect('should exist') // 42

Result.err('fail').expect('User must exist')
// ❌ throws Error("User must exist", { cause: "fail" })

// Descriptive errors
const user = getUser(id).expect(`User ${id} must exist`)
const config = loadConfig().expect('Config file is required')
```

### `expectErr(message)`

Extracts error with custom message.

```typescript
expectErr(message: string): E
```

**Throws:** Error with custom message if Ok

**Examples:**

```typescript
Result.err('fail').expectErr('should be error') // 'fail'

Result.ok(42).expectErr('Expected failure')
// ❌ throws Error("Expected failure: 42")

// In tests
const error = result.expectErr('Operation should have failed')
expect(error.code).toBe(404)
```

## Recovery

### `unwrapOr(defaultValue)`

Extracts value or returns default.

```typescript
unwrapOr(defaultValue: T): T
```

**Examples:**

```typescript
Result.ok(42).unwrapOr(0) // 42
Result.err('fail').unwrapOr(0) // 0

// Configuration with fallback
const port = getPort().unwrapOr(3000)
const timeout = getTimeout().unwrapOr(5000)

// Array operations
const items = fetchItems().unwrapOr([])
```

### `unwrapOrElse(onError)`

Computes default from error.

```typescript
unwrapOrElse(onError: (error: E) => T): T
```

**Examples:**

```typescript
Result.err('not found').unwrapOrElse((e) => {
  console.log('Error:', e)
  return 0
})

// Recovery based on error type
result.unwrapOrElse((error) => {
  if (error.code === 404) return []
  if (error.code === 500) throw error
  return defaultValue
})

// Logging and fallback
const data = fetchData().unwrapOrElse((err) => {
  logger.error('Fetch failed:', err)
  metrics.increment('fetch.error')
  return cachedData
})
```

## Pattern Matching

### `match(handlers)`

Pattern matching on Result state.

```typescript
match<L, R>(handlers: {
  ok: (value: T) => L
  err: (error: E) => R
}): L | R
```

**Examples:**

```typescript
const msg = Result.ok(5).match({
  ok: (x) => `Success: ${x * 2}`,
  err: (e) => `Error: ${e}`
})
// "Success: 10"

// React components
return result.match({
  ok: (user) => <UserProfile user={user} />,
  err: (error) => <ErrorMessage error={error} />
})

// HTTP responses
return result.match({
  ok: (data) => res.json(data),
  err: (error) => res.status(error.code).json({ error })
})

// Specific error handling
result.match({
  ok: (data) => processData(data),
  err: (error) => {
    if (error.code === 404) return showNotFound()
    if (error.code === 500) return showServerError()
    return showGenericError()
  }
})
```

## Inspection

### `inspect(visitor)`

Performs side effect on success value.

```typescript
inspect(visitor: (value: T) => void): ResultType<T, E>
```

**Examples:**

```typescript
Result.ok(42)
  .inspect((x) => console.log('value:', x))
  .map((x) => x * 2)
// logs "value: 42", returns Ok(84)

// Debug pipeline
fetchUser(id)
  .inspect((user) => console.log('user loaded'))
  .andThen(validateUser)
  .inspect((user) => console.log('user validated'))
  .andThen(saveUser)

// Metrics
result
  .inspect((value) => metrics.increment('success'))
  .inspectErr((error) => metrics.increment('error'))
```

### `inspectErr(visitor)`

Performs side effect on error.

```typescript
inspectErr(visitor: (error: E) => void): ResultType<T, E>
```

**Examples:**

```typescript
Result.err('fail')
  .inspectErr((e) => console.error('Error:', e))
  .mapErr((e) => new Error(e))

// Logging and monitoring
fetchUser(id)
  .inspectErr((error) => {
    logger.error('Failed to fetch user', { userId: id, error })
    metrics.increment('user.fetch.error')
  })

// Debug errors
result
  .inspectErr(console.error)
  .orElse(() => fetchFromBackup())
```

## Comparison

### `contains(value, comparator?)`

Checks if Ok contains specific value.

```typescript
contains(
  value: T,
  comparator?: (actual: T, expected: T) => boolean
): boolean
```

**Examples:**

```typescript
Result.ok(42).contains(42) // true
Result.ok(42).contains(99) // false
Result.err('fail').contains(42) // false

// With comparator for objects
Result.ok({ id: 1 }).contains(
  { id: 1 },
  (a, b) => a.id === b.id
) // true

// Complex comparisons
Result.ok(user).contains(
  expectedUser,
  (a, b) => a.id === b.id && a.email === b.email
)
```

### `containsErr(error, comparator?)`

Checks if Err contains specific error.

```typescript
containsErr(
  error: E,
  comparator?: (actual: E, expected: E) => boolean
): boolean
```

**Examples:**

```typescript
Result.err('fail').containsErr('fail') // true
Result.err('fail').containsErr('other') // false
Result.ok(42).containsErr('fail') // false

// With comparator
Result.err({ code: 500 }).containsErr(
  { code: 500 },
  (a, b) => a.code === b.code
) // true

// Error type checking
if (result.containsErr({ type: 'NetworkError' }, (a, b) => a.type === b.type)) {
  retryRequest()
}
```

## Summary

| Method | Ok Behavior | Err Behavior |
|--------|-------------|--------------|
| `isOk()` | Returns true | Returns false |
| `isErr()` | Returns false | Returns true |
| `isOkAnd(pred)` | Checks predicate | Returns false |
| `isErrAnd(pred)` | Returns false | Checks predicate |
| `unwrap()` | Returns value | Throws |
| `unwrapErr()` | Throws | Returns error |
| `unwrapOr(def)` | Returns value | Returns default |
| `match()` | Calls ok handler | Calls err handler |
| `inspect(fn)` | Calls function | No-op |
| `inspectErr(fn)` | No-op | Calls function |
