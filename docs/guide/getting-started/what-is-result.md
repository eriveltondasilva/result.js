# What is Result?

Result.js implements Rust's `Result<T, E>` pattern for JavaScript/TypeScript, providing explicit, type-safe error handling without exceptions.

## The Result Type

`Result<T, E>` represents an operation that can either succeed or fail:

```typescript
type Result<T, E> = Ok<T, E> | Err<T, E>
```

- **`Ok<T>`** — contains a success value
- **`Err<E>`** — contains an error value

## Result vs Exception-Based Error Handling

| Aspect | Exception | Result |
|--------|-----------|--------|
| **Error visibility** | Hidden in types | Explicit in signature |
| **Compiler enforcement** | None | Enforced by TypeScript |
| **Composition** | Nested try-catch | Fluent chaining |
| **Performance** | Stack unwinding | Zero overhead |

## Example: Before and After

### With Exceptions

```typescript
function divide(a: number, b: number): number {
  if (b === 0) throw new Error('Division by zero')
  return a / b
}

try {
  const result = divide(10, 0)
  console.log(result)
} catch (error) {
  console.error(error) // Error hidden from type
}
```

### With Result

```typescript
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return Result.err('Division by zero')
  return Result.ok(a / b)
}

const result = divide(10, 0)

result.match({
  ok: (val) => console.log(val),
  err: (msg) => console.error(msg) // Error explicit in type
})
```

## Key Characteristics

### Immutability

All operations return new Results—originals are never modified:

```typescript
const original = Result.ok(5)
const doubled = original.map(x => x * 2)

console.log(original.unwrap()) // 5 (unchanged)
console.log(doubled.unwrap())  // 10
```

### No Silent Failures

You cannot access values without handling errors:

```typescript
const result = Result.ok(42)

// ✗ Compilation error: can't access unwrap() without checking
// const value = result.unwrap()

// ✓ Correct: check state first
if (result.isOk()) {
  const value = result.unwrap() // Safe
}

// ✓ Or use pattern matching
result.match({
  ok: (val) => console.log(val),
  err: (err) => console.error(err)
})
```

## When to Use Result

**Use Result for:**

- Expected errors (validation, not found, parsing)
- Business logic failures (permission denied, insufficient funds)
- Recoverable failures (network timeout, cache miss)
- APIs where errors are common

**Use exceptions for:**

- Unexpected errors (out of memory, programmer mistakes)
- Fatal errors that can't be recovered

## Core Methods

| Method | Purpose |
|--------|---------|
| `Result.ok(value)` | Create success Result |
| `Result.err(error)` | Create failure Result |
| `result.isOk()` | Check if Ok |
| `result.isErr()` | Check if Err |
| `result.unwrap()` | Extract value (throws if Err) |
| `result.unwrapOr(fallback)` | Extract with default |
| `result.map(fn)` | Transform success value |
| `result.andThen(fn)` | Chain operations |
| `result.match({ok, err})` | Handle both cases |

## Next Steps

- **[Installation](./installation.md)** — Set up in your project
- **[Quick Start](./quick-start.md)** — Practical examples
- **[Type Safety](../core-concepts/type-safety.md)** — How TypeScript helps
