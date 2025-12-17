import { Err } from './err.js'
import { isResult } from './factories.js'
import { valueToDisplayString } from './utils.js'

import type { AsyncResult, Result, ResultMethods } from './types.d.ts'

/**
 * Represents a successful Result containing a value.
 *
 * Ok is a Result variant that encapsulates successful operations.
 * Provides methods to transform, chain, and extract the contained value,
 * as well as convert to other representations.
 *
 * @remarks
 * You normally don't instantiate Ok directly. Use `Result.ok(value)`.
 *
 * @internal
 * @template T - Success value type
 * @template E - Error type (for type compatibility)
 *
 * @example
 * const result = Result.ok(42)
 * console.log(result.unwrap()) // 42
 * console.log(result.isOk())   // true
 */
export class Ok<T, E = never> implements ResultMethods<T, E> {
  readonly #value: T

  constructor(value: T) {
    this.#value = value
  }

  private validateResult(value: unknown, method: string): void {
    if (isResult(value)) return

    throw new Error(`${method}() called on Ok that does not contain a Result`)
  }

  // #region CHECKING

  /**
   * Checks if this Result is the Ok variant.
   *
   * @group Checking
   * @see {@link isErr} for the opposite check
   * @returns {boolean} Always true for Ok
   *
   * @example
   * Result.ok(42).isOk()       // true
   * Result.err('fail').isOk()  // false
   */
  isOk(): this is Ok<T> {
    return true
  }

  /**
   * Checks if this Result is the Err variant.
   *
   * @group Checking
   * @see {@link isOk} for the opposite check
   * @returns {boolean} Always false for Ok
   *
   * @example
   * Result.ok(42).isErr() // false
   */
  isErr(): this is Err<E> {
    return false
  }

