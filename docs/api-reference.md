# API Reference

Complete reference for all Result.js methods and functions.

## Table of Contents

- [Creation](#creation)
- [Conditional Creation](#conditional-creation)
- [Validation](#validation)
- [Access](#access)
- [Recovery](#recovery)
- [Transformation](#transformation)
- [Chaining](#chaining)
- [Inspection](#inspection)
- [Comparison](#comparison)
- [Conversion](#conversion)
- [Async Operations](#async-operations)
- [Collections](#collections)

## Creation

### Result.ok()

Creates a success Result.

```typescript
Result.ok<T, E = never>(value: T): Ok<T, E>
```

**Example:**

```typescript
const result = Result.ok(42)
console.log(result.unwrap()) // 42
```

### Result.err()

Creates an error Result.

```typescript
Result.err<T = never, E = Error>(error: E): Err<T, E>
```

**Example:**

```typescript
const result = Result.err(new Error('Failed'))
console.log(result.unwrapErr()) // Error: Failed
```

## Conditional Creation

### Result.fromTry()

Wraps code that may throw in a Result.

```typescript
Result.fromTry<T>(executor: () => T): ResultType<T, Error>
Result.fromTry<T, E>(executor: () => T, onError: (error: unknown) => E): ResultType<T, E>
```

**Example:**

```typescript
const result = Result.fromTry(() => JSON.parse('{"a":1}'))
// Ok({a: 1})

const invalid = Result.fromTry(() => JSON.parse('invalid'))
// Err(SyntaxError)
```

**With custom error:**

```typescript
const result = Result.fromTry(
  () => riskyOperation(),
  (err) => new CustomError(`Operation failed: ${err}`)
)
```

### Result.fromPromise()

Wraps async operations in a Result.

```typescript
Result.fromPromise<T>(executor: () => Promise<T>): AsyncResultType<T, Error>
Result.fromPromise<T, E>(
  executor: () => Promise<T>,
  onError: (error: unknown) => E
): AsyncResultType<T, E>
```

**Example:**

```typescript
const result = await Result.fromPromise(
  async () => {
    const res = await fetch('/api/data')
    return res.json()
  }
)
```

### Result.fromNullable()

Converts nullable values to Results.

```typescript
Result.fromNullable<T>(value: T | null | undefined): ResultType<NonNullable<T>, Error>
Result.fromNullable<T, E>(
  value: T | null | undefined,
  onError: () => E
): ResultType<NonNullable<T>, E>
```

**Example:**

```typescript
const user = users.find(u => u.id === id)
const result = Result.fromNullable(user)
// Ok(user) or Err(Error: Value is null or undefined)
```

**With custom error:**

```typescript
const result = Result.fromNullable(
  value,
  () => ({ code: 'NOT_FOUND', resource: 'user' })
)
```

### Result.validate()

Creates Result by validating a value.

```typescript
Result.validate<T>(value: T, predicate: (value: T) => boolean): ResultType<T, Error>
Result.validate<T, E>(
  value: T,
  predicate: (value: T) => boolean,
  onError: (value: T) => E
): ResultType<T, E>
```

**Example:**

```typescript
const age = Result.validate(25, x => x >= 18)
// Ok(25)

const invalid = Result.validate(
  -5,
  x => x > 0,
  x => new Error(`${x} must be positive`)
)
// Err(Error: -5 must be positive)
```

## Validation

### isOk()

Checks if Result is Ok variant.

```typescript
isOk(): this is Ok<T, never>
```

**Example:**

```typescript
if (result.isOk()) {
  console.log(result.unwrap())
}
```

### isErr()

Checks if Result is Err variant.

```typescript
isErr(): this is Err<never, E>
```

**Example:**

```typescript
if (result.isErr()) {
  console.log(result.unwrapErr())
}
```

### isOkAnd()

Checks if Ok and value satisfies predicate.

```typescript
isOkAnd(predicate: (value: T) => boolean): this is Ok<T, never>
```

**Example:**

```typescript
if (result.isOkAnd(x => x > 10)) {
  console.log('Value is Ok and greater than 10')
}
```

### isErrAnd()

Checks if Err and error satisfies predicate.

```typescript
isErrAnd(predicate: (error: E) => boolean): this is Err<never, E>
```

**Example:**

```typescript
if (result.isErrAnd(e => e.code === 404)) {
  console.log('Not found error')
}
```

## Access

### ok

Property accessor for success value.

```typescript
readonly ok: T | null
```

**Example:**

```typescript
const value = result.ok // 42 or null
```

### err

Property accessor for error.

```typescript
readonly err: E | null
```

**Example:**

```typescript
const error = result.err // Error or null
```

### unwrap()

Extracts success value.

```typescript
unwrap(): T
```

**Throws:** Error if called on Err

**Example:**

```typescript
const value = Result.ok(42).unwrap() // 42
```

### unwrapErr()

Extracts error value.

```typescript
unwrapErr(): E
```

**Throws:** Error if called on Ok

**Example:**

```typescript
const error = Result.err('failed').unwrapErr() // 'failed'
```

### expect()

Extracts value with custom error message.

```typescript
expect(message: string): T
```

**Throws:** Error with custom message if called on Err

**Example:**

```typescript
const value = result.expect('User must exist')
```

### expectErr()

Extracts error with custom message.

```typescript
expectErr(message: string): E
```

**Throws:** Error with custom message if called on Ok

**Example:**

```typescript
const error = result.expectErr('Should have failed')
```

## Recovery

### unwrapOr()

Extracts value or returns default.

```typescript
unwrapOr(defaultValue: T): T
```

**Example:**

```typescript
const value = result.unwrapOr(0)
// Returns value if Ok, 0 if Err
```

### unwrapOrElse()

Extracts value or computes default from error.

```typescript
unwrapOrElse(onError: (error: E) => T): T
```

**Example:**

```typescript
const value = result.unwrapOrElse(err => {
  console.log('Error:', err)
  return defaultValue
})
```

## Transformation

### map()

Transforms success value.

```typescript
map<U>(mapper: (value: T) => U): ResultType<U, E>
map<U, F>(mapper: (value: T) => ResultType<U, F>): ResultType<U, E | F>
```

**Example:**

```typescript
const doubled = Result.ok(5).map(x => x * 2)
// Ok(10)

const nested = Result.ok(5).map(x =>
  x > 0 ? Result.ok(x) : Result.err('negative')
)
// Auto-flattened to Ok(5)
```

### mapOr()

Transforms value or returns default.

```typescript
mapOr<U>(mapper: (value: T) => U, defaultValue: U): U
```

**Example:**

```typescript
const result = Result.ok(5).mapOr(x => x * 2, 0)
// 10

const errResult = Result.err('fail').mapOr(x => x * 2, 0)
// 0
```

### mapOrElse()

Transforms using appropriate mapper.

```typescript
mapOrElse<U>(
  okMapper: (value: T) => U,
  errorMapper: (error: E) => U
): U
```

**Example:**

```typescript
const value = result.mapOrElse(
  x => x * 2,
  err => -1
)
```

### mapErr()

Transforms error value.

```typescript
mapErr<F>(mapper: (error: E) => F): ResultType<T, F>
```

**Example:**

```typescript
const result = Result.err('not found')
  .mapErr(e => new Error(e))
// Err(Error: not found)
```

### filter()

Filters Ok value with predicate.

```typescript
filter(predicate: (value: T) => boolean): ResultType<T, Error>
filter(
  predicate: (value: T) => boolean,
  onReject: (value: T) => E
): ResultType<T, E>
```

**Example:**

```typescript
const result = Result.ok(10).filter(x => x > 5)
// Ok(10)

const filtered = Result.ok(3).filter(
  x => x > 5,
  x => new Error(`${x} is too small`)
)
// Err(Error: 3 is too small)
```

### flatten()

Flattens nested Result.

```typescript
flatten<U, F>(this: ResultType<ResultType<U, F>, E>): ResultType<U, E | F>
```

**Example:**

```typescript
const nested = Result.ok(Result.ok(42))
const flattened = nested.flatten()
// Ok(42)
```

## Chaining

### andThen()

Chains operation returning Result.

```typescript
andThen<U>(flatMapper: (value: T) => ResultType<U, E>): ResultType<U, E>
```

**Example:**

```typescript
const result = Result.ok(userData)
  .andThen(validateUser)
  .andThen(saveToDatabase)
```

### orElse()

Executes recovery on error.

```typescript
orElse(onError: (error: E) => ResultType<T, E>): ResultType<T, E>
```

**Example:**

```typescript
const result = fetchFromCache()
  .orElse(() => fetchFromDatabase())
  .orElse(() => fetchFromAPI())
```

### and()

Returns second Result if this is Ok.

```typescript
and<U>(result: ResultType<U, E>): ResultType<U, E>
```

**Example:**

```typescript
const result = Result.ok(1).and(Result.ok(2))
// Ok(2)
```

### or()

Returns this or alternative Result.

```typescript
or(result: ResultType<T, E>): ResultType<T, E>
```

**Example:**

```typescript
const result = Result.err('fail').or(Result.ok(42))
// Ok(42)
```

### zip()

Combines two Results into tuple.

```typescript
zip<U, F>(result: ResultType<U, F>): ResultType<[T, U], E | F>
```

**Example:**

```typescript
const result = Result.ok(1).zip(Result.ok(2))
// Ok([1, 2])
```

## Inspection

### match()

Pattern matching on Result state.

```typescript
match<L, R>(handlers: {
  ok: (value: T) => L
  err: (error: E) => R
}): L | R
```

**Example:**

```typescript
const message = result.match({
  ok: value => `Success: ${value}`,
  err: error => `Error: ${error}`
})
```

### inspect()

Performs side effect on success value.

```typescript
inspect(visitor: (value: T) => void): ResultType<T, E>
```

**Example:**

```typescript
result
  .inspect(x => console.log('Value:', x))
  .map(x => x * 2)
```

### inspectErr()

Performs side effect on error.

```typescript
inspectErr(visitor: (error: E) => void): ResultType<T, E>
```

**Example:**

```typescript
result
  .inspectErr(err => logger.error(err))
  .mapErr(normalizeError)
```

## Comparison

### contains()

Checks if Ok contains specific value.

```typescript
contains(value: T, comparator?: (actual: T, expected: T) => boolean): boolean
```

**Example:**

```typescript
Result.ok(42).contains(42) // true

Result.ok({id: 1}).contains(
  {id: 1},
  (a, b) => a.id === b.id
) // true
```

### containsErr()

Checks if Err contains specific error.

```typescript
containsErr(error: E, comparator?: (actual: E, expected: E) => boolean): boolean
```

**Example:**

```typescript
Result.err('fail').containsErr('fail') // true
```

## Conversion

### toPromise()

Converts to Promise.

```typescript
toPromise(): Promise<T>
```

**Example:**

```typescript
const value = await Result.ok(42).toPromise()
// 42
```

### toString()

String representation.

```typescript
toString(): string
```

**Example:**

```typescript
Result.ok(42).toString() // "Ok(42)"
```

### toJSON()

JSON representation.

```typescript
toJSON(): { type: 'ok'; value: T } | { type: 'err'; error: E }
```

**Example:**

```typescript
JSON.stringify(Result.ok(42))
// '{"type":"ok","value":42}'
```

## Async Operations

### mapAsync()

Async transformation of value.

```typescript
mapAsync<U>(mapperAsync: (value: T) => Promise<U>): Promise<ResultType<U, E>>
```

**Example:**

```typescript
const result = await Result.ok(userId)
  .mapAsync(async id => fetchUser(id))
```

### mapErrAsync()

Async transformation of error.

```typescript
mapErrAsync<F>(mapperAsync: (error: E) => Promise<F>): Promise<ResultType<T, F>>
```

### mapOrAsync()

Async transformation with default.

```typescript
mapOrAsync<U>(
  mapperAsync: (value: T) => Promise<U>,
  defaultValue: U
): Promise<U>
```

### mapOrElseAsync()

Async transformation with both mappers.

```typescript
mapOrElseAsync<U>(
  okMapperAsync: (value: T) => Promise<U>,
  errMapperAsync: (error: E) => Promise<U>
): Promise<U>
```

### andThenAsync()

Async chaining.

```typescript
andThenAsync<U>(
  flatMapperAsync: (value: T) => Promise<ResultType<U, E>>
): Promise<ResultType<U, E>>
```

### orElseAsync()

Async error recovery.

```typescript
orElseAsync(
  onErrorAsync: (error: E) => Promise<ResultType<T, E>>
): Promise<ResultType<T, E>>
```

### andAsync()

Async Result combination.

```typescript
andAsync<U>(result: Promise<ResultType<U, E>>): Promise<ResultType<U, E>>
```

### orAsync()

Async alternative Result.

```typescript
orAsync(result: Promise<ResultType<T, E>>): Promise<ResultType<T, E>>
```

## Collections

### Result.all()

Combines multiple Results - fails fast.

```typescript
Result.all<T extends readonly ResultType<unknown, unknown>[]>(
  results: T
): ResultType<OkTuple<T>, ErrUnion<T>>
```

**Example:**

```typescript
const results = Result.all([
  Result.ok(1),
  Result.ok(2),
  Result.ok(3)
])
// Ok([1, 2, 3])
```

### Result.allSettled()

Collects all Results without failing.

```typescript
Result.allSettled<T extends readonly ResultType<unknown, unknown>[]>(
  results: T
): Ok<SettledResult<OkUnion<T>, ErrUnion<T>>[]>
```

**Example:**

```typescript
const settled = Result.allSettled([
  Result.ok(1),
  Result.err('fail'),
  Result.ok(3)
])
// Ok([
//   { status: 'ok', value: 1 },
//   { status: 'err', reason: 'fail' },
//   { status: 'ok', value: 3 }
// ])
```

### Result.any()

Returns first Ok or all errors.

```typescript
Result.any<T extends readonly ResultType<unknown, unknown>[]>(
  results: T
): ResultType<OkUnion<T>, ErrTuple<T>>
```

**Example:**

```typescript
const result = Result.any([
  Result.err('cache miss'),
  Result.ok(42),
  Result.err('db error')
])
// Ok(42)
```

### Result.partition()

Separates successes and failures.

```typescript
Result.partition<T, E>(
  results: readonly ResultType<T, E>[]
): readonly [T[], E[]]
```

**Example:**

```typescript
const [successes, failures] = Result.partition([
  Result.ok(1),
  Result.err('fail'),
  Result.ok(2)
])
// successes: [1, 2]
// failures: ['fail']
```

### Result.isResult()

Type guard for Result instances.

```typescript
Result.isResult(value: unknown): value is ResultType<unknown, unknown>
```

**Example:**

```typescript
if (Result.isResult(value)) {
  // TypeScript knows value is a Result
  const isOk = value.isOk()
}
```
