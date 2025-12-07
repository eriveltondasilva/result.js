# Transformation

Methods for transforming values and errors.

## Value Transformation

### `map(mapper)`

Transforms the success value.

```typescript
map<U, F>(mapper: (value: T) => U | ResultType<U, F>): ResultType<U, E | F>
```

Auto-flattens if mapper returns Result.

**Examples:**

```typescript
// Simple transformation
Result.ok(5).map((x) => x * 2) // Ok(10)

// Chaining
Result.ok('42')
  .map((s) => parseInt(s, 10))
  .map((n) => n * 2) // Ok(84)

// Auto-flatten
Result.ok(5).map((x) =>
  x > 0 ? Result.ok(x * 2) : Result.err('negative')
) // Ok(10)

// No-op on Err
Result.err('fail').map((x) => x * 2) // Err('fail')
```

### `mapOr(mapper, defaultValue)`

Transforms value or returns default.

```typescript
mapOr<U>(mapper: (value: T) => U, defaultValue: U): U
```

**Examples:**

```typescript
Result.ok(5).mapOr((x) => x * 2, 0) // 10
Result.err('fail').mapOr((x) => x * 2, 0) // 0

// Config with defaults
const port = getConfig()
  .mapOr((cfg) => cfg.port, 3000)

// Computation with fallback
const total = getItems()
  .mapOr((items) => items.reduce((a, b) => a + b, 0), 0)
```

### `mapOrElse(okMapper, errorMapper)`

Uses appropriate mapper based on state.

```typescript
mapOrElse<U>(
  okMapper: (value: T) => U,
  errorMapper: (error: E) => U
): U
```

**Examples:**

```typescript
Result.ok(5).mapOrElse(
  (x) => x * 2,
  (e) => -1
) // 10

// Converting to common type
const value = result.mapOrElse(
  (user) => user.name,
  (error) => 'Anonymous'
)

// HTTP response
return result.mapOrElse(
  (data) => res.json(data),
  (error) => res.status(error.code).json({ error })
)
```

## Error Transformation

### `mapErr(mapper)`

Transforms the error.

```typescript
mapErr<F>(mapper: (error: E) => F): ResultType<T, F>
```

**Examples:**

```typescript
Result.err('not found')
  .mapErr((e) => new Error(e))
// Err(Error: not found)

// Normalizing errors
result.mapErr((error) => ({
  code: error.code || 'UNKNOWN',
  message: error.message,
  timestamp: Date.now()
}))

// Adding context
fetchUser(id).mapErr((err) => ({
  ...err,
  context: { userId: id, timestamp: Date.now() }
}))

// No-op on Ok
Result.ok(42).mapErr((e) => new Error(e)) // Ok(42)
```

## Filtering

### `filter(predicate, onReject?)`

Filters Ok value based on predicate.

::: code-group

```typescript [Default Error]
filter(predicate: (value: T) => boolean): ResultType<T, Error>
```

```typescript [Custom Error]
filter(
  predicate: (value: T) => boolean,
  onReject: (value: T) => E
): ResultType<T, E>
```

:::

**Examples:**

```typescript
// With default error
Result.ok(10).filter((x) => x > 5)
// Ok(10)

Result.ok(3).filter((x) => x > 5)
// Err(Error: Filter predicate failed for value: 3)

// With custom error
Result.ok(3).filter(
  (x) => x > 5,
  (x) => new Error(`${x} is too small`)
)
// Err(Error: 3 is too small)

// Validation pipeline
Result.ok(age)
  .filter(
    (x) => x >= 18,
    (x) => ({ field: 'age', message: 'Must be 18+' })
  )
  .filter(
    (x) => x <= 100,
    (x) => ({ field: 'age', message: 'Invalid age' })
  )

// No-op on Err
Result.err('fail').filter((x) => x > 5) // Err('fail')
```

## Flattening

### `flatten()`

Flattens nested Result.

```typescript
flatten<U, F>(this: ResultType<ResultType<U, F>, E>): ResultType<U, E | F>
```

**Examples:**