  /**
   * Checks if it's Ok and if the value satisfies a predicate.
   *
   * Useful for conditional validations in chains.
   *
   * @group Checking
   * @see {@link isOkAnd} for the opposite check
   * @param {(value: T) => boolean} predicate - Validation function
   * @returns {boolean} true if Ok and predicate passes
   *
   * @example
   * Result.ok(10).isOkAnd((x) => x > 5)  // true
   * Result.ok(3).isOkAnd((x) => x > 5)   // false
   *
   * @example
   * // Conditional validation
   * if (result.isOkAnd((user) => user.isActive)) {
   *   // User exists AND is active
   * }
   */
  isOkAnd(predicate: (value: T) => boolean): this is Ok<T> {
    return predicate(this.#value)
  }

  /**
   * Checks if it's Err and if the error satisfies a predicate.
   *
   * @group Checking
   * @see {@link isErrAnd} for the opposite check
   * @param {(error: E) => boolean} _predicate - Validation function (ignored)
   * @returns {boolean} Always false for Ok
   */
  isErrAnd(_predicate: (error: E) => boolean): this is Err<E> {
    return false
  }

  // #endregion

  // #region ACCESSING: ok, err, unwrap, unwrapErr, unwrapOr, unwrapOrElse, expect, expectEr

  /**
   * Gets the success value or null.
   *
   * Read-only property for safe value access without throwing exceptions.
   *
   * @group Accessing
   * @returns {T} The encapsulated value
   *
   * @example
   * const result = Result.ok(42)
   * console.log(result.ok) // 42
   *
   * @example
   * const err = Result.err('fail')
   * console.log(err.ok) // null
   */
  get ok(): T {
    return this.#value
  }

  /**
   * Gets the error or null.
   *
   * @group Accessing
   * @returns {null} Always null for Ok
   *
   * @example
   * Result.ok(42).err // null
   */
  get err(): null {
    return null
  }

  /**
   * Extracts the success value.
   *
   * For Ok, returns the encapsulated value. Equivalent to accessing `.ok`.
   * Use when you're sure the Result is Ok.
   *
   * @group Accessing
   * @see {@link unwrapErr} for Err variant
   * @see {@link unwrapOr} for default value
   * @returns {T} The encapsulated value
   *
   * @example
   * const value = Result.ok(42).unwrap()
   * console.log(value) // 42
   *
   * @example
   * // Usage after checking
   * if (result.isOk()) {
   *   const value = result.unwrap() // safe
   * }
   */
  unwrap(): T {
    return this.#value
  }

  /**
   * Attempts to extract the error (always fails for Ok).
   *
   * @group Accessing
   * @returns {never} Never returns
   * @throws {Error} Always throws error indicating incorrect usage
   *
   * @example
   * Result.ok(42).unwrapErr()
   * // throws Error("Called unwrapErr on an Ok value: 42")
   */
  unwrapErr(): never {
    throw new Error(`Called unwrapErr on an Ok value: ${valueToDisplayString(this.#value)}`)
  }

  /**
   * Extracts value or returns default.
   *
   * For Ok, ignores the default and returns the value.
   * For Err, would return the default.
   *
   * @group Accessing
   * @see {@link unwrap} for Ok variant
   * @see {@link unwrapOrElse} for computed default
   * @param {T} _defaultValue - Default value (ignored for Ok)
   * @returns {T} The encapsulated value
   *
   * @example
   * Result.ok(42).unwrapOr(0) // 42
   * Result.err('fail').unwrapOr(0) // 0
   */
  unwrapOr(_defaultValue: T): T {
    return this.#value
  }

  /**
   * Extracts value or computes default from error.
   *
   * For Ok, ignores the function and returns the value.
   *
   * @group Accessing
   * @see {@link unwrapOr} for static default
   * @param {(error: E) => T} _onError - Default value generator (ignored)
   * @returns {T} The encapsulated value
   *
   * @example
   * Result.ok(42).unwrapOrElse((e) => 0) // 42
   * Result.err('fail').unwrapOrElse((e) => 0) // 0
   */
  unwrapOrElse(_onError: (error: E) => T): T {
    return this.#value
  }

  /**
   * Extracts value with custom error message (for Err).
   *
   * For Ok, ignores the message and returns the value.
   * For Err, would throw error with the provided message.
   *
   * @group Accessing
   * @see {@link expectErr} for Err variant
   * @param {string} _message - Error message (ignored for Ok)
   * @returns {T} The encapsulated value
   *
   * @example
   * const value = Result.ok(42).expect('should exist')
   * console.log(value) // 42
   */
  expect(_message: string): T {
    return this.#value
  }

  /**
   * Attempts to extract error with custom message (always fails for Ok).
   *
   * @group Accessing
   * @param {string} message - Error message
   * @returns {never} Never returns
   * @throws {Error} Always throws with provided message
   *
   * @example
   * Result.ok(42).expectErr('should be error')
   * // throws Error("should be error: 42")
   */
  expectErr(message: string): never {
    throw new Error(`${message}: ${valueToDisplayString(this.#value)}`)
  }

  // #endregion

  // #region TRANSFORMING: map, mapOr, mapOrElse, mapErr, filter, flatten

  /**
   * Transforms the success value.
   *
   * Applies function to value and returns new Ok with result.
   *
   * @group Transforming
   * @see {@link mapAsync} for async version
   * @see {@link mapOr} for default value
   * @see {@link mapErr} to transform the error part (not the value)
   * @see {@link andThen} for automatic flattening of Result returns
   * @template U - Transformed value type
   * @param {(value: T) => U} mapper - Transformation function
   * @returns {Result<U, E>} Transformed Ok or the original Err
   *
   * @example
   * // Simple transformation
   * Result.ok(5).map((x) => x * 2)
   * // Ok(10)
   *
   * @example
   * // Chaining multiple maps
   * Result.ok('42')
   *   .map((s) => parseInt(s, 10))
   *   .map((n) => n * 2)
   * // Ok(84)
   *
   * @example
   * // On error, map is skipped
   * Result.err('oops').map((x) => x * 2)
   * // Err('oops')
   */
  map<U>(mapper: (value: T) => U): Result<U, E> {
    return new Ok(mapper(this.#value))
  }

  /**
   * Transforms value or returns default.
   *
   * For Ok, applies mapper and returns result.
   * For Err, would return the default.
   *
   * @group Transforming
   * @see {@link mapOrAsync} for async version
   * @see {@link mapOrElse} for computed default
   * @template U - Transformed value type
   * @param {(value: T) => U} mapper - Transformation function
   * @param {U} _defaultValue - Default value (ignored for Ok)
   * @returns {U} Transformed value
   *
   * @example
   * Result.ok(5).mapOr((x) => x * 2, 0) // 10
   * Result.err('fail').mapOr((x) => x * 2, 0) // 0
   */
  mapOr<U>(mapper: (value: T) => U, _defaultValue: U): U {
    return mapper(this.#value)
  }

  /**
   * Transforms value using appropriate mapper.
   *
   * For Ok, uses success mapper.
   * For Err, would use error mapper.
   *
   * @group Transforming
   * @see {@link mapOrElseAsync} for async version
   * @template U - Result type
   * @param {(value: T) => U} okMapper - Success mapper
   * @param {(error: E) => U} _errorMapper - Error mapper (ignored)
   * @returns {U} Transformed value
   *
   * @example
   * Result.ok(5).mapOrElse(
   *   (x) => x * 2,
   *   (e) => -1
   * )
   * // 10
   */
  mapOrElse<U>(okMapper: (value: T) => U, _errorMapper: (error: E) => U): U {
    return okMapper(this.#value)
  }

  /**
   * Transforms the error (not applicable for Ok).
   *
   * For Ok, keeps the value and only adjusts error type.
   *
   * @group Transforming
   * @see {@link mapErrAsync} for async version
   * @template E2 - New error type
   * @param {(error: E) => E2} _mapper - Error transformer (ignored)
   * @returns {Result<T, E2>} Result with same value, different error type
   *
   * @example
   * Result.ok(42).mapErr((e) => new Error(e))
   * // Result(42) - type adjusted, but value unchanged
   */
  mapErr<E2>(_mapper: (error: E) => E2): Result<T, E2> {
    return this as unknown as Result<T, E2>
  }

  /**
   * Filters Ok value based on predicate.
   *
   * If predicate passes, keeps Ok.
   * If it fails, converts to Err.
   *
   * @overload
   * @group Transforming
   * @see {@link isOkAnd} for validation without modification
   * @param predicate - Validation function
   * @returns Ok if passes, Err with default error if fails
   *
   * @example
   * Result.ok(10).filter((x) => x > 5)
   * // Ok(10)
   *
   * Result.ok(3).filter((x) => x > 5)
   * // Err(Error: Filter predicate failed for value: 3)
   */
  filter(predicate: (value: T) => boolean): Result<T, Error>

  /**
   * Filters Ok value with custom error.
   *
   * @overload
   * @group Transforming
   * @param {(value: T) => boolean} predicate - Validation function
   * @param {(value: T) => E} onReject - Error generator on rejection
   * @returns {Result<T, E>} Ok if passes, custom Err if fails
   *
   * @example
   * Result.ok(3).filter(
   *   (x) => x > 5,
   *   (x) => new Error(`${x} is too small`)
   * )
   * // Err(Error: 3 is too small)
   */
  filter(predicate: (value: T) => boolean, onReject: (value: T) => E): Result<T, E>

  filter(
    predicate: (value: T) => boolean,
    onReject?: (value: T) => E | Error,
  ): Result<T, E | Error> {
    if (!predicate(this.#value)) {
      return new Err(
        onReject
          ? onReject(this.#value)
          : new Error(`Filter predicate failed for value: ${valueToDisplayString(this.#value)}`),
      )
    }

    return this
  }

  /**
   * Flattens nested Result.
   *
   * If Ok contains another Result, extracts the inner Result.
   * Useful for simplifying nested Results.
   *
   * @group Transforming
   * @template U - Inner Result value type
   * @template E2 - Inner Result error type
   * @param {Ok<Result<U, E2>, E>} this - Nested Result
   * @returns {Result<U, E | E2>} Result with same value, different error type
   * @throws {Error} If Ok doesn't contain a Result
   *
   * @example
   * Result.ok(Result.ok(42)).flatten()
   * // Ok(42)
   *
   * Result.ok(Result.err('fail')).flatten()
   * // Err("fail")
   *
   * @example
   * Result.ok(42).flatten()
   * // throws Error: flatten() called on Ok that does not contain a Result
   */
  flatten<U, E2>(this: Ok<Result<U, E2>, E>): Result<U, E | E2> {
    this.validateResult(this.#value, 'flatten')

    return this.#value
  }

  // #endregion

  // #region CHAINING: and, andThen, or, orElse, zip

  /**
   * Returns second Result if this is Ok.
   *
   * For Ok, returns the provided Result.
   * For Err, would keep the error.
   *
   * @group Chaining
   * @see {@link andAsync} for async version
   * @see {@link andThen} for function-based chaining
   * @template U - Second Result success type
   * @param {Result<U, E>} result - Result to return
   * @returns {Result<U, E>} The provided Result
   *
   * @example
   * Result.ok(1).and(Result.ok(2))
   * // Ok(2)
   *
   * Result.ok(1).and(Result.err('fail'))
   * // Err("fail")
   */
  and<U>(result: Result<U, E>): Result<U, E> {
    this.validateResult(result, 'and')

    return result
  }

  /**
   * Chains operation that returns Result.
   *
   * Similar to map(), but mapper must return Result explicitly.
   * Doesn't do automatic flattening.
   *
   * @group Chaining
   * @see {@link andThenAsync} for async version
   * @see {@link map} for alternative with auto-flatten
   * @template U - New success type
   * @param {(value: T) => Result<U, E>} flatMapper - Chaining function
   * @returns {Result<U, E>} Result returned by flatMapper
   *
   * @example
   * Result.ok(5).andThen((x) => Result.ok(x * 2))
   * // Ok(10)
   *
   * Result.ok(5).andThen((x) => Result.err('failure'))
   * // Err("failure")
   *
   * @example
   * // Validation pipeline
   * Result.ok(userData)
   *   .andThen(validateEmail)
   *   .andThen(validateAge)
   *   .andThen(saveToDatabase)
   */
  andThen<U>(flatMapper: (value: T) => Result<U, E>): Result<U, E> {
    return flatMapper(this.#value)
  }

  /**
   * Returns this Result or alternative.
   *
   * For Ok, ignores alternative and returns self.
   *
   * @group Chaining
   * @see {@link orAsync} for async version
   * @see {@link orElse} for function-based alternative
   * @param {Result<T, E>} result - Alternative Result (ignored)
   * @returns {Ok<T, E>} This Ok instance
   *
   * @example
   * Result.ok(1).or(Result.ok(2))
   * // Ok(1)
   *
   * Result.ok(1).or(Result.err('fail'))
   * // Ok(1)
   */
  or(result: Result<T, E>): Result<T, E> {
    this.validateResult(result, 'or')

    return this
  }

  /**
   * Returns this Result or executes error recovery.
   *
   * For Ok, ignores recovery and returns self.
   * For Err, would execute the recovery function.
   *
   * @group Chaining
   * @see {@link orElseAsync} for async version
   * @see {@link or} for static alternative
   * @param {(error: E) => Result<T, E>} _onError - Recovery (ignored)
   * @returns {Ok<T, E>} This Ok instance
   *
   * @example
   * Result.ok(42).orElse((e) => Result.ok(0))
   * // Ok(42)
   */
  orElse(_onError: (error: E) => Result<T, E>): Result<T, E> {
    return this
  }

  /**
   * Combines two Results into tuple.
   *
   * If both are Ok, returns Ok with tuple [this, other].
   * If other is Err, returns that Err.
   *
   * @group Chaining
   * @see {@link and} for chaining and discarding the first Ok value.
   * @template U - Second Result success type
   * @template E2 - Second Result error type
   * @param {Result<U, E2>} result - Result to combine
   * @returns {Result<[T, U], E | E2>} Ok with tuple or first Err
   *
   * @example
   * Result.ok(1).zip(Result.ok(2))
   * // Ok([1, 2])
   *
   * Result.ok(1).zip(Result.err('fail'))
   * // Err("fail")
   *
   * @example
   * // Combining multiple operations
   * const userId = getUserId()
   * const userName = getUserName()
   * const combined = userId.zip(userName)
   * // Ok([id, name]) or first error
   */
  zip<U, E2>(result: Result<U, E2>): Result<[T, U], E | E2> {
    this.validateResult(result, 'zip')

    if (result.isErr()) {
      return new Err<[T, U], E | E2>(result.unwrapErr())
    }

    return new Ok<[T, U], E | E2>([this.#value, result.unwrap()])
  }

  // #endregion

  // #region INSPECTING: contains, containsErr, match, inspect, inspectErr

  /**
   * Checks if Ok contains specific value.
   *
   * Uses strict equality (===) by default.
   * Custom comparator allows checking complex objects.
   *
   * @group Inspecting
   * @param {T} value - Value to compare
   * @param {(actual: T, expected: T) => boolean} [comparator] - Custom comparator
   * @returns {boolean} true if values match
   *
   * @example
   * Result.ok(42).contains(42) // true
   * Result.ok(42).contains(99) // false
   *
   * @example
   * // With objects (needs comparator)
   * Result.ok({ id: 1 }).contains(
   *   { id: 1 },
   *   (a, b) => a.id === b.id
   * )
   * // true
   */
  contains(value: T, comparator?: (actual: T, expected: T) => boolean): boolean {
    return comparator ? comparator(this.#value, value) : this.#value === value
  }

  /**
   * Checks if Err contains specific error (always false for Ok).
   *
   * @group Inspecting
   * @param {E} _error - Error to compare (ignored)
   * @param {(actual: E, expected: E) => boolean} [_comparator] - Comparator (ignored)
   * @returns {boolean} Always false
   *
   * @example
   * Result.ok(42).containsErr('fail') // false
   */
  containsErr(_error: E, _comparator?: (actual: E, expected: E) => boolean): boolean {
    return false
  }

  /**
   * Pattern matching on Result state.
   *
   * Executes appropriate handler based on state (Ok/Err).
   * Useful for structured handling of both cases.
   *
   * @group Inspecting
   * @template L - Ok handler return type
   * @template R - Err handler return type
   * @param {{ ok: (value: T) => L; err: (error: E) => R }} handlers - Handlers for each case
   * @returns {L | R} Result from corresponding handler
   *
   * @example
   * const msg = Result.ok(5).match({
   *   ok: (x) => `Success: ${x * 2}`,
   *   err: (e) => `Error: ${e}`
   * })
   * // "Success: 10"
   *
   * @example
   * // Converting to React component
   * result.match({
   *   ok: (user) => <UserProfile user={user} />,
   *   err: (error) => <ErrorMessage error={error} />,
   * })
   */
  match<L, R>(handlers: { ok: (value: T) => L; err: (error: E) => R }): L | R {
    return handlers.ok(this.#value)
  }

  /**
   * Performs side effect on success value.
   *
   * Useful for logging, debugging, or side effects
   * without breaking chaining.
   *
   * @group Inspecting
   * @see {@link inspectErr} for error inspection
   * @see {@link match} for pattern matching
   * @param {(value: T) => void} visitor - Side effect function
   * @returns {Result<T, E>} This instance for chaining
   *
   * @example
   * Result.ok(42)
   *   .inspect((x) => console.log('value:', x))
   *   .map((x) => x * 2)
   * // logs "value: 42", returns Ok(84)
   *
   * @example
   * // Debug in pipeline
   * fetchUser(id)
   *   .inspect((user) => console.log('user loaded'))
   *   .andThen(validateUser)
   *   .inspect((user) => console.log('user validated'))
   */
  inspect(visitor: (value: T) => void): Result<T, E> {
    visitor(this.#value)

    return this
  }

  /**
   * Performs side effect on error (not applicable for Ok).
   *
   * @group Inspecting
   * @see {@link inspect} for value inspection
   * @param {(error: E) => void} _visitor - Effect function (ignored)
   * @returns {Result<T, E>} This instance unchanged
   *
   * @example
   * Result.ok(42).inspectErr((e) => console.log('error:', e))
   * // Ok(42) - nothing is logged
   */
  inspectErr(_visitor: (error: E) => void): Result<T, E> {
    return this
  }

  // #endregion

  // #region CONVERSION: toPromise, toString, toJSON

  /**
   * Converts Result to resolved Promise.
   *
   * @group Conversion
   * @returns {Promise<T>} Promise resolving to the value
   *
   * @example
   * const value = await Result.ok(42).toPromise()
   * // 42
   *
   * @example
   * // Integrating with Promise-based code
   * const resultPromise = Result.ok(data).toPromise()
   */
  toPromise(): Promise<T> {
    return Promise.resolve(this.#value)
  }

  /**
   * Converts Result to string representation.
   *
   * @group Conversion
   * @returns {string} Format "Ok(value)"
   *
   * @example
   * Result.ok(42).toString()
   * // "Ok(42)"
   *
   * Result.ok({ name: 'John' }).toString()
   * // "Ok([object Object])"
   */
  toString(): string {
    return `Ok(${valueToDisplayString(this.#value)})`
  }

  /**
   * Converts Result to JSON object.
   *
   * Useful for serialization and APIs.
   *
   * @group Conversion
   * @returns {{ type: 'ok'; value: T }} JSON representation
   *
   * @example
   * Result.ok(42).toJSON()
   * // { type: 'ok', value: 42 }
   *
   * JSON.stringify(Result.ok(42))
   * // '{"type":"ok","value":42}'
   */
  toJSON(): { type: 'ok'; value: T } {
    return { type: 'ok', value: this.#value }
  }

  // #endregion

  // #region ASYNC: mapAsync, mapErrAsync, mapOrAsync, mapOrElseAsync, andThenAsync, andAsync, orAsync, orElseAsync

  /**
   * Transforms value asynchronously.
   *
   * Async version of map().
   *
   * @group Async
   * @template U - Transformed value type
   * @param {(value: T) => Promise<U>} mapperAsync - Async transformation function
   * @returns {AsyncResult<U, E>} Promise of transformed Ok
   *
   * @example
   * await Result.ok(5).mapAsync(async (x) => x * 2)
   * // Ok(10)
   *
   * @example
   * await Result.ok(userId).mapAsync(async (id) => {
   *   return await fetchUser(id)
   * })
   * // Ok(user)
   */
  async mapAsync<U>(mapperAsync: (value: T) => Promise<U>): AsyncResult<U, E> {
    return new Ok(await mapperAsync(this.#value))
  }

  /**
   * Transforms error asynchronously (not applicable for Ok).
   *
   * @group Async
   * @template E2 - New error type
   * @param {(error: E) => Promise<E2>} _mapperAsync - Async transformation (ignored)
   * @returns {AsyncResult<T, E2>} Promise of Ok with same value
   *
   * @example
   * await Result.ok(5).mapErrAsync(async (e) => e + 1)
   * // Ok(5)
   */
  mapErrAsync<E2>(_mapperAsync: (error: E) => Promise<E2>): AsyncResult<T, E2> {
    return Promise.resolve(this as unknown as Result<T, E2>)
  }

  /**
   * Transforms value asynchronously or returns default.
   *
   * @group Async
   * @template U - Transformed value type
   * @param {(value: T) => Promise<U>} mapperAsync - Async transformation
   * @param {U} _defaultValue - Default value (ignored)
   * @returns {Promise<U>} Promise of transformed value
   *
   * @example
   * await Result.ok(5).mapOrAsync(async (x) => x * 2, 0)
   * // 10
   */
  mapOrAsync<U>(mapperAsync: (value: T) => Promise<U>, _defaultValue: U): Promise<U> {
    return mapperAsync(this.#value)
  }

  /**
   * Transforms using appropriate async mapper.
   *
   * @group Async
   * @template U - Result type
   * @param {(value: T) => Promise<U>} okAsync - Async success mapper
   * @param {(error: E) => Promise<U>} _errAsync - Error mapper (ignored)
   * @returns {Promise<U>} Promise of transformed value
   *
   * @example
   * await Result.ok(5).mapOrElseAsync(
   *   async (x) => x * 2,
   *   async (e) => -1
   * )
   * // 10
   */
  mapOrElseAsync<U>(
    okAsync: (value: T) => Promise<U>,
    _errAsync: (error: E) => Promise<U>,
  ): Promise<U> {
    return okAsync(this.#value)
  }

  /**
   * Chains async operation that returns Result.
   *
   * @group Async
   * @template U - New success type
   * @param {(value: T) => AsyncResult<U, E>} mapAsync - Async chaining
   * @returns {AsyncResult<U, E>} Promise of returned Result
   *
   * @example
   * await Result.ok(userId).andThenAsync(async (id) => {
   *   const user = await fetchUser(id)
   *   return user ? Result.ok(user) : Result.err('not found')
   * })
   */
  andThenAsync<U>(mapAsync: (value: T) => AsyncResult<U, E>): AsyncResult<U, E> {
    return mapAsync(this.#value)
  }

  /**
   * Returns async Result if this is Ok.
   *
   * @group Async
   * @template U - Second Result success type
   * @param {AsyncResult<U, E>} result - Async Result
   * @returns {AsyncResult<U, E>} The provided Promise
   *
   * @example
   * await Result.ok(5).andAsync(
   *   Promise.resolve(Result.ok(10))
   * )
   * // Ok(10)
   */
  andAsync<U>(result: AsyncResult<U, E>): AsyncResult<U, E> {
    return result
  }

  /**
   * Returns this Result or async alternative.
   *
   * @group Async
   * @param {AsyncResult<T, E>} _result - Async alternative (ignored)
   * @returns {AsyncResult<T, E>} Promise of this instance
   *
   * @example
   * await Result.ok(5).orAsync(
   *   Promise.resolve(Result.ok(10))
   * )
   * // Ok(5)
   */
  orAsync(_result: AsyncResult<T, E>): AsyncResult<T, E> {
    return Promise.resolve(this)
  }

  /**
   * Returns this Result or executes async recovery.
   *
   * @group Async
   * @param {(error: E) => AsyncResult<T, E>} _onErrorAsync - Async recovery (ignored)
   * @returns {AsyncResult<T, E>} Promise of this instance
   *
   * @example
   * await Result.ok(5).orElseAsync(
   *   async (e) => Result.ok(0)
   * )
   * // Ok(5)
   */
  orElseAsync(_onErrorAsync: (error: E) => AsyncResult<T, E>): AsyncResult<T, E> {
    return Promise.resolve(this)
  }

  // #endregion
}
