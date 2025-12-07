# Migration Guide

Guide for migrating existing code to use Result.js.

## From Try-Catch to Result

### Basic Conversion

**Before:**

```typescript
function parseJSON(input: string): Data {
  try {
    return JSON.parse(input)
  } catch (error) {
    throw new Error('Parse failed')
  }
}
```

**After:**

```typescript
function parseJSON(input: string): ResultType<Data, Error> {
  return Result.fromTry(
    () => JSON.parse(input),
    () => new Error('Parse failed')
  )
}
```

### Nested Try-Catch

**Before:**

```typescript
async function processUser(id: string): Promise<User> {
  try {
    const raw = await fetchUser(id)
    try {
      const validated = validateUser(raw)
      return validated
    } catch (validationError) {
      throw new Error('Validation failed')
    }
  } catch (fetchError) {
    throw new Error('Fetch failed')
  }
}
```

**After:**

```typescript
async function processUser(id: string): AsyncResultType<User, Error> {
  return (await Result.fromPromise(() => fetchUser(id)))
    .andThen((raw) => validateUser(raw))
}
```

## From Nullable to Result

### Basic Conversion

**Before:**

```typescript
function findUser(id: string): User | null {
  return users.find((user) => user.id === id) ?? null
}

const user = findUser(id)
if (user === null) {
  console.log('Not found')
} else {
  processUser(user)
}
```

**After:**

```typescript
function findUser(id: string): ResultType<User, Error> {
  return Result.fromNullable(
    users.find((user) => user.id === id),
    () => new Error('User not found')
  )
}

findUser(id).match({
  ok: (user) => processUser(user),
  err: (error) => console.log(error.message)
})
```

### Chained Nullable Checks

**Before:**

```typescript
function getUserEmail(userId: string): string | null {
  const user = findUser(userId)
  if (!user) return null
  
  const profile = user.profile
  if (!profile) return null
  
  return profile.email ?? null
}
```

**After:**

```typescript
function getUserEmail(userId: string): ResultType<string, Error> {
  return Result.fromNullable(findUser(userId))
    .andThen((user) => Result.fromNullable(user.profile))
    .andThen((profile) => Result.fromNullable(profile.email))
}
```

## From Promises to Result

### Basic Async

**Before:**

```typescript
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
```

**After:**

```typescript
async function fetchData(url: string): AsyncResultType<Data, Error> {
  return Result.fromPromise(
    async () => {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      return response.json()
    }
  )
}

const result = await fetchData('/api/data')
result.match({
  ok: (data) => processData(data),
  err: (error) => handleError(error)
})
```

### Promise.all

**Before:**

```typescript
const [user, posts, comments] = await Promise.all([
  fetchUser(id),
  fetchPosts(id),
  fetchComments(id)
])
```

**After:**

```typescript
const result = await Promise.all([
  fetchUser(id),
  fetchPosts(id),
  fetchComments(id)
])

const combined = Result.all(result)

if (combined.isOk()) {
  const [user, posts, comments] = combined.unwrap()
}
```

## From Error Codes to Result

### Status Code Pattern

**Before:**

```typescript
interface Response<T> {
  status: 'success' | 'error'
  data?: T
  error?: string
}

function processResponse<T>(response: Response<T>): T {
  if (response.status === 'error') {
    throw new Error(response.error)
  }
  return response.data!
}
```

**After:**

```typescript
function processResponse<T>(response: Response<T>): ResultType<T, Error> {
  if (response.status === 'error') {
    return Result.err(new Error(response.error))
  }
  return Result.ok(response.data!)
}
```

### Multiple Error Codes

**Before:**

```typescript
type ApiResponse = 
  | { code: 200; data: User }
  | { code: 404; message: string }
  | { code: 500; message: string }

function handleResponse(response: ApiResponse): User {
  switch (response.code) {
    case 200: return response.data
    case 404: throw new Error(`Not found: ${response.message}`)
    case 500: throw new Error(`Server error: ${response.message}`)
  }
}
```

**After:**

```typescript
type ApiError = 
  | { type: 'not_found'; message: string }
  | { type: 'server_error'; message: string }

function handleResponse(response: ApiResponse): ResultType<User, ApiError> {
  switch (response.code) {
    case 200:
      return Result.ok(response.data)
    case 404:
      return Result.err({ type: 'not_found', message: response.message })
    case 500:
      return Result.err({ type: 'server_error', message: response.message })
  }
}
```

## From Callbacks to Result

### Callback Pattern

