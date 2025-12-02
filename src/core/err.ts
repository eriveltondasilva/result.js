import type { Ok } from './ok.js'
import type { Result, ResultMethods } from './types.js'

import { assertFunction, assertMatchHandlers, assertPromise, assertResult } from './utils.js'

/**
 * Represents a failed Result containing an error.
 *
 * @template T - Success value type
 * @template E - Error type
 *
 * @example
 * ```ts
 * const result = Result.err(new Error("fail"))
 * result.unwrapErr()
 * // Error("fail")
 * ```
 */
export class Err<T = never, E = Error> implements ResultMethods<T, E> {
  readonly #error: E

  constructor(error: E) {
    this.#error = error
  }

  // #region VALIDATION

  /**
   * Checks if Result is Ok variant.
   *
   * @group Validation
   * @returns {boolean} Always false for Err
   * @example
   * ```ts
   * const result = Result.err(new Error("fail"))
   * result.isOk()
   * // false
   * ```
   */
  isOk(): this is Ok<T, never> {
    return false
  }

  /**
   * Checks if Result is Err variant.
   *
   * @group Validation
   * @returns {boolean} Always true for Err
   * @example
   * ```ts
   * const result = Result.err(new Error("fail"))
   * result.isErr()
   * // true
   * ```
   */
  isErr(): this is Err<never, E> {
    return true
  }

  /**
   * Checks if Result is Ok and value satisfies predicate.
   *
   * @group Validation
   * @param {(value: T) => boolean} predicate - Validation function
   * @returns {boolean} Always false for Err
   * @example
   * ```ts
   * const result = Result.err(new Error("fail"))
   * result.isOkAnd((x) => x > 5)
   * // false
   * ```
   */
  isOkAnd(predicate: (value: T) => boolean): this is Ok<T, never> {
    assertFunction(predicate, 'Result.isOkAnd', 'predicate')
    return false
  }

