# Operation Chaining

Composing operations into clean, readable pipelines.

## The Chaining Pattern

Execute a sequence of operations that can fail. Execution stops at the first error:

```typescript
const result = Result.ok(userData)
  .andThen(validateEmail)      // Can fail
  .andThen(checkPermissions)   // Can fail
  .andThen(saveToDatabase)     // Can fail
  .mapErr(logError)            // Transform error if it occurs

// If any step fails, remaining steps are skipped
```

## Core Methods

### map() - Transform Success Values

Transform without returning a Result:

```typescript
Result.ok(5)
  .map(x => x * 2)        // Ok(10)
  .map(x => x + 5)        // Ok(15)
  .filter(x => x > 10)    // Ok(15)
  .unwrap()               // 15
```

### andThen() - Chain Results

Use when each operation returns a Result:

```typescript
function divide(a: number, b: number): Result<number, string> {
  return b === 0 
    ? Result.err('division by zero') 
    : Result.ok(a / b)
}

Result.ok(100)
  .andThen(x => divide(x, 2))  // Ok(50)
  .andThen(x => divide(x, 5))  // Ok(10)
  .andThen(x => divide(x, 0))  // Err('division by zero')
  .unwrapOr(0)                 // 0
```

### orElse() - Recover from Error

Execute recovery when error occurs:

```typescript
fetchFromCache(key)
  .orElse(() => fetchFromDatabase(key))
  .orElse(() => fetchFromAPI(key))
  .unwrapOr(defaultData)
```

Conditional recovery:

```typescript
operation()
  .orElse((error) => {
    if (error.code === 404) return Result.ok(defaultValue)
    if (error.code === 500) return Result.err(error) // Re-throw
    return Result.ok(null)
  })
```

## Real-World Pipeline

User registration with validation:

```typescript
async function registerUser(formData: FormData): AsyncResult<User, AppError> {
  return Result.ok(formData)
    // Validate
    .andThen((data) => validateForm(data))
    
    // Check if user exists
    .andThenAsync(async (data) => {
      const exists = await userExists(data.email)
      return exists 
        ? Result.err({ type: 'user_exists' })
        : Result.ok(data)
    })
    
    // Hash password
    .andThenAsync(async (data) => {
      const hash = await hashPassword(data.password)
      return Result.ok({ ...data, password: hash })
    })
    
    // Save to database
    .andThenAsync(async (data) => {
      const user = await db.createUser(data)
      return user ? Result.ok(user) : Result.err({ type: 'db_error' })
    })
}
```

## Filtering Values

### filter() - With Default Error

Filter Ok value based on predicate. Returns Ok if passes, converts to Err if fails with default error:

```typescript
Result.ok(10).filter((x) => x > 5)
// Ok(10)

Result.ok(3).filter((x) => x > 5)
// Err(Error: Filter predicate failed for value: 3)
```

### filter() - With Custom Error

Filter Ok value with custom error message on rejection:

```typescript
Result.ok(3).filter(
  (x) => x > 5,
  (x) => new Error(`${x} is too small`)
)
// Err(Error: 3 is too small)

// With custom error type
type ValidationError = { field: string; message: string }

Result.ok(-5).filter(
  (x) => x > 0,
  (x): ValidationError => ({ 
    field: 'age', 
    message: `Age must be positive, got ${x}` 
  })
)
// Err({ field: 'age', message: 'Age must be positive, got -5' })
```

## Filtering in Chains

Combine multiple filters:

```typescript
Result.ok(15)
  .filter((x) => x > 0)        // Ok(15)
  .filter((x) => x < 100)      // Ok(15)
  .filter(
    (x) => x % 2 === 0,
    (x) => `${x} is not even`
  )
// Err(`15 is not even`)
```

## filter() vs isOkAnd()

- **`filter()`** — Transforms Ok to Err if predicate fails
- **`isOkAnd()`** — Only checks condition, doesn't transform

```typescript
// filter() transforms the Result
const result = Result.ok(5).filter((x) => x > 10)
// Err(Error: ...)

// isOkAnd() only checks
if (result.isOkAnd((x) => x > 10)) {
  // handle
}
```

## Mixing map() and andThen()

Use both for clarity:

```typescript
Result.ok(userId)
  .map(id => fetchUserSync(id))     // Transform value
  .andThen(validate)                // Chain Result
  .map(user => user.name)           // Transform again
  .unwrapOr('Anonymous')            // Fallback
```

## Combining Multiple Results

### and() - Sequence Without Values

```typescript
hasPermission()
  .and(isAuthenticated())
  .and(isVerified())
```

### zip() - Combine Values

```typescript
const userId = getUserId()
const userName = getUserName()

userId
  .zip(userName)
  .map(([id, name]) => ({ id, name }))
```

## Common Mistakes

### Forgetting to Return Result

```typescript
// ✗ Wrong: andThen expects Result return
result.andThen(x => x * 2)

// ✓ Correct: return Result
result.andThen(x => Result.ok(x * 2))

// ✓ Or use map() instead
result.map(x => x * 2)
```

### Deep Nesting

```typescript
// ✗ Avoid: nested Results
Result.ok(Result.ok(42))

// ✓ Better: use andThen() to flatten
Result.ok(5).andThen(x => Result.ok(x * 2))
```

## Best Practices

1. Start with `Result.ok()` when beginning a chain
2. Use `andThen()` for sequential operations returning Result
3. Use `map()` for simple transformations
4. Use `orElse()` for error recovery
5. Use `match()` at the end for final handling
6. Keep chains readable — break into functions if too long
7. Use `inspect()` and `inspectErr()` for debugging

## Next Steps

- **[Pattern Matching](./matching.md)** — Handle final results
- **[Error Handling](./error-handling.md)** — Error recovery
- **[Async Operations](./async.md)** — Work with Promises
