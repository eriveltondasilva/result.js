# Core Concepts

Understanding the Result pattern and its architecture.

## The Result Type

`Result<T, E>` represents an operation that can either succeed with a value of type `T` or fail with an error of type `E`.

```typescript
type ResultType<T, E> = Ok<T, E> | Err<T, E>
```

### Two Variants

**Ok** - Contains a success value:

```typescript
class Ok<T, E> {
  readonly #value: T
  // Methods for accessing and transforming the value
}
```

**Err** - Contains an error:

```typescript
class Err<T, E> {
  readonly #error: E
  // Methods for handling and transforming the error
}
```

## Design Principles

### Immutability

All operations return new Results:

```typescript
const original = Result.ok(5)
const doubled = original.map((x) => x * 2)

console.log(original.unwrap()) // 5 (unchanged)
console.log(doubled.unwrap())  // 10
```

### Type Safety

The compiler enforces error handling:

```typescript
function divide(a: number, b: number): ResultType<number, string> {
  if (b === 0) return Result.err('division by zero')
  return Result.ok(a / b)
}

const result = divide(10, 0)
// ❌ Can't access value without checking
// const value = result.unwrap()

// ✅ Must check first
if (result.isOk()) {
  const value = result.unwrap() // Safe
}
```

### Explicit Error Handling

Errors are part of the type signature:

```typescript
// ❌ Hidden errors
function fetchUser(id: string): Promise<User> {
  // Can throw NetworkError, ValidationError, etc.
}

// ✅ Explicit errors
function fetchUser(id: string): AsyncResultType<User, ApiError> {
  // Type shows it can fail with ApiError
}
```

## Pattern Matching

Handle both cases explicitly:

```typescript
const message = result.match({
  ok: (value) => `Success: ${value}`,
  err: (error) => `Error: ${error}`
})
```

## Railway-Oriented Programming

Chain operations that can fail:

```typescript
const result = Result.ok(userData)
  .andThen(validateEmail)      // Can fail
  .andThen(checkPermissions)   // Can fail
  .andThen(saveToDatabase)     // Can fail
  .mapErr(logError)            // Transform errors

// Stops at first failure
```

Visual representation:

```txt
Input → [Ok path] → validate → check → save → Output
         ↓ Err      ↓ Err     ↓ Err    ↓ Err
         └──────────→ Error handling ───────→
```

## Error Accumulation

### Fail-Fast

Stops at first error:

```typescript
const result = Result.all([
  validateEmail(data.email),
  validatePassword(data.password),
  validateAge(data.age)
])
// Returns first error encountered
```

### Collect All

Gathers all errors:

```typescript
const errors: ValidationError[] = []

const email = validateEmail(data.email)
if (email.isErr()) errors.push(email.unwrapErr())

const password = validatePassword(data.password)
if (password.isErr()) errors.push(password.unwrapErr())

return errors.length > 0 
  ? Result.err(errors) 
  : Result.ok(validData)
```

## Type Narrowing

TypeScript narrows types based on checks:

```typescript
function process(result: ResultType<number, string>) {
  if (result.isOk()) {
    // TypeScript knows: Ok<number, never>
    const value: number = result.unwrap()
  } else {
    // TypeScript knows: Err<never, string>
    const error: string = result.unwrapErr()
  }
}
```

## Comparison with Rust

### Similarities

```rust
// Rust
let result: Result<i32, String> = Ok(42);
match result {
    Ok(value) => println!("Got: {}", value),
    Err(e) => println!("Error: {}", e),
}
```

```typescript
// Result.js
const result: ResultType<number, string> = Result.ok(42)
result.match({
  ok: (value) => console.log(`Got: ${value}`),
  err: (e) => console.log(`Error: ${e}`)
})
```

### Differences

**Error Propagation:**

```rust
// Rust has ? operator
fn process() -> Result<i32, String> {
    let x = fallible_op()?;
    Ok(x * 2)
}
```

```typescript
// Result.js uses chaining
function process(): ResultType<number, string> {
  return fallibleOp().map((x) => x * 2)
}
```

**Nullable Values:**

Rust has separate `Option<T>`. Result.js uses `fromNullable()`:

```typescript
const result = Result.fromNullable(value)
```

## Architecture

### Class Structure

```txt
Result (namespace)
├── Ok<T, E>        Success variant
├── Err<T, E>       Error variant
└── factories       Creation functions
```

### Method Categories

From JSDoc `@group` annotations:

- **Validation** - `isOk()`, `isErr()`, `isOkAnd()`, `isErrAnd()`
- **Access** - `unwrap()`, `expect()`, `ok`, `err`
- **Recovery** - `unwrapOr()`, `unwrapOrElse()`
- **Transformation** - `map()`, `mapErr()`, `filter()`, `flatten()`
- **Chaining** - `andThen()`, `orElse()`, `and()`, `or()`, `zip()`
- **Inspection** - `match()`, `inspect()`, `inspectErr()`
- **Comparison** - `contains()`, `containsErr()`
- **Conversion** - `toPromise()`, `toJSON()`, `toString()`
- **Async Operations** - `mapAsync()`, `andThenAsync()`, etc.

## Performance Considerations

### Method Chaining

Creates intermediate objects:

```typescript
// More allocations
const result = value
  .map(transform1)
  .map(transform2)
  .map(transform3)

// Fewer allocations (less readable)
if (value.isOk()) {
  const v1 = transform1(value.unwrap())
  const v2 = transform2(v1)
  const v3 = transform3(v2)
  return Result.ok(v3)
}
```

### Tree-Shaking

Unused methods are removed:

```typescript
// Only ok() and map() included in bundle
import { Result } from '@eriveltonsilva/result.js'
const result = Result.ok(42).map((x) => x * 2)
```

## Private Fields

Uses modern JavaScript private fields for encapsulation:

```typescript
class Ok<T, E> {
  readonly #value: T  // Private - no runtime property
  
  constructor(value: T) {
    this.#value = value
  }
}
```

## Zero-Cost Abstractions

Minimal runtime overhead through:

- Private fields (no enumerable properties)
- Tree-shaking support
- No proxy objects
- Direct property access

## Next Steps

- **[Quick Start](./quick-start)** - Practical examples
- **[API Reference](/api/)** - All methods
- **[Examples](/examples/)** - Real-world patterns
