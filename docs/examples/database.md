# Database Operations

## Query Execution

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
    (err): DbError =>
      typeof err === 'object' && err !== null && 'code' in err
        ? err as DbError
        : { code: 'UNKNOWN', detail: String(err) }
  )
}
```

## Transaction Handling

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

## Bulk Operations

```typescript
async function bulkInsert(users: User[]): AsyncResultType<number, DbError> {
  return Result.fromPromise(
    async () => {
      const result = await db.query(
        'INSERT INTO users (name, email) VALUES ($1, $2)',
        users.map(u => [u.name, u.email])
      )
      return result.rowCount
    },
    err => ({ code: 'INSERT_FAILED', detail: String(err) })
  )
}
```
