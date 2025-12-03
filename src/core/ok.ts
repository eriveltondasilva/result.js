import { Err } from './err.js'
import type { Result, ResultMethods } from './types.js'
import { isResult } from './utils.js'

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
    return predicate(this.#value)
  }

  /**
   * Checks if Result is Err and error satisfies predicate.
   *
   * @group Validation
   * @param {(error: E) => boolean} _predicate - Validation function
   * @returns {boolean} Always false for Ok
   */
  isErrAnd(_predicate: (error: E) => boolean): this is Err<never, E> {
    return false
  }

  // #endregion

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
   * @throws {Error} Always throws with message "Called unwrapErr on an Ok value: [value]"
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
   * @throws {Error} Always throws with the provided message followed by ": [value]"
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

  // #region RECOVERY

  /**
   * Extracts value or returns default.
   *
   * @group Recovery
   * @see {@link unwrapOrElse} for computed default
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
   * @see {@link unwrapOr} for static default
   * @param {(error: E) => T} _onError - Default value generator
   * @returns {T} The wrapped value
   * @example
   * ```ts
   * const result = Result.ok(42)
   * result.unwrapOrElse((e) => 0)
   * // 42
   * ```
   */
  unwrapOrElse(_onError: (error: E) => T): T {
    return this.#value
  }

  // #endregion

  // #region TRANSFORMATION

  /**
   * Transforms success value.
   *
   * @group Transformation
   * @see {@link mapAsync} for async version
   * @see {@link mapOr} for default value
   * @see {@link andThen} for chaining Results
   * @template U - Transformed value type
   * @template F - New error type (only when mapper returns Result)
   * @param {(value: T) => U | Result<U, F>} mapper - Transformation function
   * @returns {Ok<U, E> | Result<U, E | F>} Ok with transformed value or flattened Result
   * @example
   * ```ts
   * Result.ok(5).map((x) => x * 2)
   * // Ok(10)
   * Result.ok(5).map(
   *   (x) => x > 0 ? Result.ok(x * 2) : Result.err("negative")
   * )
   * // Ok(10)
   * Result.ok(-5).map(
   *   (x) => x > 0 ? Result.ok(x * 2) : Result.err("negative")
   * )
   * // Err("negative")
   * ```
   */
  map<U, F = never>(mapper: (value: T) => U | Result<U, F>): Ok<U, E> | Result<U, E | F> {
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
   * @see {@link mapOrAsync} for async version
   * @see {@link mapOrElse} for computed default
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
    return mapper(this.#value)
  }

  /**
   * Transforms value using appropriate mapper.
   *
   * @group Transformation
   * @see {@link mapOrElseAsync} for async version
   * @template U - Transformed value type
   * @param {(value: T) => U} okMapper - Success mapper
   * @param {(error: E) => U} _errorMapper - Error mapper
   * @returns {U} Transformed value
   * @example
   * ```ts
   * const result = Result.ok(5)
   * result.mapOrElse((x) => x * 2, (e) => 0)
   * // 10
   * ```
   */
  mapOrElse<U>(okMapper: (value: T) => U, _errorMapper: (error: E) => U): U {
    return okMapper(this.#value)
  }

  /**
   * Transforms error value.
   *
   * @group Transformation
   * @see {@link mapErrAsync} for async version
   * @template F - New error type
   * @param {(error: E) => F} _mapper - Error transformation function
   * @returns {Ok<T, F>} Ok with same value, different error type
   * @example
   * ```ts
   * const result = Result.ok(42)
   * result.mapErr((e) =>  new Error(e))
   * // Ok(42)
   * ```
   */
  mapErr<F>(_mapper: (error: E) => F): Ok<T, F> {
    return this as unknown as Ok<T, F>
  }

  /**
   * Filters Ok value based on predicate.
   *
   * @group Transformation
   * @see {@link isOkAnd} for validation without modification
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
   * @see {@link isOkAnd} for validation without modification
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
   * @throws {Error} Throws if the Ok value is not a Result
   * @example
   * ```ts
   * Result.ok(Result.ok(42)).flatten()
   * // Ok(42)
   *
   * Result.ok(Result.err("fail")).flatten()
   * // Err("fail")
   *
   * Result.ok(42).flatten()
   * // throws Error: flatten() called on Ok that does not contain a Result
   * ```
   */
  flatten<U, F>(this: Ok<Result<U, F>, E>): Result<U, E | F> {
    if (!isResult(this.#value)) {
      throw new Error('flatten() called on Ok that does not contain a Result')
    }
    return this.#value
  }

  // #endregion

  // #region CHAINING

  /**
   * Chains operation that returns Result.
   *
   * @group Chaining
   * @see {@link andThenAsync} for async version
   * @see {@link map} for auto-flattening alternative
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
    return flatMapper(this.#value)
  }

  /**
   * Returns this Result or executes error handler.
   *
   * @group Chaining
   * @see {@link orElseAsync} for async version
   * @see {@link or} for static alternative
   * @param {(error: E) => Result<T, E>} _onError - Error recovery function
   * @returns {Ok<T, E>} This Ok instance
   * @example
   * ```ts
   * Result.ok(42).orElse((e) => Result.ok(e))
   * // Ok(42)
   * ```
   */
  orElse(_onError: (error: E) => Result<T, E>): Ok<T, E> {
    return this
  }

  /**
   * Returns second Result if this is Ok.
   *
   * @group Chaining
   * @see {@link andAsync} for async version
   * @see {@link andThen} for function-based chaining
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
    return result
  }

  /**
   * Returns this Result or alternative.
   *
   * @group Chaining
   * @see {@link orAsync} for async version
   * @see {@link orElse} for function-based alternative
   * @param {Result<T, E>} _result - Alternative Result (ignored for Ok)
   * @returns {Ok<T, E>} This Ok instance
   * @example
   * ```ts
   * Result.ok(1).or(Result.ok(2))
   * // Ok(1)
   * Result.ok(1).or(Result.err("fail"))
   * // Ok(1)
   * ```
   */
  or(_result: Result<T, E>): Ok<T, E> {
    return this
  }

  /**
   * Combines two Results into tuple.
   *
   * @group Chaining
   * @template U - Second Result success type
   * @template F - Second Result error type
   * @param {Result<U, F>} result - Result to zip with
   * @returns {Result<[T, U], E | F>} Ok with tuple [this, other] or first Err
   * @example
   * Result.ok(1).zip(Result.ok(2))
   * // Ok([1, 2])
   * Result.ok(1).zip(Result.err("fail"))
   * // Err("fail")
   */
  zip<U, F>(result: Result<U, F>): Result<[T, U], E | F> {
    if (result.isErr()) {
      return new Err<[T, U], E | F>(result.unwrapErr())
    }

    return new Ok<[T, U], E | F>([this.#value, result.unwrap()])
  }

  // #endregion

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
    return handlers.ok(this.#value)
  }

  /**
   * Performs side effect on success value.
   *
   * @group Inspection
   * @see {@link inspectErr} for error inspection
   * @see {@link match} for pattern matching
   * @param {(value: T) => void} visitor - Side effect function
   * @returns {Ok<T, E>} This Ok instance for chaining
   * @example
   * ```ts
   * Result.ok(42).inspect((x) => console.log(x))
   * // logs 42, returns Ok(42)
   * ```
   */
  inspect(visitor: (value: T) => void): Ok<T, E> {
    visitor(this.#value)
    return this
  }

  /**
   * Performs side effect on error value.
   *
   * @group Inspection
   * @see {@link inspect} for value inspection
   * @param {(error: E) => void} _visitor - Side effect function
   * @returns {Ok<T, E>} This Ok instance unchanged
   * @example
   * ```ts
   * Result.ok(42).inspectErr((e) => console.log(e))
   * // Ok(42)
   * ```
   */
  inspectErr(_visitor: (error: E) => void): Ok<T, E> {
    return this
  }

  // #endregion

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
   * Result.ok({ id: 1 }).contains(
   *   { id: 1 },
   *   (a, b) => a.id === b.id
   * )
   * // true
   * ```
   */
  contains(value: T, comparator?: (actual: T, expected: T) => boolean): boolean {
    return comparator ? comparator(this.#value, value) : this.#value === value
  }

  /**
   * Checks if Err contains specific error.
   *
   * @group Comparison
   * @param {E} _error - Error to compare (ignored for Ok)
   * @param {(actual: E, expected: E) => boolean} [_comparator] - Custom comparison function
   * @returns {boolean} Always false for Ok
   * @example
   * ```ts
   * Result.ok(42).containsErr("fail")
   * // false
   * ```
   */
  containsErr(_error: E, _comparator?: (actual: E, expected: E) => boolean): boolean {
    return false
  }

  // #endregion

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
   * Result.ok(42).toJSON()
   * // { type: 'ok', value: 42 }
   * JSON.stringify(Result.ok(42))
   * // '{"type":"ok","value":42}'
   * ```
   */
  toJSON(): { type: 'ok'; value: T } {
    return { type: 'ok', value: this.#value }
  }

  // #endregion

  // #region ASYNC OPERATIONS

  /**
   * Transforms value asynchronously.
   *
   * @group Async Operations
   * @template U - Transformed value type
   * @template F - New error type (only when mapper returns Result)
   * @param {(value: T) => Promise<U | Result<U, F>>} mapperAsync - Async transformation
   * @returns {Promise<Ok<U, E> | Result<U, E | F>>} Promise of Ok with transformed value or flattened Result
   * @example
   * ```ts
   * Result.ok(5).mapAsync(async (x) => x * 2)
   * // Promise<Ok(10)>
   * Result.ok(5).mapAsync(async (x) => Result.ok(x * 2))
   * // Promise<Ok(10)>
   * Result.ok(5).mapAsync(async (x) => Result.err("fail"))
   * // Promise<Err("fail")>
   * ```
   */
  async mapAsync<U, F = never>(
    mapperAsync: (value: T) => Promise<U | Result<U, F>>
  ): Promise<Ok<U, E> | Result<U, E | F>> {
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
   * @param {(error: E) => Promise<F>} _mapperAsync - Async error transformation
   * @returns {Promise<Ok<T, F>>} Promise of Ok with same value
   * @example
   * ```ts
   * const result = Result.ok(5)
   * await result.mapErrAsync(async (e) => e + 1)
   * // Ok(5)
   * ```
   */
  mapErrAsync<F>(_mapperAsync: (error: E) => Promise<F>): Promise<Ok<T, F>> {
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
    return mapperAsync(this.#value)
  }

  /**
   * Transforms value using appropriate async mapper.
   *
   * @group Async Operations
   * @template U - Transformed value type
   * @param {(value: T) => Promise<U>} okMapperAsync - Async success mapper
   * @param {(error: E) => Promise<U>} _errMapperAsync - Async error mapper
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
    _errMapperAsync: (error: E) => Promise<U>
  ): Promise<U> {
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
    return Promise.resolve(this)
  }

  /**
   * Returns this Result or executes async error handler.
   *
   * @group Async Operations
   * @param {(error: E) => Promise<Result<T, E>>} _onErrorAsync - Async error recovery
   * @returns {Promise<Ok<T, E>>} Promise of this Ok
   * @example
   * ```ts
   * const result = Result.ok(5)
   * await result.orElseAsync(async (e) => Result.ok(e + 1))
   * // Ok(5)
   * ```
   */
  orElseAsync(_onErrorAsync: (error: E) => Promise<Result<T, E>>): Promise<Ok<T, E>> {
    return Promise.resolve(this)
  }

  // #endregion

  // #region METADATA

  get [Symbol.toStringTag](): string {
    return 'Result.Ok'
  }

  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return `Ok(${JSON.stringify(this.#value, null, 2)})`
  }

  // #endregion
}
