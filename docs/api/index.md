# API Reference

Complete reference for Result.js methods and functions.

## Quick Navigation

### By Category

- **[Creation](./creation)** - Create Result instances
- **[Validation](./validation)** - Check Result state
- **[Transformation](./transformation)** - Transform values
- **[Chaining](./chaining)** - Compose operations
- **[Async Operations](./async)** - Work with Promises
- **[Collections](./collections)** - Handle multiple Results

### By Use Case

| Task | Methods |
|------|---------|
| Create success | [`ok()`](./creation#result-ok-value) |
| Create error | [`err()`](./creation#result-err-error) |
| Handle exceptions | [`fromTry()`](./creation#result-fromtry-executor) |
| Handle Promises | [`fromPromise()`](./creation#result-frompromise-executor) |
| Handle null/undefined | [`fromNullable()`](./creation#result-fromnullable-value) |
| Validate values | [`validate()`](./creation#result-validate-value-predicate) |
| Check state | [`isOk()`](./validation#isok), [`isErr()`](./validation#iserr) |
| Extract value | [`unwrap()`](./validation#unwrap), [`expect()`](./validation#expect-message) |
| Provide default | [`unwrapOr()`](./validation#unwrapor-defaultvalue) |
| Transform success | [`map()`](./transformation#map-mapper) |
| Transform error | [`mapErr()`](./transformation#maperr-mapper) |
| Chain operations | [`andThen()`](./chaining#andthen-flatmapper) |
| Handle errors | [`orElse()`](./chaining#orelse-onerror) |
| Pattern match | [`match()`](./validation#match-handlers) |
| Combine Results | [`all()`](./collections#result-all-results), [`zip()`](./chaining#zip-result) |

## Method Categories

### Creation (7 methods)

Create Result instances from values, exceptions, or Promises:

```typescript
Result.ok(value)
Result.err(error)
Result.fromTry(() => operation())
Result.fromPromise(() => asyncOperation())
Result.fromNullable(value)
Result.validate(value, predicate)
Result.isResult(value)
```

[Full documentation →](./creation)

### Validation (8 methods)

Check Result state and extract values:

```typescript
result.isOk()
result.isErr()
result.isOkAnd(predicate)
result.unwrap()
result.expect(message)
result.unwrapOr(defaultValue)
result.match({ ok, err })
```

[Full documentation →](./validation)

### Transformation (6 methods)

Transform values and errors:

```typescript
result.map(fn)
result.mapOr(fn, defaultValue)
result.mapOrElse(okFn, errFn)
result.mapErr(fn)
result.filter(predicate)
result.flatten()
```

[Full documentation →](./transformation)

### Chaining (6 methods)

Compose multiple operations:

```typescript
result.andThen(fn)
result.orElse(fn)
result.and(otherResult)
result.or(otherResult)
result.zip(otherResult)
```

[Full documentation →](./chaining)

### Async Operations (8 methods)

Work with asynchronous operations:

```typescript
result.mapAsync(asyncFn)
result.mapErrAsync(asyncFn)
result.andThenAsync(asyncFn)
result.orElseAsync(asyncFn)
// ... and more
```

[Full documentation →](./async)

### Collections (5 methods)

Handle multiple Results:

```typescript
Result.all(results)
Result.allSettled(results)
Result.any(results)
Result.partition(results)
```

[Full documentation →](./collections)

### Inspection (2 methods)

Side effects without modification:

```typescript
result.inspect(fn)
result.inspectErr(fn)
```

### Comparison (2 methods)

Check for specific values:

```typescript
result.contains(value)
result.containsErr(error)
```

### Conversion (3 methods)

Convert to other representations:

```typescript
result.toPromise()
result.toJSON()
result.toString()
```

## Type Signatures

### Core Types

```typescript
type ResultType<T, E> = Ok<T, E> | Err<T, E>
type AsyncResultType<T, E> = Promise<ResultType<T, E>>
```

### Generic Constraints

```typescript
// Value type
function parse<T>(input: string): ResultType<T, Error>

// Error type
function validate<E>(data: unknown): ResultType<Data, E>

// Both
function transform<T, E>(value: unknown): ResultType<T, E>
```

## Common Patterns

### Error Handling Pipeline

```typescript
const result = Result.ok(input)
  .andThen(parse)
  .andThen(validate)
  .andThen(transform)
  .andThen(save)
  .mapErr(handleError)
```

### Async Operations

```typescript
const user = await Result.fromPromise(() => fetchUser(id))
  .then((result) => result.andThenAsync((user) => saveUser(user)))
```

### Multiple Validations

```typescript
const results = Result.all([
  validateEmail(email),
  validatePassword(password),
  validateAge(age)
])
```

### Fallback Chain

```typescript
const data = await fetchFromCache()
  .orElseAsync(() => fetchFromDatabase())
  .orElseAsync(() => fetchFromAPI())
```

## Method Availability

### Ok Methods

Methods available on `Ok<T, E>`:

- All transformation methods operate on the value
- Chaining methods continue with the value
- Error-related methods are no-ops

### Err Methods

Methods available on `Err<T, E>`:

- Value transformation methods are no-ops
- Error transformation methods operate on the error
- Recovery methods can convert to Ok

## Next Steps

- **[Creation Methods](./creation)** - Start here
- **[Examples](/examples/)** - See real-world usage
- **[Type Reference](/reference/types)** - Advanced types
