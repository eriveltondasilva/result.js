# Examples & Patterns

Real-world usage examples and best practices.

## Form Validation

### Single Field Validation

```typescript
type ValidationError = { field: string; message: string }

function validateEmail(email: string): ResultType<string, ValidationError> {
  if (!email) {
    return Result.err({ field: 'email', message: 'Email is required' })
  }
  
  if (!email.includes('@')) {
    return Result.err({ field: 'email', message: 'Invalid email format' })
  }
  
  return Result.ok(email)
}
```

### Multiple Fields with Accumulation

```typescript
type FormData = { email: string; password: string; age: number }
type ValidatedForm = { email: string; password: string; age: number }

function validateForm(data: FormData): ResultType<ValidatedForm, ValidationError[]> {
  const errors: ValidationError[] = []
  
  const email = validateEmail(data.email)
  if (email.isErr()) errors.push(email.unwrapErr())
  
  const password = validatePassword(data.password)
  if (password.isErr()) errors.push(password.unwrapErr())
  
  const age = validateAge(data.age)
  if (age.isErr()) errors.push(age.unwrapErr())
  
  if (errors.length > 0) {
    return Result.err(errors)
  }
  
  return Result.ok({
    email: email.unwrap(),
    password: password.unwrap(),
    age: age.unwrap()
  })
}
```

### Fail-Fast Validation Pipeline

```typescript
function validateUserSignup(data: FormData): ResultType<ValidatedForm, ValidationError> {
  return Result.ok(data)
    .andThen((d) => validateEmail(d.email).map(() => d))
    .andThen((d) => validatePassword(d.password).map(() => d))
    .andThen((d) => validateAge(d.age).map(() => d))
    .map((d) => ({ email: d.email, password: d.password, age: d.age }))
}
```

## API Integration

### Basic Fetch

```typescript
type ApiError = { status: number; message: string }

async function fetchUser(id: string): AsyncResultType<User, ApiError> {
  return Result.fromPromise(
    async () => {
      const response = await fetch(`/api/users/${id}`)
      
      if (!response.ok) {
        throw { status: response.status, message: await response.text() }
      }
      
      return response.json()
    },
    (ApiError) => 
      typeof err === 'object' && err !== null && 'status' in err
        ? err as ApiError
        : { status: 500, message: String(err) }
  )
}
```

### With Retry Logic

```typescript
async function fetchWithRetry<T>(
  url: string,
  maxRetries = 3
): AsyncResultType<T, ApiError> {
  for (let i = 0; i < maxRetries; i++) {
    const result = await Result.fromPromise(
      async () => {
        const response = await fetch(url)
        if (!response.ok) throw new Error(response.statusText)
        return response.json()
      }
    )
    
    if (result.isOk()) return result
    
    if (i < maxRetries - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, i)))
    }
  }
  
  return Result.err({ status: 500, message: 'Max retries exceeded' })
}
```

### Multiple Parallel Requests

```typescript
async function loadUserDashboard(userId: string) {
  const results = await Promise.all([
    fetchUser(userId),
    fetchPosts(userId),
    fetchFollowers(userId)
  ])
  
  return Result.all(results).map(([user, posts, followers]) => ({
    user,
    posts,
    followers
  }))
}
```

## Database Operations

### Query with Error Handling

```typescript
type DbError = { code: string; detail: string }

async function findUserById(id: string): AsyncResultType<User, DbError> {
  return Result.fromPromise(
    async () => {
      const user = await db.query('SELECT * FROM users WHERE id = $1', [id])
      
      if (!user) {
        throw { code: 'NOT_FOUND', detail: `User ${id} not found` }
      }
      
      return user
    },
    (err): (DbError) =>
      typeof err === 'object' && err !== null && 'code' in err
        ? err as DbError
        : { code: 'UNKNOWN', detail: String(err) }
  )
}
```

### Transaction Pattern

```typescript
async function transferFunds(
  fromId: string,
  toId: string,
  amount: number
): AsyncResultType<void, DbError> {
  return Result.fromPromise(async () => {
    await db.beginTransaction()
    
    try {
      await db.query(
        'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
        [amount, fromId]
      )
      
      await db.query(
        'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
        [amount, toId]
      )
      
      await db.commit()
    } catch (error) {
      await db.rollback()
      throw error
    }
  })
}
```

## File Operations

### Read File

```typescript
import { readFile } from 'fs/promises'

async function loadConfig(path: string): AsyncResultType<Config, Error> {
  return Result.fromPromise(
    async () => {
      const content = await readFile(path, 'utf-8')
      return JSON.parse(content)
    }
  )
}
```

### Parse with Validation

```typescript
async function loadAndValidateConfig(
  path: string
): AsyncResultType<ValidConfig, Error> {
  return (await loadConfig(path))
    .andThen((config) => validateConfig(config))
}
```

