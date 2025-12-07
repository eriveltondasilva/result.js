# Chaining Operations

Methods for composing multiple Results.

## Sequential Operations

### `andThen(flatMapper)`

Chains operation that returns Result.

```typescript
andThen<U>(flatMapper: (value: T) => ResultType<U, E>): ResultType<U, E>
```

**Examples:**

```typescript
Result.ok(5).andThen((x) => Result.ok(x * 2)) // Ok(10)
Result.ok(5).andThen((x) => Result.err('failed')) // Err('failed')
Result.err('fail').andThen((x) => Result.ok(x * 2)) // Err('fail')

// Validation pipeline
Result.ok(userData)
  .andThen(validateEmail)
  .andThen(validateAge)
  .andThen(saveToDatabase)

// Conditional branching
Result.ok(value)
  .andThen((x) => x > 0 
    ? Result.ok(x) 
    : Result.err('must be positive'))
```

### `orElse(onError)`

Executes recovery on error.

```typescript
orElse(onError: (error: E) => ResultType<T, E>): ResultType<T, E>
```

**Examples:**

```typescript
Result.err('not found').orElse((e) => Result.ok(null)) // Ok(null)
Result.err('fail').orElse((e) => Result.err('backup')) // Err('backup')
Result.ok(42).orElse((e) => Result.ok(0)) // Ok(42)

// Fallback chain
fetchFromCache()
  .orElse(() => fetchFromDatabase())
  .orElse(() => fetchFromAPI())

// Error-specific recovery
result.orElse((error) => {
  if (error.code === 404) return Result.ok(defaultValue)
  return Result.err(error)
})
```

## Combination

### `and(result)`

Returns second Result if this is Ok.

```typescript
and<U>(result: ResultType<U, E>): ResultType<U, E>
```

**Examples:**

```typescript
Result.ok(1).and(Result.ok(2)) // Ok(2)
Result.ok(1).and(Result.err('fail')) // Err('fail')
Result.err('first').and(Result.ok(2)) // Err('first')

// Sequential checks
hasPermission()
  .and(isAuthenticated())
  .and(isVerified())
```

### `or(result)`

Returns this or alternative Result.

```typescript
or(result: ResultType<T, E>): ResultType<T, E>
```

**Examples:**

```typescript
Result.ok(1).or(Result.ok(2)) // Ok(1)
Result.err('fail').or(Result.ok(42)) // Ok(42)
Result.err('first').or(Result.err('second')) // Err('second')

// Primary or fallback
getPrimaryConfig().or(getDefaultConfig())
```

### `zip(result)`

Combines two Results into tuple.

```typescript
zip<U, F>(result: ResultType<U, F>): ResultType<[T, U], E | F>
```

**Examples:**

```typescript
Result.ok(1).zip(Result.ok(2)) // Ok([1, 2])
Result.ok(1).zip(Result.err('fail')) // Err('fail')
Result.err('first').zip(Result.ok(2)) // Err('first')

// Combining multiple operations
const userId = getUserId()
const userName = getUserName()
const userEmail = getEmail()

userId
  .zip(userName)
  .zip(userEmail)
  .map(([[id, name], email]) => ({ id, name, email }))

// Parallel operations
const [user, posts] = getUserId()
  .zip(getPostIds())
  .unwrap()
```

## Async Chaining

### `andThenAsync(flatMapperAsync)`

Async chaining operation.

```typescript
andThenAsync<U>(
  flatMapperAsync: (value: T) => Promise<ResultType<U, E>>
): Promise<ResultType<U, E>>
```

**Examples:**

```typescript
await Result.ok(userId).andThenAsync(async (id) => {
  const user = await fetchUser(id)
  return user ? Result.ok(user) : Result.err('not found')
})

// Async pipeline
await Result.ok(data)
  .andThenAsync(async (d) => await validate(d))
  .then((r) => r.andThenAsync(async (d) => await save(d)))
```

### `orElseAsync(onErrorAsync)`

Async error recovery.

```typescript
orElseAsync(
  onErrorAsync: (error: E) => Promise<ResultType<T, E>>
): Promise<ResultType<T, E>>
```

**Examples:**

```typescript
await Result.err('cache miss').orElseAsync(
  async () => Result.ok(await fetchFromDB())
)

// Async fallback chain
await result
  .orElseAsync(async () => await fetchFromCache())
  .then((r) => r.orElseAsync(async () => await fetchFromAPI()))
```

### `andAsync(result)`

Returns async Result if this is Ok.

```typescript
andAsync<U>(
  result: Promise<ResultType<U, E>>
): Promise<ResultType<U, E>>
```

**Examples:**

```typescript
await Result.ok(5).andAsync(
  Promise.resolve(Result.ok(10))
) // Ok(10)

// Conditional async operation
const nextStep = condition ? asyncOp1() : asyncOp2()
await result.andAsync(nextStep)
```

### `orAsync(result)`

Returns this or async alternative.

```typescript
orAsync(
  result: Promise<ResultType<T, E>>
): Promise<ResultType<T, E>>
```

**Examples:**

```typescript
await Result.ok(5).orAsync(
  Promise.resolve(Result.ok(10))
) // Ok(5)

await Result.err('fail').orAsync(
  Promise.resolve(Result.ok(42))
) // Ok(42)
```

## Method Comparison

| Method | Ok Behavior | Err Behavior | Returns |
|--------|-------------|--------------|---------|
| `andThen()` | Executes mapper | Passes through | Result from mapper |
| `orElse()` | Passes through | Executes recovery | Result from recovery |
| `and()` | Returns argument | Passes through | Argument or error |
| `or()` | Returns this | Returns argument | This or argument |
| `zip()` | Combines values | Returns error | Tuple or error |

## Common Patterns

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

### Fallback Chains

```typescript
// Try multiple sources
const data = fetchFromCache()
  .orElse(() => fetchFromDatabase())
  .orElse(() => fetchFromAPI())
  .unwrapOr(defaultData)

// Async version
const data = await fetchFromCache()
  .orElseAsync(() => fetchFromDatabase())
  .orElseAsync(() => fetchFromAPI())
```

### Conditional Operations

```typescript
Result.ok(user)
  .andThen((u) => u.isAdmin 
    ? Result.ok(u) 
    : Result.err('unauthorized'))
  .andThen((u) => hasPermission(u, 'write')
    ? Result.ok(u)
    : Result.err('forbidden'))
```

### Combining Results

```typescript
// Sequential (short-circuits)
const result = getUser()
  .andThen((user) => getPermissions(user))
  .andThen((perms) => validatePermissions(perms))

// Parallel
const combined = getUser()
  .zip(getConfig())
  .zip(getFeatureFlags())
  .map(([[user, config], flags]) => ({ user, config, flags }))
```
