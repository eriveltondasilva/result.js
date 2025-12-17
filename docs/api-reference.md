# API Reference

Complete documentation of all Result.js methods and functions.

## Quick Reference

| Use Case | Method | Purpose |
|----------|--------|---------|
| **Creating** | `Result.ok(value)` | Create success |
| | `Result.err(error)` | Create failure |
| | `Result.fromTry(fn)` | Wrap try-catch |
| | `Result.fromPromise(fn)` | Wrap Promise |
| | `Result.fromNullable(val)` | Handle null/undefined |
| | `Result.validate(val, pred)` | Validate with predicate |
| **Checking** | `result.isOk()` | Is Ok? |
| | `result.isErr()` | Is Err? |
| | `result.isOkAnd(pred)` | Is Ok AND predicate? |
| | `result.isErrAnd(pred)` | Is Err AND predicate? |
| | `Result.isResult(result)` | Is Result? |
| **Extracting** | `result.ok` | Safe value access |
| | `result.err` | Safe error access |
| | `result.unwrap()` | Get value |
| | `result.unwrapErr()` | Get error |
| | `result.unwrapOr(def)` | Get value or default |
| | `result.unwrapOrElse(fn)` | Get value or compute default |
| | `result.expect(msg)` | Get value with message |
| | `result.expectErr(msg)` | Get error with message |
| **Transforming** | `result.map(fn)` | Transform value |
| | `result.mapOr(fn, def)` | Transform or default |
| | `result.mapOrElse(okFn, errFn)` | Transform conditional |
| | `result.mapErr(fn)` | Transform error |
| | `result.filter(pred)` | Filter value |
| | `result.flatten()` | Flatten nested Result |
| **Chaining** | `result.andThen(fn)` | Chain Results |
| | `result.orElse(fn)` | Error recovery |
| | `result.and(other)` | Sequence Results |
| | `result.or(other)` | Alternative Result |
| | `result.zip(other)` | Combine Results |
| **Inspection** | `result.match({ok, err})` | Pattern matching |
| | `result.inspect(fn)` | Inspect value |
| | `result.inspectErr(fn)` | Inspect error |
| | `result.contains(value)` | Check value |
| | `result.containsErr(error)` | Check error |
| **Collections** | `Result.all([...])` | Fail-fast combine |
| | `Result.allSettled([...])` | Combine all |
| | `Result.any([...])` | First Ok |
| | `Result.partition([...])` | Separate Ok/Err |
| | `Result.values([...])` | Extract Ok values |
| | `Result.errors([...])` | Extract errors |
| **Conversion** | `result.toPromise()` | Convert to Promise |
| | `result.toString()` | Convert to string |
| | `result.toJSON()` | Convert to JSON |
| **Async** | `result.mapAsync(fn)` | Async transform |
| | `result.mapErrAsync(fn)` | Async error transform |
| | `result.mapOrAsync(fn, def)` | Async or default |
| | `result.mapOrElseAsync(okFn, errFn)` | Async conditional |
| | `result.andThenAsync(fn)` | Async chain |
| | `result.andAsync(result)` | Async sequence |
| | `result.orAsync(result)` | Async alternative |
| | `result.orElseAsync(fn)` | Async recovery |

## Type Definitions

### Result<T, E>

```typescript
type Result<T, E> = Ok<T, E> | Err<T, E>
```

### AsyncResult<T, E>

```typescript
type AsyncResult<T, E> = Promise<Result<T, E>>
```

### Ok<T, E>

```typescript
class Ok<T, E = never> { ... }
```

### Err<T, E>

```typescript
class Err<T = never, E = Error> { ... }
```

## Creation Functions

### Result.ok()

```typescript
Result.ok<T, E>(value: T): Ok<T, E>
```

Creates a successful Result containing a value.

### Result.err()

```typescript
Result.err<T, E>(error: E): Err<T, E>
```

Creates a failed Result containing an error.

### Result.fromTry()

```typescript
Result.fromTry<T>(executor: () => T): Result<T, Error>
Result.fromTry<T, E>(executor: () => T, onError: (error: unknown) => E): Result<T, E>
```

Wraps synchronous function execution, capturing exceptions.

### Result.fromPromise()

```typescript
async function fromPromise<T>(executor: () => Promise<T>): AsyncResult<T, Error>
async function fromPromise<T, E>(executor: () => Promise<T>, onError: (error: unknown) => E): AsyncResult<T, E>
```

Wraps async function execution, capturing rejections.

### Result.fromNullable()

```typescript
Result.fromNullable<T>(value: T | null | undefined): Result<NonNullable<T>, Error>
Result.fromNullable<T, E>(value: T | null | undefined, onError: () => E): Result<NonNullable<T>, E>
```

Converts null/undefined values to Err.

### Result.validate()

```typescript
Result.validate<T>(value: T, predicate: (value: T) => boolean): Result<T, Error>
Result.validate<T, E>(value: T, predicate: (value: T) => boolean, onError: (value: T) => E): Result<T, E>
```

Validates a value with a predicate function.

## Validation Methods

### isOk()

```typescript
isOk(): this is Ok<T>
```

### isErr()

```typescript
isErr(): this is Err<E>
```

### isOkAnd()

```typescript
isOkAnd(predicate: (value: T) => boolean): this is Ok<T>
```

### isErrAnd()

