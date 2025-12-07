# Architecture & Concepts

## Core Concepts

### The Result Type

Result.js implements the `Result<T, E>` pattern, where:

- `T` is the success value type
- `E` is the error type

A Result can be in one of two states:

- **Ok**: contains a success value
- **Err**: contains an error

```typescript
type ResultType<T, E> = Ok<T, E> | Err<T, E>
```

### Why Result Over Exceptions?

#### **Explicit Error Handling**

```typescript
// Exceptions - easy to forget
function divide(a: number, b: number): number {
  if (b === 0) throw new Error('Division by zero')
  return a / b
}

// Result - errors in type signature
function divide(a: number, b: number): ResultType<number, string> {
  if (b === 0) return Result.err('Division by zero')
  return Result.ok(a / b)
}
```

#### **Type Safety**

```typescript
// Compiler forces error handling
const result = divide(10, 0)
// Can't access value without checking
// result.unwrap() // TypeScript error without check

if (result.isOk()) {
  const value = result.unwrap() // Safe
}
```

## Design Principles

### Immutability

All Result operations are immutable. Methods return new Results rather than modifying the original.

```typescript
const original = Result.ok(5)
const doubled = original.map((x) => x * 2)

console.log(original.unwrap()) // 5 (unchanged)
console.log(doubled.unwrap())  // 10
```

### Zero-Cost Abstractions

Result.js uses private fields and tree-shaking to minimize runtime overhead.

```typescript
class Ok<T, E> {
  readonly #value: T  // Private field - no runtime property
  
  constructor(value: T) {
    this.#value = value
  }
}
```

### Type Inference

TypeScript automatically infers Result types from usage.

```typescript
// Type inferred as ResultType<number, string>
const result = Result.ok(42)
  .map((x) => x * 2)
  .andThen((x) => x > 50 ? Result.ok(x) : Result.err('too small'))
```

## Internal Architecture

### Class Structure

```txt
Result (namespace)
├── Ok<T, E>     - Success variant
├── Err<T, E>    - Error variant
└── factories    - Creation functions
    ├── ok()
    ├── err()
    ├── fromTry()
    ├── fromPromise()
    ├── fromNullable()
    └── validate()
```

### Method Categories

#### **Validation**

- `isOk()`, `isErr()` - Check variant
- `isOkAnd()`, `isErrAnd()` - Conditional checks

#### **Access**

- `unwrap()`, `unwrapErr()` - Extract values
- `expect()`, `expectErr()` - Extract with message
- `ok`, `err` - Property accessors

#### **Recovery**

- `unwrapOr()` - Provide default
- `unwrapOrElse()` - Compute default

#### **Transformation**

- `map()`, `mapErr()` - Transform values
- `filter()` - Conditional transformation
- `flatten()` - Flatten nested Results

#### **Chaining**

- `andThen()` - Sequential operations
- `orElse()` - Error recovery
- `and()`, `or()` - Combine Results
- `zip()` - Tuple combination

#### **Inspection**

- `match()` - Pattern matching
- `inspect()`, `inspectErr()` - Side effects

#### **Conversion**

- `toPromise()` - Convert to Promise
- `toJSON()` - Serialize
- `toString()` - String representation

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

### Key Differences

#### **Error Propagation**

```rust
// Rust has ? operator
fn process() -> Result<i32, String> {
    let x = fallible_op()?;  // Auto-propagate error
    Ok(x * 2)
}
```

```typescript
// Result.js uses method chaining
function process(): ResultType<number, string> {
  return fallibleOp()
    .map((x) => x * 2)
}
```

#### **Option Type**

- Rust has separate `Option<T>` type
- Result.js uses `Result.fromNullable()` for nullable values

## Error Handling Patterns

### Error Accumulation

```typescript
type ValidationError = { field: string; message: string }

function validateForm(data: FormData): ResultType<ValidData, ValidationError[]> {
  const errors: ValidationError[] = []
  
  const email = validateEmail(data.email)
  if (email.isErr()) errors.push(email.unwrapErr())
  
  const age = validateAge(data.age)
  if (age.isErr()) errors.push(age.unwrapErr())
  
  return errors.length > 0
    ? Result.err(errors)
    : Result.ok({ email: email.unwrap(), age: age.unwrap() })
}
```

### Railway-Oriented Programming

```typescript
const processUser = (input: UserInput) =>
  Result.ok(input)
    .andThen(validateInput)
    .andThen(enrichData)
    .andThen(saveToDatabase)
    .andThen(sendNotification)
    .mapErr(logError)
```

### Fail-Fast vs Fail-Safe

```typescript
// Fail-fast: stop at first error
const result = Result.all([
  operation1(),
  operation2(),
  operation3()
])

// Fail-safe: collect all results
const settled = Result.allSettled([
  operation1(),
  operation2(),
  operation3()
])
```

## Performance Considerations

### Method Chaining

Chaining creates intermediate Result objects. For hot paths, consider direct checks:

```typescript
// Chaining (more allocations)
const result = value
  .map(transform1)
  .map(transform2)
  .map(transform3)

// Direct (fewer allocations, less readable)
if (value.isOk()) {
  const v1 = transform1(value.unwrap())
  const v2 = transform2(v1)
  const v3 = transform3(v2)
  return Result.ok(v3)
}
```

### Bundle Size

Result.js is tree-shakeable. Unused methods are removed during bundling.

```typescript
// Only imports ok() and map() - smaller bundle
import { Result } from '@eriveltonsilva/result.js'
const result = Result.ok(42).map((x) => x * 2)
```

## Type System Integration

### Discriminated Unions

Result leverages TypeScript's discriminated unions for type narrowing:

```typescript
function process(result: ResultType<number, string>) {
  if (result.isOk()) {
    // TypeScript knows result is Ok<number, never>
    const value: number = result.unwrap()
  } else {
    // TypeScript knows result is Err<never, string>
    const error: string = result.unwrapErr()
  }
}
```

### Generic Constraints

```typescript
// Constrain error type to Error instances
function fetchUser(id: string): ResultType<User, Error> {
  // ...
}

// Allow any error type
function validate<E>(data: unknown): ResultType<ValidData, E> {
  // ...
}
```

## Further Reading

- [Rust Book: Error Handling](https://doc.rust-lang.org/book/ch09-00-error-handling.html)
- [Railway Oriented Programming](https://fsharpforfunandprofit.com/rop/)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)