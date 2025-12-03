import type { Err } from './err.js'
import type { Ok } from './ok.js'

// #region TYPES

/**
 * Represents a result that can be either success (Ok) or failure (Err).
 *
 * @see {@link AsyncResultType} for async version
 * @template T - Success value type
 * @template E - Error type
 *
 * @example
 * ```ts
 * function divide(a: number, b: number): ResultType<number, string> {
 *   return b === 0 ? Result.err('Division by zero') : Result.ok(a / b)
 * }
 *
 * const result = divide(10, 2)
 *
 * if (result.isOk()) {
 *   console.log(result.unwrap()) // 5
 * }
 * ```
 */
export type ResultType<T, E> = Ok<T, E> | Err<T, E>

/**
 * Represents a Promise that resolves to a Result.
 *
 * @template T - Success value type
 * @template E - Error type
 *
 * @example
 * ```ts
 * async function fetchUser(id: string): AsyncResultType<User, Error> {
 *   return Result.fromPromise(
 *     async () => {
 *       const response = await fetch(`/api/users/${id}`)
 *       return response.json()
 *     }
 *   )
 * }
 * ```
 */
export type AsyncResultType<T, E> = Promise<ResultType<T, E>>

// #endregion

// #region INFERENCE
export type InferOk<R> = R extends ResultType<infer T, unknown> ? T : never
export type InferErr<R> = R extends ResultType<unknown, infer E> ? E : never
// #endregion

// #region TUPLES
export type OkTuple<T extends readonly ResultType<unknown, unknown>[]> = {
  [K in keyof T]: InferOk<T[K]>
}
export type ErrTuple<T extends readonly ResultType<unknown, unknown>[]> = {
  [K in keyof T]: InferErr<T[K]>
}
// #endregion

// #region UNION
export type OkUnion<T extends readonly ResultType<unknown, unknown>[]> = InferOk<T[number]>
export type ErrUnion<T extends readonly ResultType<unknown, unknown>[]> = InferErr<T[number]>
// #endregion

// #region SETTLED
export type SettledOk<T> = { status: 'ok'; value: T }
export type SettledErr<E> = { status: 'err'; reason: E }
export type SettledResult<T, E> = SettledOk<T> | SettledErr<E>
// #endregion

/**
 * Interface that both Ok and Err must implement.
 */
export interface ResultMethods<T, E> {
  // #region VALIDATION
  isOk(): this is Ok<T, never>
  isErr(): this is Err<never, E>
  isOkAnd(predicate: (value: T) => boolean): this is Ok<T, never>
  isErrAnd(predicate: (error: E) => boolean): this is Err<never, E>
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
  map<U, F = never>(
    mapper: (value: T) => U | ResultType<U, F>
  ): ResultType<U, E> | ResultType<U, E | F>
  mapOr<U>(mapper: (value: T) => U, defaultValue: U): U
  mapOrElse<U>(okMapper: (value: T) => U, errorMapper: (error: E) => U): U
  mapErr<F>(mapper: (error: E) => F): ResultType<T, F>
  filter(
    predicate: (value: T) => boolean,
    onReject?: (value: T) => E | Error
  ): ResultType<T, E | Error>
  flatten<U, F>(this: ResultType<ResultType<U, F>, E>): ResultType<U, E | F>
  // #endregion

  // #region CHAINING
  andThen<U>(flatMapper: (value: T) => ResultType<U, E>): ResultType<U, E>
  orElse(onError: (error: E) => ResultType<T, E>): ResultType<T, E>
  and<U>(result: ResultType<U, E>): ResultType<U, E>
  or(result: ResultType<T, E>): ResultType<T, E>
  zip<U, F>(result: ResultType<U, F>): ResultType<[T, U], E | F>
  // #endregion

  // #region INSPECTION
  match<L, R>(handlers: { ok: (value: T) => L; err: (error: E) => R }): L | R
  inspect(visitor: (value: T) => void): ResultType<T, E>
  inspectErr(visitor: (error: E) => void): ResultType<T, E>
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
  mapAsync<U, F = never>(
    mapperAsync: (value: T) => Promise<U | ResultType<U, F>>
  ): Promise<ResultType<U, E> | ResultType<U, E | F>>
  mapErrAsync<F>(mapperAsync: (error: E) => Promise<F>): AsyncResultType<T, F>
  mapOrAsync<U>(mapperAsync: (value: T) => Promise<U>, defaultValue: U): Promise<U>
  mapOrElseAsync<U>(
    okMapperAsync: (value: T) => Promise<U>,
    errMapperAsync: (error: E) => Promise<U>
  ): Promise<U>
  andThenAsync<U>(flatMapperAsync: (value: T) => AsyncResultType<U, E>): AsyncResultType<U, E>
  andAsync<U>(result: AsyncResultType<U, E>): AsyncResultType<U, E>
  orAsync(result: AsyncResultType<T, E>): AsyncResultType<T, E>
  orElseAsync(onErrorAsync: (error: E) => AsyncResultType<T, E>): AsyncResultType<T, E>
  // #endregion

  // #region METADATA
  readonly [Symbol.toStringTag]: string
  [Symbol.for('nodejs.util.inspect.custom')]: string
  // #endregion
}
