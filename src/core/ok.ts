import type { Err } from './err.js'
import type { IResult, Result } from './types.js'

/**
 * Represents a successful Result containing a value.
 *
 * @template T - Success value type
 * @template E - Error type
 */
export class Ok<T, E = never> implements IResult<T, E> {
  readonly #value: T

  constructor(value: T) {
    this.#value = value
  }

  // #region VALIDATION
  isOk(): this is Ok<T, never> {
    return true
  }

  isErr(): this is Err<never, E> {
    return false
  }

  isOkAnd(fn: (value: T) => boolean): this is Ok<T, never> {
    return fn(this.#value)
  }

  isErrAnd(_fn: (error: E) => boolean): this is Err<never, E> {
    return false
  }
  // #endregion

  // #region EXTRACTION
  get ok(): T {
    return this.#value
  }

  get err(): null {
    return null
  }

  unwrap(): T {
    return this.#value
  }

  unwrapErr(): never {
    throw new Error('Called unwrapErr on an Ok value')
  }

  unwrapOr(_defaultValue: T): T {
    return this.#value
  }

  unwrapOrElse(_fn: (error: E) => T): T {
    return this.#value
  }

  expect(_message: string): T {
    return this.#value
  }

  expectErr(message: string): never {
    throw new Error(message)
  }
  // #endregion

  // #region TRANSFORMATION
  map<U>(fn: (value: T) => U): Ok<U, E> {
    return new Ok(fn(this.#value))
  }

  mapErr<F>(_fn: (error: E) => F): Ok<T, F> {
    return new Ok(this.#value)
  }

  mapOr<U>(_defaultValue: U, fn: (value: T) => U): U {
    return fn(this.#value)
  }

  mapOrElse<U>(_defaultFn: (error: E) => U, fn: (value: T) => U): U {
    return fn(this.#value)
  }
  // #endregion

  // #region CHAINING
  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.#value)
  }

  and<U>(other: Result<U, E>): Result<U, E> {
    return other
  }

  or(_other: Result<T, E>): Ok<T, E> {
    return this
  }

  orElse(_fn: (error: E) => Result<T, E>): Ok<T, E> {
    return this
  }
  // #endregion

  // #region INSPECTION
  match<R>(handlers: { ok: (value: T) => R; err: (error: E) => R }): R {
    return handlers.ok(this.#value)
  }

  inspect(fn: (value: T) => void): Ok<T, E> {
    fn(this.#value)
    return this
  }

  inspectErr(_fn: (error: E) => void): Ok<T, E> {
    return this
  }
  // #endregion

  // #region CONVERSION
  flatten<U, F>(this: Ok<Result<U, F>, E>): Result<U, E | F> {
    return this.#value
  }

  toPromise(): Promise<T> {
    return Promise.resolve(this.#value)
  }
  // #endregion

  // #region ASYNC
  async mapAsync<U>(fn: (value: T) => Promise<U>): Promise<Ok<U, E>> {
    return new Ok(await fn(this.#value))
  }

  async mapErrAsync<F>(_fn: (error: E) => Promise<F>): Promise<Ok<T, F>> {
    return new Ok(this.#value)
  }

  async mapOrAsync<U>(defaultValue: U, _fn: (value: T) => Promise<U>): Promise<U> {
    return defaultValue
  }

  async mapOrElseAsync<U>(
    _defaultFn: (error: E) => Promise<U>,
    fn: (value: T) => Promise<U>
  ): Promise<U> {
    return fn(this.#value)
  }

  async andThenAsync<U>(fn: (value: T) => Promise<Result<U, E>>): Promise<Result<U, E>> {
    return await fn(this.#value)
  }

  async andAsync<U>(other: Promise<Result<U, E>>): Promise<Result<U, E>> {
    return other
  }

  async orAsync(_other: Promise<Result<T, E>>): Promise<Ok<T, E>> {
    return this
  }

  async orElseAsync(_fn: (error: E) => Promise<Result<T, E>>): Promise<Ok<T, E>> {
    return this
  }

  async inspectAsync(_fn: (value: T) => Promise<void>): Promise<Ok<T, E>> {
    return this
  }

  async inspectErrAsync(_fn: (error: E) => Promise<void>): Promise<Ok<T, E>> {
    return this
  }
  // #endregion
}
