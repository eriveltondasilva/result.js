/** biome-ignore-all lint/suspicious/noConsole: test file */
import { Result } from './index'

const log = (...args: unknown[]) => console.log(args.join(' '))

// -------------------------------------

const result = Result.ok(42)
  .map((x) => x * 2)
  .andThen((x) => Result.ok(x + 10))
  .unwrap()

log('result:', result)

// -------------------------------------

const parsed = Result.fromTry(() => {
  return JSON.parse('{"a":1}')
})

log('parsed:', parsed.unwrap())

// -------------------------------------

const user = await Result.fromPromise(async () => {
  const data = await fetch('https://jsonplaceholder.typicode.com/todos/1')
  return data.json()
})

log('user:', user.unwrap())

// -------------------------------------

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return Result.err('Cannot divide by zero')

  return Result.ok(a / b)
}

log('divide 10 by 2:', divide(10, 2).unwrap())
log('divide 10 by 0:', divide(10, 0).unwrapErr())

// -------------------------------------

log(
  'nested:',
  Result.ok(Result.ok(Result.ok(42)))
    .flatten()
    .flatten()
    .unwrap(),
)

// -------------------------------------

log(JSON.stringify(Result.ok(42)))
log(JSON.stringify(Result.err('fail')))

// -------------------------------------

// Tipos de erro distintos
type AuthError = { code: 'UNAUTHORIZED' }
type DbError = { code: 'DB_FAIL' }

declare function authenticate(token: string): Result<string, AuthError>
declare function fetchProfile(id: string): Result<number, DbError>

const result2 = authenticate('token')

const result3 = result2.andThen((user) => fetchProfile(user))

log(result3.unwrap())

const aa: Result<number, AuthError> = Result.ok(42)
const b: Result<string, DbError> = Result.ok('user')
const c = aa.and(b)
const d = c
log(d)
