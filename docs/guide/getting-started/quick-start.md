# Quick Start

Master the essentials with 8 practical examples.

## 1. Creating Results

```typescript
import { Result } from '@eriveltonsilva/result.js'

Result.ok(42)                    // Success
Result.err('failed')             // Failure
Result.fromTry(() => JSON.parse('...'))  // Wrap try-catch
Result.fromNullable(maybeValue)  // Convert null/undefined to Err
```

## 2. Checking State

```typescript
result.isOk()              // true or false
result.isErr()             // true or false
result.isOkAnd(x => x > 0) // true if Ok AND predicate passes
result.isErrAnd(e => e.code === 404) // true if Err AND predicate passes
```

## 3. Extracting Values

```typescript
result.unwrap()      // T (throws if Err)
result.unwrapOr(42)  // T (fallback value)
result.ok            // T | null (safe, never throws)
result.err           // E | null (safe, never throws)
```

## 4. Transforming Values

```typescript
Result.ok(5)
  .map((x) => x * 2)      // Ok(10)
  .filter((x) => x > 8)   // Ok(10)
  .map((x) => x + 1)      // Ok(11)
  .unwrap()               // 11
```

## 5. Chaining Operations with andThen()

Use `andThen()` when operations return Results:

```typescript
function divide(a: number, b: number): Result<number, string> {
  return b === 0 
    ? Result.err('division by zero') 
    : Result.ok(a / b)
}

Result.ok(10)
  .andThen((x) => divide(x, 2))  // Ok(5)
  .andThen((x) => divide(x, 0))  // Err('division by zero')
  .unwrapOr(0)                   // 0
```

## 6. Error Recovery with orElse()

Chain multiple sources with fallbacks:

```typescript
fetchFromCache(key)
  .orElse(() => fetchFromDatabase(key))
  .orElse(() => fetchFromAPI(key))
  .unwrapOr(defaultData)
```

## 7. Pattern Matching

Handle both cases explicitly:

```typescript
result.match({
  ok: (val) => console.log('Success:', val),
  err: (err) => console.error('Error:', err)
})

// Returns the result of whichever handler is called
const message = result.match({
  ok: (val) => `Got ${val}`,
  err: (err) => `Failed with ${err}`
})
```

## 8. Async Operations

Wrap Promises and transform async values:

```typescript
// Wrap a Promise
const user = await Result.fromPromise(
  () => fetch('/api/user').then((r) => r.json())
)

// Transform async values
const result = await Result.ok(userId)
  .mapAsync(async (id) => await fetchUser(id))
  .andThenAsync(async (user) => {
    await validateUser(user)
    return Result.ok(user)
  })

if (result.isOk()) {
  console.log('User:', result.unwrap())
}
```

## Complete Example: Form Validation

```typescript
type ValidationError = { field: string; message: string }

function validateAge(age: number): Result<number, ValidationError> {
  if (age < 18) {
    return Result.err({ field: 'age', message: 'Must be 18+' })
  }
  return Result.ok(age)
}

async function registerUser(
  email: string,
  age: number
): Promise<void> {
  const result = validateAge(age)

  result.match({
    ok: (validAge) => console.log(`User is ${validAge} years old`),
    err: (error) => console.error(`${error.field}: ${error.message}`)
  })
}

await registerUser('user@example.com', 25)
```

## Next Steps

- **[Type Safety](../core-concepts/type-safety.md)** — Understand TypeScript integration
- **[Error Handling](../core-concepts/error-handling.md)** — Error strategies and patterns
- **[Operation Chaining](../core-concepts/chaining.md)** — Advanced composition
