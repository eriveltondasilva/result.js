import type { Ok } from './ok.js'
import type { Result, ResultMethods } from './types.js'

import { assertFunction, assertMatchHandlers, assertPromise, assertResult } from './utils.js'

/**
 * Represents a failed Result containing an error.
 *
 * @template T - Success value type
 * @template E - Error type
 */
export class Err<T = never, E = Error> implements ResultMethods<T, E> {
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

  isOkAnd(predicate: (value: T) => boolean): this is Ok<T, never> {
    assertFunction(predicate, 'Result.isOkAnd', 'predicate')

    return false
  }

  isErrAnd(predicate: (error: E) => boolean): this is Err<never, E> {
    assertFunction(predicate, 'Result.isErrAnd', 'predicate')

    return predicate(this.#error)
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

  unwrapOrElse(onError: (error: E) => T): T {
    assertFunction(onError, 'Result.unwrapOrElse', 'onError')

    return onError(this.#error)
  }

  // ==================== TRANSFORMING ====================
  // Transform Ok values
  map<U>(mapper: (value: T) => U): Err<U, E> {
    assertFunction(mapper, 'Result.map', 'mapper')

    return this as unknown as Err<U, E>
  }

  mapOr<U>(mapper: (value: T) => U, defaultValue: U): U {
    assertFunction(mapper, 'Result.mapOr', 'mapper')

    return defaultValue
  }

  mapOrElse<U>(okMapper: (value: T) => U, errorMapper: (error: E) => U): U {
    assertFunction(okMapper, 'Result.mapOrElse', 'okMapper')
    assertFunction(errorMapper, 'Result.mapOrElse', 'errorMapper')

    return errorMapper(this.#error)
  }

  // Transform Err values
  mapErr<F>(mapper: (error: E) => F): Err<T, F> {
    assertFunction(mapper, 'Result.mapErr', 'mapper')

    return new Err(mapper(this.#error))
  }

  // Filter Ok values
  filter(predicate: (value: T) => boolean, onReject: (value: T) => E): Result<T, E> {
    assertFunction(predicate, 'Result.filter', 'predicate')
    assertFunction(onReject, 'Result.filter', 'onReject')

    return this
  }

  // ==================== CHAINING ====================
  // Chain operations that return Result
  andThen<U>(flatMapper: (value: T) => Result<U, E>): Err<U, E> {
    assertFunction(flatMapper, 'Result.andThen', 'flatMapper')

    return this as unknown as Err<U, E>
  }

  orElse(onError: (error: E) => Result<T, E>): Result<T, E> {
    assertFunction(onError, 'Result.orElse', 'onError')

    return onError(this.#error)
  }

  // Combine with other Results
  and<U>(result: Result<U, E>): Err<U, E> {
    assertResult(result, 'Result.and')

    return this as unknown as Err<U, E>
  }

  or(result: Result<T, E>): Result<T, E> {
    assertResult(result, 'Result.or')

    return result
  }

  zip<U, F>(result: Result<U, F>): Result<[T, U], E | F> {
    assertResult(result, 'Result.zip')

    return this as unknown as Err<[T, U], E | F>
  }

  // ==================== INSPECTING ====================
  // Pattern matching
  match<L, R>(handlers: { ok: (value: T) => L; err: (error: E) => R }): L | R {
    assertMatchHandlers(handlers, 'Result.match')

    return handlers.err(this.#error)
  }

  // Side effects (doesn't modify Result)
  inspect(visitor: (value: T) => void): Err<T, E> {
    assertFunction(visitor, 'Result.inspect', 'visitor')

    return this
  }

  inspectErr(visitor: (error: E) => void): Err<T, E> {
    assertFunction(visitor, 'Result.inspectErr', 'visitor')

    visitor(this.#error)
    return this
  }

  // ==================== COMPARING ====================
  contains(_value: T, comparator?: (actual: T, expected: T) => boolean): boolean {
    comparator && assertFunction(comparator, 'Result.contains', 'comparator')

    return false
  }

  containsErr(error: E, comparator?: (actual: E, expected: E) => boolean): boolean {
    comparator && assertFunction(comparator, 'Result.containsErr', 'comparator')

    return comparator ? comparator(this.#error, error) : this.#error === error
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
  mapAsync<U>(mapperAsync: (value: T) => Promise<U>): Promise<Err<U, E>> {
    assertFunction(mapperAsync, 'Result.mapAsync', 'mapperAsync')

    return Promise.resolve(this as unknown as Err<U, E>)
  }

  mapErrAsync<F>(mapperAsync: (error: E) => Promise<F>): Promise<Err<T, F>> {
    assertFunction(mapperAsync, 'Result.mapErrAsync', 'mapperAsync')

    return mapperAsync(this.#error).then((error) => new Err(error))
  }

  mapOrAsync<U>(mapperAsync: (value: T) => Promise<U>, defaultValue: U): Promise<U> {
    assertFunction(mapperAsync, 'Result.mapOrAsync', 'mapperAsync')

    return Promise.resolve(defaultValue)
  }

  mapOrElseAsync<U>(
    okMapperAsync: (value: T) => Promise<U>,
    errMapperAsync: (error: E) => Promise<U>
  ): Promise<U> {
    assertFunction(okMapperAsync, 'Result.mapOrElseAsync', 'okMapperAsync')
    assertFunction(errMapperAsync, 'Result.mapOrElseAsync', 'errMapperAsync')

    return errMapperAsync(this.#error)
  }

  // Chaining
  andThenAsync<U>(flatMapperAsync: (value: T) => Promise<Result<U, E>>): Promise<Err<U, E>> {
    assertFunction(flatMapperAsync, 'Result.andThenAsync', 'flatMapperAsync')

    return Promise.resolve(this as unknown as Err<U, E>)
  }

  andAsync<U>(_result: Promise<Result<U, E>>): Promise<Err<U, E>> {
    assertPromise(_result, 'Result.andAsync', 'result')

    return Promise.resolve(this as unknown as Err<U, E>)
  }

  orAsync(result: Promise<Result<T, E>>): Promise<Result<T, E>> {
    assertPromise(result, 'Result.orAsync', 'result')

    return result
  }

  // zipAsync<U, F>(result: Promise<Result<U, F>>): Promise<Result<[T, U], E | F>> {
  //   assertPromise(result, 'Result.zipAsync', 'result')

  //   return Promise.resolve(new Err<[T, U], E | F>(this.#error))
  // }

  orElseAsync(onErrorAsync: (error: E) => Promise<Result<T, E>>): Promise<Result<T, E>> {
    assertFunction(onErrorAsync, 'Result.orElseAsync', 'onErrorAsync')

    return onErrorAsync(this.#error)
  }

  // ==================== METADATA ====================
  get [Symbol.toStringTag](): string {
    return 'Result.Err'
  }

  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return `Err(${JSON.stringify(this.#error, null, 2)})`
  }
}
