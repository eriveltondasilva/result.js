import { Err } from './err.js'
import type { Result, ResultMethods } from './types.js'
import { assertFunction, assertMatchHandlers, assertPromise, assertResult } from './utils.js'

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

  // #region CHECKING

  /**
   * Checks if Result is Ok variant.
   *
   * @returns {boolean} Always true for Ok
   * @example
   * const result = Result.ok(42)
   * result.isOk() // true
   */
  isOk(): this is Ok<T, never> {
    return true
  }

  /**
   * Checks if Result is Err variant.
   *
   * @returns {boolean} Always false for Ok
   * @example
   * const result = Result.ok(42)
   * result.isErr() // false
   */
  isErr(): this is Err<never, E> {
    return false
  }

  /**
   * Checks if Result is Ok and value satisfies predicate.
   *
   * @param {(value: T) => boolean} predicate - Validation function
   * @returns {boolean} True if Ok and predicate passes
   * @example
   * Result.ok(10).isOkAnd((x) => x > 5)
   * // true
   * Result.ok(3).isOkAnd((x) => x > 5)
   * // false
   */
  isOkAnd(predicate: (value: T) => boolean): this is Ok<T, never> {
    assertFunction(predicate, 'Result.isOkAnd', 'predicate')

    return predicate(this.#value)
  }

  /**
   * Checks if Result is Err and error satisfies predicate.
   *
   * @param {(error: E) => boolean} predicate - Validation function
   * @returns {boolean} Always false for Ok
   */
  isErrAnd(predicate: (error: E) => boolean): this is Err<never, E> {
    assertFunction(predicate, 'Result.isErrAnd', 'predicate')

    return false
  }

  // #endregion

  // ---

  // #region EXTRACTING

  /**
   * Gets success value or null.
   *
   * @returns {T} The wrapped value
   */
  get ok(): T {
    return this.#value
  }

  /**
   * Gets error value or null.
   *
   * @returns {null} Always null for Ok
   */
  get err(): null {
    return null
  }

  /**
   * Extracts success value.
   *
   * @returns {T} The wrapped value
   * @example
   * Result.ok(42).unwrap() // 42
   */
  unwrap(): T {
    return this.#value
  }

  /**
   * Extracts error value.
   *
   * @returns {never} Never returns
   * @throws {Error} Always throws for Ok
   */
  unwrapErr(): never {
    throw new Error(`Called unwrapErr on an Ok value: ${String(this.#value)}`)
  }

  /**
   * Extracts value with custom error message.
   *
   * @param {string} _message - Error message (ignored for Ok)
   * @returns {T} The wrapped value
   * @example
   * Result.ok(42).expect("should exist")
   * // 42
   */
  expect(_message: string): T {
    return this.#value
  }

  /**
   * Extracts error with custom message.
   *
   * @param {string} message - Error message
   * @returns {never} Never returns
   * @throws {Error} Always throws for Ok
   */
  expectErr(message: string): never {
    throw new Error(`${message}: ${String(this.#value)}`)
  }

  /**
   * Extracts value or returns default.
   *
   * @param {T} _defaultValue - Fallback value (ignored for Ok)
   * @returns {T} The wrapped value
   * @example
   * Result.ok(42).unwrapOr(0) // 42
   */
  unwrapOr(_defaultValue: T): T {
    return this.#value
  }

  /**
   * Extracts value or computes default from error.
   *
   * @param {(error: E) => T} onError - Default value generator
   * @returns {T} The wrapped value
   */
  unwrapOrElse(onError: (error: E) => T): T {
    assertFunction(onError, 'Result.unwrapOrElse', 'onError')

    return this.#value
  }

  // #endregion

  // ---

  // #region TRANSFORMING

  /**
   * Transforms success value.
   *
   * @template U - Transformed value type
   * @param {(value: T) => U} mapper - Transformation function
   * @returns {Ok<U, E>} Ok with transformed value
   * @example
   * Result.ok(5).map((x) => x * 2)
   * // Ok(10)
   */
  map<U>(mapper: (value: T) => U): Ok<U, E> {
    assertFunction(mapper, 'Result.map', 'mapper')

    return new Ok(mapper(this.#value))
  }

  /**
   * Transforms value or returns default.
   *
   * @template U - Transformed value type
   * @param {(value: T) => U} mapper - Transformation function
   * @param {U} _defaultValue - Fallback value (ignored for Ok)
   * @returns {U} Transformed value
   */
  mapOr<U>(mapper: (value: T) => U, _defaultValue: U): U {
    assertFunction(mapper, 'Result.mapOr', 'mapper')

    return mapper(this.#value)
  }

  /**
   * Transforms value using appropriate mapper.
   *
   * @template U - Transformed value type
   * @param {(value: T) => U} okMapper - Success mapper
   * @param {(error: E) => U} errorMapper - Error mapper
   * @returns {U} Transformed value
   */
  mapOrElse<U>(okMapper: (value: T) => U, errorMapper: (error: E) => U): U {
    assertFunction(okMapper, 'Result.mapOrElse', 'okMapper')
    assertFunction(errorMapper, 'Result.mapOrElse', 'errorMapper')

    return okMapper(this.#value)
  }

  /**
   * Transforms error value.
   *
   * @template F - New error type
   * @param {(error: E) => F} mapper - Error transformation function
   * @returns {Ok<T, F>} Ok with same value, different error type
   */
  mapErr<F>(mapper: (error: E) => F): Ok<T, F> {
    assertFunction(mapper, 'Result.mapErr', 'mapper')

    return this as unknown as Ok<T, F>
  }

  /**
   * Filters Ok value based on predicate.
   *
   * @param {(value: T) => boolean} predicate - Validation function
   * @param {(value: T) => E} onReject - Error generator for rejection
   * @returns {Result<T, E>} Ok if predicate passes, else Err
   * @example
   * Result.ok(10).filter(
   *   (x) => x > 5,
   *   () => new Error("too small")
   * )
   * // Ok(10)
   * Result.ok(3).filter(
   *   (x) => x > 5,
   *   () => new Error("too small")
   * )
   * // Err(Error: too small)
   */
  filter(predicate: (value: T) => boolean, onReject: (value: T) => E): Result<T, E> {
    assertFunction(predicate, 'Result.filter', 'predicate')
    assertFunction(onReject, 'Result.filter', 'onReject')

    return predicate(this.#value) ? this : new Err(onReject(this.#value))
  }

  // #endregion

  // ---

  // #region CHAINING

  /**
   * Chains operation that returns Result.
   *
   * @template U - New success type
   * @param {(value: T) => Result<U, E>} flatMapper - Chaining function
   * @returns {Result<U, E>} Result from flatMapper
   * @example
   * Result.ok(5).andThen((x) => Result.ok(x * 2))
   * // Ok(10)
   * Result.ok(5).andThen((x) => Result.err("fail"))
   * // Err("fail")
   */
  andThen<U>(flatMapper: (value: T) => Result<U, E>): Result<U, E> {
    assertFunction(flatMapper, 'Result.andThen', 'flatMapper')

    return flatMapper(this.#value)
  }

  /**
   * Returns this Result or executes error handler.
   *
   * @param {(error: E) => Result<T, E>} onError - Error recovery function
   * @returns {Ok<T, E>} This Ok instance
   */
  orElse(onError: (error: E) => Result<T, E>): Ok<T, E> {
    assertFunction(onError, 'Result.orElse', 'onError')

    return this
  }

  /**
   * Returns second Result if this is Ok.
   *
   * @template U - Second Result success type
   * @param {Result<U, E>} result - Result to return
   * @returns {Result<U, E>} The provided Result
   * @example
   * Result.ok(1).and(Result.ok(2))
   * // Ok(2)
   * Result.ok(1).and(Result.err("fail"))
   * // Err("fail")
   */
  and<U>(result: Result<U, E>): Result<U, E> {
    assertResult(result, 'Result.and')

    return result
  }

  /**
   * Returns this Result or alternative.
   *
   * @param {Result<T, E>} _result - Alternative Result (ignored for Ok)
   * @returns {Ok<T, E>} This Ok instance
   */
  or(_result: Result<T, E>): Ok<T, E> {
    assertResult(_result, 'Result.or')

    return this
  }

  /**
   * Combines two Results into tuple.
   *
   * @template U - Second Result success type
   * @template F - Second Result error type
   * @param {Result<U, F>} result - Result to zip with
   * @returns {Result<[T, U], E | F>} Ok with tuple or first Err
   * @example
   * Result.ok(1).zip(Result.ok(2))
   * // Ok([1, 2])
   * Result.ok(1).zip(Result.err("fail"))
   * // Err("fail")
   */
  zip<U, F>(result: Result<U, F>): Result<[T, U], E | F> {
    assertResult(result, 'Result.zip')

    if (result.isErr()) {
      return new Err<[T, U], E | F>(result.unwrapErr())
    }

    return new Ok<[T, U], E | F>([this.#value, result.unwrap()])
  }

  // #endregion

  // ---

  // #region INSPECTING

  /**
   * Pattern matches on Result state.
   *
   * @template L - Ok handler return type
   * @template R - Err handler return type
   * @param {{ ok: (value: T) => L; err: (error: E) => R }} handlers - Match handlers
   * @returns {L | R} Result from matching handler
   * @example
   * Result.ok(5).match({
   *   ok: (x) => x * 2,
   *   err: (e) => 0
   * })
   * // 10
   */
  match<L, R>(handlers: { ok: (value: T) => L; err: (error: E) => R }): L | R {
    assertMatchHandlers(handlers, 'Result.match')

    return handlers.ok(this.#value)
  }

  /**
   * Performs side effect on success value.
   *
   * @param {(value: T) => void} visitor - Side effect function
   * @returns {Ok<T, E>} This Ok instance for chaining
   * @example
   * Result.ok(42).inspect((x) => console.log(x))
   * // logs 42, returns Ok(42)
   */
  inspect(visitor: (value: T) => void): Ok<T, E> {
    assertFunction(visitor, 'Result.inspect', 'visitor')

    visitor(this.#value)
    return this
  }

  /**
   * Performs side effect on error value.
   *
   * @param {(error: E) => void} visitor - Side effect function
   * @returns {Ok<T, E>} This Ok instance unchanged
   */
  inspectErr(visitor: (error: E) => void): Ok<T, E> {
    assertFunction(visitor, 'Result.inspectErr', 'visitor')

    return this
  }

  // #endregion

  // ---

  // #region COMPARING

  /**
   * Checks if Ok contains specific value.
   *
   * @param {T} value - Value to compare
   * @param {(actual: T, expected: T) => boolean} [comparator] - Custom comparison
   * @returns {boolean} True if values match
   * @example
   * Result.ok(42).contains(42) // true
   * Result.ok(42).contains(99) // false
   */
  contains(value: T, comparator?: (actual: T, expected: T) => boolean): boolean {
    comparator && assertFunction(comparator, 'Result.contains', 'comparator')

    return comparator ? comparator(this.#value, value) : this.#value === value
  }

  /**
   * Checks if Err contains specific error.
   *
   * @param {E} _error - Error to compare (ignored for Ok)
   * @param {(actual: E, expected: E) => boolean} [comparator] - Custom comparison
   * @returns {boolean} Always false for Ok
   */
  containsErr(_error: E, comparator?: (actual: E, expected: E) => boolean): boolean {
    comparator && assertFunction(comparator, 'Result.containsErr', 'comparator')

    return false
  }

  // #endregion

  // ---

  // #region CONVERTING

  /**
   * Flattens nested Result.
   *
   * @template U - Inner Result success type
   * @template F - Inner Result error type
   * @param {Ok<Result<U, F>, E>} this - Nested Result
   * @returns {Result<U, E | F>} Flattened Result
   * @example
   * Result.ok(Result.ok(42)).flatten()
   * // Ok(42)
   */
  flatten<U, F>(this: Ok<Result<U, F>, E>): Result<U, E | F> {
    return this.#value
  }

  /**
   * Converts Result to resolved Promise.
   *
   * @returns {Promise<T>} Promise resolving to value
   * @example
   * await Result.ok(42).toPromise()
   * // 42
   */
  toPromise(): Promise<T> {
    return Promise.resolve(this.#value)
  }

  /**
   * Converts Result to string representation.
   *
   * @returns {string} String format
   */
  toString(): string {
    return `Ok(${String(this.#value)})`
  }

  /**
   * Converts Result to JSON object.
   *
   * @returns {{ type: 'ok'; value: T }} JSON representation
   */
  toJSON(): { type: 'ok'; value: T } {
    return { type: 'ok', value: this.#value }
  }

  // #endregion

  // ---

  // #region ASYNC OPERATIONS

  /**
   * Transforms value asynchronously.
   *
   * @template U - Transformed value type
   * @param {(value: T) => Promise<U>} mapperAsync - Async transformation
   * @returns {Promise<Ok<U, E>>} Promise of Ok with transformed value
   * @example
   * await Result.ok(5).mapAsync(async (x) => x * 2)
   * // Ok(10)
   */
  mapAsync<U>(mapperAsync: (value: T) => Promise<U>): Promise<Ok<U, E>> {
    assertFunction(mapperAsync, 'Result.mapAsync', 'mapperAsync')

    return mapperAsync(this.#value).then((value) => new Ok(value))
  }

  /**
   * Transforms error asynchronously.
   *
   * @template F - New error type
   * @param {(error: E) => Promise<F>} mapperAsync - Async error transformation
   * @returns {Promise<Ok<T, F>>} Promise of Ok with same value
   */
  mapErrAsync<F>(mapperAsync: (error: E) => Promise<F>): Promise<Ok<T, F>> {
    assertFunction(mapperAsync, 'Result.mapErrAsync', 'mapperAsync')

    return Promise.resolve(this as unknown as Ok<T, F>)
  }

  /**
   * Transforms value asynchronously or returns default.
   *
   * @template U - Transformed value type
   * @param {(value: T) => Promise<U>} mapperAsync - Async transformation
   * @param {U} _defaultValue - Fallback value (ignored for Ok)
   * @returns {Promise<U>} Promise of transformed value
   */
  mapOrAsync<U>(mapperAsync: (value: T) => Promise<U>, _defaultValue: U): Promise<U> {
    assertFunction(mapperAsync, 'Result.mapOrAsync', 'mapperAsync')

    return mapperAsync(this.#value)
  }

  /**
   * Transforms value using appropriate async mapper.
   *
   * @template U - Transformed value type
   * @param {(value: T) => Promise<U>} okMapperAsync - Async success mapper
   * @param {(error: E) => Promise<U>} errMapperAsync - Async error mapper
   * @returns {Promise<U>} Promise of transformed value
   */
  mapOrElseAsync<U>(
    okMapperAsync: (value: T) => Promise<U>,
    errMapperAsync: (error: E) => Promise<U>
  ): Promise<U> {
    assertFunction(okMapperAsync, 'Result.mapOrElseAsync', 'okMapperAsync')
    assertFunction(errMapperAsync, 'Result.mapOrElseAsync', 'errMapperAsync')

    return okMapperAsync(this.#value)
  }

  /**
   * Chains async operation returning Result.
   *
   * @template U - New success type
   * @param {(value: T) => Promise<Result<U, E>>} flatMapperAsync - Async chaining function
   * @returns {Promise<Result<U, E>>} Promise of Result from flatMapper
   */
  andThenAsync<U>(flatMapperAsync: (value: T) => Promise<Result<U, E>>): Promise<Result<U, E>> {
    assertFunction(flatMapperAsync, 'Result.andThenAsync', 'flatMapperAsync')

    return flatMapperAsync(this.#value)
  }

  /**
   * Returns async Result if this is Ok.
   *
   * @template U - Second Result success type
   * @param {Promise<Result<U, E>>} result - Async Result to return
   * @returns {Promise<Result<U, E>>} The provided Promise
   */
  andAsync<U>(result: Promise<Result<U, E>>): Promise<Result<U, E>> {
    assertPromise(result, 'Result.andAsync', 'result')

    return result
  }

  /**
   * Returns this Result or async alternative.
   *
   * @param {Promise<Result<T, E>>} _result - Alternative Result (ignored for Ok)
   * @returns {Promise<Ok<T, E>>} Promise of this Ok
   */
  orAsync(_result: Promise<Result<T, E>>): Promise<Ok<T, E>> {
    assertPromise(_result, 'Result.orAsync', 'result')

    return Promise.resolve(this)
  }

  /**
   * Returns this Result or executes async error handler.
   *
   * @param {(error: E) => Promise<Result<T, E>>} onErrorAsync - Async error recovery
   * @returns {Promise<Ok<T, E>>} Promise of this Ok
   */
  orElseAsync(onErrorAsync: (error: E) => Promise<Result<T, E>>): Promise<Ok<T, E>> {
    assertFunction(onErrorAsync, 'Result.orElseAsync', 'onErrorAsync')

    return Promise.resolve(this)
  }

  // #endregion

  // ---

  // #region METADATA

  get [Symbol.toStringTag](): string {
    return 'Result.Ok'
  }

  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return `Ok(${JSON.stringify(this.#value, null, 2)})`
  }

  // #endregion
}
