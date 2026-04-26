import type { TAG } from '../brand'
import type { ResultMethods } from './methods'

/**
 * Represents a successful Result containing a value.
 *
 * @remarks
 * You normally don't instantiate Ok directly. Use `Result.ok(value)`.
 *
 * @internal
 *
 * @see {@link Err}
 *
 * @template T - Success value type
 * @template E - Error type (never used in Ok, but needed for typing)
 *
 * @example
 * Result.ok(42).unwrap()  // 42
 * Result.ok(42).isOk()    // true
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
 * @remarks
 * You normally don't instantiate Err directly. Use `Result.err(error)`.
 *
 * @internal
 *
 * @template T - Success value type (for type compatibility)
 * @template E - Error type
 *
 * @example
 * Result.err(new Error('failed')).unwrapErr()  // Error: failed
 * Result.err(new Error('failed')).isErr()      // true
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
 * @see {@link AsyncResult} for async version
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
 */
export type Result<T, E> = Ok<T, E> | Err<T, E>

/**
 * Represents a Promise that resolves to a Result.
 *
 * @see {@link Result}
 *
 * @template T - Success value type
 * @template E - Error type
 *
 * @example
 * async function fetchUser(id: number): AsyncResult<User, Error> {
 *   return Result.fromPromise(async () => {
 *     const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
 *     return response.json()
 *   })
 * }
 *
 * await fetchUser(1)
 * // => Ok({ id: 1, name: 'Leanne Graham', ... }) or Err(Error('...'))
 */
export type AsyncResult<T, E> = Promise<Result<T, E>>
