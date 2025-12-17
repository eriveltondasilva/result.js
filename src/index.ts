import * as factories from './core/factories.js'

import { Err } from './core/err.js'
import { Ok } from './core/ok.js'

// #region TYPE

/**
 * Represents a result that can be either success (Ok) or failure (Err).
 *
 * @see {@link AsyncResult} for async version
 * @template T - Success value type
 * @template E - Error type
 *
 * @example
 * ```ts
 * function divide(a: number, b: number): Result<number, string> {
 *   if (b === 0) {
 *     return Result.err('Division by zero')
 *   }
 *
 *   return Result.ok(a / b)
 * }
 *
 * const result = divide(10, 2)
 *
 * if (result.isOk()) {
 *   console.log(result.unwrap()) // 5
 * }
 * ```
 */
export type Result<T, E> = Ok<T, E> | Err<T, E>

/**
 * Represents a Promise that resolves to a Result.
 *
 * @template T - Success value type
 * @template E - Error type
 *
 * @example
 * ```ts
 * async function fetchUser(id: string): AsyncResult<User, Error> {
 *   return Result.fromPromise(
 *     async () => {
 *       const response = await fetch(`/api/users/${id}`)
 *       return response.json()
 *     }
 *   )
 * }
 * ```
 */
export type AsyncResult<T, E> = Promise<Result<T, E>>

// #endregion

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
 *
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
export const Result = Object.freeze({ ...factories } as const)

export { Ok, Err }
export default Result
