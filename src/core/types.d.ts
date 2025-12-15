import type { Ok } from './ok.js'
import type { Err } from './err.js'
import type { Result, AsyncResult } from '../index.js'
export type { Result, AsyncResult }

// #region INFERENCE

/**
 * Extracts the success value type (T) from a Result.
 * Returns never if the input is not a Result.
 * @internal
 */
export type InferOk<R> = R extends Result<infer T, unknown> ? T : never

/**
 * Extracts the error type (E) from a Result.
 * Returns never if the input is not a Result.
 * @internal
 */
export type InferErr<R> = R extends Result<unknown, infer E> ? E : never

// #endregion

// #region TUPLES

/**
 * Infers a tuple of success types from an array of Results.
 * @template T - A tuple of Result instances.
 * @internal
 */
export type OkTuple<T extends readonly Result<unknown, unknown>[]> = {
  [K in keyof T]: InferOk<T[K]>
}

/**
 * Infers a tuple of error types from an array of Results.
 * @template T - A tuple of Result instances.
 * @internal
 */
export type ErrTuple<T extends readonly Result<unknown, unknown>[]> = {
  [K in keyof T]: InferErr<T[K]>
}

// #endregion

// #region UNION

/**
 * Infers a union of all possible success types from an array of Results.
 * @template T - A tuple/array of Result instances.
 * @internal
 */
export type OkUnion<T extends readonly Result<unknown, unknown>[]> = InferOk<T[number]>

/**
 * Infers a union of all possible error types from an array of Results.
 * @template T - A tuple/array of Result instances.
 * @internal
 */
export type ErrUnion<T extends readonly Result<unknown, unknown>[]> = InferErr<T[number]>

// #endregion

// #region SETTLED

/**
 * Represents a successful outcome in a settled result structure (e.g., from Result.allSettled).
 * @internal
 */
export type SettledOk<T> = { status: 'ok'; value: T }

/**
 * Represents a failed outcome in a settled result structure (e.g., from Result.allSettled).
 * @internal
 */
export type SettledErr<E> = { status: 'err'; reason: E }

/**
 * Represents a final outcome of a Result operation, whether success or failure.
 * @internal
 */
export type SettledResult<T, E> = SettledOk<T> | SettledErr<E>

// #endregion

/**
 * Interface that both Ok and Err must implement.
 *
 * @internal
 * @template T - Success value type
 * @template E - Error type
 */
export interface ResultMethods<T, E> {
  // #region VALIDATION
  isOk(): this is Ok<T>
  isErr(): this is Err<E>
  isOkAnd(predicate: (value: T) => boolean): this is Ok<T>
  isErrAnd(predicate: (error: E) => boolean): this is Err<E>
  // #endregion

  // #region ACCESS
  readonly ok: T | null
  readonly err: E | null
  unwrap(): T
  unwrapErr(): E
  expect(message: string): T
  expectErr(message: string): E
  // #endregion

  // #region RECOVERY
  unwrapOr(defaultValue: T): T
  unwrapOrElse(onError: (error: E) => T): T
  // #endregion

  // #region TRANSFORMATION
  map<U>(mapper: (value: T) => U): Result<U, E>
  mapOr<U>(mapper: (value: T) => U, defaultValue: U): U
  mapOrElse<U>(okMapper: (value: T) => U, errorMapper: (error: E) => U): U
  mapErr<E2>(mapper: (error: E) => E2): Result<T, E2>
  filter(predicate: (value: T) => boolean, onReject?: (value: T) => E | Error): Result<T, E | Error>
  flatten<U, E2>(this: Result<Result<U, E2>, E>): Result<U, E | E2>
  // #endregion

  // #region CHAINING
  andThen<U>(flatMapper: (value: T) => Result<U, E>): Result<U, E>
  orElse(onError: (error: E) => Result<T, E>): Result<T, E>
  and<U>(result: Result<U, E>): Result<U, E>
  or(result: Result<T, E>): Result<T, E>
  zip<U, E2>(result: Result<U, E2>): Result<[T, U], E | E2>
  // #endregion

  // #region INSPECTION
  match<L, R>(handlers: { ok: (value: T) => L; err: (error: E) => R }): L | R
  inspect(visitor: (value: T) => void): Result<T, E>
  inspectErr(visitor: (error: E) => void): Result<T, E>
  // #endregion

  // #region COMPARISON
  contains(value: T, comparator?: (actual: T, expected: T) => boolean): boolean
  containsErr(error: E, comparator?: (actual: E, expected: E) => boolean): boolean
  // #endregion

  // #region CONVERSION
  toPromise(): Promise<T>
  toString(): string
  toJSON(): { type: 'ok'; value: T } | { type: 'err'; error: E }
  // #endregion

  // #region ASYNC OPERATIONS
  mapAsync<U>(mapperAsync: (value: T) => Promise<U>): AsyncResult<U, E>
  mapErrAsync<E2>(mapperAsync: (error: E) => Promise<E2>): AsyncResult<T, E2>
  mapOrAsync<U>(mapperAsync: (value: T) => Promise<U>, defaultValue: U): Promise<U>
  mapOrElseAsync<U>(
    okAsync: (value: T) => Promise<U>,
    errAsync: (error: E) => Promise<U>,
  ): Promise<U>
  andThenAsync<U>(mapAsync: (value: T) => AsyncResult<U, E>): AsyncResult<U, E>
  andAsync<U>(result: AsyncResult<U, E>): AsyncResult<U, E>
  orAsync(result: AsyncResult<T, E>): AsyncResult<T, E>
  orElseAsync(onErrorAsync: (error: E) => AsyncResult<T, E>): AsyncResult<T, E>
  // #endregion
}
