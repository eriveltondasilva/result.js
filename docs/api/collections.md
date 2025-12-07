# Collections

Methods for working with multiple Results.

## Combining Results

### `Result.all(results)`

Combines multiple Results - fails fast.

```typescript
Result.all<T extends readonly ResultType<unknown, unknown>[]>(
  results: T
): ResultType<OkTuple<T>, ErrUnion<T>>
```

Returns first error or tuple of all values.

**Examples:**

```typescript
// All Ok
const result = Result.all([
  Result.ok(1),
  Result.ok('two'),
  Result.ok(true)
])
result.unwrap() // [1, "two", true]

// With Err - returns first error
const result = Result.all([
  Result.ok(1),
  Result.err('error 1'),
  Result.err('error 2')
])
// Err("error 1")

// Validation
const validated = Result.all([
  validateEmail(form.email),
  validatePassword(form.password),
  validateAge(form.age)
])

if (validated.isOk()) {
  const [email, password, age] = validated.unwrap()
  createUser({ email, password, age })
}

// Empty array
Result.all([]) // Ok([])
```

### `Result.allSettled(results)`

Collects all Results - never fails.

```typescript
Result.allSettled<T extends readonly ResultType<unknown, unknown>[]>(
  results: T
): Ok<SettledResult<OkUnion<T>, ErrUnion<T>>[]>
```

Always returns Ok with status array.

**Examples:**

```typescript
const results = Result.allSettled([
  Result.ok(1),
  Result.err('failed'),
  Result.ok(3)
])

results.unwrap()
// [
//   { status: 'ok', value: 1 },
//   { status: 'err', reason: 'failed' },
//   { status: 'ok', value: 3 }
// ]

// Processing results
const settled = Result.allSettled(operations).unwrap()
const successes = settled.filter((r) => r.status === 'ok')
const failures = settled.filter((r) => r.status === 'err')

console.log(`${successes.length} succeeded, ${failures.length} failed`)
```

### `Result.any(results)`

Returns first Ok or all errors.

```typescript
Result.any<T extends readonly ResultType<unknown, unknown>[]>(
  results: T
): ResultType<OkUnion<T>, ErrTuple<T>>
```

Short-circuits on first Ok.

**Examples:**

```typescript
// First Ok wins
const result = Result.any([
  Result.err('error 1'),
  Result.ok(42),
  Result.ok(99)
])
result.unwrap() // 42

// All Err
const result = Result.any([
  Result.err('error 1'),
  Result.err('error 2'),
  Result.err('error 3')
])
result.unwrapErr() // ["error 1", "error 2", "error 3"]

// Fallback sources
const data = Result.any([
  fetchFromCache(key),
  fetchFromDatabase(key),
  fetchFromAPI(key)
])

// Empty array
Result.any([]) // Err([])
```

### `Result.partition(results)`

Separates successes and failures.

```typescript
Result.partition<T, E>(
  results: readonly ResultType<T, E>[]
): readonly [T[], E[]]
```

**Examples:**

```typescript
const operations = [
  Result.ok(1),
  Result.err('failure A'),
  Result.ok(2),
  Result.err('failure B'),
  Result.ok(3)
]

const [successes, errors] = Result.partition(operations)
console.log(successes) // [1, 2, 3]
console.log(errors) // ["failure A", "failure B"]

// Batch processing
const results = items.map((item) => processItem(item))
const [processed, failures] = Result.partition(results)

console.log(`${processed.length} items processed`)
if (failures.length > 0) {
  console.error(`${failures.length} failures:`, failures)
}

// Empty array
Result.partition([]) // [[], []]
```

## Comparison Table

| Method | Behavior | Return Type | Use Case |
|--------|----------|-------------|----------|
| `all()` | Fails on first error | `Ok<T[]>` or `Err<E>` | All must succeed |
| `allSettled()` | Never fails | `Ok<Status[]>` | Want all results |
| `any()` | First success wins | `Ok<T>` or `Err<E[]>` | Any success is ok |
| `partition()` | Separates ok/err | `[T[], E[]]` | Need both lists |

## Common Patterns

### Validation with Error Accumulation

```typescript
function validateForm(data: FormData): ResultType<ValidData, ValidationError[]> {
  const results = Result.allSettled([
    validateEmail(data.email),
    validatePassword(data.password),
    validateAge(data.age)
  ]).unwrap()
  
  const errors = results
    .filter((r) => r.status === 'err')
    .map((r) => r.reason)
  
  if (errors.length > 0) {
    return Result.err(errors)
  }
  
  const values = results.map((r) => r.value)
  return Result.ok({ email: values[0], password: values[1], age: values[2] })
}
```

### Parallel Operations with Fallback

```typescript
async function loadData(key: string) {
  const results = await Promise.all([
    fetchFromCache(key),
    fetchFromDatabase(key),
    fetchFromAPI(key)
  ])
  
  return Result.any(results)
}
```

### Batch Processing with Report

```typescript
async function batchProcess(items: Item[]) {
  const results = await Promise.all(
    items.map((item) => processItem(item))
  )
  
  const [successes, failures] = Result.partition(results)
  
  return {
    total: items.length,
    processed: successes.length,
    failed: failures.length,
    data: successes,
    errors: failures
  }
}
```
