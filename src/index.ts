import type { AsyncResult, Err, Ok, Result } from './types'

import results from './result'

/**
 * Utility namespace for creating and working with {@link Result} values.
 *
 * This enables explicit error handling without relying on thrown exceptions. Inspired by Rust's `Result<T, E>`.
 *
 * @namespace
 * @readonly
 *
 * @example
 * // Basic creation
 * const success = Result.ok(42)
 * // => Ok(42)
 *
 * const failure = Result.err('failed')
 * // => Err('failed')
 *
 * @example
 * // Transformation and chaining
 * const result = Result
 *   .ok(42)
 *   .map((x) => x * 2)
 *   .andThen((x) => Result.ok(x + 10))
 * // => Ok(94)
 *
 * @example
 * // Exception-safe execution
 * const parsed = Result.fromTry(
 *   () => JSON.parse('{"a":1}')
 * )
 * // => Ok({ a: 1 })
 *
 * @example
 * // Async usage
 * const user = await Result.fromPromise(async () => {
 *   const data = await fetch('https://jsonplaceholder.typicode.com/todos/1')
 *   return data.json()
 * })
 * // => Ok(...)
 *
 * @example
 * // Combining multiple Results
 * const [a, b, c] = Result.all([
 *   Result.ok(1),
 *   Result.ok(2),
 *   Result.ok(3)
 * ])
 * // => Ok([1, 2, 3])
 */
export const result = Object.freeze(results)

export type { AsyncResult, Err, Ok, Result }

export const { ok, err } = result
export default result
