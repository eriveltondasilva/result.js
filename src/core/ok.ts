import { Err } from './err.js'
import type { Result, ResultMethods } from './types.js'
import { assertFunction, assertMatchHandlers, assertResult } from './utils.js'

/**
 * Represents a successful Result containing a value.
 *
 * @template T - Success value type
 * @template E - Error type
 */
export class Ok<T, E = never> implements ResultMethods<T, E> {
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

  isOkAnd(predicate: (value: T) => boolean): this is Ok<T, never> {
    assertFunction(predicate, 'Result.isOkAnd', 'predicate')

    return predicate(this.#value)
  }

  isErrAnd(predicate: (error: E) => boolean): this is Err<never, E> {
    assertFunction(predicate, 'Result.isErrAnd', 'predicate')

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

  unwrapOrElse(onError: (error: E) => T): T {
    assertFunction(onError, 'Result.unwrapOrElse', 'onError')

    return this.#value
  }

  // ==================== TRANSFORMING ====================
  // Transform Ok values
  map<U>(mapper: (value: T) => U): Ok<U, E> {
    assertFunction(mapper, 'Result.map', 'mapper')

    return new Ok(mapper(this.#value))
  }

  mapOr<U>(mapper: (value: T) => U, _defaultValue: U): U {
    assertFunction(mapper, 'Result.mapOr', 'mapper')

    return mapper(this.#value)
  }

  mapOrElse<U>(okMapper: (value: T) => U, errorMapper: (error: E) => U): U {
    assertFunction(okMapper, 'Result.mapOrElse', 'okMapper')
    assertFunction(errorMapper, 'Result.mapOrElse', 'errorMapper')

    return okMapper(this.#value)
  }

  // Transform Err values
  mapErr<F>(mapper: (error: E) => F): Ok<T, F> {
    assertFunction(mapper, 'Result.mapErr', 'mapper')

    return this as unknown as Ok<T, F>
  }

  // Filter Ok values
  filter(predicate: (value: T) => boolean, onReject: (value: T) => E): Result<T, E> {
    assertFunction(predicate, 'Result.filter', 'predicate')
    assertFunction(onReject, 'Result.filter', 'onReject')

    return predicate(this.#value) ? this : new Err(onReject(this.#value))
  }

  // ==================== CHAINING ====================
  // Chain operations that return Result
  andThen<U>(flatMapper: (value: T) => Result<U, E>): Result<U, E> {
    assertFunction(flatMapper, 'Result.andThen', 'flatMapper')

    return flatMapper(this.#value)
  }

  orElse(onError: (error: E) => Result<T, E>): Ok<T, E> {
    assertFunction(onError, 'Result.orElse', 'onError')

    return this
  }

  // Combine with other Results
  and<U>(result: Result<U, E>): Result<U, E> {
    assertResult(result, 'Result.and')

    return result
  }

  or(_result: Result<T, E>): Ok<T, E> {
    assertResult(_result, 'Result.or')

    return this
  }

  zip<U, F>(result: Result<U, F>): Result<[T, U], E | F> {
    assertResult(result, 'Result.zip')

    if (result.isOk()) {
      return new Ok<[T, U], E | F>([this.#value, result.unwrap()])
    }

    return new Err<[T, U], E | F>(result.unwrapErr())
  }

  // ==================== INSPECTING ====================
  // Pattern matching
  match<L, R>(handlers: { ok: (value: T) => L; err: (error: E) => R }): L | R {
    assertMatchHandlers(handlers, 'Result.match')

    return handlers.ok(this.#value)
  }

  // Side effects (doesn't modify Result)
  inspect(visitor: (value: T) => void): Ok<T, E> {
    assertFunction(visitor, 'Result.inspect', 'visitor')

    visitor(this.#value)
    return this
  }

  inspectErr(visitor: (error: E) => void): Ok<T, E> {
    assertFunction(visitor, 'Result.inspectErr', 'visitor')

    return this
  }

  // ==================== COMPARING ====================
  contains(value: T, comparator?: (actual: T, expected: T) => boolean): boolean {
    comparator && assertFunction(comparator, 'Result.contains', 'comparator')

    return comparator ? comparator(this.#value, value) : this.#value === value
  }

  containsErr(_error: E, comparator?: (actual: E, expected: E) => boolean): boolean {
    comparator && assertFunction(comparator, 'Result.containsErr', 'comparator')

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
  mapAsync<U>(mapperAsync: (value: T) => Promise<U>): Promise<Ok<U, E>> {
    assertFunction(mapperAsync, 'Result.mapAsync', 'mapperAsync')

    return mapperAsync(this.#value).then((value) => new Ok(value))
  }

  mapErrAsync<F>(mapperAsync: (error: E) => Promise<F>): Promise<Ok<T, F>> {
    assertFunction(mapperAsync, 'Result.mapErrAsync', 'mapperAsync')

    return Promise.resolve(this as unknown as Ok<T, F>)
  }

  mapOrAsync<U>(mapperAsync: (value: T) => Promise<U>, _defaultValue: U): Promise<U> {
    assertFunction(mapperAsync, 'Result.mapOrAsync', 'mapperAsync')

    return mapperAsync(this.#value)
  }

  mapOrElseAsync<U>(
    okMapperAsync: (value: T) => Promise<U>,
    errMapperAsync: (error: E) => Promise<U>
  ): Promise<U> {
    assertFunction(okMapperAsync, 'Result.mapOrElseAsync', 'okMapperAsync')
    assertFunction(errMapperAsync, 'Result.mapOrElseAsync', 'errMapperAsync')

    return okMapperAsync(this.#value)
  }

  // Chaining
  andThenAsync<U>(flatMapperAsync: (value: T) => Promise<Result<U, E>>): Promise<Result<U, E>> {
    assertFunction(flatMapperAsync, 'Result.andThenAsync', 'flatMapperAsync')

    return flatMapperAsync(this.#value)
  }

  andAsync<U>(result: Promise<Result<U, E>>): Promise<Result<U, E>> {
    // assertResult(result, 'Result.andAsync')

    return result
  }

  orAsync(_result: Promise<Result<T, E>>): Promise<Ok<T, E>> {
    // assertResult(result, 'Result.orAsync')

    return Promise.resolve(this)
  }

  orElseAsync(onErrorAsync: (error: E) => Promise<Result<T, E>>): Promise<Ok<T, E>> {
    assertFunction(onErrorAsync, 'Result.orElseAsync', 'onErrorAsync')

    return Promise.resolve(this)
  }

  // ==================== METADATA ====================
  get [Symbol.toStringTag](): string {
    return 'Result.Ok'
  }

  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return `Ok(${JSON.stringify(this.#value, null, 2)})`
  }
}