```typescript
Result.ok(Result.ok(42)).flatten()
// Ok(42)

Result.ok(Result.err('fail')).flatten()
// Err('fail')

// After operations that return Result
function parseAndValidate(input: string): ResultType<ResultType<number, string>, Error> {
  return Result.fromTry(() => {
    const num = parseInt(input)
    return num > 0 ? Result.ok(num) : Result.err('negative')
  })
}

parseAndValidate('42').flatten() // Ok(42)
parseAndValidate('-5').flatten() // Err('negative')

// Error case
Result.err('outer error').flatten()
// Err('outer error')
```

## Async Transformations

### `mapAsync(mapperAsync)`

Async transformation of value.

```typescript
mapAsync<U, F>(
  mapperAsync: (value: T) => Promise<U | ResultType<U, F>>
): Promise<ResultType<U, E | F>>
```

**Examples:**

```typescript
await Result.ok(5).mapAsync(async (x) => x * 2)
// Ok(10)

await Result.ok(userId).mapAsync(async (id) => {
  const user = await fetchUser(id)
  return user || Result.err('not found')
})

// Chaining async operations
await Result.ok(data)
  .mapAsync(async (d) => await processData(d))
  .then((r) => r.mapAsync(async (d) => await saveData(d)))
```

### `mapErrAsync(mapperAsync)`

Async transformation of error.

```typescript
mapErrAsync<F>(
  mapperAsync: (error: E) => Promise<F>
): Promise<ResultType<T, F>>
```

**Examples:**

```typescript
await Result.err('fail').mapErrAsync(
  async (e) => new Error(e)
)
// Err(Error: fail)

// Enriching error with async data
await result.mapErrAsync(async (error) => ({
  ...error,
  context: await fetchContext(),
  timestamp: Date.now()
}))
```

### `mapOrAsync(mapperAsync, defaultValue)`

Async transformation with default.

```typescript
mapOrAsync<U>(
  mapperAsync: (value: T) => Promise<U>,
  defaultValue: U
): Promise<U>
```

**Examples:**

```typescript
await Result.ok(5).mapOrAsync(
  async (x) => x * 2,
  0
) // 10

await Result.err('fail').mapOrAsync(
  async (x) => x * 2,
  0
) // 0
```

### `mapOrElseAsync(okMapperAsync, errMapperAsync)`

Async transformation with both mappers.

```typescript
mapOrElseAsync<U>(
  okMapperAsync: (value: T) => Promise<U>,
  errMapperAsync: (error: E) => Promise<U>
): Promise<U>
```

**Examples:**

```typescript
await Result.ok(5).mapOrElseAsync(
  async (x) => x * 2,
  async (e) => -1
) // 10

// Async error recovery
const value = await result.mapOrElseAsync(
  async (data) => await processData(data),
  async (error) => {
    await logError(error)
    return defaultData
  }
)
```

## Comparison Table

| Method | Ok Behavior | Err Behavior | Async |
|--------|-------------|--------------|-------|
| `map()` | Transforms value | Passes through | ❌ |
| `mapOr()` | Transforms value | Returns default | ❌ |
| `mapOrElse()` | Uses ok mapper | Uses err mapper | ❌ |
| `mapErr()` | Passes through | Transforms error | ❌ |
| `filter()` | Checks predicate | Passes through | ❌ |
| `flatten()` | Unwraps nested | Passes through | ❌ |
| `mapAsync()` | Async transform | Passes through | ✅ |
| `mapErrAsync()` | Passes through | Async transform | ✅ |
| `mapOrAsync()` | Async transform | Returns default | ✅ |
| `mapOrElseAsync()` | Uses async ok mapper | Uses async err mapper | ✅ |

## Common Patterns

### Validation Pipeline

```typescript
Result.ok(userData)
  .map(validateEmail)
  .map(validateAge)
  .map(normalizeData)
```

### Type Conversion

```typescript
Result.ok('42')
  .map(parseInt)
  .filter((n) => !isNaN(n))
  .map((n) => n.toString())
```

### Error Normalization

```typescript
fetchData()
  .mapErr((err) => ({
    type: 'API_ERROR',
    code: err.status || 500,
    message: err.message || 'Unknown error'
  }))
```

### Nested Results

```typescript
parseInput(input)
  .map(validate)
  .flatten()
```
