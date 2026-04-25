import type { AsyncResult, Err as IErr, Ok as IOk, Result } from './types'

import { Err } from './err'
import { formatForDisplay } from './utils'

export class Ok<T, E = never> implements IOk<T, E> {
  readonly _tag = 'Ok'
  readonly #value: T

  constructor(value: T) {
    this.#value = value
  }

  // #region Type Guards

  isOk(): this is IOk<T, E> {
    return true
  }

  isErr(): this is IErr<T, E> {
    return false
  }

  isOkAnd(predicate: (value: T) => boolean): this is IOk<T, E> {
    return predicate(this.#value)
  }

  isErrAnd(_predicate: (error: E) => boolean): this is IErr<T, E> {
    return false
  }

  // #endregion

  // #region Extraction

  unwrap(): T {
    return this.#value
  }

  unwrapErr(): never {
    throw new Error(`Called unwrapErr on an Ok value: ${formatForDisplay(this.#value)}`)
  }

  unwrapOr(_defaultValue: T): T {
    return this.#value
  }

  unwrapOrElse(_onError: (error: E) => T): T {
    return this.#value
  }

  expect(_message: string): T {
    return this.#value
  }

  expectErr(message: string): never {
    throw new Error(`${message}: ${formatForDisplay(this.#value)}`)
  }

  // #endregion

  // #region Transformation

  map<U>(mapper: (value: T) => U): Result<U, E> {
    return new Ok(mapper(this.#value)) as Result<U, E>
  }

  mapOr<U>(mapper: (value: T) => U, _defaultValue: U): U {
    return mapper(this.#value)
  }

  mapOrElse<U>(okMapper: (value: T) => U, _errorMapper: (error: E) => U): U {
    return okMapper(this.#value)
  }

  mapErr<E2>(_mapper: (error: E) => E2): Result<T, E2> {
    return this as unknown as Result<T, E2>
  }

  filter(predicate: (value: T) => boolean): Result<T, Error>
  filter(predicate: (value: T) => boolean, onReject: (value: T) => E): Result<T, E>
  filter(predicate: (value: T) => boolean, onReject?: (value: T) => E): Result<T, E | Error> {
    if (!predicate(this.#value)) {
      return new Err(
        onReject
          ? onReject(this.#value)
          : new Error(`Filter predicate failed for value: ${formatForDisplay(this.#value)}`),
      ) as unknown as Result<T, E | Error>
    }

    return this as Result<T, E | Error>
  }

  flatten<U, E2>(this: IOk<Result<U, E2>, E>): Result<U, E | E2> {
    return this.unwrap()
  }

  // #endregion

  // #region Alternation

  and<U, E2 = E>(result: Result<U, E2>): Result<U, E | E2> {
    return result
  }

  andThen<U, E2 = E>(flatMapper: (value: T) => Result<U, E2>): Result<U, E | E2> {
    return flatMapper(this.#value)
  }

  or<E2 = E>(_result: Result<T, E2>): Result<T, E2> {
    return this as unknown as Result<T, E2>
  }

  orElse<E2 = E>(_onError: (error: E) => Result<T, E2>): Result<T, E2> {
    return this as unknown as Result<T, E2>
  }

  // #endregion

  // #region Combination

  zip<U, E2>(result: Result<U, E2>) {
    if (result.isErr()) {
      return new Err<[T, U], E | E2>(result.unwrapErr())
    }

    return new Ok<[T, U], E | E2>([this.#value, result.unwrap()])
  }

  // #endregion

  // #region Inspection

  contains<U>(value: U, comparator?: (actual: T, expected: U) => boolean): boolean {
    if (comparator) {
      return comparator(this.#value, value)
    }

    if (this.#value != null && typeof this.#value === 'object') {
      return JSON.stringify(this.#value) === JSON.stringify(value)
    }

    return (this.#value as unknown) === value
  }

  containsErr<U>(_error: U, _comparator?: (actual: E, expected: U) => boolean): boolean {
    return false
  }

  match<L, R>(handlers: { ok: (value: T) => L; err: (error: E) => R }): L | R {
    return handlers.ok(this.#value)
  }

  inspect(visitor: (value: T) => void): IOk<T, E> {
    visitor(this.#value)

    return this
  }

  inspectErr(_visitor: (error: E) => void): Result<T, E> {
    return this
  }

  // #endregion

  // #region Async Transformation

  async mapAsync<U>(mapperAsync: (value: T) => Promise<U>): AsyncResult<U, E> {
    return new Ok(await mapperAsync(this.#value)) as unknown as Result<U, E>
  }

  mapErrAsync<E2>(_mapperAsync: (error: E) => Promise<E2>): AsyncResult<T, E2> {
    return Promise.resolve(this as unknown as Result<T, E2>)
  }

  mapOrAsync<U>(mapperAsync: (value: T) => Promise<U>, _defaultValue: U): Promise<U> {
    return mapperAsync(this.#value)
  }

  mapOrElseAsync<U>(
    okAsync: (value: T) => Promise<U>,
    _errAsync: (error: E) => Promise<U>,
  ): Promise<U> {
    return okAsync(this.#value)
  }

  // #endregion

  // #region Async Alternation

  andAsync<U, E2 = E>(result: AsyncResult<U, E2>): AsyncResult<U, E | E2> {
    return result
  }

  andThenAsync<U, E2 = E>(mapAsync: (value: T) => AsyncResult<U, E2>): AsyncResult<U, E | E2> {
    return mapAsync(this.#value)
  }

  orAsync<E2 = E>(_result: AsyncResult<T, E2>): AsyncResult<T, E2> {
    return Promise.resolve(this as unknown as Result<T, E2>)
  }

  orElseAsync<E2 = E>(_onErrorAsync: (error: E) => AsyncResult<T, E2>): AsyncResult<T, E2> {
    return Promise.resolve(this as unknown as Result<T, E2>)
  }

  // #endregion

  // #region Conversion

  toString(): string {
    return `Ok(${formatForDisplay(this.#value)})`
  }

  toJSON(): { type: 'ok'; value: T } {
    return { type: 'ok', value: this.#value }
  }

  toNullable(): T {
    return this.#value
  }

  // #endregion
}
