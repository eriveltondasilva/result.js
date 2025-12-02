import { Err } from './err.js'
import type { Result, ResultMethods } from './types.js'
import {
  assertFunction,
  assertMatchHandlers,
  assertPromise,
  assertResult,
  isResult,
} from './utils.js'

/**
 * Represents a successful Result containing a value.
 *
 * @template T - Success value type
 * @template E - Error type
 *
 * @example
 * ```ts
 * const result = Result.ok(42)
 * result.unwrap()
 * // 42
 * ```
 */
export class Ok<T, E = never> implements ResultMethods<T, E> {
  readonly #value: T

  constructor(value: T) {
    this.#value = value
  }

  // #region VALIDATION

  /**
   * Checks if Result is Ok variant.
   *
   * @group Validation
   * @returns {boolean} Always true for Ok
   * @example
   * ```ts
   * const result = Result.ok(42)
   * result.isOk()
   * // true
   * ```
   */
  isOk(): this is Ok<T, never> {
    return true
  }

  /**
   * Checks if Result is Err variant.
   *
   * @group Validation
   * @returns {boolean} Always false for Ok
   * @example
   * ```ts
   * const result = Result.ok(42)
   * result.isErr()
   * // false
   * ```
   */
  isErr(): this is Err<never, E> {
    return false
  }

