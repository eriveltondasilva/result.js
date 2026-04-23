import { Err } from './err'
import { Ok } from './ok'
import { result } from './result'
import type { AsyncResult as AsyncResultType, Result as ResultType } from './types'

/**
 * Result is a type that represents an operation that can succeed (Ok) or fail (Err),
 * without using exceptions. Inspired by Rust's Result<T, E>.
 *
 * @remarks
 * Provides a fluent and type-safe API for error handling, allowing you to chain
 * operations, transform values, and handle success/failure cases explicitly.
 *
 * @namespace
 * @readonly
 *
 * @example
 * // Basic creation
 * const success = Result.ok(42)         // => Ok(42)
 * const failure = Result.err('failed')  // => Err('failed')
 *
 * // Transformation and chaining
 * const result = Result.ok(42).map((x) => x * 2).andThen((x) => Result.ok(x + 10))
 * // => Ok(94)
 *
 * // Error handling with try/catch
 * const parsed = Result.fromTry(() => JSON.parse('{"a":1}'))
 * // => Ok({a: 1})
 *
 * // Async/await usage
 * const user = await Result.fromPromise(async () => {
 *   const data = await fetch('https://jsonplaceholder.typicode.com/todos/1')
 *   return data.json()
 * })
 * // => Ok({userId: 1, id: 1, title: 'delectus aut autem', completed: false})
 *
 * // Combining multiple Results
 * const [a, b, c] = Result.all([Result.ok(1), Result.ok(2), Result.ok(3)])
 * // => Ok([1, 2, 3])
 */
export const Result = Object.freeze(result)

export type Result<T, E> = ResultType<T, E>
export type AsyncResult<T, E> = AsyncResultType<T, E>

export { Err, Ok }
export default Result
