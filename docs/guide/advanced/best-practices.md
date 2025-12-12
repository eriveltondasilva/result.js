# Best Practices

10 core principles for effective Result.js usage.

## 1. Define Explicit Error Types

Avoid generic errors. Define domain-specific error types:

```typescript
// ✗ Too generic
function process(data: Data): Result<Output, Error>

// ✓ Better: specific error type
type ApiError = 
  | { type: 'not_found'; resource: string }
  | { type: 'validation'; field: string; message: string }
  | { type: 'unauthorized' }
  | { type: 'server_error'; status: number }

function process(data: Data): Result<Output, ApiError>
```

Benefits: TypeScript enforces handling all cases, enables precise recovery, self-documenting code.

## 2. Prefer Chaining Over Nested Checks

```typescript
// ✓ Prefer: clean pipeline
Result.ok(input)
  .andThen(validate)
  .andThen(transform)
  .andThen(save)

// ✗ Avoid: nested checks
const validated = validate(input)
if (validated.isErr()) return validated
const transformed = transform(validated.unwrap())
if (transformed.isErr()) return transformed
```

If chains become too long, break into smaller functions.

## 3. Use Pattern Matching for Final Handling

```typescript
// ✓ Prefer: explicit intent
result.match({
  ok: (value) => processValue(value),
  err: (error) => handleError(error)
})

// ✗ Avoid: if-else chains
if (result.isOk()) {
  processValue(result.unwrap())
} else {
  handleError(result.unwrapErr())
}
```

Perfect for React components and HTTP responses.

## 4. Transform Errors with Context

```typescript
// ✗ Generic error loses context
fetchUser(id).mapErr(e => new Error('Failed'))

// ✓ Better: Add context
fetchUser(id).mapErr(err => ({
  ...err,
  context: { userId: id, timestamp: Date.now() }
}))

// ✓ Standard structure
fetchUser(id).mapErr(err => ({
  type: 'api_error',
  status: err.statusCode || 500,
  message: err.message || 'Unknown error',
  userId: id,
  timestamp: Date.now()
}))
```

## 5. Use Inspect for Side Effects

Never put side effects in `map()`:

```typescript
// ✗ Avoid: side effects in map
result.map(x => {
  console.log(x)
  saveToDb(x)
  return x
})

// ✓ Prefer: explicit intent
result
  .inspect(x => console.log('Received:', x))
  .inspectErr(e => logger.error('Failed:', e))
  .andThen(saveToDb)
```

## 6. Be Consistent with Error Handling

```typescript
// ✓ Good: consistent use of Result
function validateEmail(email: string): Result<string, ValidationError> { ... }
function validatePassword(password: string): Result<string, ValidationError> { ... }

// ✗ Bad: mixing patterns
function validateEmail(email: string): Result<string, Error> { ... }
function validatePassword(password: string): Promise<string> { ... }
function validateAge(age: number): boolean { ... }
```

## 7. Fail-Fast vs Error Accumulation

Choose based on dependencies:

```typescript
// Fail-fast: later steps depend on earlier ones
Result.all([
  validateStructure(data),
  validateReferences(data),
  validateBusiness(data)
])

// Collect all: independent validations
const errors: ValidationError[] = []
if (validateEmail(data).isErr()) errors.push(...)
if (validatePassword(data).isErr()) errors.push(...)
return errors.length > 0 ? Result.err(errors) : Result.ok(...)
```

## 8. Always Await Async Methods

```typescript
// ✗ Wrong: forgot await
const result = operation().mapAsync(async x => x * 2)
console.log(result.unwrap()) // Error: result is Promise!

// ✓ Correct
const result = await operation().mapAsync(async x => x * 2)
console.log(result.unwrap())
```

## 9. Log Errors Meaningfully

```typescript
// ✗ Avoid: silent failures
operation().orElse(() => Result.ok(defaultValue))

// ✓ Better: log failures
operation()
  .inspectErr(error => {
    logger.error('Operation failed:', {
      error,
      timestamp: Date.now(),
      context: { userId, action }
    })
  })
  .orElse(() => Result.ok(defaultValue))
```

## 10. Test Both Paths

Always test success and failure cases:

```typescript
describe('divide', () => {
  it('should return Ok for valid division', () => {
    const result = divide(10, 2)
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toBe(5)
  })

  it('should return Err for division by zero', () => {
    const result = divide(10, 0)
    expect(result.isErr()).toBe(true)
    expect(result.unwrapErr()).toBe('Division by zero')
  })
})
```

## Anti-Patterns to Avoid

### Mixing Result with Exceptions

```typescript
// ✗ Inconsistent error handling
function process(data: Data): Result<Output, Error> {
  const result = validate(data)
  if (result.isErr()) return result
  
  if (someCondition) {
    throw new Error('Bad!')  // Mixing patterns!
  }
  
  return Result.ok(output)
}

// ✓ Consistent
function process(data: Data): Result<Output, Error> {
  const result = validate(data)
  if (result.isErr()) return result
  
  if (someCondition) {
    return Result.err(new Error('Bad!'))
  }
  
  return Result.ok(output)
}
```

### Overusing Result

```typescript
// ✗ Avoid: Result for operations that can't fail
function add(a: number, b: number): Result<number, never> {
  return Result.ok(a + b)
}

// ✓ Good: Result for fallible operations
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return Result.err('Division by zero')
  return Result.ok(a / b)
}
```

## Summary Checklist

- ✓ Define explicit error types
- ✓ Chain operations cleanly
- ✓ Use pattern matching for final handling
- ✓ Transform errors with context
- ✓ Use inspect() for side effects
- ✓ Be consistent with error handling
- ✓ Choose fail-fast or collect all appropriately
- ✓ Always await async methods
- ✓ Log errors meaningfully
- ✓ Test both success and failure paths

## Next Steps

- **[Migration Guide](./migration.md)** — Adopt Result in existing code
- **[Troubleshooting](./troubleshooting.md)** — Common issues