  /**
   * Checks if Result is Err and error satisfies predicate.
   *
   * @group Validation
   * @param {(error: E) => boolean} predicate - Validation function
   * @returns {boolean} True if Err and predicate passes
   * @example
   * ```ts
   * const result = Result.err(new Error("not found"));
   * result.isErrAnd((e) => e.message.includes("not"))
   * // true
   * ```
   */
  isErrAnd(predicate: (error: E) => boolean): this is Err<never, E> {
    assertFunction(predicate, 'Result.isErrAnd', 'predicate')
    return predicate(this.#error)
  }

  // #endregion

  // ---

  // #region ACCESS

  /**
   * Gets success value or null.
   *
   * @group Access
   * @returns {null} Always null for Err
   * @example
   * ```ts
   * const result = Result.err(new Error("fail"))
   * result.ok
   * // null
   * ```
   */
  get ok(): null {
    return null
  }

  /**
   * Gets error value or null.
   *
   * @group Access
   * @returns {E} The wrapped error
   * @example
   * ```ts
   * const result = Result.err(new Error("fail"))
   * result.err
   * // Error("fail")
   * ```
   */
  get err(): E {
    return this.#error
  }

  /**
   * Extracts success value.
   *
   * @group Access
   * @returns {never} Never returns
   * @throws {Error} Always throws with message "Called unwrap on an Err value" and cause set to the error
   * @example
   * ```ts
   * const result = Result.err(new Error("fail"))
   * result.unwrap()
   * // throws Error("Called unwrap on an Err value", { cause: Error("fail") })
   * ```
   */
  unwrap(): never {
    throw new Error('Called unwrap on an Err value', { cause: this.#error })
  }

  /**
   * Extracts error value.
   *
   * @group Access
   * @returns {E} The wrapped error
   * @example
   * ```ts
   * const result = Result.err(new Error("fail"))
   * result.unwrapErr()
   * // Error("fail")
   * ```
   */
  unwrapErr(): E {
    return this.#error
  }

  /**
   * Extracts value with custom error message.
   *
   * @group Access
   * @param {string} message - Error message
   * @returns {never} Never returns
   * @throws {Error} Always throws with message "Called expect on an Err value" and cause set to the error
   * @example
   * ```ts
   * const result = Result.err(new Error("fail"))
   * result.expect("should exist")
   * // throws Error("should exist", { cause: Error("fail") })
   * ```
   */
  expect(message: string): never {
    throw new Error(message, { cause: this.#error })
  }

  /**
   * Extracts error with custom message.
   *
   * @group Access
   * @param {string} _message - Error message (ignored for Err)
   * @returns {E} The wrapped error
   * @example
   * ```ts
   * const result = Result.err(new Error("fail"))
   * result.expectErr("oops")
   * // Error("fail")
   * ```
   */
  expectErr(_message: string): E {
    return this.#error
  }

  // #endregion

  // ---

  // #region RECOVERY

  /**
   * Extracts value or returns default.
   *
   * @group Recovery
   * @param {T} defaultValue - Fallback value
   * @returns {T} The default value
   * @example
   * ```ts
   * const result = Result.err(new Error())
   * result.unwrapOr(42)
   * // 42
   * ```
   */
  unwrapOr(defaultValue: T): T {
    return defaultValue
  }

  /**
   * Extracts value or computes default from error.
   *
   * @group Recovery
   * @param {(error: E) => T} onError - Default value generator
   * @returns {T} Computed default value
   * @example
   * ```ts
   * const result = Result.err(new Error("fail"))
   * result.unwrapOrElse((e) => 0)
   * // 0
   * ```
   */
  unwrapOrElse(onError: (error: E) => T): T {
    assertFunction(onError, 'Result.unwrapOrElse', 'onError')
    return onError(this.#error)
  }

  // #endregion

  // ---

  // #region TRANSFORMATION

  /**
   * Transforms success value.
   *
   * @group Transformation
   * @see {@link mapAsync} for async version
   * @template U - Transformed value type
   * @param {(value: T) => U} mapper - Transformation function
   * @returns {Err<U, E>} Err with same error, different value type
   * @example
   * ```ts
   * const result = Result.err(new Error("fail"))
   * result.map((x) => x * 2)
   * // Err(Error: fail)
   * ```
   */
  map<U>(mapper: (value: T) => U): Err<U, E>

  /**
   * Transforms success value that returns Result.
   *
   * @group Transformation
   * @see {@link mapAsync} for async version
   * @template U - Transformed value type
   * @template F - New error type
   * @param {(value: T) => Result<U, F>} mapper - Transformation function returning Result
   * @returns {Err<U, E>} Err with same error
   * @example
   * ```ts
   * const result = Result.err(new Error("fail"))
   * result.map((x) => Result.ok(x * 2))
   * // Err(Error: fail)
   * ```
   */
  map<U, F>(mapper: (value: T) => Result<U, F>): Err<U, E>

  map<U, F>(mapper: (value: T) => U | Result<U, F>): Err<U, E> {
    assertFunction(mapper, 'Result.map', 'mapper')
    return this as unknown as Err<U, E>
  }

  /**
   * Transforms value or returns default.
   *
   * @group Transformation
   * @template U - Transformed value type
   * @param {(value: T) => U} mapper - Transformation function
   * @param {U} defaultValue - Fallback value
   * @returns {U} The default value
   * @example
   * ```ts
   * const result = Result.err(new Error("fail"))
   * result.mapOr((e) => 0, 42)
   * // 42
   * ```
   */
  mapOr<U>(mapper: (value: T) => U, defaultValue: U): U {
    assertFunction(mapper, 'Result.mapOr', 'mapper')
    return defaultValue
  }

  /**
   * Transforms value using appropriate mapper.
   *
   * @group Transformation
   * @template U - Transformed value type
   * @param {(value: T) => U} okMapper - Success mapper
   * @param {(error: E) => U} errorMapper - Error mapper
   * @returns {U} Result from error mapper
   * @example
   * ```ts
   * const result = Result.err(new Error("fail"))
   * result.mapOrElse((x) => x * 2, (e) => -1)
   * // -1
   * ```
   */
  mapOrElse<U>(okMapper: (value: T) => U, errorMapper: (error: E) => U): U {
    assertFunction(okMapper, 'Result.mapOrElse', 'okMapper')
    assertFunction(errorMapper, 'Result.mapOrElse', 'errorMapper')
    return errorMapper(this.#error)
  }

  /**
   * Transforms error value.
   *
   * @group Transformation
   * @template F - New error type
   * @param {(error: E) => F} mapper - Error transformation function
   * @returns {Err<T, F>} Err with transformed error
   * @example
   * ```ts
   * const result = Result.err("fail")
   * result.mapErr((e) => new Error(e))
   * // Err(Error: fail)
   * ```
   */
  mapErr<F>(mapper: (error: E) => F): Err<T, F> {
    assertFunction(mapper, 'Result.mapErr', 'mapper')
    return new Err(mapper(this.#error))
  }

  // ---

  /**
   * Filters Ok value based on predicate.
   *
   * @group Transformation
   * @param predicate - Validation function
   * @returns This Err unchanged
   * @example
   * ```ts
   * const result = Result.err("fail")
   * result.filter((x) => x > 0)
   * // Err("fail")
   * ```
   */
  filter(predicate: (value: T) => boolean): Result<T, Error>

  /**
   * Filters Ok value based on predicate with custom error.
   *
   * @group Transformation
   * @param {(value: T) => boolean} predicate - Validation function
   * @param {(value: T) => E} onReject - Function that generates error when predicate fails
   * @returns {Result<T, E>} This Err unchanged
   * @example
   * ```ts
   * const result = Result.err("fail")
   * result.filter((x) => x > 0, (x) => new Error("negative"))
   * // Err("fail")
   * ```
   */
  filter(predicate: (value: T) => boolean, onReject: (value: T) => E): Result<T, E>

  filter(
    predicate: (value: T) => boolean,
    onReject?: (value: T) => E | Error
  ): Result<T, E | Error> {
    assertFunction(predicate, 'Result.filter', 'predicate')
    onReject && assertFunction(onReject, 'Result.filter', 'onReject')
    return this
  }

  /**
   * Flattens nested Result.
   *
   * @group Transformation
   * @template U - Inner Result success type
   * @template F - Inner Result error type
   * @param {Err<Result<U, F>, E>} this - Nested Result
   * @returns {Err<U, E | F>} Flattened Err
   */
  flatten<U, F>(this: Err<Result<U, F>, E>): Err<U, E | F> {
    return this as unknown as Err<U, E | F>
  }

  // #endregion

  // ---

  // #region CHAINING

  /**
   * Chains operation that returns Result.
   *
   * @group Chaining
   * @template U - New success type
   * @param {(value: T) => Result<U, E>} flatMapper - Chaining function
   * @returns {Err<U, E>} Err with same error, different value type
   * @example
   * ```ts
   * const result = Result.err("fail")
   * result.andThen((x) => Result.ok(x * 2))
   * // Err("fail")
   * ```
   */
  andThen<U>(flatMapper: (value: T) => Result<U, E>): Err<U, E> {
    assertFunction(flatMapper, 'Result.andThen', 'flatMapper')
    return this as unknown as Err<U, E>
  }

  /**
   * Returns this Result or executes error handler.
   *
   * @group Chaining
   * @param {(error: E) => Result<T, E>} onError - Error recovery function
   * @returns {Result<T, E>} Result from error handler
   * @example
   * ```ts
   * Result.err("fail").orElse((e) => Result.ok(0))
   * // Ok(0)
   * Result.err("fail").orElse((e) => Result.err("backup"))
   * // Err("backup")
   * ```
   */
  orElse(onError: (error: E) => Result<T, E>): Result<T, E> {
    assertFunction(onError, 'Result.orElse', 'onError')
    return onError(this.#error)
  }

  /**
   * Returns second Result if this is Ok.
   *
   * @group Chaining
   * @template U - Second Result success type
   * @param {Result<U, E>} result - Result to return
   * @returns {Err<U, E>} Err with same error, different value type
   * @example
   * ```ts
   * Result.err("fail").and(Result.ok(42))
   * // Err("fail")
   * ```
   */
  and<U>(result: Result<U, E>): Err<U, E> {
    assertResult(result, 'Result.and')
    return this as unknown as Err<U, E>
  }

  /**
   * Returns this Result or alternative.
   *
   * @group Chaining
   * @param {Result<T, E>} result - Alternative Result
   * @returns {Result<T, E>} The alternative Result
   * @example
   * ```ts
   * Result.err("fail").or(Result.ok(42))
   * // Ok(42)
   * ```
   */
  or(result: Result<T, E>): Result<T, E> {
    assertResult(result, 'Result.or')
    return result
  }

  /**
   * Combines two Results into tuple.
   *
   * @group Chaining
   * @template U - Second Result success type
   * @template F - Second Result error type
   * @param {Result<U, F>} result - Result to zip with
   * @returns {Result<[T, U], E | F>} Err with this error
   * @example
   * ```ts
   * Result.err("fail").zip(Result.ok(2))
   * // Err("fail")
   * ```
   */
  zip<U, F>(result: Result<U, F>): Result<[T, U], E | F> {
    assertResult(result, 'Result.zip')
    return this as unknown as Err<[T, U], E | F>
  }

  // #endregion

  // ---

  // #region INSPECTION

  /**
   * Pattern matches on Result state.
   *
   * @group Inspection
   * @template L - Ok handler return type
   * @template R - Err handler return type
   * @param {{ ok: (value: T) => L; err: (error: E) => R }} handlers - Match handlers
   * @returns {L | R} Result from error handler
   * @example
   * ```ts
   * const result = Result.err("fail")
   * result.match({
   *   ok: (x) => x * 2,
   *   err: (e) => 0
   * })
   * // 0
   * ```
   */
  match<L, R>(handlers: { ok: (value: T) => L; err: (error: E) => R }): L | R {
    assertMatchHandlers(handlers, 'Result.match')
    return handlers.err(this.#error)
  }

  /**
   * Performs side effect on success value.
   *
   * @group Inspection
   * @param {(value: T) => void} visitor - Side effect function
   * @returns {Err<T, E>} This Err unchanged
   * @example
   * ```ts
   * const result = Result.err("fail")
   * result.inspect((x) => console.log(x))
    * // does nothing, returns Err("fail")
   * ```
   */
  inspect(visitor: (value: T) => void): Err<T, E> {
    assertFunction(visitor, 'Result.inspect', 'visitor')
    return this
  }

  /**
   * Performs side effect on error value.
   *
   * @group Inspection
   * @param {(error: E) => void} visitor - Side effect function
   * @returns {Err<T, E>} This Err instance for chaining
   * @example
   * ```ts
   * const result = Result.err("fail")
   * result.inspectErr((e) => console.log(e))
   * // logs "fail", returns Err(Error: fail)
   * ```
   */
  inspectErr(visitor: (error: E) => void): Err<T, E> {
    assertFunction(visitor, 'Result.inspectErr', 'visitor')
    visitor(this.#error)
    return this
  }

  // #endregion

  // ---

  // #region COMPARISON

  /**
   * Checks if Ok contains specific value.
   *
   * @group Comparison
   * @param {T} _value - Value to compare (ignored for Err)
   * @param {(actual: T, expected: T) => boolean} [comparator] - Custom comparison
   * @returns {boolean} Always false for Err
   * @example
   * ```ts
   * Result.err("fail").contains("fail")
   * // false
   * ```
   */
  contains(_value: T, comparator?: (actual: T, expected: T) => boolean): boolean {
    comparator && assertFunction(comparator, 'Result.contains', 'comparator')
    return false
  }

  /**
   * Checks if Err contains specific error.
   *
   * @group Comparison
   * @param {E} error - Error to compare
   * @param {(actual: E, expected: E) => boolean} [comparator] - Custom comparison
   * @returns {boolean} True if errors match
   * @example
   * ```ts
   * Result.err("fail").containsErr("fail")
   * // true
   * Result.err("fail").containsErr("other")
   * // false
   * ```
   */
  containsErr(error: E, comparator?: (actual: E, expected: E) => boolean): boolean {
    comparator && assertFunction(comparator, 'Result.containsErr', 'comparator')
    return comparator ? comparator(this.#error, error) : this.#error === error
  }

  // #endregion

  // ---

  // #region CONVERSION

  /**
   * Converts Result to rejected Promise.
   *
   * @group Conversion
   * @returns {Promise<never>} Promise rejecting with error
   * @example
   * ```ts
   * const result = Result.err("fail")
   * result.toPromise().catch((e) => console.log(e))
   * // logs "fail"
   * ```
   */
  toPromise(): Promise<never> {
    return Promise.reject(this.#error)
  }

  /**
   * Converts Result to string representation.
   *
   * @group Conversion
   * @returns {string} String format
   * @example
   * ```ts
   * Result.err("fail").toString()
   * // "Err(fail)"
   * ```
   */
  toString(): string {
    return `Err(${this.#error})`
  }

  /**
   * Converts Result to JSON object.
   *
   * @group Conversion
   * @returns {{ type: 'err'; error: E }} JSON representation
   * @example
   * ```ts
   * Result.err("fail").toJSON()
   * // { type: "err", error: "fail" }
   * ```
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
   * @group Async Operations
   * @template U - Transformed value type
   * @param {(value: T) => Promise<U>} mapperAsync - Async transformation
   * @returns {Promise<Err<U, E>>} Promise of Err with same error
   * @example
   * ```ts
   * const result = Result.err("fail")
   * result.mapAsync(async (x) => x * 2)
   * // Err(Error: fail)
   * ```
   */
  mapAsync<U>(mapperAsync: (value: T) => Promise<U>): Promise<Err<U, E>>

  /**
   * Transforms value asynchronously that returns Result.
   *
   * @group Async Operations
   * @template U - Transformed value type
   * @template F - New error type
   * @param {(value: T) => Promise<Result<U, F>>} mapperAsync - Async transformation returning Result
   * @returns {Promise<Err<U, E>>} Promise of Err with same error
   * @example
   * ```ts
   * const result = Result.err("fail")
   * result.mapAsync(async (x) => Result.ok(x * 2))
   * // Err(Error: fail)
   * ```
   */
  mapAsync<U, F>(mapperAsync: (value: T) => Promise<Result<U, F>>): Promise<Err<U, E>>

  async mapAsync<U, F>(mapperAsync: (value: T) => Promise<U | Result<U, F>>): Promise<Err<U, E>> {
    assertFunction(mapperAsync, 'Result.mapAsync', 'mapperAsync')
    return this as unknown as Err<U, E>
  }

  /**
   * Transforms error asynchronously.
   *
   * @group Async Operations
   * @template F - New error type
   * @param {(error: E) => Promise<F>} mapperAsync - Async error transformation
   * @returns {Promise<Err<T, F>>} Promise of Err with transformed error
   * @example
   * ```ts
   * const result = Result.err("fail")
   * result.mapErrAsync(async (e) => new Error(e))
   * // Err(Error: fail)
   * ```
   */
  async mapErrAsync<F>(mapperAsync: (error: E) => Promise<F>): Promise<Err<T, F>> {
    assertFunction(mapperAsync, 'Result.mapErrAsync', 'mapperAsync')
    const e = await mapperAsync(this.#error)
    return new Err(e)
  }

  /**
   * Transforms value asynchronously or returns default.
   *
   * @group Async Operations
   * @template U - Transformed value type
   * @param {(value: T) => Promise<U>} mapperAsync - Async transformation
   * @param {U} defaultValue - Fallback value
   * @returns {Promise<U>} Promise of default value
   * @example
   * ```ts
   * const result = Result.err("fail")
   * result.mapOrAsync(async (x) => x * 2, 0)
   * // 0
   * ```
   */
  mapOrAsync<U>(mapperAsync: (value: T) => Promise<U>, defaultValue: U): Promise<U> {
    assertFunction(mapperAsync, 'Result.mapOrAsync', 'mapperAsync')
    return Promise.resolve(defaultValue)
  }

  /**
   * Transforms value using appropriate async mapper.
   *
   * @group Async Operations
   * @template U - Transformed value type
   * @param {(value: T) => Promise<U>} okMapperAsync - Async success mapper
   * @param {(error: E) => Promise<U>} errMapperAsync - Async error mapper
   * @returns {Promise<U>} Promise from error mapper
   * @example
   * ```ts
   * const result = Result.err("fail")
   * result.mapOrElseAsync(
   *   async (x) => x * 2,
   *   async (e) => new Error(e)
   * )
   * // Error("fail")
   * ```
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
   * @group Async Operations
   * @template U - New success type
   * @param {(value: T) => Promise<Result<U, E>>} flatMapperAsync - Async chaining function
   * @returns {Promise<Err<U, E>>} Promise of Err with same error
   * @example
   * ```ts
   * const result = Result.err("fail")
   * await result.andThenAsync(async (x) => Result.ok(x * 2))
   * // Err("fail")
   * ```
   */
  andThenAsync<U>(flatMapperAsync: (value: T) => Promise<Result<U, E>>): Promise<Err<U, E>> {
    assertFunction(flatMapperAsync, 'Result.andThenAsync', 'flatMapperAsync')

    return Promise.resolve(this as unknown as Err<U, E>)
  }

  /**
   * Returns async Result if this is Ok.
   *
   * @group Async Operations
   * @template U - Second Result success type
   * @param {Promise<Result<U, E>>} _result - Async Result (ignored for Err)
   * @returns {Promise<Err<U, E>>} Promise of Err with same error
   * @example
   * ```ts
   * const result = Result.err("fail")
   * await result.andAsync(Promise.resolve(Result.ok(42)))
   * // Err("fail")
   * ```
   */
  andAsync<U>(_result: Promise<Result<U, E>>): Promise<Err<U, E>> {
    assertPromise(_result, 'Result.andAsync', 'result')
    return Promise.resolve(this as unknown as Err<U, E>)
  }

  /**
   * Returns this Result or async alternative.
   *
   * @group Async Operations
   * @param {Promise<Result<T, E>>} result - Alternative async Result
   * @returns {Promise<Result<T, E>>} The alternative Promise
   * @example
   * ```ts
   * const result = Result.err("fail")
   * await result.orAsync(Promise.resolve(Result.ok(42)))
   * // Ok(42)
   * ```
   */
  orAsync(result: Promise<Result<T, E>>): Promise<Result<T, E>> {
    assertPromise(result, 'Result.orAsync', 'result')
    return result
  }

  /**
   * Returns this Result or executes async error handler.
   *
   * @group Async Operations
   * @param {(error: E) => Promise<Result<T, E>>} onErrorAsync - Async error recovery
   * @returns {Promise<Result<T, E>>} Promise from error handler
   * @example
   * const result = Result.err("fail")
   * await result.orElseAsync(async (e) => Result.ok(0))
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
