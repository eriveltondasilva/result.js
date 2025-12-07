# Quick Start

5-minute practical tutorial to start using Result.js.

## 1. Creating Results

### Success and Error

```typescript
import { Result } from '@eriveltonsilva/result.js'

// Create success
const success = Result.ok(42)

// Create error
const failure = Result.err('something went wrong')
```

### With Custom Types

```typescript
type User = { id: number; name: string }
type ApiError = { code: number; message: string }

const user: ResultType<User, ApiError> = Result.ok({
  id: 1,
  name: 'Alice'
})
```

## 2. Checking Results

```typescript
const result = Result.ok(42)

// Simple check
if (result.isOk()) {
  console.log('Success!', result.unwrap())
}

if (result.isErr()) {
  console.log('Error:', result.unwrapErr())
}

// Check with condition
if (result.isOkAnd((x) => x > 40)) {
  console.log('Ok and greater than 40')
}
```

## 3. Accessing Values

```typescript
const result = Result.ok(42)

// Properties (don't throw)
const value = result.ok   // 42
const error = result.err  // null

// Methods (throw if wrong type)
const value = result.unwrap()     // 42
const error = result.unwrapErr()  // ❌ Exception

// With fallback
const value = result.unwrapOr(0)  // 42
```

## 4. Transforming Values

### map() - Transform value

```typescript
Result.ok(5)
  .map((x) => x * 2)
  .map((x) => x + 10)
  .unwrap() // 20
```

### andThen() - Chain operations that return Result

```typescript
function divide(a: number, b: number): ResultType<number, string> {
  if (b === 0) return Result.err('division by zero')
  return Result.ok(a / b)
}

Result.ok(10)
  .andThen((x) => divide(x, 2))  // Ok(5)
  .andThen((x) => divide(x, 0))  // Err('division by zero')
  .unwrapOr(0) // 0
```

### mapErr() - Transform error

```typescript
Result.err('not found')
  .mapErr((msg) => new Error(msg))
  .unwrapErr() // Error: not found
```

## 5. Error Handling

### Pattern Matching

```typescript
const message = result.match({
  ok: (value) => `Success: ${value}`,
  err: (error) => `Error: ${error}`
})
```

### Default Values

```typescript
// Static
const value = result.unwrapOr(42)

// Computed
const value = result.unwrapOrElse((error) => {
  console.error('Error:', error)
  return 42
})
```

### Recovery with orElse()

```typescript
fetchFromCache()
  .orElse(() => fetchFromDatabase())
  .orElse(() => Result.ok(defaultData))
```

## 6. Working with Try-Catch

```typescript
// Capture exceptions
const result = Result.fromTry(() => JSON.parse(input))

// With error transformation
const result = Result.fromTry(
  () => JSON.parse(input),
  (error) => ({ type: 'parse_error', original: error })
)
```

## 7. Nullable Values

```typescript
const user = users.find((u) => u.id === id)

// Convert null/undefined to Err
const result = Result.fromNullable(user)

// With custom error
const result = Result.fromNullable(
  user,
  () => new Error(`User ${id} not found`)
)
```

## 8. Async Operations

### fromPromise()

```typescript
const result = await Result.fromPromise(
  async () => {
    const res = await fetch('/api/data')
    return res.json()
  }
)
```

### mapAsync()

```typescript
const result = await Result.ok(userId)
  .mapAsync(async (id) => await fetchUser(id))
```

### andThenAsync()

```typescript
const result = await Result.ok(userData)
  .andThenAsync(async (data) => {
    await saveToDb(data)
    return Result.ok(data)
  })
```

## 9. Multiple Results

### all() - Stops at first error

```typescript
const results = Result.all([
  Result.ok(1),
  Result.ok(2),
  Result.ok(3)
])

if (results.isOk()) {
  const [a, b, c] = results.unwrap() // [1, 2, 3]
}
```

### allSettled() - Never fails

```typescript
const settled = Result.allSettled([
  Result.ok(1),
  Result.err('failed'),
  Result.ok(3)
]).unwrap()

// [
//   { status: 'ok', value: 1 },
//   { status: 'err', reason: 'failed' },
//   { status: 'ok', value: 3 }
// ]
```

### any() - First success

```typescript
const result = Result.any([
  Result.err('cache miss'),
  Result.ok(42),
  Result.err('db error')
])

result.unwrap() // 42
```

## 10. Complete Example

```typescript
import { Result, type ResultType, type AsyncResultType } from '@eriveltonsilva/result.js'

type User = { id: string; email: string; age: number }
type ValidationError = { field: string; message: string }

function validateEmail(email: string): ResultType<string, ValidationError> {
  if (!email.includes('@')) {
    return Result.err({ field: 'email', message: 'Invalid email' })
  }
  return Result.ok(email)
}

function validateAge(age: number): ResultType<number, ValidationError> {
  if (age < 18) {
    return Result.err({ field: 'age', message: 'Must be 18+' })
  }
  return Result.ok(age)
}

async function createUser(
  email: string,
  age: number
): AsyncResultType<User, ValidationError> {
  // Validate fields
  const emailResult = validateEmail(email)
  if (emailResult.isErr()) return emailResult as any

  const ageResult = validateAge(age)
  if (ageResult.isErr()) return ageResult as any

  // Save to database
  return Result.fromPromise(
    async () => {
      const user = {
        id: crypto.randomUUID(),
        email: emailResult.unwrap(),
        age: ageResult.unwrap()
      }
      await saveToDatabase(user)
      return user
    },
    (error) => ({ field: 'database', message: String(error) })
  )
}

// Usage
const result = await createUser('alice@example.com', 25)

result.match({
  ok: (user) => console.log('User created:', user.id),
  err: (error) => console.error(`Error in ${error.field}: ${error.message}`)
})
```

## Next Steps

- **[Core Concepts](./core-concepts)** - Understand Result architecture
- **[API Reference](/api/)** - Explore all available methods
- **[Examples](/examples/)** - See real-world patterns
