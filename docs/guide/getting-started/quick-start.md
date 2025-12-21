# Quick Start

Master the essentials with 10 practical examples.

## 1. Creating Results

```typescript
import { Result } from '@eriveltonsilva/result.js'

Result.ok(42)                            // Success
Result.err('failed')                     // Failure
Result.fromTry(() => JSON.parse('...'))  // Wrap try-catch
Result.fromNullable(maybeValue)          // Convert null/undefined to Err
Result.validate(25, (x) => x >= 18)      // Validate with predicate
```

## 2. Checking State

```typescript
result.isOk()                           // true or false
result.isErr()                          // true or false
result.isOkAnd((x) => x > 0)            // true if Ok AND predicate passes
result.isErrAnd((e) => e.code === 404)  // true if Err AND predicate passes
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
  ok: (value) => console.log('Success:', value),
  err: (error) => console.error('Error:', error)
})

// Returns the result of whichever handler is called
const message = result.match({
  ok: (value) => `Got ${value}`,
  err: (error) => `Failed with ${error}`
})
```

## 8. Validating Values with validate()

Create Result by validating with predicate:

```typescript
// Simple validation
const age = Result.validate(25, (x) => x >= 18)
// Ok(25)

const invalid = Result.validate(15, (x) => x >= 18)
// Err(Error: Validation failed for value: 15)

// With custom error type
type ValidationError = { field: string; message: string }

const result = Result.validate(
  -5,
  (x) => x > 0,
  (x): ValidationError => ({ 
    field: 'age', 
    message: `${x} is not positive` 
  })
)
// Err({ field: 'age', message: '-5 is not positive' })
```

## 9. Combining Multiple Results with all()

Collect multiple Results and fail fast on first error:

```typescript
// All succeed - returns tuple of values
const result = Result.all([
  Result.ok(1),
  Result.ok('two'),
  Result.ok(true)
])
result.unwrap() // [1, "two", true]

// First error stops execution
const validated = Result.all([
  validateEmail(form.email),
  validatePassword(form.password),
  validateAge(form.age)
])

if (validated.isOk()) {
  const [email, password, age] = validated.unwrap()
  // All fields valid, proceed
} else {
  const error = validated.unwrapErr()
  console.error('Validation failed:', error)
}
```

## 10. Async Operations

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
  return Result.validate(
    age,
    (x) => x >= 18,
    (x) => ({ field: 'age', message: `Must be 18+, got ${x}` })
  )
}

function validateEmail(email: string): Result<string, ValidationError> {
  return Result.validate(
    email,
    (e) => e.includes('@'),
    (e) => ({ field: 'email', message: `Invalid format: ${e}` })
  )
}

async function registerUser(email: string, age: number): Promise<void> {
  const result = Result.all([
    validateEmail(email),
    validateAge(age)
  ])

  result.match({
    ok: ([validEmail, validAge]) => 
      console.log(`Registered: ${validEmail}, age ${validAge}`),
    err: (error) => 
      console.error(`${error.field}: ${error.message}`)
  })
}

await registerUser('user@example.com', 25)
```

## Next Steps

- **[Type Safety](../core-concepts/type-safety.md)** — Understand Typescript integration
- **[Error Handling](../core-concepts/error-handling.md)** — Error strategies and patterns
- **[Operation Chaining](../core-concepts/chaining.md)** — Advanced composition
