import type { Ok } from './ok.js'
import type { IResult, Result } from './types.js'

/**
 * Represents a failed Result containing an error.
 *
 * @template T - Success value type
 * @template E - Error type
 */
export class Err<T = never, E = Error> implements IResult<T, E> {
  readonly #error: E

  constructor(error: E) {
    this.#error = error
  }

  // #region VALIDATION
  isOk(): this is Ok<T, never> {
    return false
  }

  isErr(): this is Err<never, E> {
    return true
  }

  isOkAnd(_fn: (value: T) => boolean): this is Ok<T, never> {
    return false
  }

  isErrAnd(fn: (error: E) => boolean): this is Err<never, E> {
    return fn(this.#error)
  }
  // #endregion

  // #region EXTRACTION
  get ok(): null {
    return null
  }

  get err(): E {
    return this.#error
  }

  unwrap(): never {
    throw new Error('Called unwrap on an Err value', { cause: this.#error })
  }

  unwrapErr(): E {
    return this.#error
  }

  unwrapOr(defaultValue: T): T {
    return defaultValue
  }

  unwrapOrElse(fn: (error: E) => T): T {
    return fn(this.#error)
  }

  expect(message: string): never {
    throw new Error(message, { cause: this.#error })
  }

  expectErr(_message: string): E {
    return this.#error
  }
  // #endregion

  // #region TRANSFORMATION
  map<U>(_fn: (value: T) => U): Err<U, E> {
    return new Err(this.#error)
  }

  mapErr<F>(fn: (error: E) => F): Err<T, F> {
    return new Err(fn(this.#error))
  }

  mapOr<U>(defaultValue: U, _fn: (value: T) => U): U {
    return defaultValue
  }

  mapOrElse<U>(defaultFn: (error: E) => U, _fn: (value: T) => U): U {
    return defaultFn(this.#error)
  }

  filter(_fn: (value: T) => boolean, _errorFn: (value: T) => E): Result<T, E> {
    return this
  }
  // #endregion

  // #region CHAINING
  andThen<U>(_fn: (value: T) => Result<U, E>): Err<U, E> {
    return new Err(this.#error)
  }

  and<U>(_other: Result<U, E>): Err<U, E> {
    return new Err(this.#error)
  }

  or(other: Result<T, E>): Result<T, E> {
    return other
  }

  orElse(fn: (error: E) => Result<T, E>): Result<T, E> {
    return fn(this.#error)
  }
  // #endregion

  // #region INSPECTION
  match<R>(handlers: { ok: (value: T) => R; err: (error: E) => R }): R {
    return handlers.err(this.#error)
  }

  inspect(_fn: (value: T) => void): Err<T, E> {
    return this
  }

  inspectErr(fn: (error: E) => void): Err<T, E> {
    fn(this.#error)
    return this
  }
  // #endregion

  // #region CONVERSION
  flatten<U, F>(this: Err<Result<U, F>, E>): Err<U, E | F> {
    return new Err(this.#error)
  }

  toPromise(): Promise<never> {
    return Promise.reject(this.#error)
  }
  // #endregion

  // #region ASYNC
  async mapAsync<U>(_fn: (value: T) => Promise<U>): Promise<Err<U, E>> {
    return new Err(this.#error)
  }

  async mapErrAsync<F>(fn: (error: E) => Promise<F>): Promise<Err<T, F>> {
    return new Err(await fn(this.#error))
  }

  async mapOrAsync<U>(defaultValue: U, _fn: (value: T) => Promise<U>): Promise<U> {
    return defaultValue
  }

  async mapOrElseAsync<U>(
    defaultFn: (error: E) => Promise<U>,
    _fn: (value: T) => Promise<U>
  ): Promise<U> {
    return defaultFn(this.#error)
  }

  async andThenAsync<U>(_fn: (value: T) => Promise<Result<U, E>>): Promise<Err<U, E>> {
    return new Err(this.#error)
  }

  async andAsync<U>(_other: Promise<Result<U, E>>): Promise<Err<U, E>> {
    return new Err(this.#error)
  }

  async orAsync(_other: Promise<Result<T, E>>): Promise<Result<T, E>> {
    return new Err(this.#error)
  }

  async orElseAsync(fn: (error: E) => Promise<Result<T, E>>): Promise<Result<T, E>> {
    return fn(this.#error)
  }

  async inspectAsync(_fn: (value: T) => Promise<void>): Promise<Err<T, E>> {
    return this
  }

  async inspectErrAsync(fn: (error: E) => Promise<void>): Promise<Err<T, E>> {
    await fn(this.#error)
    return this
  }
  // #endregion
}
