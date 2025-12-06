---
title: Getting Started
group: Documents
category: Guides
---

# Getting Started

This guide will help you install and start using Result.js in your project.

## Installation

### npm

```bash
npm install @eriveltonsilva/result.js
```

<!-- ### yarn

```bash
yarn add @eriveltonsilva/result.js
``` -->

## Requirements

- Node.js >= 22.0.0
- TypeScript >= 5.0 (optional, for TypeScript projects)

## Importing

### ESM (Recommended)

```typescript
import { Result } from '@eriveltonsilva/result.js'
```

### CommonJS

```javascript
const { Result } = require('@eriveltonsilva/result.js')
```

## Your First Result

### Creating Results

```typescript
// Success case
const success = Result.ok(42)

// Error case
const failure = Result.err(new Error('Something went wrong'))
```

### Checking State

```typescript
const result = Result.ok(42)

if (result.isOk()) {
  console.log('Success:', result.unwrap())
}

if (result.isErr()) {
  console.log('Error:', result.unwrapErr())
}
```

### Safe Access

```typescript
const result = Result.ok(42)

// Get value or null (no exceptions)
const value = result.ok // 42
const error = result.err // null
```

## Error Handling

### Try-Catch Alternative

```typescript
// Traditional approach
let data
try {
  data = JSON.parse(input)
} catch (error) {
  console.error('Parse failed:', error)
  data = null
}

// With Result
const result = Result.fromTry(() => JSON.parse(input))

if (result.isOk()) {
  const data = result.unwrap()
} else {
  console.error('Parse failed:', result.unwrapErr())
}
```

### Custom Error Types

```typescript
type ValidationError = {
  field: string
  message: string
}

function validateEmail(email: string): ResultType<string, ValidationError> {
  if (!email.includes('@')) {
    return Result.err({
      field: 'email',
      message: 'Invalid email format'
    })
  }
  return Result.ok(email)
}
```

## Transforming Values

### Using map()

```typescript
const result = Result.ok(5)
  .map(x => x * 2)
  .map(x => x + 10)

console.log(result.unwrap()) // 20
```

### Chaining Operations

```typescript
const result = Result.ok(userData)
  .andThen(validateUser)
  .andThen(saveToDatabase)
  .andThen(sendWelcomeEmail)

if (result.isOk()) {
  console.log('User created successfully')
}
```

## Handling Nullables

```typescript
const user = users.find(u => u.id === userId)

// Convert to Result
const result = Result.fromNullable(user)

if (result.isOk()) {
  console.log('User found:', result.unwrap())
} else {
  console.log('User not found')
}
```

### With Custom Error

```typescript
const result = Result.fromNullable(
  process.env.API_KEY,
  () => new Error('API_KEY not configured')
)
```

## Async Operations

### From Promise

```typescript
const result = await Result.fromPromise(
  async () => {
    const response = await fetch('/api/user')
    return response.json()
  }
)

if (result.isOk()) {
  const data = result.unwrap()
}
```

### Async Transformations

```typescript
const result = await Result.ok(userId)
  .mapAsync(async id => {
    const user = await fetchUser(id)
    return user
  })
  .andThenAsync(async user => {
    await updateLastLogin(user.id)
    return Result.ok(user)
  })
```

## Pattern Matching

```typescript
const message = result.match({
  ok: value => `Success: ${value}`,
  err: error => `Error: ${error.message}`
})

console.log(message)
```

## Recovery

### Providing Defaults

```typescript
// Static default
const value = result.unwrapOr(42)

// Computed default
const value = result.unwrapOrElse(error => {
  console.log('Error occurred:', error)
  return defaultValue
})
```

### Fallback Chain

```typescript
const data = fetchFromCache()
  .orElse(() => fetchFromDatabase())
  .orElse(() => fetchFromAPI())
  .unwrapOr(defaultData)
```

## Working with Collections

### Combining Results

```typescript
const results = Result.all([
  Result.ok(1),
  Result.ok(2),
  Result.ok(3)
])

if (results.isOk()) {
  const [a, b, c] = results.unwrap()
  console.log(a, b, c) // 1, 2, 3
}
```

### First Success

```typescript
const result = Result.any([
  Result.err('cache miss'),
  Result.ok(cachedData),
  Result.err('db error')
])

if (result.isOk()) {
  console.log('Got data:', result.unwrap())
}
```

### Partition Successes and Failures

```typescript
const operations = items.map(processItem)
const [successes, failures] = Result.partition(operations)

console.log(`Processed: ${successes.length}`)
console.log(`Failed: ${failures.length}`)
```

## Best Practices

### Always Handle Errors

```typescript
// ❌ Don't ignore errors
const value = result.unwrap() // May throw

// ✅ Handle explicitly
if (result.isOk()) {
  const value = result.unwrap()
} else {
  handleError(result.unwrapErr())
}
```

### Use Type Guards

```typescript
function processResult(result: ResultType<User, Error>) {
  if (result.isOk()) {
    // TypeScript knows result is Ok<User>
    const user = result.unwrap()
  } else {
    // TypeScript knows result is Err<Error>
    const error = result.unwrapErr()
  }
}
```

### Compose Operations

```typescript
// ❌ Nested checks
const result1 = operation1()
if (result1.isOk()) {
  const result2 = operation2(result1.unwrap())
  if (result2.isOk()) {
    // ...
  }
}

// ✅ Chain operations
const result = operation1()
  .andThen(operation2)
  .andThen(operation3)
```

## Next Steps

- Explore the [API Reference](./api-reference.md) for all available methods
- See [Examples & Patterns](./examples.md) for real-world usage
- Learn about [Architecture & Concepts](./architecture.md)
- Check out [TypeScript types](./type-reference.md) for advanced typing
