# Type Reference

Complete TypeScript type reference for Result.js.

## Core Types

### ResultType

Union type representing either success or failure.

```typescript
type ResultType<T, E> = Ok<T, E> | Err<T, E>
```

**Usage:**

```typescript
function divide(a: number, b: number): ResultType<number, string> {
  if (b === 0) return Result.err('Division by zero')
  return Result.ok(a / b)
}
```

### AsyncResultType

Promise that resolves to a Result.

```typescript
type AsyncResultType<T, E> = Promise<ResultType<T, E>>
```

**Usage:**

```typescript
async function fetchUser(id: string): AsyncResultType<User, Error> {
  return Result.fromPromise(async () => {
    const response = await fetch(`/api/users/${id}`)
    return response.json()
  })
}
```

## Utility Types

### InferOk

Extracts the success type from a ResultType.

```typescript
type InferOk<R> = R extends ResultType<infer T, unknown> ? T : never
```

**Usage:**

```typescript
type UserResult = ResultType<User, Error>
type UserType = InferOk<UserResult> // User
```

### InferErr

Extracts the error type from a ResultType.

```typescript
type InferErr<R> = R extends ResultType<unknown, infer E> ? E : never
```

**Usage:**

```typescript
type UserResult = ResultType<User, ApiError>
type ErrorType = InferErr<UserResult> // ApiError
```

### OkTuple

Converts array of Results to tuple of success types.

```typescript
type OkTuple<T extends readonly ResultType<unknown, unknown>[]> = {
  [K in keyof T]: InferOk<T[K]>
}
```

**Usage:**

```typescript
const results = [
  Result.ok(1),
  Result.ok('hello'),
  Result.ok(true)
] as const

type Values = OkTuple<typeof results> // [number, string, boolean]
```

### ErrTuple

Converts array of Results to tuple of error types.

```typescript
type ErrTuple<T extends readonly ResultType<unknown, unknown>[]> = {
  [K in keyof T]: InferErr<T[K]>
}
```

### OkUnion

Creates union of all success types from array of Results.

```typescript
type OkUnion<T extends readonly ResultType<unknown, unknown>[]> = InferOk<T[number]>
```

**Usage:**

```typescript
const results = [
  Result.ok(1),
  Result.ok('hello'),
  Result.ok(true)
]

type Values = OkUnion<typeof results> // number | string | boolean
```

### ErrUnion

Creates union of all error types from array of Results.

```typescript
type ErrUnion<T extends readonly ResultType<unknown, unknown>[]> = InferErr<T[number]>
```

### SettledResult

Represents outcome in `allSettled` pattern.

```typescript
type SettledResult<T, E> = SettledOk<T> | SettledErr<E>

type SettledOk<T> = { status: 'ok'; value: T }
type SettledErr<E> = { status: 'err'; reason: E }
```

**Usage:**

```typescript
const settled = Result.allSettled([
  Result.ok(1),
  Result.err('fail')
]).unwrap()

settled.forEach(result => {
  if (result.status === 'ok') {
    console.log(result.value)
  } else {
    console.log(result.reason)
  }
})
```

## Type Guards

### Type Narrowing with isOk/isErr

```typescript
function process(result: ResultType<number, string>) {
  if (result.isOk()) {
    // TypeScript infers result as Ok<number, never>
    const value: number = result.unwrap()
  } else {
    // TypeScript infers result as Err<never, string>
    const error: string = result.unwrapErr()
  }
}
```

### Using isOkAnd/isErrAnd

```typescript
function processPositive(result: ResultType<number, Error>) {
  if (result.isOkAnd(x => x > 0)) {
    // result is Ok<number> AND value > 0
    const positive: number = result.unwrap()
  }
}
```

### Result.isResult Guard

```typescript
function handleUnknown(value: unknown) {
  if (Result.isResult(value)) {
    // TypeScript knows value is ResultType<unknown, unknown>
    if (value.isOk()) {
      console.log(value.unwrap())
    }
  }
}
```

## Generic Constraints

### Constraining Error Types

```typescript
// Only allow Error instances
function fetchData<T>(url: string): ResultType<T, Error> {
  // ...
}

// Allow any error type
function parse<T, E>(input: string): ResultType<T, E> {
  // ...
}

// Constrain to specific error union
type AppError = ValidationError | NetworkError | DatabaseError

function processUser(data: UserInput): ResultType<User, AppError> {
  // ...
}
```

### Constraining Value Types

