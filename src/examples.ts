/** biome-ignore-all lint/suspicious/noConsole: test file */
import { Result } from './index'

const log = (...args: unknown[]) => console.log(args)

const result = Result.ok(42)
  .map((x) => x * 2)
  .andThen((x) => Result.ok(x + 10))
  .unwrap()

log('result:', result)

const parsed = Result.fromTry(() => JSON.parse('{"a":1}'))

log('parsed:', parsed.unwrap())

const user = await Result.fromPromise(async () => {
  const data = await fetch('https://jsonplaceholder.typicode.com/todos/1')
  return data.json()
})

log('user:', user.unwrap())

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return Result.err('Cannot divide by zero')
  }

  return Result.ok(a / b)
}

log('divide 10 by 2:', divide(10, 2).unwrap())
log('divide 10 by 0:', divide(10, 0).unwrapErr())
