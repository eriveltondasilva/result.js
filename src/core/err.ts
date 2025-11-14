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
  // #endregion

  // #region ACCESS
  get ok(): null {
    return null
  }

  get err(): E {
    return this.#error
  }

  unwrap(): never {
    throw this.#error
  }

  unwrapErr(): E {
    return this.#error
  }

  unwrapOr(defaultValue: T): T {
    return defaultValue
  }

  unwrapOrElse(fn: () => T): T {
    return fn()
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

  mapOr<U>(defaultValue: U, _fn: (value: T) => U): U {
    return defaultValue
  }

  mapErr<F>(fn: (error: E) => F): Err<T, F> {
    return new Err(fn(this.#error))
  }

  andThen<U>(_fn: (value: T) => Result<U, E>): Err<U, E> {
    return new Err(this.#error)
  }

  flatten<U>(this: Err<Result<U, E>, E>): Err<U, E> {
    return new Err(this.#error)
  }
  // #endregion

  // #region COMBINATION
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

  // #region CONVERSION
  toPromise(): Promise<never> {
    return Promise.reject(this.#error)
  }
  // #endregion

  // #region INSPECTION
  match<R>(handlers: { ok: (value: T) => R; err: (error: E) => R }): R {
    return handlers.err(this.#error)
  }

  inspect(handlers: { ok: (value: T) => void; err: (error: E) => void }): Err<T, E> {
    handlers.err(this.#error)
    return this
  }

  inspectOk(_fn: (value: T) => void): Err<T, E> {
    return this
  }

  inspectErr(fn: (error: E) => void): Err<T, E> {
    fn(this.#error)
    return this
  }
  // #endregion
}
