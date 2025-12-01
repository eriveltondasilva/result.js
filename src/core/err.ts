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

  // #region CHECKING

  /**
   * Checks if Result is Ok variant.
   *
   * @returns {boolean} Always false for Err
   * @example
   * const result = Result.err(new Error())
   * result.isOk() // false
   */
  isOk(): this is Ok<T, never> {
    return false
  }

  /**
   * Checks if Result is Err variant.
   *
   * @returns {boolean} Always true for Err
   * @example
   * const result = Result.err(new Error())
   * result.isErr() // true
   */
  isErr(): this is Err<never, E> {
    return true
  }

  /**
   * Checks if Result is Ok and value satisfies predicate.
   *
   * @param {(value: T) => boolean} predicate - Validation function
   * @returns {boolean} Always false for Err
   */
  isOkAnd(predicate: (value: T) => boolean): this is Ok<T, never> {
    assertFunction(predicate, 'Result.isOkAnd', 'predicate')

    return false
  }

  /**
   * Checks if Result is Err and error satisfies predicate.
   *
   * @param {(error: E) => boolean} predicate - Validation function
   * @returns {boolean} True if Err and predicate passes
   * @example
   * const err = Result.err(new Error("not found"));
   * err.isErrAnd((e) => e.message.includes("not"))
   * // true
   */
  isErrAnd(predicate: (error: E) => boolean): this is Err<never, E> {
    assertFunction(predicate, 'Result.isErrAnd', 'predicate')

    return predicate(this.#error)
  }

  // #endregion

  // ---

  // #region EXTRACTING

  /**
   * Gets success value or null.
   *
   * @returns {null} Always null for Err
   */
  get ok(): null {
    return null
  }

  /**
   * Gets error value or null.
   *
   * @returns {E} The wrapped error
   */
  get err(): E {
    return this.#error
  }

  /**
   * Extracts success value.
   *
   * @returns {never} Never returns
   * @throws {Error} Always throws for Err
   * @example
   * Result.err(new Error("fail")).unwrap()
   * // throws
   */
  unwrap(): never {
    throw new Error('Called unwrap on an Err value', { cause: this.#error })
  }

  /**
   * Extracts error value.
   *
   * @returns {E} The wrapped error
   * @example
   * Result.err(new Error("fail")).unwrapErr()
   * // Error("fail")
   */
  unwrapErr(): E {
    return this.#error
  }

  /**
   * Extracts value with custom error message.
   *
   * @param {string} message - Error message
   * @returns {never} Never returns
   * @throws {Error} Always throws for Err
   * @example
   * Result.err(new Error()).expect("should exist")
   * // throws Error("should exist")
   */
  expect(message: string): never {
    throw new Error(message, { cause: this.#error })
  }

  /**
   * Extracts error with custom message.
   *
   * @param {string} _message - Error message (ignored for Err)
   * @returns {E} The wrapped error
   * @example
   * Result.err(new Error("fail")).expectErr("oops")
   * // Error("fail")
   */
  expectErr(_message: string): E {
    return this.#error
  }

  /**
   * Extracts value or returns default.
   *
   * @param {T} defaultValue - Fallback value
   * @returns {T} The default value
   * @example
   * Result.err(new Error()).unwrapOr(42)
   * // 42
   */
  unwrapOr(defaultValue: T): T {
    return defaultValue
  }

  /**
   * Extracts value or computes default from error.
   *
   * @param {(error: E) => T} onError - Default value generator
   * @returns {T} Computed default value
   * @example
   * Result.err(new Error("fail")).unwrapOrElse(e => 0)
   * // 0
   */
  unwrapOrElse(onError: (error: E) => T): T {
    assertFunction(onError, 'Result.unwrapOrElse', 'onError')

    return onError(this.#error)
  }

  // #endregion

  // ---

  // #region TRANSFORMING

  /**
   * Transforms success value.
   *
   * @template U - Transformed value type
   * @param {(value: T) => U} mapper - Transformation function
   * @returns {Err<U, E>} Err with same error, different value type
   */
  map<U>(mapper: (value: T) => U): Err<U, E> {
    assertFunction(mapper, 'Result.map', 'mapper')

    return this as unknown as Err<U, E>
  }

  /**
   * Transforms value or returns default.
   *
   * @template U - Transformed value type
   * @param {(value: T) => U} mapper - Transformation function
   * @param {U} defaultValue - Fallback value
   * @returns {U} The default value
   */
  mapOr<U>(mapper: (value: T) => U, defaultValue: U): U {
    assertFunction(mapper, 'Result.mapOr', 'mapper')

    return defaultValue
  }

  /**
   * Transforms value using appropriate mapper.
   *
   * @template U - Transformed value type
   * @param {(value: T) => U} okMapper - Success mapper
   * @param {(error: E) => U} errorMapper - Error mapper
   * @returns {U} Result from error mapper
   * @example
   * Result.err(new Error("fail")).mapOrElse(
   *    (x) => x * 2,
   *    (e) => -1
   * )
   * // -1
   */
  mapOrElse<U>(okMapper: (value: T) => U, errorMapper: (error: E) => U): U {
    assertFunction(okMapper, 'Result.mapOrElse', 'okMapper')
    assertFunction(errorMapper, 'Result.mapOrElse', 'errorMapper')

    return errorMapper(this.#error)
  }

  /**
   * Transforms error value.
   *
   * @template F - New error type
   * @param {(error: E) => F} mapper - Error transformation function
   * @returns {Err<T, F>} Err with transformed error
   * @example
   * Result.err("fail").mapErr(e => new Error(e))
   * // Err(Error: fail)
   */
  mapErr<F>(mapper: (error: E) => F): Err<T, F> {
    assertFunction(mapper, 'Result.mapErr', 'mapper')

    return new Err(mapper(this.#error))
  }

  /**
   * Filters Ok value based on predicate.
   *
   * @param {(value: T) => boolean} predicate - Validation function
   * @param {(value: T) => E} onReject - Error generator for rejection
   * @returns {Result<T, E>} This Err unchanged
   */
  filter(predicate: (value: T) => boolean, onReject: (value: T) => E): Result<T, E> {
    assertFunction(predicate, 'Result.filter', 'predicate')
    assertFunction(onReject, 'Result.filter', 'onReject')

    return this
  }

  // #endregion

  // ---

  // #region CHAINING

  /**
   * Chains operation that returns Result.
   *
   * @template U - New success type
   * @param {(value: T) => Result<U, E>} flatMapper - Chaining function
   * @returns {Err<U, E>} Err with same error, different value type
   */
  andThen<U>(flatMapper: (value: T) => Result<U, E>): Err<U, E> {
    assertFunction(flatMapper, 'Result.andThen', 'flatMapper')

    return this as unknown as Err<U, E>
  }

  /**
   * Returns this Result or executes error handler.
   *
   * @param {(error: E) => Result<T, E>} onError - Error recovery function
   * @returns {Result<T, E>} Result from error handler
   * @example
   * Result.err("fail").orElse((e) => Result.ok(0))
   * // Ok(0)
   * Result.err("fail").orElse((e) => Result.err("backup"))
   * // Err("backup")
   */
  orElse(onError: (error: E) => Result<T, E>): Result<T, E> {
    assertFunction(onError, 'Result.orElse', 'onError')

    return onError(this.#error)
  }

  /**
   * Returns second Result if this is Ok.
   *
   * @template U - Second Result success type
   * @param {Result<U, E>} result - Result to return
   * @returns {Err<U, E>} Err with same error, different value type
   */
  and<U>(result: Result<U, E>): Err<U, E> {
    assertResult(result, 'Result.and')

    return this as unknown as Err<U, E>
  }

  /**
   * Returns this Result or alternative.
   *
   * @param {Result<T, E>} result - Alternative Result
   * @returns {Result<T, E>} The alternative Result
   * @example
   * Result.err("fail").or(Result.ok(42))
   * // Ok(42)
   */
  or(result: Result<T, E>): Result<T, E> {
    assertResult(result, 'Result.or')

    return result
  }

  /**
   * Combines two Results into tuple.
   *
   * @template U - Second Result success type
   * @template F - Second Result error type
   * @param {Result<U, F>} result - Result to zip with
   * @returns {Result<[T, U], E | F>} Err with this error
   * @example
   * Result.err("fail").zip(Result.ok(2))
   * // Err("fail")
   */
  zip<U, F>(result: Result<U, F>): Result<[T, U], E | F> {
    assertResult(result, 'Result.zip')

    return this as unknown as Err<[T, U], E | F>
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
   * @returns {L | R} Result from error handler
   * @example
   * Result.err("fail").match({
   *   ok: (x) => x * 2,
   *   err: (e) => 0
   * })
   * // 0
   */
  match<L, R>(handlers: { ok: (value: T) => L; err: (error: E) => R }): L | R {
    assertMatchHandlers(handlers, 'Result.match')

    return handlers.err(this.#error)
  }

  /**
   * Performs side effect on success value.
   *
   * @param {(value: T) => void} visitor - Side effect function
   * @returns {Err<T, E>} This Err unchanged
   */
  inspect(visitor: (value: T) => void): Err<T, E> {
    assertFunction(visitor, 'Result.inspect', 'visitor')

    return this
  }

  /**
   * Performs side effect on error value.
   *
   * @param {(error: E) => void} visitor - Side effect function
   * @returns {Err<T, E>} This Err instance for chaining
   * @example
   * Result.err("fail").inspectErr((e) => console.log(e))
   * // logs "fail", returns Err("fail")
   */
  inspectErr(visitor: (error: E) => void): Err<T, E> {
    assertFunction(visitor, 'Result.inspectErr', 'visitor')

    visitor(this.#error)
    return this
  }

  // #endregion

  // ---

  // #region COMPARING

  /**
   * Checks if Ok contains specific value.
   *
   * @param {T} _value - Value to compare (ignored for Err)
   * @param {(actual: T, expected: T) => boolean} [comparator] - Custom comparison
   * @returns {boolean} Always false for Err
   */
  contains(_value: T, comparator?: (actual: T, expected: T) => boolean): boolean {
    comparator && assertFunction(comparator, 'Result.contains', 'comparator')

    return false
  }

  /**
   * Checks if Err contains specific error.
   *
   * @param {E} error - Error to compare
   * @param {(actual: E, expected: E) => boolean} [comparator] - Custom comparison
   * @returns {boolean} True if errors match
   * @example
   * Result.err("fail").containsErr("fail")
   * // true
   * Result.err("fail").containsErr("other")
   * // false
   */
  containsErr(error: E, comparator?: (actual: E, expected: E) => boolean): boolean {
    comparator && assertFunction(comparator, 'Result.containsErr', 'comparator')

    return comparator ? comparator(this.#error, error) : this.#error === error
  }

  // #endregion

  // ---

  // #region CONVERTING

  /**
   * Flattens nested Result.
   *
   * @template U - Inner Result success type
   * @template F - Inner Result error type
   * @param {Err<Result<U, F>, E>} this - Nested Result
   * @returns {Err<U, E | F>} Flattened Err
   */
  flatten<U, F>(this: Err<Result<U, F>, E>): Err<U, E | F> {
    return this as unknown as Err<U, E | F>
  }

  /**
   * Converts Result to rejected Promise.
   *
   * @returns {Promise<never>} Promise rejecting with error
   * @example
   * Result.err("fail").toPromise().catch((e) => console.log(e))
   * // logs "fail"
   */
  toPromise(): Promise<never> {
    return Promise.reject(this.#error)
  }

  /**
   * Converts Result to string representation.
   *
   * @returns {string} String format
   */
  toString(): string {
    return `Err(${this.#error})`
  }

  /**
   * Converts Result to JSON object.
   *
   * @returns {{ type: 'err'; error: E }} JSON representation
   */
  toJSON(): { type: 'err'; error: E } {
    return { type: 'err', error: this.#error }
  }

  // #endregion

  // ---

  // #region ASYNC OPERATIONS

  /**
   * Transforms value asynchronously.
   *
   * @template U - Transformed value type
   * @param {(value: T) => Promise<U>} mapperAsync - Async transformation
   * @returns {Promise<Err<U, E>>} Promise of Err with same error
   */
  mapAsync<U>(mapperAsync: (value: T) => Promise<U>): Promise<Err<U, E>> {
    assertFunction(mapperAsync, 'Result.mapAsync', 'mapperAsync')

    return Promise.resolve(this as unknown as Err<U, E>)
  }

  /**
   * Transforms error asynchronously.
   *
   * @template F - New error type
   * @param {(error: E) => Promise<F>} mapperAsync - Async error transformation
   * @returns {Promise<Err<T, F>>} Promise of Err with transformed error
   * @example
   * await Result.err("fail")
   *   .mapErrAsync(async (e) => new Error(e))
   * // Err(Error: fail)
   */
  mapErrAsync<F>(mapperAsync: (error: E) => Promise<F>): Promise<Err<T, F>> {
    assertFunction(mapperAsync, 'Result.mapErrAsync', 'mapperAsync')

    return mapperAsync(this.#error).then((error) => new Err(error))
  }

  /**
   * Transforms value asynchronously or returns default.
   *
   * @template U - Transformed value type
   * @param {(value: T) => Promise<U>} mapperAsync - Async transformation
   * @param {U} defaultValue - Fallback value
   * @returns {Promise<U>} Promise of default value
   */
  mapOrAsync<U>(mapperAsync: (value: T) => Promise<U>, defaultValue: U): Promise<U> {
    assertFunction(mapperAsync, 'Result.mapOrAsync', 'mapperAsync')

    return Promise.resolve(defaultValue)
  }

  /**
   * Transforms value using appropriate async mapper.
   *
   * @template U - Transformed value type
   * @param {(value: T) => Promise<U>} okMapperAsync - Async success mapper
   * @param {(error: E) => Promise<U>} errMapperAsync - Async error mapper
   * @returns {Promise<U>} Promise from error mapper
   */
  mapOrElseAsync<U>(
    okMapperAsync: (value: T) => Promise<U>,
    errMapperAsync: (error: E) => Promise<U>
  ): Promise<U> {
    assertFunction(okMapperAsync, 'Result.mapOrElseAsync', 'okMapperAsync')
    assertFunction(errMapperAsync, 'Result.mapOrElseAsync', 'errMapperAsync')

    return errMapperAsync(this.#error)
  }

  /**
   * Chains async operation returning Result.
   *
   * @template U - New success type
   * @param {(value: T) => Promise<Result<U, E>>} flatMapperAsync - Async chaining function
   * @returns {Promise<Err<U, E>>} Promise of Err with same error
   */
  andThenAsync<U>(flatMapperAsync: (value: T) => Promise<Result<U, E>>): Promise<Err<U, E>> {
    assertFunction(flatMapperAsync, 'Result.andThenAsync', 'flatMapperAsync')

    return Promise.resolve(this as unknown as Err<U, E>)
  }

  /**
   * Returns async Result if this is Ok.
   *
   * @template U - Second Result success type
   * @param {Promise<Result<U, E>>} _result - Async Result (ignored for Err)
   * @returns {Promise<Err<U, E>>} Promise of Err with same error
   */
  andAsync<U>(_result: Promise<Result<U, E>>): Promise<Err<U, E>> {
    assertPromise(_result, 'Result.andAsync', 'result')

    return Promise.resolve(this as unknown as Err<U, E>)
  }

  /**
   * Returns this Result or async alternative.
   *
   * @param {Promise<Result<T, E>>} result - Alternative async Result
   * @returns {Promise<Result<T, E>>} The alternative Promise
   * @example
   * await Result.err("fail")
   *   .orAsync(Promise.resolve(Result.ok(42)))
   * // Ok(42)
   */
  orAsync(result: Promise<Result<T, E>>): Promise<Result<T, E>> {
    assertPromise(result, 'Result.orAsync', 'result')

    return result
  }

  /**
   * Returns this Result or executes async error handler.
   *
   * @param {(error: E) => Promise<Result<T, E>>} onErrorAsync - Async error recovery
   * @returns {Promise<Result<T, E>>} Promise from error handler
   * @example
   * await Result.err("fail")
   *   .orElseAsync(async (e) => Result.ok(0))
   * // Ok(0)
   */
  orElseAsync(onErrorAsync: (error: E) => Promise<Result<T, E>>): Promise<Result<T, E>> {
    assertFunction(onErrorAsync, 'Result.orElseAsync', 'onErrorAsync')

    return onErrorAsync(this.#error)
  }

  // #endregion

  // ---

  // #region METADATA

  get [Symbol.toStringTag](): string {
    return 'Result.Err'
  }

  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return `Err(${JSON.stringify(this.#error, null, 2)})`
  }

  // #endregion
}
