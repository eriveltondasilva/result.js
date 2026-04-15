import { Result } from './index'

const result = Result.ok(42)
  .map((x) => x * 2)
  .andThen((x) => Result.ok(x + 10))
  .unwrap()

console.log(result)

const parsed = Result.fromTry(() => JSON.parse('{"a":1}'))

console.log(parsed.unwrap())

const user = await Result.fromPromise(async () => {
  const data = await fetch('https://jsonplaceholder.typicode.com/todos/1')
  return data.json()
})

console.log(user.unwrap())

function divide(a: number, b: number): Result<number, Error> {
  if (b === 0) {
    return Result.err(new Error('Cannot divide by zero'))
  }
  return Result.ok(a / b)
}
