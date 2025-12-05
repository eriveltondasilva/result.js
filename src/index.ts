import {
  all,
  allSettled,
  any,
  err,
  fromNullable,
  fromPromise,
  fromTry,
  isResult,
  ok,
  partition,
  validate,
} from './core/factories.js'

export type { AsyncResultType, ResultMethods, ResultType } from './core/types.js'

/**
 * teste lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua
 * @document ../docs/todos.md
 */

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
 * const success = Result.ok(42)
 * const failure = Result.err(new Error('failed'))
 *
 * @example
 * // Transformation and chaining
 * const result = Result.ok(21)
 *   .map(x => x * 2)
 *   .andThen(x => Result.ok(x + 10))
 *   .unwrap() // 52
 *
 * @example
 * // Error handling with try/catch
 * const parsed = Result.fromTry(() => JSON.parse('{"a":1}'))
 * if (parsed.isOk()) {
 *   console.log(parsed.unwrap()) // {a: 1}
 * }
 *
 * @example
 * // Async/await
 * const user = await Result.fromPromise(
 *   async () => fetch('/api/user').then(r => r.json())
 * )
 *
 * @example
 * // Combining multiple Results
 * const [a, b, c] = Result.all([
 *   Result.ok(1),
 *   Result.ok(2),
 *   Result.ok(3)
 * ]).unwrap() // [1, 2, 3]
 */
export const Result = Object.freeze({
  ok,
  err,
  fromTry,
  fromPromise,
  fromNullable,
  validate,
  isResult,
  all,
  any,
  partition,
  allSettled,
} as const)

export default Result
