# Comparison with Other Libraries

## vs Rust's Result

### Similarities

Both use `Result<T, E>` pattern with `Ok` and `Err` variants:

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

| Feature | Rust | Result.js |
|---------|------|-----------|
| Error propagation | `?` operator | Method chaining |
| Null handling | Separate `Option<T>` | `fromNullable()` |
| Memory | Stack allocated | Heap allocated (JS objects) |
| Compile-time | Checked | TypeScript checked |

**Error Propagation:**

```rust
// Rust
fn process() -> Result<i32, String> {
    let x = fallible_op()?;
    Ok(x * 2)
}
```

```typescript
// Result.js
function process(): ResultType<number, string> {
  return fallibleOp().map((x) => x * 2)
}
```

## vs TypeScript Union Types

### Before (Union Types)

```typescript
function divide(a: number, b: number): number | Error {
  if (b === 0) return new Error('division by zero')
  return a / b
}

const result = divide(10, 2)
if (result instanceof Error) {
  // Handle error
} else {
  // Use value
}
```

### After (Result.js)

```typescript
function divide(a: number, b: number): ResultType<number, string> {
  if (b === 0) return Result.err('division by zero')
  return Result.ok(a / b)
}

const result = divide(10, 2)
if (result.isErr()) {
  // TypeScript knows result is Err
} else {
  // TypeScript knows result is Ok
}
```

**Advantages:**

- Type guards work better
- Explicit success/failure variants
- Rich API for transformations
- Consistent error handling

## vs oxide.ts

Both implement Rust's Result pattern. Key differences:

| Feature | Result.js | oxide.ts |
|---------|-----------|----------|
| Size | ~3KB | ~5KB |
| Dependencies | 0 | 0 |
| Auto-flatten | Yes (in `map()`) | No |
| Collections | `all()`, `any()`, `partition()` | Limited |
| JSDoc | Comprehensive | Basic |

## vs result.ts

Similar implementation, different API style:

**Result.js:**

```typescript
Result.ok(42)
  .map((x) => x * 2)
  .unwrapOr(0)
```

**result.ts:**

```typescript
Ok(42)
  .map((x) => x * 2)
  .unwrapOr(0)
```

Result.js uses namespace pattern (`Result.ok()`) while result.ts exports constructors directly (`Ok()`, `Err()`).

## vs fp-ts Either

fp-ts provides `Either<E, A>` (similar to Result):

**fp-ts:**

```typescript
import { Either, right, left } from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

const result = pipe(
  right(42),
  map((x) => x * 2)
)
```

**Result.js:**

```typescript
const result = Result.ok(42).map((x) => x * 2)
```

Result.js has more familiar OOP-style chaining vs fp-ts's functional pipe style.

## Migration Benefits

### From Exceptions

- **Before:** Hidden failure modes
- **After:** Explicit in type signature

### From Nullable Types

- **Before:** `null` checks everywhere
- **After:** Rich API for handling absence

### From Union Types

- **Before:** Manual type guards
- **After:** Automatic type narrowing

## Performance Comparison

Result.js is optimized for modern JavaScript:

- Private fields (no enumerable properties)
- Tree-shakeable exports
- Zero runtime dependencies
- Minimal object allocations

Benchmarks show comparable performance to native try-catch for error cases, with better ergonomics.
