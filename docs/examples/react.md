# React Integration

## useAsync Hook

```typescript
import { useEffect, useState } from 'react'

interface UseAsyncState<T, E> {
  data: T | null
  error: E | null
  loading: boolean
}

function useAsync<T, E>(
  fn: () => AsyncResult<T, E>,
  deps: unknown[] = []
): UseAsyncState<T, E> {
  const [state, setState] = useState<UseAsyncState<T, E>>({
    data: null,
    error: null,
    loading: true
  })

  useEffect(() => {
    let mounted = true

    ;(async () => {
      const result = await fn()
      if (mounted) {
        result.match({
          ok: (data) => setState({ data, error: null, loading: false }),
          err: (error) => setState({ data: null, error, loading: false })
        })
      }
    })()

    return () => {
      mounted = false
    }
  }, deps)

  return state
}

// Usage
function UserProfile({ userId }: { userId: string }) {
  const { data: user, error, loading } = useAsync(() => fetchUser(userId), [userId])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  return <div>{user?.name}</div>
}
```

## useForm Hook

```typescript
interface UseFormState<T, E> {
  values: T
  errors: Partial<Record<keyof T, E>>
  isSubmitting: boolean
  setField: <K extends keyof T>(key: K, value: T[K]) => void
  submit: () => Promise<void>
}

function useForm<T, E>(
  initial: T,
  validate: (values: T) => Result<T, E[]>,
  onSuccess: (values: T) => Promise<void>
): UseFormState<T, E> {
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof T, E>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async () => {
    setIsSubmitting(true)

    validate(values).match({
      ok: async (validated) => {
        await onSuccess(validated)
        setIsSubmitting(false)
      },
      err: (validationErrors) => {
        const errorMap: Partial<Record<keyof T, E>> = {}
        validationErrors.forEach((err: any) => {
          if (err.field) errorMap[err.field as keyof T] = err
        })
        setErrors(errorMap)
        setIsSubmitting(false)
      }
    })
  }

  return {
    values,
    errors,
    isSubmitting,
    setField: (key, value) => setValues(prev => ({ ...prev, [key]: value })),
    submit
  }
}

// Usage
function RegisterForm() {
  const form = useForm(
    { email: '', password: '' },
    (values) => validateRegistration(values),
    async (values) => {
      await registerUser(values)
    }
  )

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.submit() }}>
      <input
        value={form.values.email}
        onChange={(e) => form.setField('email', e.target.value)}
      />
      {form.errors.email && <span>{form.errors.email.message}</span>}

      <button disabled={form.isSubmitting}>
        {form.isSubmitting ? 'Registering...' : 'Register'}
      </button>
    </form>
  )
}
```

## Match Component

```typescript
interface MatchProps<T, E> {
  result: Result<T, E> | AsyncResult<T, E>
  ok: (data: T) => React.ReactNode
  err: (error: E) => React.ReactNode
  pending?: React.ReactNode
}

export function Match<T, E>({ result, ok, err, pending }: MatchProps<T, E>) {
  if (result instanceof Promise) {
    return <div>{pending ?? 'Loading...'}</div>
  }

  return result.match({
    ok: (data) => ok(data),
    err: (error) => err(error)
  }) as React.ReactNode
}

// Usage
function UserCard({ userId }: { userId: string }) {
  const { data: result } = useAsync(() => fetchUser(userId), [userId])

  return (
    <Match
      result={result || Result.err({ message: 'Not found' })}
      ok={(user) => <div>{user.name}</div>}
      err={(error) => <div>Error: {error.message}</div>}
      pending={<div>Loading...</div>}
    />
  )
}
```
