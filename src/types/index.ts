import type { TAG } from '@/brand'
import type { ResultMethods } from './methods'

/**
 * Represents a successful Result containing a value.
 *
 * @internal
 *
 * @see {@link Err}
 *
 * @template T - Success value type
 * @template E - Error type (never used in Ok, but needed for typing)
 *
 * @example
 * const res = Result.ok(42)
 * res.unwrap()  // => Ok(42)
 * res.isOk()    // => true
 */
export interface Ok<T, E = never> extends ResultMethods<T, E> {
  /** @internal */
  readonly _tag: typeof TAG.Ok

  unwrap(): T
  unwrapErr(): never
  toJSON(): { type: 'ok'; value: T }
}

/**
 * Represents an error Result containing a failure.
 *
 * @internal
 *
 * @template T - Success value type (for type compatibility)
 * @template E - Error type
 *
 * @example
 * const res = Result.err('failed')
 * res.unwrapErr()  // => Err("failed")
 * res.isErr()      // => true
 */
export interface Err<T = never, E = Error> extends ResultMethods<T, E> {
  /** @internal */
  readonly _tag: typeof TAG.Err

  unwrap(): never
  unwrapErr(): E
  toJSON(): { type: 'err'; error: E }
}

/**
 * Represents a result that can be either success (Ok) or failure (Err).
 *
 * @see {@link AsyncResult} - for async version
 *
 * @template T - Success value type
 * @template E - Error type
 *
 * @example
 * function divide(a: number, b: number): Result<number, string> {
 *   if (b === 0) return Result.err('Division by zero')
 *
 *   return Result.ok(a / b)
 * }
 *
 * divide(10, 2) // => Ok(5)
 * divide(10, 0) // => Err('Division by zero')
 */
export type Result<T, E> = Ok<T, E> | Err<T, E>

/**
 * Represents a Promise that resolves to a Result.
 * Ideal for wrapping asynchronous operations like API calls or database queries.
 *
 * @see {@link Result} - for sync version
 *
 * @template T - Success value type
 * @template E - Error type
 *
 * @example
 * async function getUser(id: number): AsyncResult<User, Error> {
 *   return Result.fromPromise(() => fetchUserById(id))
 * }
 *
 * const res = await getUser(1)
 * // => Ok(User) | Err(Error)
 */
export type AsyncResult<T, E> = Promise<Result<T, E>>
