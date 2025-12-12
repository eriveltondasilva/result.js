# Express.js Integration

## Basic Route Handler

```typescript
import express, { Request, Response } from 'express'
import { Result } from '@eriveltonsilva/result.js'

type ApiError = { status: number; message: string }

interface User {
  id: string
  name: string
  email: string
}

async function getUser(id: string): AsyncResult<User, ApiError> {
  return Result.fromPromise(
    () => db.users.findById(id),
    (error): ApiError => ({
      status: error.status ?? 500,
      message: String(error)
    })
  )
}

const app = express()

app.get('/users/:id', async (req, res) => {
  const result = await getUser(req.params.id)

  result.match({
    ok: (user) => res.json(user),
    err: (error) => res.status(error.status).json({ error: error.message })
  })
})
```

## Request → Response Pipeline

```typescript
type ValidationError = { field: string; message: string }
type AppError = 
  | { type: 'validation'; errors: ValidationError[] }
  | { type: 'not_found' }
  | { type: 'server_error'; message: string }

function validateUserCreate(data: any): Result<User, ValidationError[]> {
  const errors: ValidationError[] = []

  if (!data.name?.trim()) {
    errors.push({ field: 'name', message: 'Name is required' })
  }
  if (!data.email?.includes('@')) {
    errors.push({ field: 'email', message: 'Invalid email' })
  }

  return errors.length > 0 ? Result.err(errors) : Result.ok(data)
}

app.post('/users', async (req, res) => {
  const result = Result.ok(req.body)
    .andThen((data) => validateUserCreate(data).map(() => data))
    .andThenAsync(async (data) => {
      const user = await db.users.create(data)
      return user ? Result.ok(user) : Result.err({ type: 'server_error', message: 'Create failed' })
    })

  result.match({
    ok: (user) => res.status(201).json(user),
    err: (error) => {
      if (Array.isArray(error)) {
        res.status(400).json({ errors: error })
      } else {
        res.status(500).json({ error: error.message })
      }
    }
  })
})
```

## Service Layer Pattern

```typescript
class UserService {
  async findById(id: string): AsyncResult<User, ApiError> {
    return Result.fromPromise(
      () => db.users.findById(id),
      (): ApiError => ({ status: 404, message: 'User not found' })
    )
  }

  async create(data: any): AsyncResult<User, AppError> {
    return Result.ok(data)
      .andThen((d) => {
        const errors = this.validateCreate(d)
        return errors.length > 0
          ? Result.err({ type: 'validation', errors })
          : Result.ok(d)
      })
      .andThenAsync((d) => Result.fromPromise(() => db.users.create(d)))
  }

  private validateCreate(data: any): ValidationError[] {
    const errors: ValidationError[] = []
    if (!data.name) errors.push({ field: 'name', message: 'Required' })
    if (!data.email) errors.push({ field: 'email', message: 'Required' })
    return errors
  }
}

// Usage in routes
const userService = new UserService()

app.get('/users/:id', async (req, res) => {
  const result = await userService.findById(req.params.id)
  result.match({
    ok: (user) => res.json(user),
    err: (error) => res.status(error.status).json(error)
  })
})

app.post('/users', async (req, res) => {
  const result = await userService.create(req.body)
  result.match({
    ok: (user) => res.status(201).json(user),
    err: (error) => {
      if (error.type === 'validation') {
        res.status(400).json(error)
      } else {
        res.status(500).json(error)
      }
    }
  })
})
```

## Error Middleware

```typescript
function errorHandler(
  handler: (req: Request, res: Response) => Promise<void>
) {
  return async (req: Request, res: Response) => {
    try {
      await handler(req, res)
    } catch (error) {
      res.status(500).json({
        error: 'Internal server error',
        details: String(error)
      })
    }
  }
}

// Usage
app.get(
  '/users/:id',
  errorHandler(async (req, res) => {
    const result = await userService.findById(req.params.id)
    result.match({
      ok: (user) => res.json(user),
      err: (error) => res.status(404).json(error)
    })
  })
)
```