**Before:**

```typescript
function loadUser(
  id: string,
  onSuccess: (user: User) => void,
  onError: (error: Error) => void
): void {
  fetchUser(id)
    .then(onSuccess)
    .catch(onError)
}

loadUser(
  id,
  (user) => console.log(user),
  (error) => console.error(error)
)
```

**After:**

```typescript
async function loadUser(id: string): AsyncResultType<User, Error> {
  return Result.fromPromise(() => fetchUser(id))
}

const result = await loadUser(id)
result.match({
  ok: (user) => console.log(user),
  err: (error) => console.error(error)
})
```

## Common Patterns

### Validation Pipeline

**Before:**

```typescript
function validateUser(data: UserInput): User {
  if (!data.email) throw new Error('Email required')
  if (!data.email.includes('@')) throw new Error('Invalid email')
  if (data.age < 18) throw new Error('Must be 18+')
  
  return {
    email: data.email,
    age: data.age
  }
}
```

**After:**

```typescript
function validateUser(data: UserInput): ResultType<User, ValidationError> {
  return Result.ok(data)
    .andThen((d) => 
      d.email 
        ? Result.ok(d) 
        : Result.err({ field: 'email', message: 'Email required' })
    )
    .andThen((d) =>
      d.email.includes('@')
        ? Result.ok(d)
        : Result.err({ field: 'email', message: 'Invalid email' })
    )
    .andThen((d) =>
      d.age >= 18
        ? Result.ok(d)
        : Result.err({ field: 'age', message: 'Must be 18+' })
    )
    .map((d) => ({ email: d.email, age: d.age }))
}
```

### Fallback Chain

**Before:**

```typescript
async function getData(key: string): Promise<Data> {
  try {
    return await fetchFromCache(key)
  } catch {
    try {
      return await fetchFromDatabase(key)
    } catch {
      return await fetchFromAPI(key)
    }
  }
}
```

**After:**

```typescript
async function getData(key: string): AsyncResultType<Data, Error> {
  return (await fetchFromCache(key))
    .orElseAsync(() => fetchFromDatabase(key))
    .orElseAsync(() => fetchFromAPI(key))
}
```

## Gradual Migration Strategy

### 1. Start with New Code

Write new functions using Result:

```typescript
// New function
function newFeature(): ResultType<Data, Error> {
  return Result.ok(data)
}
```

### 2. Add Result Wrappers

Wrap existing functions:

```typescript
// Wrapper for old code
function oldFunctionWrapped(): ResultType<Data, Error> {
  return Result.fromTry(() => oldFunction())
}
```

### 3. Migrate Critical Paths

Focus on error-prone areas:

```typescript
// Before: prone to errors
async function criticalOperation() {
  const data = await riskyFetch()
  return processData(data)
}

// After: safe
async function criticalOperation(): AsyncResultType<Data, Error> {
  return (await Result.fromPromise(() => riskyFetch()))
    .andThen((data) => processData(data))
}
```

### 4. Update Tests

```typescript
// Before
test('should throw on invalid input', () => {
  expect(() => parse('invalid')).toThrow()
})

// After
test('should return Err on invalid input', () => {
  const result = parse('invalid')
  expect(result.isErr()).toBe(true)
})
```

## Interoperability

### Using Result with Legacy Code

```typescript
// Convert Result to Promise for old API
function legacyFunction(data: Data): Promise<Result> {
  return processData(data).toPromise()
}

// Convert Promise to Result for new API
async function newFunction(data: Data): AsyncResultType<Result, Error> {
  return Result.fromPromise(() => legacyFunction(data))
}
```

### Mixed Error Handling

```typescript
// Some functions still throw
async function mixedApproach(id: string): AsyncResultType<User, Error> {
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

1. **Explicit Error Handling**: All errors visible in type signatures
2. **Composable Operations**: Chain operations naturally
3. **Type Safety**: Compiler enforces error handling
4. **No Silent Failures**: Can't forget to handle errors
5. **Better Testing**: Easier to test success and failure paths

## Checklist

- [ ] Identify functions that throw exceptions
- [ ] Replace try-catch with `Result.fromTry()`
- [ ] Convert nullable returns to `Result.fromNullable()`
- [ ] Wrap Promises with `Result.fromPromise()`
- [ ] Update function signatures to return `ResultType<T, E>`
- [ ] Replace `throw` statements with `Result.err()`
- [ ] Update tests to check Result variants
- [ ] Update documentation with new error handling approach
