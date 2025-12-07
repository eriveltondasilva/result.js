# Form Validation Examples

## Single Field Validation

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

function validatePassword(password: string): ResultType<string, ValidationError> {
  if (password.length < 8) {
    return Result.err({ field: 'password', message: 'Min 8 characters' })
  }
  
  if (!/[A-Z]/.test(password)) {
    return Result.err({ field: 'password', message: 'Must contain uppercase' })
  }
  
  return Result.ok(password)
}
```

## Error Accumulation

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

// Usage
const result = validateForm(formData)
result.match({
  ok: (data) => console.log('Valid:', data),
  err: (errors) => errors.forEach((e) => 
    console.error(`${e.field}: ${e.message}`)
  )
})
```

## Fail-Fast Pipeline

```typescript
function validateUserSignup(data: FormData): ResultType<ValidatedForm, ValidationError> {
  return Result.ok(data)
    .andThen((d) => validateEmail(d.email).map(() => d))
    .andThen((d) => validatePassword(d.password).map(() => d))
    .andThen((d) => validateAge(d.age).map(() => d))
    .map((d) => ({ email: d.email, password: d.password, age: d.age }))
}

// Stops at first error
const result = validateUserSignup(formData)
```

## Complex Validation

```typescript
type User = { email: string; age: number; country: string }

function validateUser(data: unknown): ResultType<User, ValidationError> {
  return Result.validate(
    data,
    (d): d is Record<string, unknown> => typeof d === 'object' && d !== null,
    () => ({ field: 'root', message: 'Invalid data type' })
  )
  .andThen((d) => Result.fromNullable(
    d.email,
    () => ({ field: 'email', message: 'Email required' })
  ))
  .andThen((email) => validateEmail(String(email)))
  .map((email) => ({ email, age: 0, country: '' })) // Simplified
}
```

## With Custom Error Class

```typescript
class ValidationException extends Error {
  constructor(
    public field: string,
    message: string
  ) {
    super(message)
    this.name = 'ValidationException'
  }
}

function validateField(
  value: string,
  field: string,
  rules: ((v: string) => boolean)[]
): ResultType<string, ValidationException> {
  for (const rule of rules) {
    if (!rule(value)) {
      return Result.err(
        new ValidationException(field, `Validation failed for ${field}`)
      )
    }
  }
  return Result.ok(value)
}
```
