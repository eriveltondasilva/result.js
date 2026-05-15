import type { Result as _Result } from './types';

import * as api from './api';

// ─── Namespace API ───────────────────────────────────────────────────────────

/**
 * Utilities for creating and composing {@link Result} values.
 *
 * @see {@link Ok} - success
 * @see {@link Err} - failure
 * @see {@link Result} - sync version
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
 * const parsed = Result.fromTry(
 *   () => JSON.parse(input)
 * )
 * // => Ok(parsed) | Err(Error)
 *
 * @example
 * const user = await Result.fromPromise(
 *   () => fetchUser(id)
 * )
 * // => Ok(user) | Err(Error)
 */
export const Result: typeof api = Object.freeze({ ...api });

// ─── Creation ────────────────────────────────────────────────────────────────

export { err, fromNullable, fromPromise, fromTry, ok, validate } from './api/creation';

// ─── Collection ──────────────────────────────────────────────────────────────

export { all, allSettled, any, errors, partition, values } from './api/collection';

// ─── Type Guards ─────────────────────────────────────────────────────────────

export { isErr, isOk, isResult } from './api/type-guards';

// ─── Types ───────────────────────────────────────────────────────────────────

export type Result<T, E> = _Result<T, E>;

export type { AsyncResult, Err, Ok } from './types';

export default Result;
