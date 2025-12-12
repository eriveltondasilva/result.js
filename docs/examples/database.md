# Database Operations

## Query Execution

```typescript
type DbError = { code: string; detail: string }

interface User {
  id: string
  name: string
  email: string
}

async function findUserById(id: string): AsyncResult<User, DbError> {
  return Result.fromPromise(
    () => db.query<User>('SELECT * FROM users WHERE id = $1', [id]),
    (error): DbError => ({
      code: 'QUERY_FAILED',
      detail: String(error)
    })
  )
}

// Usage
const result = await findUserById('123')
result.match({
  ok: (user) => console.log('Found:', user),
  err: (error) => console.error(`${error.code}: ${error.detail}`)
})
```

## Transactions

```typescript
interface TransferResult {
  fromBalance: number
  toBalance: number
}

async function transferFunds(
  fromId: string,
  toId: string,
  amount: number
): AsyncResult<TransferResult, DbError> {
  return Result.fromPromise(
    async () => {
      const client = await db.connect()

      try {
        await client.query('BEGIN')

        // Deduct from source
        await client.query(
          'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
          [amount, fromId]
        )

        // Add to destination
        await client.query(
          'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
          [amount, toId]
        )

        // Verify balance
        const fromAccount = await client.query(
          'SELECT balance FROM accounts WHERE id = $1',
          [fromId]
        )

        if (fromAccount.balance < 0) {
          throw new Error('Insufficient funds')
        }

        await client.query('COMMIT')

        return {
          fromBalance: fromAccount.balance,
          toBalance: (await client.query(
            'SELECT balance FROM accounts WHERE id = $1',
            [toId]
          )).balance
        }
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }
    },
    (error): DbError => ({
      code: 'TRANSACTION_FAILED',
      detail: String(error)
    })
  )
}

// Usage
const result = await transferFunds('user1', 'user2', 100)
result.match({
  ok: (transfer) => console.log('Complete:', transfer),
  err: (error) => console.error('Failed:', error.detail)
})
```

## Batch Operations

```typescript
async function bulkInsertUsers(users: User[]): AsyncResult<number, DbError> {
  return Result.fromPromise(
    async () => {
      const values = users
        .map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`)
        .join(',')

      const params = users.flatMap((u) => [u.id, u.name, u.email])

      const result = await db.query(
        `INSERT INTO users (id, name, email) VALUES ${values} RETURNING id`,
        params
      )

      return result.length
    },
    (error): DbError => ({ code: 'INSERT_FAILED', detail: String(error) })
  )
}

// Usage
const result = await bulkInsertUsers([
  { id: '1', name: 'Alice', email: 'alice@example.com' },
  { id: '2', name: 'Bob', email: 'bob@example.com' }
])

result.match({
  ok: (count) => console.log(`Inserted ${count} users`),
  err: (error) => console.error('Insert failed:', error.detail)
})
```

## Batch Processing with Report

```typescript
interface ProcessingReport {
  total: number
  succeeded: number
  failed: number
}

async function processBatch(ids: string[]): Promise<ProcessingReport> {
  const results = await Promise.all(ids.map((id) => findUserById(id)))
  const [users, errors] = Result.partition(results)

  return {
    total: ids.length,
    succeeded: users.length,
    failed: errors.length
  }
}

// Usage
const report = await processBatch(['1', '2', '3', 'invalid'])
console.log(`Processed: ${report.succeeded}/${report.total}`)
```

## Data Migration

```typescript
async function migrateUsers(): AsyncResult<{ migrated: number }, DbError> {
  return Result.ok(null)
    .andThenAsync(async () => {
      // Fetch from legacy database
      return Result.fromPromise(() => legacyDb.fetchAllUsers())
    })
    .andThenAsync(async (legacyUsers) => {
      // Transform
      const transformed = legacyUsers.map((u) => ({
        id: u.legacyId,
        name: u.fullName,
        email: u.emailAddress
      }))
      return Result.ok(transformed)
    })
    .andThenAsync(async (users) => {
      // Insert to new database
      const insertResult = await bulkInsertUsers(users)
      return insertResult.map((count) => ({ migrated: count }))
    })
}

// Usage
const result = await migrateUsers()
result.match({
  ok: (report) => console.log(`Migration complete: ${report.migrated}`),
  err: (error) => console.error('Migration failed:', error.detail)
})
```
