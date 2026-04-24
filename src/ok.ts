import type { AsyncResult, Err as IErr, Ok as IOk, Result as IResult } from './types'

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

  map<U>(mapper: (value: T) => U): IResult<U, E> {
    return new Ok(mapper(this.#value)) as IResult<U, E>
  }

  mapOr<U>(mapper: (value: T) => U, _defaultValue: U): U {
    return mapper(this.#value)
  }

  mapOrElse<U>(okMapper: (value: T) => U, _errorMapper: (error: E) => U): U {
    return okMapper(this.#value)
  }

  mapErr<E2>(_mapper: (error: E) => E2): IResult<T, E2> {
    return this as unknown as IResult<T, E2>
  }

  filter(predicate: (value: T) => boolean): IResult<T, E>
  filter(predicate: (value: T) => boolean, onReject: (value: T) => E): IResult<T, E>
  filter(
    predicate: (value: T) => boolean,
    onReject?: (value: T) => E | Error,
  ): IResult<T, E | Error> {
    if (!predicate(this.#value)) {
      return new Err(
        onReject
          ? onReject(this.#value)
          : new Error(`Filter predicate failed for value: ${formatForDisplay(this.#value)}`),
      ) as unknown as IResult<T, E | Error>
    }

    return this as IResult<T, E | Error>
  }

  flatten<U, E2>(this: Ok<IResult<U, E2>, E>): IResult<U, E | E2> {
    return this.#value
  }

  // #endregion

  // #region Alternation

  and<U>(result: IResult<U, E>): IResult<U, E> {
    return result
  }

  andThen<U>(flatMapper: (value: T) => IResult<U, E>): IResult<U, E> {
    return flatMapper(this.#value)
  }

  or(_result: IResult<T, E>): IResult<T, E> {
    return this
  }

  orElse(_onError: (error: E) => IResult<T, E>): IResult<T, E> {
    return this
  }

  // #endregion

  // #region Combination

  zip<U, E2>(result: IResult<U, E2>) {
    if (result.isErr()) {
      return new Err<[T, U], E | E2>(result.unwrapErr())
    }

    return new Ok<[T, U], E | E2>([this.#value, result.unwrap()])
  }

  // #endregion

  // #region Inspection

  contains(value: T, comparator?: (actual: T, expected: T) => boolean): boolean {
    return comparator ? comparator(this.#value, value) : this.#value === value
  }

  containsErr(_error: E, _comparator?: (actual: E, expected: E) => boolean): boolean {
    return false
  }

  match<L, R>(handlers: { ok: (value: T) => L; err: (error: E) => R }): L | R {
    return handlers.ok(this.#value)
  }

  inspect(visitor: (value: T) => void): IResult<T, E> {
    visitor(this.#value)

    return this
  }

  inspectErr(_visitor: (error: E) => void): IResult<T, E> {
    return this
  }

  // #endregion

  // #region Async Transformation

  async mapAsync<U>(mapperAsync: (value: T) => Promise<U>) {
    return new Ok(await mapperAsync(this.#value))
  }

  mapErrAsync<E2>(_mapperAsync: (error: E) => Promise<E2>): AsyncResult<T, E2> {
    return Promise.resolve(this as unknown as IResult<T, E2>)
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

  andAsync<U>(result: AsyncResult<U, E>): AsyncResult<U, E> {
    return result
  }

  andThenAsync<U>(mapAsync: (value: T) => AsyncResult<U, E>): AsyncResult<U, E> {
    return mapAsync(this.#value)
  }

  orAsync(_result: AsyncResult<T, E>): AsyncResult<T, E> {
    return Promise.resolve(this)
  }

  orElseAsync(_onErrorAsync: (error: E) => AsyncResult<T, E>): AsyncResult<T, E> {
    return Promise.resolve(this)
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
