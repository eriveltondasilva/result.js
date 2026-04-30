import type { Result as _Result } from './types';

import result from './result';

export type { AsyncResult, Err, Ok } from './types';

/**
 * Utilities for creating and composing {@link Result} values.
 *
 * @see {@link Ok} - success
 * @see {@link Err} - failure
 * @see {@link AsyncResult} - async version
 *
 * `Result<T, E>` represents either:
 *
 * - {@link Ok} — success containing `T`
 * - {@link Err} — failure containing `E`
 *
 * Inspired by Rust's `Result<T, E>`, enabling explicit error handling without exceptions.
 *
 * @remarks
 * Runtime namespace with helpers such as:
 *
 * - `Result.ok(value)`
 * - `Result.err(error)`
 * - `Result.fromTry(fn)`
 * - `Result.fromPromise(fn)`
 * - `Result.fromNullable(value)`
 * - `Result.all(results)`
 *
 * Also exported as a type alias:
 *
 * @example
 * function divide(a: number, b: number): Result<number, string> {
 *   if (b === 0) return Result.err('division by zero')
 *   return Result.ok(a / b)
 * }
 *
 * @example
 * const value = Result
 *   .ok(10)
 *   .map((x) => x * 2)
 *   .andThen((x) => Result.ok(x + 5))
 * // => Ok(25)
 *
 * @example
 * const parsed = Result.fromTry(() => JSON.parse(input))
 *
 * @example
 * const user = await Result.fromPromise(() => fetchUser(id))
 */
export const Result = Object.freeze(result);

export const { err, ok } = result;

export type Result<T, E> = _Result<T, E>;

export default Result;
