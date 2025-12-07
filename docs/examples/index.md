# Examples

Real-world usage patterns and best practices.

## By Category

### Form Validation

**[→ Validation Examples](./validation)**

- Single field validation
- Multiple fields with error accumulation
- Fail-fast validation pipelines
- Custom error types

### API Integration

**[→ API Examples](./api-calls)**

- Basic HTTP requests
- Error handling with custom types
- Retry logic
- Parallel requests

### Database Operations

**[→ Database Examples](./database)**

- Query execution
- Transaction handling
- Connection pooling
- Error recovery

### Error Handling

**[→ Error Handling Patterns](./error-handling)**

- Graceful degradation
- Fallback chains
- Error logging
- Custom error types

## Quick Examples

### Basic Pattern

```typescript
function divide(a: number, b: number): ResultType<number, string> {
  if (b === 0) return Result.err('division by zero')
  return Result.ok(a / b)
}

const result = divide(10, 2)
if (result.isOk()) {
  console.log(result.unwrap()) // 5
}
```

### Async Pattern

```typescript
async function fetchUser(id: string): AsyncResultType<User, ApiError> {
  return Result.fromPromise(
    async () => {
      const res = await fetch(`/api/users/${id}`)
      if (!res.ok) throw { status: res.status }
      return res.json()
    },
    (err) => ({ status: 500, message: String(err) })
  )
}
```

### Validation Pipeline

```typescript
Result.ok(formData)
  .andThen(validateEmail)
  .andThen(validatePassword)
  .andThen(createAccount)
  .match({
    ok: (user) => redirect('/dashboard'),
    err: (error) => showError(error)
  })
```

## Common Use Cases

| Use Case | Pattern | Link |
|----------|---------|------|
| Form validation | `validate()`, `all()` | [→](./validation) |
| HTTP requests | `fromPromise()` | [→](./api-calls) |
| File operations | `fromTry()`, `fromPromise()` | [→](./error-handling) |
| Database queries | `fromPromise()`, `andThen()` | [→](./database) |
| Batch processing | `partition()`, `allSettled()` | [→](./error-handling) |
| Retry logic | `orElse()`, `orElseAsync()` | [→](./api-calls) |
| Fallback chains | `any()`, `or()` | [→](./error-handling) |

## Next Steps

Choose a category above or explore:

- **[API Reference](/api/)** - Method documentation
- **[Type Reference](/reference/types)** - TypeScript types
