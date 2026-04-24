import type { AsyncResult, Err as IErr, Ok as IOk, Result } from './types'

import { formatForDisplay } from './utils'

export class Err<T = never, E = Error> implements IErr<T, E> {
  readonly _tag = 'Err'
  readonly #error: E

  constructor(error: E) {
    this.#error = error
  }

  // #region Type Guards

  isOk(): this is IOk<T, E> {
    return false
  }

  isErr(): this is IErr<T, E> {
    return true
  }

  isOkAnd(_predicate: (value: T) => boolean): this is IOk<T, E> {
    return false
  }

  isErrAnd(predicate: (error: E) => boolean): this is IErr<T, E> {
    return predicate(this.#error)
  }

  // #endregion

  // #region Extraction

  unwrap(): never {
    throw new Error('Called unwrap on an Err value', { cause: this.#error })
  }

  unwrapErr(): E {
    return this.#error
  }

  unwrapOr(defaultValue: T): T {
    return defaultValue
  }

  unwrapOrElse(onError: (error: E) => T): T {
    return onError(this.#error)
  }

  expect(message: string): never {
    throw new Error(message, { cause: this.#error })
  }

  expectErr(_message: string): E {
    return this.#error
  }

  // #endregion

  // #region Transformation

  map<U>(_mapper: (value: T) => U): Result<U, E> {
    return this as unknown as Result<U, E>
  }

  mapOr<U>(_mapper: (value: T) => U, defaultValue: U): U {
    return defaultValue
  }

  mapOrElse<U>(_okMapper: (value: T) => U, errorMapper: (error: E) => U): U {
    return errorMapper(this.#error)
  }

  mapErr<E2>(mapper: (error: E) => E2): Result<T, E2> {
    return new Err(mapper(this.#error))
  }

  filter(predicate: (value: T) => boolean): Result<T, Error>
  filter(predicate: (value: T) => boolean, onReject: (value: T) => E): Result<T, E>
  filter(_predicate: (value: T) => boolean, _onReject?: (value: T) => E): Result<T, E | Error> {
    return this as unknown as Result<T, E | Error>
  }

  flatten<U, E2>(this: IErr<Result<U, E2>, E>): Result<U, E | E2> {
    return this as unknown as Result<U, E | E2>
  }

  // #endregion

  // #region Alternation

  and<U, E2 = E>(_result: Result<U, E2>): Result<U, E | E2> {
    return this as unknown as Result<U, E | E2>
  }

  andThen<U, E2 = E>(_flatMapper: (value: T) => Result<U, E2>): Result<U, E | E2> {
    return this as unknown as Result<U, E | E2>
  }

  or<E2 = E>(result: Result<T, E2>): Result<T, E2> {
    return result
  }

  orElse<E2 = E>(onError: (error: E) => Result<T, E2>): Result<T, E2> {
    return onError(this.#error)
  }

  // #endregion

  // #region Combination

  zip<U, E2>(_result: Result<U, E2>): Result<[T, U], E | E2> {
    return this as unknown as Result<[T, U], E | E2>
  }

  // #endregion

  // #region Inspection

  contains(_value: T, _comparator?: (actual: T, expected: T) => boolean): boolean {
    return false
  }

  containsErr(error: E, comparator?: (actual: E, expected: E) => boolean): boolean {
    return comparator ? comparator(this.#error, error) : this.#error === error
  }

  match<L, R>(handlers: { ok: (value: T) => L; err: (error: E) => R }): L | R {
    return handlers.err(this.#error)
  }

  inspect(_visitor: (value: T) => void): Result<T, E> {
    return this
  }

  inspectErr(visitor: (error: E) => void): Result<T, E> {
    visitor(this.#error)

    return this
  }

  // #endregion

  // #region Async Transformation

  async mapAsync<U>(_mapperAsync: (value: T) => Promise<U>): AsyncResult<U, E> {
    return this as unknown as Result<U, E>
  }

  async mapErrAsync<E2>(mapperAsync: (error: E) => Promise<E2>): AsyncResult<T, E2> {
    return new Err(await mapperAsync(this.#error))
  }

  mapOrAsync<U>(_mapperAsync: (value: T) => Promise<U>, defaultValue: U): Promise<U> {
    return Promise.resolve(defaultValue)
  }

  mapOrElseAsync<U>(
    _okAsync: (value: T) => Promise<U>,
    errAsync: (error: E) => Promise<U>,
  ): Promise<U> {
    return errAsync(this.#error)
  }

  // #endregion

  // #region Async Alternation

  andAsync<U, E2 = E>(_result: AsyncResult<U, E2>): AsyncResult<U, E | E2> {
    return Promise.resolve(this as unknown as Result<U, E | E2>)
  }

  andThenAsync<U, E2 = E>(_mapAsync: (value: T) => AsyncResult<U, E2>): AsyncResult<U, E | E2> {
    return Promise.resolve(this as unknown as Result<U, E | E2>)
  }

  orAsync<E2 = E>(result: AsyncResult<T, E2>): AsyncResult<T, E2> {
    return result
  }

  orElseAsync<E2 = E>(onErrorAsync: (error: E) => AsyncResult<T, E2>): AsyncResult<T, E2> {
    return onErrorAsync(this.#error)
  }

  // #endregion

  // #region Conversion

  toString(): string {
    return `Err(${formatForDisplay(this.#error)})`
  }

  toJSON(): { type: 'err'; error: E } {
    return { type: 'err', error: this.#error }
  }

  toNullable(): null {
    return null
  }

  // #endregion
}
