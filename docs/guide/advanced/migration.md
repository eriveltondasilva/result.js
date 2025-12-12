# Migration Guide

Strategies for adopting Result.js in existing codebases.

## Three Core Migration Patterns

### 1. Try-Catch → Result.fromTry()

```typescript
// Before
function parseData(input: string): Data {
  try {
    return JSON.parse(input)
  } catch (error) {
    throw new Error('Parse failed')
  }
}

// After
function parseData(input: string): Result<Data, Error> {
  return Result.fromTry(() => JSON.parse(input))
}

// With custom error handling
function parseData(input: string): Result<Data, Error> {
  return Result.fromTry(
    () => JSON.parse(input),
    (err) => new Error(`Parse failed: ${err}`)
  )
}
```

### 2. Nullable → Result.fromNullable()

```typescript
// Before
function getUser(id: string): User | null {
  return users.find(u => u.id === id) ?? null
}

const user = getUser(id)
if (!user) {
  console.log('Not found')
} else {
  processUser(user)
}

// After
function getUser(id: string): Result<User, Error> {
  return Result.fromNullable(
    users.find(u => u.id === id),
    () => new Error('User not found')
  )
}

getUser(id).match({
  ok: (user) => processUser(user),
  err: (error) => console.log(error.message)
})
```

### 3. Promise → Result.fromPromise()

```typescript
// Before
async function fetchData(url: string): Promise<Data> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  return response.json()
}

try {
  const data = await fetchData('/api/data')
  processData(data)
} catch (error) {
  handleError(error)
}

// After
async function fetchData(url: string): AsyncResult<Data, Error> {
  return Result.fromPromise(async () => {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return response.json()
  })
}

const result = await fetchData('/api/data')
result.match({
  ok: (data) => processData(data),
  err: (error) => handleError(error)
})
```

## Gradual Migration Strategy

### Step 1: Write New Code with Result

All new features use Result from the start:

```typescript
// New code
function newFeature(): Result<Data, Error> {
  return Result.ok(data)
}
```

### Step 2: Wrap Legacy Code

Create Result adapters around existing functions:

```typescript
// Old code still throws
function legacyOperation(): Data {
  // ...
}

// Wrapper for new code
function safeOperation(): Result<Data, Error> {
  return Result.fromTry(() => legacyOperation())
}
```

### Step 3: Migrate Critical Paths

Focus on error-prone or frequently-used functions:

```typescript
// Before: prone to silent failures
async function authenticate(user: string, pass: string): Promise<User> {
  const user = await fetchUser(user)
  validatePassword(pass, user.hash)
  return user
}

// After: safe with explicit errors
async function authenticate(
  user: string,
  pass: string
): AsyncResult<User, AuthError> {
  return (await Result.fromPromise(() => fetchUser(user)))
    .andThenAsync((u) => validatePassword(pass, u.hash))
}
```

### Step 4: Update Tests

```typescript
// Before
test('should throw on invalid input', () => {
  expect(() => parse('invalid')).toThrow()
})

// After
test('should return Err on invalid input', () => {
  const result = parse('invalid')
  expect(result.isErr()).toBe(true)
  expect(result.unwrapErr().message).toContain('invalid')
})
```

## Interoperability

### Use Result with Legacy APIs

```typescript
// Old code expects Promise<Result>
function legacyFunction(data: Data): Promise<Result> {
  return processData(data).toPromise()
}

// New code expects Result
async function newFunction(data: Data): AsyncResult<Result, Error> {
  return Result.fromPromise(() => legacyFunction(data))
}
```

### Mixed Error Handling

When some code still throws:

```typescript
async function hybridApproach(id: string): AsyncResult<User, Error> {
  // New code with Result
  const userData = await fetchUser(id)
  if (userData.isErr()) {
    return userData
  }

  // Old code that throws
  try {
    const processed = legacyProcess(userData.unwrap())
    return Result.ok(processed)
  } catch (error) {
    return Result.err(error as Error)
  }
}
```

## Benefits After Migration

- **Explicit error handling** — All errors visible in types
- **Composable operations** — Chain naturally without nesting
- **Type safety** — Compiler enforces error handling
- **No silent failures** — Can't forget to handle errors
- **Better testing** — Easy to test success and failure paths
- **Reduced complexity** — No try-catch nesting

## Migration Checklist

- [ ] Identify functions that throw or return nullable values
- [ ] Replace try-catch with `Result.fromTry()`
- [ ] Convert nullable returns to `Result.fromNullable()`
- [ ] Wrap Promises with `Result.fromPromise()`
- [ ] Update function signatures to return `Result<T, E>`
- [ ] Define explicit error types
- [ ] Update tests to check Result variants
- [ ] Add error handling where missing
- [ ] Review critical paths for clarity
- [ ] Document error conditions

## Common Pitfalls

**Mixing patterns:** Don't use Result in some functions and exceptions in others.

**Overly generic errors:** Use specific error types that enable precise handling.

**Forgetting await:** Async methods return Promises—always `await` them.

**Silent .unwrap():** Only call `.unwrap()` after checking `.isOk()`.

## Next Steps

- **[Best Practices](./best-practices.md)** — Core principles
- **[Troubleshooting](./troubleshooting.md)** — Common issues
