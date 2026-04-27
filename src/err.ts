import type { AsyncResult, Err as IErr, Ok as IOk, Result } from './types'
import type { MatchCases } from './types/methods'

import { TAG } from './brand'
import { formatForDisplay } from './utils'

export class Err<T = never, E = Error> implements IErr<T, E> {
  readonly _tag = TAG.Err
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

  isOkAnd(_condition: (value: T) => boolean): this is IOk<T, E> {
    return false
  }

  isErrAnd(condition: (error: E) => boolean): this is IErr<T, E> {
    return condition(this.#error)
  }

  // #endregion

  // #region Extraction

  unwrap(): never {
    throw new Error('Called unwrap on an Err value', { cause: this.#error })
  }

  unwrapErr(): E {
    return this.#error
  }

  unwrapOr<U = T>(defaultValue: U): T | U {
    return defaultValue
  }

  unwrapOrElse<U = T>(fallback: (error: E) => U): T | U {
    return fallback(this.#error)
  }

  expect(reason: string): never {
    throw new Error(reason, { cause: this.#error })
  }

  expectErr(_reason: string): E {
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

  mapOrElse<U>(_okMapper: (value: T) => U, errMapper: (error: E) => U): U {
    return errMapper(this.#error)
  }

  mapErr<E2>(mapper: (error: E) => E2): Result<T, E2> {
    return new Err(mapper(this.#error))
  }

  filter(_condition: (value: T) => boolean, _reason?: string): Result<T, Error> {
    return this as unknown as Result<T, Error>
  }

  filterOrElse<E2>(
    _condition: (value: T) => boolean,
    _onFailure: (value: T) => E2,
  ): Result<T, E | E2> {
    return this as unknown as Result<T, E | E2>
  }

  flatten<U, E2>(this: IErr<Result<U, E2>, E>): Result<U, E | E2> {
    return this as unknown as Result<U, E | E2>
  }

  // #endregion

  // #region Alternation

  and<U, E2 = never>(_other: Result<U, E2>): Result<U, E | E2> {
    return this as unknown as Result<U, E | E2>
  }

  andThen<U, E2 = never>(_next: (value: T) => Result<U, E2>): Result<U, E | E2> {
    return this as unknown as Result<U, E | E2>
  }

  or<U = T, E2 = never>(other: Result<U, E2>): Result<T | U, E2> {
    return other as unknown as Result<T | U, E2>
  }

  orElse<U = T, E2 = never>(fallback: (error: E) => Result<U, E2>): Result<T | U, E2> {
    return fallback(this.#error) as unknown as Result<T | U, E2>
  }

  // #endregion

  // #region Combination

  zip<U, E2>(_other: Result<U, E2>): Result<[T, U], E | E2> {
    return this as unknown as Result<[T, U], E | E2>
  }

  zipWith<U, R, E2>(
    _other: Result<U, E2>,
    _combine: (value: T, otherValue: U) => R,
  ): Result<R, E | E2> {
    return this as unknown as Result<R, E | E2>
  }
  // #endregion

  // #region Inspection

  contains<U>(_value: U, _comparator?: (actual: T, expected: U) => boolean): boolean {
    return false
  }

  match<L, R>(cases: MatchCases<T, E, L, R>): L | R {
    return cases.err(this.#error)
  }

  inspect(_action: (value: T) => void): this {
    return this
  }

  inspectErr(action: (error: E) => void): this {
    action(this.#error)

    return this
  }

  // #endregion

  // #region Async Transformation

  async mapAsync<U>(_mapper: (value: T) => Promise<U>): AsyncResult<U, E> {
    return this as unknown as AsyncResult<U, E>
  }

  async mapErrAsync<E2>(mapper: (error: E) => Promise<E2>): AsyncResult<T, E2> {
    return new Err(await mapper(this.#error))
  }

  mapOrAsync<U>(_mapper: (value: T) => Promise<U>, defaultValue: U): Promise<U> {
    return Promise.resolve(defaultValue)
  }

  mapOrElseAsync<U>(
    _okMapper: (value: T) => Promise<U>,
    errMapper: (error: E) => Promise<U>,
  ): Promise<U> {
    return errMapper(this.#error)
  }

  // #endregion

  // #region Async Alternation

  andAsync<U, E2 = never>(_other: AsyncResult<U, E2>): AsyncResult<U, E | E2> {
    return Promise.resolve(this as unknown as Result<U, E | E2>)
  }

  andThenAsync<U, E2 = never>(_next: (value: T) => AsyncResult<U, E2>): AsyncResult<U, E | E2> {
    return Promise.resolve(this as unknown as Result<U, E | E2>)
  }

  orAsync<U = T, E2 = never>(other: AsyncResult<U, E2>): AsyncResult<T | U, E2> {
    return other as unknown as AsyncResult<T | U, E2>
  }

  orElseAsync<U = T, E2 = never>(
    fallback: (error: E) => AsyncResult<U, E2>,
  ): AsyncResult<T | U, E2> {
    return fallback(this.#error) as unknown as AsyncResult<T | U, E2>
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

  toValue(): T | undefined {
    return undefined
  }

  // #endregion
}
