import { Err } from './err.js'
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

  // ==================== CHECKING ====================
  // Type guards to check Result state
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

  // ==================== EXTRACTING ====================
  // Access values directly (may be null)
  get ok(): T {
    return this.#value
  }

  get err(): null {
    return null
  }

  // Extract values (may throw)
  unwrap(): T {
    return this.#value
  }

  unwrapErr(): never {
    throw new Error(`Called unwrapErr on an Ok value: ${String(this.#value)}`)
  }

  expect(_message: string): T {
    return this.#value
  }

  expectErr(message: string): never {
    throw new Error(`${message}: ${String(this.#value)}`)
  }

  // Extract with fallback (never throws)
  unwrapOr(_defaultValue: T): T {
    return this.#value
  }

  unwrapOrElse(_fn: (error: E) => T): T {
    return this.#value
  }

  // ==================== TRANSFORMING ====================
  // Transform Ok values
  map<U>(fn: (value: T) => U): Ok<U, E> {
    return new Ok(fn(this.#value))
  }

  mapOr<U>(fn: (value: T) => U, _defaultValue: U): U {
    return fn(this.#value)
  }

  mapOrElse<U>(okFn: (value: T) => U, _errFn: (error: E) => U): U {
    return okFn(this.#value)
  }

  // Transform Err values
  mapErr<F>(_fn: (error: E) => F): Ok<T, F> {
    return this as unknown as Ok<T, F>
  }

  // Filter Ok values
  filter(predicate: (value: T) => boolean, onReject: (value: T) => E): Result<T, E> {
    return predicate(this.#value) ? this : new Err(onReject(this.#value))
  }

  // ==================== CHAINING ====================
  // Chain operations that return Result
  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.#value)
  }

  orElse(_fn: (error: E) => Result<T, E>): Ok<T, E> {
    return this
  }

  // Combine with other Results
  and<U>(result: Result<U, E>): Result<U, E> {
    return result
  }

  or(_result: Result<T, E>): Ok<T, E> {
    return this
  }

  zip<U, F>(result: Result<U, F>): Result<[T, U], E | F> {
    if (result.isOk()) {
      return new Ok<[T, U], E | F>([this.#value, result.ok])
    }
    return new Err<[T, U], E | F>(result.err as F)
  }

  // ==================== INSPECTING ====================
  // Pattern matching
  match<R1, R2>(handlers: { ok: (value: T) => R1; err: (error: E) => R2 }): R1 | R2 {
    return handlers.ok(this.#value)
  }

  // Side effects (doesn't modify Result)
  inspect(fn: (value: T) => void): Ok<T, E> {
    fn(this.#value)
    return this
  }

  inspectErr(_fn: (error: E) => void): Ok<T, E> {
    return this
  }

  // ==================== COMPARING ====================
  contains(value: T, equals?: (actual: T, expected: T) => boolean): boolean {
    return equals ? equals(this.#value, value) : this.#value === value
  }

  containsErr(_error: E, _equals?: (actual: E, expected: E) => boolean): boolean {
    return false
  }

  // ==================== CONVERTING ====================
  flatten<U, F>(this: Ok<Result<U, F>, E>): Result<U, E | F> {
    return this.#value
  }

  toPromise(): Promise<T> {
    return Promise.resolve(this.#value)
  }

  toString(): string {
    return `Ok(${String(this.#value)})`
  }

  toJSON(): { type: 'ok'; value: T } {
    return { type: 'ok', value: this.#value }
  }

  // ==================== ASYNC OPERATIONS ====================
  // Transforming
  mapAsync<U>(fn: (value: T) => Promise<U>): Promise<Ok<U, E>> {
    return fn(this.#value).then((value) => new Ok(value))
  }

  mapErrAsync<F>(_fn: (error: E) => Promise<F>): Promise<Ok<T, F>> {
    return Promise.resolve(this as unknown as Ok<T, F>)
  }

  mapOrAsync<U>(fn: (value: T) => Promise<U>, _defaultValue: U): Promise<U> {
    return fn(this.#value)
  }

  mapOrElseAsync<U>(okFn: (value: T) => Promise<U>, _errFn: (error: E) => Promise<U>): Promise<U> {
    return okFn(this.#value)
  }

  // Chaining
  andThenAsync<U>(fn: (value: T) => Promise<Result<U, E>>): Promise<Result<U, E>> {
    return fn(this.#value)
  }

  andAsync<U>(result: Promise<Result<U, E>>): Promise<Result<U, E>> {
    return result
  }

  orAsync(_result: Promise<Result<T, E>>): Promise<Ok<T, E>> {
    return Promise.resolve(this)
  }

  orElseAsync(_fn: (error: E) => Promise<Result<T, E>>): Promise<Ok<T, E>> {
    return Promise.resolve(this)
  }

  // ==================== METADATA ====================
  get [Symbol.toStringTag](): string {
    return 'Result.Ok'
  }

  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return `Ok(${JSON.stringify(this.#value)})`
  }
}