```typescript
isErrAnd(predicate: (error: E) => boolean): this is Err<E>
```

### Result.isResult()

```typescript
Result.isResult(value: unknown): value is Result<unknown, unknown>
```

## Access & Extraction

### Properties

```typescript
result.ok: T | null
result.err: E | null
```

### Methods

```typescript
unwrap(): T
unwrapErr(): E
expect(message: string): T
expectErr(message: string): E
unwrapOr(defaultValue: T): T
unwrapOrElse(onError: (error: E) => T): T
```

## Transformation Methods

### map()

```typescript
map<U>(mapper: (value: T) => U): Result<U, E>
```

### mapOr()

```typescript
mapOr<U>(mapper: (value: T) => U, defaultValue: U): U
```

### mapOrElse()

```typescript
mapOrElse<U>(okMapper: (value: T) => U, errorMapper: (error: E) => U): U
```

### mapErr()

```typescript
mapErr<E2>(mapper: (error: E) => E2): Result<T, E2>
```

### filter()

```typescript
filter(predicate: (value: T) => boolean): Result<T, Error>
filter(predicate: (value: T) => boolean, onReject: (value: T) => E): Result<T, E>
```

### flatten()

```typescript
flatten<U, E2>(this: Result<Result<U, E2>, E>): Result<U, E | E2>
```

## Chaining Methods

### andThen()

```typescript
andThen<U>(flatMapper: (value: T) => Result<U, E>): Result<U, E>
```

### orElse()

```typescript
orElse(onError: (error: E) => Result<T, E>): Result<T, E>
```

### and()

```typescript
and<U>(result: Result<U, E>): Result<U, E>
```

### or()

```typescript
or(result: Result<T, E>): Result<T, E>
```

### zip()

```typescript
zip<U, E2>(result: Result<U, E2>): Result<[T, U], E | E2>
```

## Inspection Methods

### match()

```typescript
match<L, R>(handlers: { ok: (value: T) => L; err: (error: E) => R }): L | R
```

Pattern matching on Result state.

### inspect()

```typescript
inspect(visitor: (value: T) => void): Result<T, E>
```

Performs side effect on success value.

### inspectErr()

```typescript
inspectErr(visitor: (error: E) => void): Result<T, E>
```

Performs side effect on error.

### contains()

```typescript
contains(value: T, comparator?: (actual: T, expected: T) => boolean): boolean
```

### containsErr()

```typescript
containsErr(error: E, comparator?: (actual: E, expected: E) => boolean): boolean
```

## Collection Methods

### Result.all()

```typescript
Result.all<T extends readonly Result<unknown, unknown>[]>(results: T): Result<OkTuple<T>, ErrUnion<T>>
```

Combines multiple Results (fail-fast).

### Result.allSettled()

```typescript
Result.allSettled<T extends readonly Result<unknown, unknown>[]>(results: T): Ok<SettledResult<OkUnion<T>, ErrUnion<T>>[]>
```

Collects all Results without failing.

### Result.any()

```typescript
Result.any<T extends readonly Result<unknown, unknown>[]>(results: T): Result<OkUnion<T>, ErrTuple<T>>
```

Returns first Ok or all errors.

### Result.partition()

```typescript
Result.partition<T, E>(results: readonly Result<T, E>[]): [T[], E[]]
```

Separates Results into successes and failures.

### Result.values()

```typescript
Result.values<T, E>(results: readonly Result<T, E>[]): T[]
```

Extracts only success values.

### Result.errors()

```typescript
Result.errors<T, E>(results: readonly Result<T, E>[]): E[]
```

Extracts only errors.

## Conversion Methods

### toPromise()

```typescript
toPromise(): Promise<T>
```

Converts Result to Promise.

### toString()

```typescript
toString(): string
```

Converts to string representation.

### toJSON()

```typescript
toJSON(): { type: 'ok'; value: T } | { type: 'err'; error: E }
```

Converts to JSON object.

## Async Methods

### mapAsync()

```typescript
mapAsync<U>(mapperAsync: (value: T) => Promise<U>): AsyncResult<U, E>
```

Transforms value asynchronously.

### mapErrAsync()

```typescript
mapErrAsync<E2>(mapperAsync: (error: E) => Promise<E2>): AsyncResult<T, E2>
```

Transforms error asynchronously.

### mapOrAsync()

```typescript
mapOrAsync<U>(mapperAsync: (value: T) => Promise<U>, defaultValue: U): Promise<U>
```

Transforms with async fallback.

### mapOrElseAsync()

```typescript
mapOrElseAsync<U>(okMapperAsync: (value: T) => Promise<U>, errMapperAsync: (error: E) => Promise<U>): Promise<U>
```

Transforms using appropriate async mapper.

### andThenAsync()

```typescript
andThenAsync<U>(flatMapperAsync: (value: T) => AsyncResult<U, E>): AsyncResult<U, E>
```

Chains async operation returning Result.

### andAsync()

```typescript
andAsync<U>(result: AsyncResult<U, E>): AsyncResult<U, E>
```

Returns async Result if this is Ok.

### orAsync()

```typescript
orAsync(result: AsyncResult<T, E>): AsyncResult<T, E>
```

Returns this Result or async alternative.

### orElseAsync()

```typescript
orElseAsync(onErrorAsync: (error: E) => AsyncResult<T, E>): AsyncResult<T, E>
```

Executes async recovery function on error.
