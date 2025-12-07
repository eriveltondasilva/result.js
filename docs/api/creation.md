# Creating Results

Methods for creating `Result` instances.

## Basic Creation

### `Result.ok(value)`

Creates a success Result.

```typescript
Result.ok<T, E = never>(value: T): Ok<T, E>
```

**Example:**

```typescript
const result = Result.ok(42)
console.log(result.unwrap()) // 42

function divide(a: number, b: number): ResultType<number, string> {
  if (b === 0) return Result.err('division by zero')
  return Result.ok(a / b)
}
```

### `Result.err(error)`

Creates an error Result.

```typescript
Result.err<T = never, E = Error>(error: E): Err<T, E>
```

**Example:**

```typescript
const result = Result.err(new Error('Failed'))
console.log(result.unwrapErr()) // Error: Failed

type ValidationError = { field: string; message: string }
const error = Result.err<User, ValidationError>({
  field: 'email',
  message: 'invalid format'
})
```

## Conditional Creation

### `Result.validate(value, predicate)`

Validates a value with a predicate.

::: code-group

```typescript [Basic]
Result.validate<T>(
  value: T,
  predicate: (value: T) => boolean
): ResultType<T, Error>
```

```typescript [Custom Error]
Result.validate<T, E>(
  value: T,
  predicate: (value: T) => boolean,
  onError: (value: T) => E
): ResultType<T, E>
```

:::

**Examples:**

```typescript
// With default error
const age = Result.validate(25, (x) => x >= 18)
// Ok(25)

const invalid = Result.validate(15, (x) => x >= 18)
// Err(Error: Validation failed for value: 15)

// With custom error
const result = Result.validate(
  -5,
  (x) => x > 0,
  (x) => ({ code: 'INVALID_VALUE', value: x })
)
// Err({ code: 'INVALID_VALUE', value: -5 })
```

### `Result.fromNullable(value)`

Converts nullable values to Result.

::: code-group

```typescript [Basic]
Result.fromNullable<T>(
  value: T | null | undefined
): ResultType<NonNullable<T>, Error>
```

```typescript [Custom Error]
Result.fromNullable<T, E>(
  value: T | null | undefined,
  onError: () => E
): ResultType<NonNullable<T>, E>
```

:::

**Examples:**

```typescript
// With present value
const value = Result.fromNullable(42)
// Ok(42)

// With null
const empty = Result.fromNullable(null)
// Err(Error: Value is null or undefined)

// With custom error
const user = Result.fromNullable(
  users.find((u) => u.id === id),
  () => new Error(`User ${id} not found`)
)

// With optional chaining
const result = Result.fromNullable(
  obj?.nested?.property,
  () => ({ code: 'NOT_FOUND', path: 'obj.nested.property' })
)
```

## Exception Conversion

### `Result.fromTry(executor)`

Captures exceptions and converts to Result.

::: code-group

```typescript [Basic]
Result.fromTry<T>(
  executor: () => T
): ResultType<T, Error>
```

```typescript [Error Transform]
Result.fromTry<T, E>(
  executor: () => T,
  onError: (error: unknown) => E
): ResultType<T, E>
```

:::

**Examples:**

```typescript
// JSON parsing
const data = Result.fromTry(() => JSON.parse('{"name":"John"}'))
// Ok({name: "John"})

const invalid = Result.fromTry(() => JSON.parse('invalid'))
// Err(SyntaxError: ...)

// With custom error
type ParseError = { type: 'parse_error'; input: string }
const result = Result.fromTry(
  () => JSON.parse(input),
  (): ParseError => ({ type: 'parse_error', input })
)

// Operations that can fail
const config = Result.fromTry(
  () => {
    const file = readFileSync('config.json', 'utf-8')
    return JSON.parse(file)
  },
  (err) => new Error(`Failed to load config: ${err}`)
)
```

## Async Conversion

### `Result.fromPromise(executor)`

Captures Promise rejections.

::: code-group

```typescript [Basic]
Result.fromPromise<T>(
  executor: () => Promise<T>
): AsyncResultType<T, Error>
```

```typescript [Error Transform]
Result.fromPromise<T, E>(
  executor: () => Promise<T>,
  onError: (error: unknown) => E
): AsyncResultType<T, E>
```

:::

**Examples:**

```typescript
// Fetch API
const response = await Result.fromPromise(
  async () => {
    const res = await fetch('/api/user')
    return res.json()
  }
)

// With error handling
type NetworkError = { type: 'network'; status?: number }
const data = await Result.fromPromise(
  () => fetch('/api/data').then(r => r.json()),
  (err): NetworkError => ({
    type: 'network',
    status: err instanceof Response ? err.status : undefined
  })
)

// I/O operations
const content = await Result.fromPromise(
  () => fs.promises.readFile('file.txt', 'utf-8'),
  (err) => ({ code: 'IO_ERROR', message: String(err) })
)
```

## Type Validation

### `Result.isResult(value)`

Type guard to check if value is Result.

```typescript
Result.isResult(value: unknown): value is ResultType<unknown, unknown>
```

**Examples:**

```typescript
// Basic check
Result.isResult(Result.ok(1)) // true
Result.isResult(42) // false
Result.isResult({ ok: 1 }) // false

// As type guard
function process(value: unknown) {
  if (Result.isResult(value)) {
    // TypeScript knows value is ResultType
    return value.isOk() ? value.unwrap() : null
  }
  return value
}

// API input validation
function handleResponse(data: unknown) {
  if (!Result.isResult(data)) {
    throw new Error('Invalid response')
  }
  return data
}
```

## Summary

| Method | Use | Default Error Return |
|--------|-----|---------------------|
| `ok()` | Create success | - |
| `err()` | Create error | - |
| `validate()` | Validate with predicate | `Error` |
| `fromNullable()` | Convert nullable | `Error: Value is null or undefined` |
| `fromTry()` | Capture exceptions | `Error` |
| `fromPromise()` | Capture rejections | `Error` |
| `isResult()` | Type guard | - |
