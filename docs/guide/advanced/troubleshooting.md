# Troubleshooting

Common issues, debugging techniques, and solutions.

## Common Errors

### "Cannot read property X of undefined"

**Cause:** Forgot `await` on async method

```typescript
// ✗ Wrong: result is Promise<Result>, not Result
const result = result.mapAsync(async x => x * 2)
console.log(result.unwrap()) // Error: result is not a Result

// ✓ Correct: await to get Result
const result = await result.mapAsync(async x => x * 2)
console.log(result.unwrap()) // Works
```

### "Cannot call unwrap() on an Err value"

**Cause:** Attempted to extract value from Err without checking

```typescript
// ✗ Wrong: no safety check
const value = result.unwrap()

// ✓ Option 1: Check before unwrap
if (result.isOk()) {
  const value = result.unwrap()
}

// ✓ Option 2: Use fallback
const value = result.unwrapOr(defaultValue)

// ✓ Option 3: Pattern match
result.match({
  ok: (val) => useValue(val),
  err: (err) => handleError(err)
})
```

### Type Error with Generics

**Cause:** Error type not explicitly specified

```typescript
// ✗ Unclear type inference
const result = someOperation()

// ✓ Explicit error type
const result: Result<Data, ApiError> = someOperation()

// ✓ Or type the function
function operation(): Result<Data, ApiError> {
  // ...
}
```

### "Result.ok is not a function"

**Cause:** Incorrect import statement

```typescript
// ✓ Correct imports
import { Result } from '@eriveltonsilva/result.js'

// ✗ Wrong: don't import from submodules
import Result from '@eriveltonsilva/result.js/err'
```

### Async Method Returns Promise

**Cause:** Not awaiting async operation

```typescript
// ✗ Wrong: forgot await
const result = result.andThenAsync(async x => ...)
// result is Promise<Result>, not Result

// ✓ Correct
const result = await result.andThenAsync(async x => ...)
```

## Debugging Techniques

### Inspect Values in Console

```typescript
// View the value or error
console.log(result.ok)     // value or null
console.log(result.err)    // error or null

// String representation
console.log(result.toString())
// Ok(42) or Err(error message)

// JSON for logging
console.log(JSON.stringify(result))
// {"type":"ok","value":42} or {"type":"err","error":"message"}
```

### Add Inspection Points in Chain

```typescript
Result.ok(data)
  .inspect(d => console.log('After fetch:', d))
  .andThen(validate)
  .inspectErr(e => console.error('Validation failed:', e))
  .inspect(d => console.log('After validation:', d))
```

### Pretty Print in DevTools

```typescript
const result = await fetchUser(id)

// Add breakpoint and inspect
debugger
console.log(result)        // View full Result object
console.log(result.ok)     // View just the value
console.log(result.err)    // View just the error
```

### Log with Context

```typescript
operation()
  .mapErr(err => {
    console.error('Operation failed:', {
      error: err,
      timestamp: new Date().toISOString(),
      stack: new Error().stack
    })
    return err
  })
```

## FAQ

**Q: Can I mix Result and try-catch?**  
A: Not recommended. Choose one strategy for consistency.

**Q: What's the performance overhead?**  
A: ~50ns per operation. Negligible for 99% of applications.

**Q: How do I integrate with Promise-based APIs?**  
A: Use `Result.fromPromise()` to wrap Promises, or `.toPromise()` to convert Results.

**Q: Does Result support cancellation?**  
A: Not natively. Use AbortController with Promises.

**Q: Can I use Result with async/await?**  
A: Yes. Use `await Result.fromPromise(fn)` and `await result.mapAsync(fn)`.

**Q: How do I handle errors from async operations?**  
A: Use `Result.fromPromise()` or wrap with try-catch inside it:

```typescript
Result.fromPromise(
  async () => {
    const res = await fetch('/api/data')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  }
)
```

**Q: Should I always check with isOk() before unwrap()?**  
A: Yes, or use `.unwrapOr()`, `.match()`, or conditional checks instead.

**Q: How do I test functions returning Results?**  
A: Assert on `.isOk()` and `.isErr()`:

```typescript
test('should return Ok for valid input', () => {
  const result = validate(25)
  expect(result.isOk()).toBe(true)
  expect(result.unwrap()).toBe(25)
})

test('should return Err for invalid input', () => {
  const result = validate(-5)
  expect(result.isErr()).toBe(true)
  expect(result.unwrapErr().field).toBe('age')
})
```

## Still Need Help?

- **[Best Practices](./best-practices.md)** — Core principles
- **[Error Handling](../core-concepts/error-handling.md)** — Recovery strategies
- **[GitHub Issues](https://github.com/eriveltondasilva/result.js/issues)** — Report bugs
