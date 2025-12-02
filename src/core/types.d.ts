import type { Err } from './err.js'
import type { Ok } from './ok.js'

// #
export type Result<T, E> = Ok<T, E> | Err<T, E>
export type AsyncResult<T, E> = Promise<Result<T, E>>

// #
export type InferOk<R> = R extends Result<infer T, unknown> ? T : never
export type InferErr<R> = R extends Result<unknown, infer E> ? E : never

//#
export type OkTuple<T extends readonly Result<unknown, unknown>[]> = {
  [K in keyof T]: InferOk<T[K]>
}
export type ErrTuple<T extends readonly Result<unknown, unknown>[]> = {
  [K in keyof T]: InferErr<T[K]>
}

//#
export type OkUnion<T extends readonly Result<unknown, unknown>[]> = InferOk<T[number]>
export type ErrUnion<T extends readonly Result<unknown, unknown>[]> = InferErr<T[number]>

//#
export type SettledOk<T> = { status: 'ok'; value: T }
export type SettledErr<E> = { status: 'err'; reason: E }
export type SettledResult<T, E> = SettledOk<T> | SettledErr<E>

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
  map<U, F = never>(mapper: (value: T) => U | Result<U, F>): Result<U, E> | Result<U, E | F>
  mapOr<U>(mapper: (value: T) => U, defaultValue: U): U
  mapOrElse<U>(okMapper: (value: T) => U, errorMapper: (error: E) => U): U
  mapErr<F>(mapper: (error: E) => F): Result<T, F>
  filter(predicate: (value: T) => boolean, onReject?: (value: T) => E | Error): Result<T, E | Error>
  flatten<U, F>(this: Result<Result<U, F>, E>): Result<U, E | F>
  // #endregion

  // #region CHAINING
  andThen<U>(flatMapper: (value: T) => Result<U, E>): Result<U, E>
  orElse(onError: (error: E) => Result<T, E>): Result<T, E>
  and<U>(result: Result<U, E>): Result<U, E>
  or(result: Result<T, E>): Result<T, E>
  zip<U, F>(result: Result<U, F>): Result<[T, U], E | F>
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
  mapAsync<U, F = never>(
    mapperAsync: (value: T) => Promise<U | Result<U, F>>
  ): Promise<Result<U, E> | Result<U, E | F>>
  mapErrAsync<F>(mapperAsync: (error: E) => Promise<F>): AsyncResult<T, F>
  mapOrAsync<U>(mapperAsync: (value: T) => Promise<U>, defaultValue: U): Promise<U>
  mapOrElseAsync<U>(
    okMapperAsync: (value: T) => Promise<U>,
    errMapperAsync: (error: E) => Promise<U>
  ): Promise<U>
  andThenAsync<U>(flatMapperAsync: (value: T) => AsyncResult<U, E>): AsyncResult<U, E>
  andAsync<U>(result: AsyncResult<U, E>): AsyncResult<U, E>
  orAsync(result: AsyncResult<T, E>): AsyncResult<T, E>
  orElseAsync(onErrorAsync: (error: E) => AsyncResult<T, E>): AsyncResult<T, E>
  // #endregion

  // #region METADATA
  readonly [Symbol.toStringTag]: string
  [Symbol.for('nodejs.util.inspect.custom')]: string
  // #endregion
}