## Authentication

### Login Flow

```typescript
type AuthError = 
  | { type: 'invalid_credentials' }
  | { type: 'account_locked' }
  | { type: 'network_error'; message: string }

async function login(
  email: string,
  password: string
): AsyncResultType<AuthToken, AuthError> {
  return Result.ok({ email, password })
    .andThen(validateCredentials)
    .andThenAsync(checkAccountStatus)
    .andThenAsync(generateToken)
}
```

### Permission Check

```typescript
function checkPermission(
  user: User,
  resource: string,
  action: string
): ResultType<void, PermissionError> {
  if (!user.permissions.includes(`${resource}:${action}`)) {
    return Result.err({
      type: 'forbidden',
      message: `User lacks permission: ${resource}:${action}`
    })
  }
  
  return Result.ok(undefined)
}
```

## Async Patterns

### Sequential Operations

```typescript
async function processUserData(userId: string) {
  return (await fetchUser(userId))
    .mapAsync(async (user) => {
      const enriched = await enrichUserData(user)
      return enriched
    })
    .andThenAsync(async (user) => {
      await saveUserCache(user)
      return Result.ok(user)
    })
}
```

### Parallel with Fallback

```typescript
async function loadData(key: string) {
  const [cache, db, api] = await Promise.all([
    fetchFromCache(key),
    fetchFromDatabase(key),
    fetchFromAPI(key)
  ])
  
  return Result.any([cache, db, api])
}
```

## Error Recovery

### Graceful Degradation

```typescript
async function getProductRecommendations(userId: string) {
  const mlResult = await fetchMLRecommendations(userId)
  
  return mlResult.orElseAsync(async () => {
    // Fallback to rule-based
    const ruleResult = await fetchRuleBasedRecommendations(userId)
    
    return ruleResult.orElse(() => {
      // Final fallback to popular items
      return Result.ok(getPopularProducts())
    })
  })
}
```

### Error Logging with Recovery

```typescript
async function fetchWithLogging<T>(url: string): AsyncResultType<T, Error> {
  return (await Result.fromPromise(() => fetch(url).then((r) => r.json())))
    .inspectErr((error) => {
      logger.error('Fetch failed', { url, error })
      metrics.increment('fetch.error')
    })
}
```

## Batch Processing

### Process Items with Report

```typescript
async function batchProcessItems(items: Item[]) {
  const results = await Promise.all(
    items.map((item) => processItem(item))
  )
  
  const [successes, failures] = Result.partition(results)
  
  return {
    processed: successes.length,
    failed: failures.length,
    errors: failures,
    results: successes
  }
}
```

### Fail-Fast Batch

```typescript
async function batchCreateUsers(users: UserInput[]) {
  const validations = users.map((user) => validateUser(user))
  const allValid = Result.all(validations)
  
  if (allValid.isErr()) {
    return Result.err({
      type: 'validation_failed',
      error: allValid.unwrapErr()
    })
  }
  
  const validUsers = allValid.unwrap()
  return Result.fromPromise(() => db.insertMany(validUsers))
}
```

### Process with Limit

```typescript
async function processWithConcurrencyLimit<T, E>(
  items: T[],
  processor: (item: T) => AsyncResultType<unknown, E>,
  limit: number
): AsyncResultType<void, E> {
  const results: ResultType<unknown, E>[] = []
  
  for (let i = 0; i < items.length; i += limit) {
    const batch = items.slice(i, i + limit)
    const batchResults = await Promise.all(batch.map(processor))
    results.push(...batchResults)
    
    // Check for first error
    const firstError = batchResults.find((r) => r.isErr())
    if (firstError) {
      return firstError as Err<never, E>
    }
  }
  
  return Result.ok(undefined)
}
```

## Testing Patterns

### Mock API Responses

```typescript
function mockFetchUser(id: string): ResultType<User, ApiError> {
  const users: Record<string, User> = {
    '1': { id: '1', name: 'Alice' },
    '2': { id: '2', name: 'Bob' }
  }
  
  const user = users[id]
  return user
    ? Result.ok(user)
    : Result.err({ status: 404, message: 'User not found' })
}
```

### Test Error Cases

```typescript
describe('fetchUser', () => {
  it('should handle network errors', async () => {
    const result = await fetchUser('invalid')
    
    expect(result.isErr()).toBe(true)
    
    if (result.isErr()) {
      const error = result.unwrapErr()
      expect(error.status).toBe(404)
    }
  })
  
  it('should return user on success', async () => {
    const result = await fetchUser('1')
    
    expect(result.isOk()).toBe(true)
    
    if (result.isOk()) {
      const user = result.unwrap()
      expect(user.name).toBe('Alice')
    }
  })
})
```