  /**
   * Checks if Result is Ok and value satisfies predicate.
   *
   * @group Validation
   * @param {(value: T) => boolean} predicate - Validation function
   * @returns {boolean} True if Ok and predicate passes
   * @example
   * ```ts
   * Result.ok(10).isOkAnd((x) => x > 5)
   * // true
   * Result.ok(3).isOkAnd((x) => x > 5)
   * // false
   * ```
   */
  isOkAnd(predicate: (value: T) => boolean): this is Ok<T, never> {
    assertFunction(predicate, 'Result.isOkAnd', 'predicate')
    return predicate(this.#value)
  }

  /**
   * Checks if Result is Err and error satisfies predicate.
   *
   * @group Validation
   * @param {(error: E) => boolean} predicate - Validation function
   * @returns {boolean} Always false for Ok
   */
  isErrAnd(predicate: (error: E) => boolean): this is Err<never, E> {
    assertFunction(predicate, 'Result.isErrAnd', 'predicate')
    return false
  }

  // #endregion

  // ---

  // #region ACCESS

  /**
   * Gets success value or null.
   *
   * @group Access
   * @returns {T} The wrapped value
   * @example
   * ```ts
   * const result = Result.ok(42)
   * result.ok
   * // 42
   * ```
   */
  get ok(): T {
    return this.#value
  }

  /**
   * Gets error value or null.
   *
   * @group Access
   * @returns {null} Always null for Ok
   * @example
   * ```ts
   * const result = Result.ok(42)
   * result.err
   * // null
   * ```
   */
  get err(): null {
    return null
  }

  /**
   * Extracts success value.
   *
   * @group Access
   * @returns {T} The wrapped value
   * @example
   * ```ts
   * const result = Result.ok(42)
   * result.unwrap()
   * // 42
   * ```
   */
  unwrap(): T {
    return this.#value
  }

  /**
   * Extracts error value.
   *
   * @group Access
   * @returns {never} Never returns
   * @throws {Error} Always throws with message "Called unwrapErr on an Ok value" and cause set to the value
   * @example
   * ```ts
   * const result = Result.ok(42)
   * result.unwrapErr()
   * // throws Error("Called unwrapErr on an Ok value: 42")
   * ```
   */
  unwrapErr(): never {
    throw new Error(`Called unwrapErr on an Ok value: ${String(this.#value)}`)
  }

  /**
   * Extracts value with custom error message.
   *
   * @group Access
   * @param {string} _message - Error message (ignored for Ok)
   * @returns {T} The wrapped value
   * @example
   * ```ts
   * const result = Result.ok(42)
   * result.expect("should exist")
   * // 42
   * ```
   */
  expect(_message: string): T {
    return this.#value
  }

  /**
   * Extracts error with custom message.
   *
   * @group Access
   * @param {string} message - Error message
   * @returns {never} Never returns
   * @throws {Error} Always throws with message "Called expectErr on an Ok value" and cause set to the value
   * @example
   * ```ts
   * const result = Result.ok(42)
   * result.expectErr("should exist")
   * // throws Error("should exist: 42")
   * ```
   */
  expectErr(message: string): never {
    throw new Error(`${message}: ${String(this.#value)}`)
  }

  // #endregion

  // ---

  // #region RECOVERY

  /**
   * Extracts value or returns default.
   *
   * @group Recovery
   * @param {T} _defaultValue - Fallback value (ignored for Ok)
   * @returns {T} The wrapped value
   * @example
   * ```ts
   * const result = Result.ok(42)
   * result.unwrapOr(0)
   * // 42
   * ```
   */
  unwrapOr(_defaultValue: T): T {
    return this.#value
  }

  /**
   * Extracts value or computes default from error.
   *
   * @group Recovery
   * @param {(error: E) => T} onError - Default value generator
   * @returns {T} The wrapped value
   * @example
   * ```ts
   * const result = Result.ok(42)
   * result.unwrapOrElse((e) => 0)
   * // 42
   * ```
   */
  unwrapOrElse(onError: (error: E) => T): T {
    assertFunction(onError, 'Result.unwrapOrElse', 'onError')
    return this.#value
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
   * @returns {Ok<U, E>} Ok with transformed value
   * @example
   * ```ts
   * const result = Result.ok(5)
   * result.map((x) => x * 2)
   * // Ok(10)
   * ```
   */
  map<U>(mapper: (value: T) => U): Ok<U, E>

  /**
   * Transforms success value that returns Result.
   *
   * @group Transformation
   * @see {@link mapAsync} for async version
   * @template U - Transformed value type
   * @template F - New error type
   * @param {(value: T) => Result<U, F>} mapper - Transformation function returning Result
   * @returns {Result<U, E | F>} Flattened Result
   * @example
   * ```ts
   * const result = Result.ok(5)
   * result.map((x) => {
   *   return x > 0
   *     ? Result.ok(x * 2)
   *     : Result.err("negative")
   * })
   * // Result<number, string>
   * ```
   */
  map<U, F>(mapper: (value: T) => Result<U, F>): Result<U, E | F>

  map<U, F>(mapper: (value: T) => U | Result<U, F>): Ok<U, E> | Result<U, E | F> {
    assertFunction(mapper, 'Result.map', 'mapper')
    const mapped = mapper(this.#value)

    if (isResult(mapped)) {
      return mapped as Result<U, E | F>
    }

    return new Ok(mapped as U)
  }

  /**
   * Transforms value or returns default.
   *
   * @group Transformation
   * @template U - Transformed value type
   * @param {(value: T) => U} mapper - Transformation function
   * @param {U} _defaultValue - Fallback value (ignored for Ok)
   * @returns {U} Transformed value
   * @example
   * ```ts
   * const result = Result.ok(5)
   * result.mapOr((x) => x * 2, 0)
   * // 10
   * ```
   */
  mapOr<U>(mapper: (value: T) => U, _defaultValue: U): U {
    assertFunction(mapper, 'Result.mapOr', 'mapper')
    return mapper(this.#value)
  }

  /**
   * Transforms value using appropriate mapper.
   *
   * @group Transformation
   * @template U - Transformed value type
   * @param {(value: T) => U} okMapper - Success mapper
   * @param {(error: E) => U} errorMapper - Error mapper
   * @returns {U} Transformed value
   * @example
   * ```ts
   * const result = Result.ok(5)
   * result.mapOrElse((x) => x * 2, (e) => 0)
   * // 10
   * ```
   */
  mapOrElse<U>(okMapper: (value: T) => U, errorMapper: (error: E) => U): U {
    assertFunction(okMapper, 'Result.mapOrElse', 'okMapper')
    assertFunction(errorMapper, 'Result.mapOrElse', 'errorMapper')
    return okMapper(this.#value)
  }

  /**
   * Transforms error value.
   *
   * @group Transformation
   * @template F - New error type
   * @param {(error: E) => F} mapper - Error transformation function
   * @returns {Ok<T, F>} Ok with same value, different error type
   * @example
   * ```ts
   * const result = Result.ok(42)
   * result.mapErr((e) =>  new Error(e))
   * // Ok(42)
   * ```
   */
  mapErr<F>(mapper: (error: E) => F): Ok<T, F> {
    assertFunction(mapper, 'Result.mapErr', 'mapper')
    return this as unknown as Ok<T, F>
  }

  // ---

  /**
   * Filters Ok value based on predicate.
   *
   * @group Transformation
   * @param predicate - Validation function
   * @returns Ok if predicate passes, else Err with default error
   * @example
   * ```ts
   * Result.ok(10).filter((x) => x > 5)
   * // Ok(10)
   * Result.ok(3).filter((x) => x > 5)
   * // Err(Error: Filter predicate failed for value: 3)
   * ```
   */
  filter(predicate: (value: T) => boolean): Result<T, Error>

  /**
   * Filters Ok value based on predicate with custom error.
   *
   * @group Transformation
   * @param {(value: T) => boolean} predicate - Validation function
   * @param {(value: T) => E} onReject - Function that generates error when predicate fails
   * @returns {Result<T, E>} Ok if predicate passes, else Err
   * @example
   * ```ts
   * const result = Result.ok(3)
   * result.filter(
   *   (x) => x > 5,
   *   (value) => new Error(`${value} is too small`)
   * )
   * // Err(Error: 3 is too small)
   * ```
   */
  filter(predicate: (value: T) => boolean, onReject: (value: T) => E): Result<T, E>

  filter(
    predicate: (value: T) => boolean,
    onReject?: (value: T) => E | Error
  ): Result<T, E | Error> {
    assertFunction(predicate, 'Result.filter', 'predicate')
    onReject && assertFunction(onReject, 'Result.filter', 'onReject')

    if (!predicate(this.#value)) {
      const error = onReject
        ? onReject(this.#value)
        : new Error(`Filter predicate failed for value: ${String(this.#value)}`)
      return new Err(error)
    }

    return this
  }

  /**
   * Flattens nested Result.
   *
   * @group Transformation
   * @template U - Inner Result success type
   * @template F - Inner Result error type
   * @param {Ok<Result<U, F>, E>} this - Nested Result
   * @returns {Result<U, E | F>} Flattened Result
   * @example
   * ```ts
   * Result.ok(Result.ok(42)).flatten()
   * // Ok(42)
   * ```
   */
  flatten<U, F>(this: Ok<Result<U, F>, E>): Result<U, E | F> {
    return this.#value
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
   * @returns {Result<U, E>} Result from flatMapper
   * @example
   * ```ts
   * Result.ok(5).andThen((x) => Result.ok(x * 2))
   * // Ok(10)
   * Result.ok(5).andThen((x) => Result.err("fail"))
   * // Err("fail")
   * ```
   */
  andThen<U>(flatMapper: (value: T) => Result<U, E>): Result<U, E> {
    assertFunction(flatMapper, 'Result.andThen', 'flatMapper')
    return flatMapper(this.#value)
  }

  /**
   * Returns this Result or executes error handler.
   *
   * @group Chaining
   * @param {(error: E) => Result<T, E>} onError - Error recovery function
   * @returns {Ok<T, E>} This Ok instance
   * @example
   * ```ts
   * Result.ok(42).orElse((e) => Result.ok(e))
   * // Ok(42)
   * ```
   */
  orElse(onError: (error: E) => Result<T, E>): Ok<T, E> {
    assertFunction(onError, 'Result.orElse', 'onError')
    return this
  }

  /**
   * Returns second Result if this is Ok.
   *
   * @group Chaining
   * @template U - Second Result success type
   * @param {Result<U, E>} result - Result to return
   * @returns {Result<U, E>} The provided Result
   * @example
   * ```ts
   * Result.ok(1).and(Result.ok(2))
   * // Ok(2)
   * Result.ok(1).and(Result.err("fail"))
   * // Err("fail")
   * ```
   */
  and<U>(result: Result<U, E>): Result<U, E> {
    assertResult(result, 'Result.and')
    return result
  }

  /**
   * Returns this Result or alternative.
   *
   * @group Chaining
   * @param {Result<T, E>} _result - Alternative Result (ignored for Ok)
   * @returns {Ok<T, E>} This Ok instance
   * @example
   * ```ts
   * Result.ok(1).or(Result.ok(2))
   * // Ok(1)
   * ```
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

  // #region INSPECTION

  /**
   * Pattern matches on Result state.
   *
   * @group Inspection
   * @template L - Ok handler return type
   * @template R - Err handler return type
   * @param {{ ok: (value: T) => L; err: (error: E) => R }} handlers - Match handlers
   * @returns {L | R} Result from matching handler
   * @example
   * ```ts
   * const result = Result.ok(5)
   * result.match({
   *   ok: (x) => x * 2,
   *   err: (e) => 0
   * })
   * // 10
   * ```
   */
  match<L, R>(handlers: { ok: (value: T) => L; err: (error: E) => R }): L | R {
    assertMatchHandlers(handlers, 'Result.match')
    return handlers.ok(this.#value)
  }

  /**
   * Performs side effect on success value.
   *
   * @group Inspection
   * @param {(value: T) => void} visitor - Side effect function
   * @returns {Ok<T, E>} This Ok instance for chaining
   * @example
   * ```ts
   * Result.ok(42).inspect((x) => console.log(x))
   * // logs 42, returns Ok(42)
   * ```
   */
  inspect(visitor: (value: T) => void): Ok<T, E> {
    assertFunction(visitor, 'Result.inspect', 'visitor')
    visitor(this.#value)
    return this
  }

  /**
   * Performs side effect on error value.
   *
   * @group Inspection
   * @param {(error: E) => void} visitor - Side effect function
   * @returns {Ok<T, E>} This Ok instance unchanged
   * @example
   * ```ts
   * Result.ok(42).inspectErr((e) => console.log(e))
   * // Ok(42)
   * ```
   */
  inspectErr(visitor: (error: E) => void): Ok<T, E> {
    assertFunction(visitor, 'Result.inspectErr', 'visitor')
    return this
  }

  // #endregion

  // ---

  // #region COMPARISON

  /**
   * Checks if Ok contains specific value.
   *
   * @group Comparison
   * @param {T} value - Value to compare
   * @param {(actual: T, expected: T) => boolean} [comparator] - Custom comparison function
   * @returns {boolean} True if values match
   * @example
   * ```ts
   * Result.ok(42).contains(42)
   * // true
   * Result.ok(42).contains(99)
   * // false
   * ```
   */
  contains(value: T, comparator?: (actual: T, expected: T) => boolean): boolean {
    comparator && assertFunction(comparator, 'Result.contains', 'comparator')
    return comparator ? comparator(this.#value, value) : this.#value === value
  }

  /**
   * Checks if Err contains specific error.
   *
   * @group Comparison
   * @param {E} _error - Error to compare (ignored for Ok)
   * @param {(actual: E, expected: E) => boolean} [comparator] - Custom comparison function
   * @returns {boolean} Always false for Ok
   * @example
   * ```ts
   * Result.ok(42).containsErr("fail")
   * // false
   * ```
   */
  containsErr(_error: E, comparator?: (actual: E, expected: E) => boolean): boolean {
    comparator && assertFunction(comparator, 'Result.containsErr', 'comparator')
    return false
  }

  // #endregion

  // ---

  // #region CONVERSION

  /**
   * Converts Result to resolved Promise.
   *
   * @group Conversion
   * @returns {Promise<T>} Promise resolving to value
   * @example
   * ```ts
   * const result = Result.ok(42)
   * await result.toPromise()
   * // 42
   * ```
   */
  toPromise(): Promise<T> {
    return Promise.resolve(this.#value)
  }

  /**
   * Converts Result to string representation.
   *
   * @group Conversion
   * @returns {string} String format
   * @example
   * ```ts
   * Result.ok(42).toString()
   * // "Ok(42)"
   * ```
   */
  toString(): string {
    return `Ok(${String(this.#value)})`
  }

  /**
   * Converts Result to JSON object.
   *
   * @group Conversion
   * @returns {{ type: 'ok'; value: T }} JSON representation
   * @example
   * ```ts
   * const result = Result.ok(42)
   * result.toJSON()
   * // { type: 'ok', value: 42 }
   * ```
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
   * @group Async Operations
   * @template U - Transformed value type
   * @param {(value: T) => Promise<U>} mapperAsync - Async transformation
   * @returns {Promise<Ok<U, E>>} Promise of Ok with transformed value
   * @example
   * ```ts
   * const result = Result.ok(5)
   * await result.mapAsync(async (x) => x * 2)
   * // Ok(10)
   * ```
   */
  mapAsync<U>(mapperAsync: (value: T) => Promise<U>): Promise<Ok<U, E>>

  /**
   * Transforms value asynchronously that returns Result.
   *
   * @group Async Operations
   * @template U - Transformed value type
   * @template F - New error type
   * @param {(value: T) => Promise<Result<U, F>>} mapperAsync - Async transformation returning Result
   * @returns {Promise<Result<U, E | F>>} Promise of flattened Result
   * @example
   * ```ts
   * const result = Result.ok(5)
   * await result.mapAsync(async x =>
   *   x > 0 ? Result.ok(x * 2) : Result.err("negative")
   * )
   * // Ok(10)
   * ```
   */
  mapAsync<U, F>(mapperAsync: (value: T) => Promise<Result<U, F>>): Promise<Result<U, E | F>>

  async mapAsync<U, F>(
    mapperAsync: (value: T) => Promise<U | Result<U, F>>
  ): Promise<Ok<U, E> | Result<U, E | F>> {
    assertFunction(mapperAsync, 'Result.mapAsync', 'mapperAsync')
    const mapped = await mapperAsync(this.#value)

    if (isResult(mapped)) {
      return mapped as Result<U, E | F>
    }

    return new Ok(mapped as U)
  }

  /**
   * Transforms error asynchronously.
   *
   * @group Async Operations
   * @template F - New error type
   * @param {(error: E) => Promise<F>} mapperAsync - Async error transformation
   * @returns {Promise<Ok<T, F>>} Promise of Ok with same value
   * @example
   * ```ts
   * const result = Result.ok(5)
   * await result.mapErrAsync(async (e) => e + 1)
   * // Ok(5)
   * ```
   */
  mapErrAsync<F>(mapperAsync: (error: E) => Promise<F>): Promise<Ok<T, F>> {
    assertFunction(mapperAsync, 'Result.mapErrAsync', 'mapperAsync')
    return Promise.resolve(this as unknown as Ok<T, F>)
  }

  /**
   * Transforms value asynchronously or returns default.
   *
   * @group Async Operations
   * @template U - Transformed value type
   * @param {(value: T) => Promise<U>} mapperAsync - Async transformation
   * @param {U} _defaultValue - Fallback value (ignored for Ok)
   * @returns {Promise<U>} Promise of transformed value
   * @example
   * ```ts
   * const result = Result.ok(5)
   * await result.mapOrAsync(async x => x * 2, 0)
   * // 10
   * ```
   */
  mapOrAsync<U>(mapperAsync: (value: T) => Promise<U>, _defaultValue: U): Promise<U> {
    assertFunction(mapperAsync, 'Result.mapOrAsync', 'mapperAsync')
    return mapperAsync(this.#value)
  }

  /**
   * Transforms value using appropriate async mapper.
   *
   * @group Async Operations
   * @template U - Transformed value type
   * @param {(value: T) => Promise<U>} okMapperAsync - Async success mapper
   * @param {(error: E) => Promise<U>} errMapperAsync - Async error mapper
   * @returns {Promise<U>} Promise of transformed value
   * @example
   * ```ts
   * const result = Result.ok(5)
   * await result.mapOrElseAsync(
   *   async (x) => x * 2,
   *   async (e) => e + 1
   * )
   * // 10
   * ```
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
   * @group Async Operations
   * @template U - New success type
   * @param {(value: T) => Promise<Result<U, E>>} flatMapperAsync - Async chaining function
   * @returns {Promise<Result<U, E>>} Promise of Result from flatMapper
   * @example
   * ```ts
   * const result = Result.ok(5)
   * await result.andThenAsync(
   *   async (x) => Result.ok(x * 2)
   * )
   * // Ok(10)
   * ```
   */
  andThenAsync<U>(flatMapperAsync: (value: T) => Promise<Result<U, E>>): Promise<Result<U, E>> {
    assertFunction(flatMapperAsync, 'Result.andThenAsync', 'flatMapperAsync')
    return flatMapperAsync(this.#value)
  }

  /**
   * Returns async Result if this is Ok.
   *
   * @group Async Operations
   * @template U - Second Result success type
   * @param {Promise<Result<U, E>>} result - Async Result to return
   * @returns {Promise<Result<U, E>>} The provided Promise
   * @example
   * ```ts
   * const result = Result.ok(5)
   * await result.andAsync(Promise.resolve(Result.ok(10)))
   * // Ok(10)
   * ```
   */
  andAsync<U>(result: Promise<Result<U, E>>): Promise<Result<U, E>> {
    assertPromise(result, 'Result.andAsync', 'result')
    return result
  }

  /**
   * Returns this Result or async alternative.
   *
   * @group Async Operations
   * @param {Promise<Result<T, E>>} _result - Alternative Result (ignored for Ok)
   * @returns {Promise<Ok<T, E>>} Promise of this Ok
   * @example
   * ```ts
   * const result = Result.ok(5)
   * await result.orAsync(Promise.resolve(Result.ok(10)))
   * // Ok(5)
   * ```
   */
  orAsync(_result: Promise<Result<T, E>>): Promise<Ok<T, E>> {
    assertPromise(_result, 'Result.orAsync', 'result')
    return Promise.resolve(this)
  }

  /**
   * Returns this Result or executes async error handler.
   *
   * @group Async Operations
   * @param {(error: E) => Promise<Result<T, E>>} onErrorAsync - Async error recovery
   * @returns {Promise<Ok<T, E>>} Promise of this Ok
   * @example
   * ```ts
   * const result = Result.ok(5)
   * await result.orElseAsync(async (e) => Result.ok(e + 1))
   * // Ok(5)
   * ```
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
