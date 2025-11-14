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
  // #endregion

  // #region ACCESS
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

  unwrapOrElse(_fn: () => T): T {
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

  mapOr<U>(_defaultValue: U, fn: (value: T) => U): U {
    return fn(this.#value)
  }

  mapErr<F>(_fn: (error: E) => F): Ok<T, F> {
    return new Ok(this.#value)
  }

  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.#value)
  }

  flatten<U>(this: Ok<Result<U, E>, E>): Result<U, E> {
    return this.#value
  }
  // #endregion

  // #region COMBINATION
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

  // #region CONVERSION
  toPromise(): Promise<T> {
    return Promise.resolve(this.#value)
  }
  // #endregion

  // #region INSPECTION
  match<R>(handlers: { ok: (value: T) => R; err: (error: E) => R }): R {
    return handlers.ok(this.#value)
  }

  inspect(handlers: { ok: (value: T) => void; err: (error: E) => void }): Result<T, E> {
    handlers.ok(this.#value)
    return this
  }

  inspectOk(fn: (value: T) => void): Ok<T, E> {
    fn(this.#value)
    return this
  }

  inspectErr(_fn: (error: E) => void): Ok<T, E> {
    return this
  }
  // #endregion
}
