# Introduction

Result.js implements Rust's `Result<T, E>` pattern for JavaScript and TypeScript, offering explicit, type-safe error handling without exceptions.

## What is a Result?

A `Result` represents an operation that can succeed or fail:

- **`Ok<T>`** - contains a success value of type `T`
- **`Err<E>`** - contains an error of type `E`

```typescript
type ResultType<T, E> = Ok<T, E> | Err<T, E>
```

## Why Use Result?

### 1. Explicit Errors in Type

```typescript
// ❌ Exceptions - hidden errors
function fetchUser(id: string): Promise<User> {
  // Can throw NetworkError, ValidationError, etc.
  // Nothing in type indicates this
}

// ✅ Result - errors in return type
function fetchUser(id: string): AsyncResultType<User, ApiError> {
  // Type makes clear it can fail
  // Error must be handled explicitly
}
```

### 2. Type Safety

TypeScript enforces error handling:

```typescript
const result = divide(10, 0)

// ❌ Compilation error - can't access directly
// const value = result.unwrap()

// ✅ Must check first
if (result.isOk()) {
  const value = result.unwrap() // Safe
}
```

### 3. Composability

Chain operations without nested try-catch:

```typescript
const result = Result.ok(userData)
  .andThen(validateEmail)
  .andThen(checkPermissions)
  .andThen(saveToDatabase)
  .mapErr(logError)
```

## Installation

::: code-group

```bash [npm]
npm install @eriveltonsilva/result.js
```
<!-- 
```bash [yarn]
yarn add @eriveltonsilva/result.js
```

```bash [pnpm]
pnpm add @eriveltonsilva/result.js
``` -->

:::

### Requirements

- Node.js ≥ 22.0.0
- TypeScript ≥ 5.0 (optional)

## Import

::: code-group

```typescript [ESM]
import { Result } from '@eriveltonsilva/result.js'
```

```typescript [ESM (default)]
import Result from '@eriveltonsilva/result.js'
```

```javascript [CommonJS]
const { Result } = require('@eriveltonsilva/result.js')
```

```javascript [CommonJS (default)]
const Result = require('@eriveltonsilva/result.js')
```

:::

## First Example

### Creating Results

```typescript
// Success
const success = Result.ok(42)
console.log(success.unwrap()) // 42

// Error
const failure = Result.err(new Error('Failed'))
console.log(failure.unwrapErr()) // Error: Failed
```

### Checking State

```typescript
const result = fetchData()

if (result.isOk()) {
  // TypeScript knows result is Ok<Data>
  const data = result.unwrap()
  processData(data)
} else {
  // TypeScript knows result is Err<E>
  const error = result.unwrapErr()
  handleError(error)
}
```

### Transforming Values

```typescript
const result = Result.ok(5)
  .map((x) => x * 2)      // Ok(10)
  .map((x) => x + 5)      // Ok(15)
  .filter((x) => x > 10)  // Ok(15)

console.log(result.unwrap()) // 15
```

### Handling Errors

```typescript
// Without exceptions
const result = Result.fromTry(() => JSON.parse(input))

result.match({
  ok: (data) => console.log('Parsed:', data),
  err: (error) => console.error('Failed:', error)
})
```

## Comparison with Exceptions

### Problem: Hidden Exceptions

```typescript
// ❌ Not clear that it can fail
async function getUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`)
  return response.json() // Can throw multiple exceptions
}

// Developer might forget to handle
const user = await getUser('123')
console.log(user.name) // 💥 Can explode
```

### Solution: Explicit Errors

```typescript
// ✅ Type explicitly indicates possibility of error
async function getUser(id: string): AsyncResultType<User, ApiError> {
  return Result.fromPromise(
    async () => {
      const response = await fetch(`/api/users/${id}`)
      if (!response.ok) throw { status: response.status }
      return response.json()
    },
    (err): ApiError => ({ status: 500, message: String(err) })
  )
}

// Developer is forced to handle
const result = await getUser('123')
if (result.isOk()) {
  console.log(result.unwrap().name) // Safe
}
```

## Common Patterns

### Validation

```typescript
function validateAge(age: number): ResultType<number, string> {
  if (age < 0) return Result.err('Age cannot be negative')
  if (age > 150) return Result.err('Invalid age')
  return Result.ok(age)
}
```

### Nullable Values

```typescript
const user = users.find((u) => u.id === id)

// Convert to Result
const result = Result.fromNullable(
  user,
  () => new Error('User not found')
)
```

### Async Operations

```typescript
const user = await Result.fromPromise(
  async () => {
    const res = await fetch('/api/user')
    return res.json()
  }
)
```

### Multiple Operations

```typescript
// Fail fast - stops at first error
const results = Result.all([
  validateEmail(email),
  validatePassword(password),
  validateAge(age)
])

// Collect all results
const settled = Result.allSettled([
  operation1(),
  operation2(),
  operation3()
])
```

## Next Steps

- **[Quick Start](./quick-start)** - 5-minute practical tutorial
- **[Core Concepts](./core-concepts)** - Understand the Result pattern
- **[API Reference](/api/)** - Explore all methods
- **[Examples](/examples/)** - See real-world use cases