```typescript
// Only allow objects
function validateObject<T extends object>(
  data: unknown
): ResultType<T, ValidationError> {
  // ...
}

// Only allow numbers
function parseNumber(input: string): ResultType<number, Error> {
  // ...
}
```

## Advanced Patterns

### Discriminated Unions

```typescript
type ApiError =
  | { type: 'network'; status: number }
  | { type: 'validation'; fields: string[] }
  | { type: 'auth'; reason: string }

function handleError(result: ResultType<User, ApiError>) {
  if (result.isErr()) {
    const error = result.unwrapErr()
    
    switch (error.type) {
      case 'network':
        console.log(`Network error: ${error.status}`)
        break
      case 'validation':
        console.log(`Invalid fields: ${error.fields.join(', ')}`)
        break
      case 'auth':
        console.log(`Auth failed: ${error.reason}`)
        break
    }
  }
}
```

### Mapped Types

```typescript
// Convert object of values to object of Results
type ResultMap<T> = {
  [K in keyof T]: ResultType<T[K], Error>
}

interface UserData {
  email: string
  age: number
  name: string
}

type ValidatedUserData = ResultMap<UserData>
// {
//   email: ResultType<string, Error>
//   age: ResultType<number, Error>
//   name: ResultType<string, Error>
// }
```

### Conditional Types

```typescript
// Extract Result value type or return never
type ExtractOk<T> = T extends ResultType<infer U, unknown> ? U : never

// Check if type is a Result
type IsResult<T> = T extends ResultType<unknown, unknown> ? true : false

// Unwrap nested Results
type UnwrapResult<T> = 
  T extends ResultType<infer U, unknown>
    ? UnwrapResult<U>
    : T
```

## Function Signatures

### Function Returning Result

```typescript
// Basic
function parse(input: string): ResultType<Data, Error>

// With generics
function convert<T, E>(value: unknown): ResultType<T, E>

// With constraints
function validate<T extends object>(data: unknown): ResultType<T, ValidationError>
```

### Async Function Returning Result

```typescript
// Basic
async function fetchData(url: string): AsyncResultType<Data, Error>

// Shorthand
async function fetchData(url: string): Promise<ResultType<Data, Error>>
```

### Callback with Result

```typescript
type ResultCallback<T, E> = (result: ResultType<T, E>) => void

function processAsync<T, E>(
  operation: () => Promise<T>,
  callback: ResultCallback<T, E>
): void {
  Result.fromPromise(operation).then(callback)
}
```

## Type Inference Examples

### Automatic Inference

```typescript
// Infers ResultType<number, never>
const result1 = Result.ok(42)

// Infers ResultType<never, string>
const result2 = Result.err('failed')

// Infers ResultType<number, string>
const result3 = Math.random() > 0.5
  ? Result.ok(42)
  : Result.err('failed')
```

### Chain Inference

```typescript
// Each step infers types automatically
const result = Result.ok(5)           // ResultType<number, never>
  .map(x => x * 2)                    // ResultType<number, never>
  .andThen(x =>                       // ResultType<string, Error>
    x > 0 
      ? Result.ok(String(x))
      : Result.err(new Error('negative'))
  )
```

### Collection Inference

```typescript
// Infers tuple types
const results = Result.all([
  Result.ok(1),
  Result.ok('hello'),
  Result.ok(true)
])
// ResultType<[number, string, boolean], never>

// Infers union types
const anyResult = Result.any([
  Result.ok(1),
  Result.ok('hello')
])
// ResultType<number | string, unknown[]>
```

## Common Type Issues

### Issue: Type Widening

```typescript
// ❌ Type widened to ResultType<number | string, never>
const result = condition
  ? Result.ok(42)
  : Result.ok('hello')

// ✅ Explicitly type the function
function getResult(condition: boolean): ResultType<number | string, never> {
  return condition ? Result.ok(42) : Result.ok('hello')
}
```

### Issue: Generic Constraints

```typescript
// ❌ Too generic
function process<T>(value: T): ResultType<T, Error> {
  // Can't validate unknown type
}

// ✅ Add constraint
function process<T extends Validatable>(value: T): ResultType<T, Error> {
  if (!value.isValid()) {
    return Result.err(new Error('Invalid'))
  }
  return Result.ok(value)
}
```

### Issue: Union Narrowing

```typescript
type AppResult = ResultType<User, AppError>

function handle(result: AppResult) {
  // ❌ Can't access without narrowing
  // const value = result.unwrap()
  
  // ✅ Narrow first
  if (result.isOk()) {
    const value = result.unwrap()
  }
}
```
