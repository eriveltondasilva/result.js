// biome-ignore-all lint/suspicious/noConsole: test file
import { ok, Result } from './index'

const log = (...args: unknown[]) => console.log(args)

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

// Tipos de erro distintos
type AuthError = { code: 'UNAUTHORIZED' }
type DbError = { code: 'DB_FAIL' }

const aa: Result<number, AuthError> = Result.ok(42)
const b: Result<string, DbError> = Result.ok('user')
const c = aa.and(b)
const d = c
log('d', d.unwrap())

// -------------------------------------

// biome-ignore format: reason
const aaa = Result
  .ok({ name: 'aaa', value: true })
  .contains(
    {username: 'aaa'},
    (a, b) => a.name === b.username // b.username
  )

log('aaa', aaa)

// -------------------------------------

const any = Result.any([Result.err(1), Result.err('a'), Result.err(true)])

log('any:', any.unwrapErr())

// -------------------------------------

const all = Result.all([Result.ok(1), Result.ok('a'), Result.ok(true)])

log('all:', all.unwrap())

// -------------------------------------

// const error = new Error('Something went wrong', {
//   cause: { code: 'INTERNAL_ERROR', details: 'Database connection failed' },
// })
// log('error:', error.name)
// log('error:', error)

// -------------------------------------

// const result2: Result<number, string> = Result.err('not found')
// const filtered = result2.filter((x) => x > 0)

// log('filtered:', filtered.unwrapErr())

// -------------------------------------

const testFiltered = Result.ok(42).filter((x) => x > 0)

log('filtered:', testFiltered.isOk() ? testFiltered.unwrap() : testFiltered.unwrapErr())

// -------------------------------------

const result5 = Result.ok(42)

console.log(result5._tag)

if (result5.isOk()) {
  result5 // Ok<number, string> ✅
  result5.unwrap() // number ✅
}

const test2 = ok('hello').map((x) => x.toUpperCase())

log('test2:', test2.unwrap())

// -------------------------------------

// const result3 = Result.allSettled([Result.ok(1), Result.err('fail'), Result.ok(true)])

// result3.match({
//   ok: (x) => log('Ok:', x),
//   err: (x) => log('Err:', x),
// })

// -------------------------------------

const r = Result.ok(42)
r.unwrap() // ✅ number
// r.unwrapErr() // ✅ never (erro de tipo em compile time)

const e = Result.err(new Error())
// e.unwrap()    // ✅ never (erro de tipo em compile time)
e.unwrapErr() // ✅ Error

// -------------------------------------

log(Result.ok(42))
