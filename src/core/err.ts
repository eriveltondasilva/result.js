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

  // ==================== CHECKING ====================
  // Type guards to check Result state
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

  // ==================== EXTRACTING ====================
  // Access values directly (may be null)
  get ok(): null {
    return null
  }

  get err(): E {
    return this.#error
  }

  // Extract values (may throw)
  unwrap(): never {
    throw new Error('Called unwrap on an Err value', { cause: this.#error })
  }

  unwrapErr(): E {
    return this.#error
  }

  expect(message: string): never {
    throw new Error(message, { cause: this.#error })
  }

  expectErr(_message: string): E {
    return this.#error
  }

  // Extract with fallback (never throws)
  unwrapOr(defaultValue: T): T {
    return defaultValue
  }

  unwrapOrElse(fn: (error: E) => T): T {
    return fn(this.#error)
  }

  // ==================== TRANSFORMING ====================
  // Transform Ok values
  map<U>(_fn: (value: T) => U): Err<U, E> {
    return this as unknown as Err<U, E>
  }

  mapOr<U>(_fn: (value: T) => U, defaultValue: U): U {
    return defaultValue
  }

  mapOrElse<U>(_okFn: (value: T) => U, errFn: (error: E) => U): U {
    return errFn(this.#error)
  }

  // Transform Err values
  mapErr<F>(fn: (error: E) => F): Err<T, F> {
    return new Err(fn(this.#error))
  }

  // Filter Ok values
  filter(_predicate: (value: T) => boolean, _onReject: (value: T) => E): Result<T, E> {
    return this
  }

  // ==================== CHAINING ====================
  // Chain operations that return Result
  andThen<U>(_fn: (value: T) => Result<U, E>): Err<U, E> {
    return this as unknown as Err<U, E>
  }

  orElse(fn: (error: E) => Result<T, E>): Result<T, E> {
    return fn(this.#error)
  }

  // Combine with other Results
  and<U>(_result: Result<U, E>): Err<U, E> {
    return this as unknown as Err<U, E>
  }

  or(result: Result<T, E>): Result<T, E> {
    return result
  }

  zip<U, F>(_result: Result<U, F>): Result<[T, U], E | F> {
    return this as unknown as Err<[T, U], E | F>
  }

  // ==================== INSPECTING ====================
  // Pattern matching
  match<R1, R2>(handlers: { ok: (value: T) => R1; err: (error: E) => R2 }): R1 | R2 {
    return handlers.err(this.#error)
  }

  // Side effects (doesn't modify Result)
  inspect(_fn: (value: T) => void): Err<T, E> {
    return this
  }

  inspectErr(fn: (error: E) => void): Err<T, E> {
    fn(this.#error)
    return this
  }

  // ==================== COMPARING ====================
  contains(_value: T, _equals?: (actual: T, expected: T) => boolean): boolean {
    return false
  }

  containsErr(error: E, equals?: (actual: E, expected: E) => boolean): boolean {
    return equals ? equals(this.#error, error) : this.#error === error
  }

  // ==================== CONVERTING ====================
  flatten<U, F>(this: Err<Result<U, F>, E>): Err<U, E | F> {
    return this as unknown as Err<U, E | F>
  }

  toPromise(): Promise<never> {
    return Promise.reject(this.#error)
  }

  toString(): string {
    return `Err(${this.#error})`
  }

  toJSON(): { type: 'err'; error: E } {
    return { type: 'err', error: this.#error }
  }

  // ==================== ASYNC OPERATIONS ====================
  // Transforming
  mapAsync<U>(_fn: (value: T) => Promise<U>): Promise<Err<U, E>> {
    return Promise.resolve(this as unknown as Err<U, E>)
  }

  mapErrAsync<F>(fn: (error: E) => Promise<F>): Promise<Err<T, F>> {
    return fn(this.#error).then((error) => new Err(error))
  }

  mapOrAsync<U>(_fn: (value: T) => Promise<U>, defaultValue: U): Promise<U> {
    return Promise.resolve(defaultValue)
  }

  mapOrElseAsync<U>(_okFn: (value: T) => Promise<U>, errFn: (error: E) => Promise<U>): Promise<U> {
    return errFn(this.#error)
  }

  // Chaining
  andThenAsync<U>(_fn: (value: T) => Promise<Result<U, E>>): Promise<Err<U, E>> {
    return Promise.resolve(this as unknown as Err<U, E>)
  }

  andAsync<U>(_result: Promise<Result<U, E>>): Promise<Err<U, E>> {
    return Promise.resolve(this as unknown as Err<U, E>)
  }

  orAsync(result: Promise<Result<T, E>>): Promise<Result<T, E>> {
    return result
  }

  orElseAsync(fn: (error: E) => Promise<Result<T, E>>): Promise<Result<T, E>> {
    return fn(this.#error)
  }

  // ==================== METADATA ====================
  get [Symbol.toStringTag](): string {
    return 'Result.Err'
  }

  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return `Err(${JSON.stringify(this.#error)})`
  }
}
