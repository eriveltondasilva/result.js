import type { TAG } from '@/lib/brand';
import type { ResultMethods } from './methods';

/**
 * Successful variant of {@link Result}.
 *
 * @see {@link Err} - for the error variant
 *
 * @template TValue - Type of the success value
 * @template TError - Error type carried by {@link Result}. Present only for union compatibility
 *
 * @example
 * const result = Result.ok(42)
 *
 * result.isOk()   // => true
 * result.unwrap() // => Ok(42)
 */
export interface Ok<TValue, TError = never> extends ResultMethods<TValue, TError> {
  /** @internal */
  readonly _tag: typeof TAG.Ok;

  unwrap(): TValue;
  unwrapErr(): never;

  toJSON(): { type: 'ok'; value: TValue };
}

/**
 * Failure variant of {@link Result}.
 *
 * @see {@link Ok} - for the success variant
 *
 * @template TValue - Success type carried by {@link Result}. Present only for union compatibility.
 * @template TError - Type of the stored error.
 *
 * @example
 * const result = Result.err('failed')
 *
 * result.isErr()     // => true
 * result.unwrapErr() // => Err("failed")
 */
export interface Err<TValue = never, TError = Error> extends ResultMethods<TValue, TError> {
  /** @internal */
  readonly _tag: typeof TAG.Err;

  unwrap(): never;
  unwrapErr(): TError;

  toJSON(): { type: 'err'; error: TError };
}

/**
 * Represents a result that can be either success ({@link Ok}) or failure ({@link Err}).
 *
 * @see {@link AsyncResult} - for async version
 *
 * @template TValue - Success value type
 * @template TError - Error value type
 *
 * @example
 * function divide(a: number, b: number): Result<number, string> {
 *   if (b === 0) return Result.err('Division by zero')
 *
 *   return Result.ok(a / b)
 * }
 *
 * divide(10, 2) // => Ok(5)
 * divide(10, 0) // => Err("Division by zero")
 */
export type Result<TValue, TError> = Ok<TValue, TError> | Err<TValue, TError>;

/**
 * Promise that resolves to a {@link Result}.
 *
 * @see {@link Result} - for sync version
 *
 * @template TValue - Success value type
 * @template TError - Error value type
 *
 * @example
 * async function getUser(id: number): AsyncResult<User, Error> {
 *   return Result.fromPromise(() => fetchUserById(id))
 * }
 *
 * const result = await getUser(1)
 * // => Ok(User) | Err(Error("..."))
 */
export type AsyncResult<TValue, TError> = Promise<Result<TValue, TError>>;
