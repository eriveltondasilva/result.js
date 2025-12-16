# Type Safety

How Typescript enforces error handling with Result.js.

## Compiler-Enforced Error Handling

Typescript knows when a Result might be an error and forces you to handle it:

```typescript
function fetchUser(id: string): Result<User, ApiError> {
  // Implementation...
}

const result = fetchUser('123')

// ✗ Compilation error: Can't access value without checking
// const user = result.unwrap()

// ✓ Correct: Check state first
if (result.isOk()) {
  const user = result.unwrap() // Type-safe
}
```

## Type Narrowing

After checking with `isOk()` or `isErr()`, Typescript automatically narrows the type:

```typescript
function process(result: Result<number, string>) {
  if (result.isOk()) {
    // Typescript knows: Ok<number, never>
    const value: number = result.unwrap()
    console.log(value + 1)
  } else {
    // Typescript knows: Err<never, string>
    const error: string = result.unwrapErr()
    console.log('Error:', error)
  }
}
```

## Custom Error Types

Define domain-specific errors for precise handling:

```typescript
type ApiError = 
  | { type: 'not_found'; resource: string }
  | { type: 'validation'; field: string; message: string }
  | { type: 'unauthorized' }
  | { type: 'server_error'; status: number }

function fetchUser(id: string): Result<User, ApiError> {
  // Implementation...
}

// Typescript ensures all cases are handled
const result = fetchUser('123')

result.match({
  ok: (user) => console.log(user),
  err: (error) => {
    switch (error.type) {
      case 'not_found':
        console.error(`Resource not found: ${error.resource}`)
        break
      case 'validation':
        console.error(`${error.field}: ${error.message}`)
        break
      case 'unauthorized':
        redirectToLogin()
        break
      case 'server_error':
        console.error(`Server error: ${error.status}`)
        break
    }
  }
})
```

## Type Inference

Typescript automatically infers generic types:

```typescript
// Types inferred automatically
const ok = Result.ok(42)           // Ok<number, never>
const err = Result.err('failed')   // Err<never, string>

// Chaining preserves types
const result = Result.ok(5)
  .map(x => x * 2)    // Still Ok<number, never>
  .andThen(x => Result.ok(x + 1))  // Ok<number, never>

// Pattern matching preserves types
result.match({
  ok: (value) => {
    const v: number = value  // Type-safe
  },
  err: (error) => {
    const e: never = error   // No error in this branch
  }
})
```

## Type Helpers

Extract types from Results when needed:

```typescript
type MyResult = Result<User, ApiError>

// Extract success type
type Success = MyResult extends Result<infer T, any> ? T : never  // User
type Error = MyResult extends Result<any, infer E> ? E : never    // ApiError
```

## Preventing Common Mistakes

Typescript catches errors that would be silent with exceptions:

```typescript
// ✗ Won't compile: Can't pass Result<T> where T expected
function processUser(user: User) { ... }
const result: Result<User, Error> = fetchUser()
processUser(result)  // Error!

// ✓ Correct: Extract first
if (result.isOk()) {
  processUser(result.unwrap())
}

// ✓ Or use match
result.match({
  ok: (user) => processUser(user),
  err: (error) => handleError(error)
})
```

## Performance

Type safety with zero runtime cost:

- Typescript erases all generic types at runtime
- No reflection or runtime type checking
- Same performance as manual if-else checks

## Next Steps

- **[Error Handling](./error-handling.md)** — Error strategies
- **[Operation Chaining](./chaining.md)** — Advanced composition
