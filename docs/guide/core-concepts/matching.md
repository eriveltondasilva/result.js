# Pattern Matching

Using `match()` to handle both success and error cases elegantly.

## The match() Method

Explicitly handle both Ok and Err cases:

```typescript
result.match({
  ok: (value) => handleSuccess(value),
  err: (error) => handleError(error)
})
```

Returns the result of whichever handler is called.

## Basic Examples

### Simple Message

```typescript
const msg = Result.ok(42).match({
  ok: (x) => `Success: ${x}`,
  err: (e) => `Error: ${e}`
})
// "Success: 42"
```

### Conditional Logic

```typescript
Result.err('not found').match({
  ok: (user) => {
    console.log('User found:', user)
    return user
  },
  err: (error) => {
    console.error('Error:', error)
    return null
  }
})
```

## React Components

Return different components based on Result:

```typescript
function UserProfile({ userId }: { userId: string }) {
  const { data: result } = useAsync(() => fetchUser(userId))

  return (
    result?.match({
      ok: (user) => <UserCard user={user} />,
      err: (error) => <ErrorMessage error={error} />
    }) || <Loading />
  )
}
```

## HTTP Responses

Convert Result to HTTP response:

```typescript
async function getUserHandler(req: Request) {
  const result = await fetchUser(req.params.id)

  return result.match({
    ok: (user) => {
      res.status(200).json(user)
    },
    err: (error) => {
      res.status(error.code).json({ error: error.message })
    }
  })
}
```

## Error-Specific Handling

Handle different error types:

```typescript
type ApiError = 
  | { type: 'not_found'; resource: string }
  | { type: 'validation'; field: string; message: string }
  | { type: 'unauthorized' }
  | { type: 'server_error'; status: number }

fetchUser(id).match({
  ok: (user) => console.log('User:', user),
  err: (error) => {
    switch (error.type) {
      case 'not_found':
        console.error(`${error.resource} not found`)
        showNotFoundPage()
        break
      case 'validation':
        console.error(`${error.field}: ${error.message}`)
        showValidationError(error.field, error.message)
        break
      case 'unauthorized':
        redirectToLogin()
        break
      case 'server_error':
        console.error(`Server error: ${error.status}`)
        showServerError()
        break
    }
  }
})
```

## Returning Values

Both handlers must return compatible types:

```typescript
// Both return strings
const message = result.match({
  ok: (value) => `Got: ${value}`,
  err: (error) => `Failed: ${error}`
})

// Both return JSX
const element = result.match({
  ok: (user) => <Profile user={user} />,
  err: (error) => <Error error={error} />
})

// Transforming data in handlers
const processed = result.match({
  ok: (user) => ({
    id: user.id,
    name: user.name.toUpperCase()
  }),
  err: (error) => ({
    code: error.code,
    message: error.message
  })
})
```

## Side Effects

Execute side effects in handlers:

```typescript
result.match({
  ok: (data) => {
    logger.info('Operation successful', { data })
    analytics.track('success', { data })
    cache.set(key, data)
    return data
  },
  err: (error) => {
    logger.error('Operation failed', { error })
    analytics.track('error', { error })
    metrics.increment('failures')
    return null
  }
})
```

## Async Handlers

Use async functions in handlers:

```typescript
await result.match({
  ok: async (data) => {
    await saveToCache(data)
    await notifyUser('Success')
    return data
  },
  err: async (error) => {
    await logError(error)
    await notifyAdmin('Failure')
    return null
  }
})
```

## match() vs if-else Comparison

### If-Else Style

```typescript
if (result.isOk()) {
  const value = result.unwrap()
  console.log('Value:', value)
} else {
  const error = result.unwrapErr()
  console.error('Error:', error)
}
```

### Pattern Matching Style

```typescript
result.match({
  ok: (value) => console.log('Value:', value),
  err: (error) => console.error('Error:', error)
})
```

Pattern matching is:

- More concise
- Clearer intent
- Functional style
- Easier to return values

## Real-World Example: Form Submission

```typescript
async function handleFormSubmit(formData: FormData) {
  const result = await validateAndSubmit(formData)

  return result.match({
    ok: async (response) => {
      showToast('Submitted successfully')
      resetForm()
      await navigate('/success')
      analytics.track('form_submitted', { form_type: 'contact' })
      return response
    },
    err: (error) => {
      showToast(`Error: ${error.message}`)
      logger.error('Form submission failed', { error, formData })
      setErrors(error.fields)
      analytics.track('form_submission_failed', { error: error.code })
      return null
    }
  })
}
```

## Best Practices

1. Use `match()` for final result handling
2. Keep handlers concise — extract complex logic to functions
3. Be consistent — all handlers return same type
4. Handle all cases — both ok and err must be present
5. Avoid nesting — don't nest match() calls
6. Perfect for React components and API responses

## Next Steps

- **[Async Operations](./async.md)** — Advanced async patterns
- **[Best Practices](../advanced/best-practices.md)** — General recommendations
