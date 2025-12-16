import { isResult } from './factories.js'
import type { Ok } from './ok.js'
import { valueToDisplayString } from './utils.js'

import type { AsyncResult, Result, ResultMethods } from './types.d.ts'

/**
 * Represents an error Result containing a failure.
 *
 * Err is a Result variant that encapsulates failed operations.
 * Provides methods for recovery, error transformation, and conversion
 * to other representations, maintaining type-safety.
 *
 * @remarks
 * You normally don't instantiate Err directly. Use `Result.err(error)`.
 *
 * @internal
 * @template T - Success value type (for compatibility)
 * @template E - Error type
 *
 * @example
 * const result = Result.err(new Error('failed'))
 * console.log(result.unwrapErr()) // Error: failed
 * console.log(result.isErr()) // true
 */
export class Err<T = never, E = Error> implements ResultMethods<T, E> {
  readonly #error: E

  constructor(error: E) {
    this.#error = error
  }

  // #region VALIDATION

  /**
   * Checks if this Result is the Ok variant.
   *
   * @group Validation
   * @see {@link isErr} for the opposite check
   * @returns {boolean} Always false for Err
   *
   * @example
   * Result.err('fail').isOk() // false
   */
  isOk(): this is Ok<T> {
    return false
  }

  /**
   * Checks if this Result is the Err variant.
   *
   * @group Validation
   * @see {@link isOk} for the opposite check
   * @returns {boolean} Always true for Err
   *
   * @example
   * Result.err('fail').isErr() // true
   * Result.ok(42).isErr() // false
   */
  isErr(): this is Err<E> {
    return true
  }

  /**
   * Checks if it's Ok and if the value satisfies a predicate.
   *
   * @group Validation
   * @see {@link isErrAnd} for the opposite check
   * @param {(value: T) => boolean} _predicate - Validation function (ignored)
   * @returns {boolean} Always false for Err
   *
   * @example
   * Result.err('fail').isOkAnd(x => x > 5) // false
   */
  isOkAnd(_predicate: (value: T) => boolean): this is Ok<T> {
    return false
  }

  /**
   * Checks if it's Err and if the error satisfies a predicate.
   *
   * Useful for filtering specific error types or conditions.
   *
   * @group Validation
   * @param {(error: E) => boolean} predicate - Validation function
   * @returns {boolean} true if Err and predicate passes
   *
   * @example
   * const err = Result.err(new Error('not found'))
   * err.isErrAnd(e => e.message.includes('not'))
   * // true
   *
   * @example
   * // Checking specific error type
   * if (result.isErrAnd(e => e.code === 404)) {
   *   console.log('Resource not found')
   * }
   */
  isErrAnd(predicate: (error: E) => boolean): this is Err<E> {
    return predicate(this.#error)
  }

  // #endregion

  // #region ACCESS

  /**
   * Gets the success value or null.
   *
   * @group Access
   * @returns {null} Always null for Err
   *
   * @example
   * Result.err('fail').ok // null
   */
  get ok(): null {
    return null
  }

  /**
   * Gets the error or null.
   *
   * Read-only property for safe error access.
   *
   * @group Access
   * @returns {E} The encapsulated error
   *
   * @example
   * const result = Result.err('fail')
   * console.log(result.err) // "fail"
   *
   * @example
   * const ok = Result.ok(42)
   * console.log(ok.err) // null
   */
  get err(): E {
    return this.#error
  }

  /**
   * Attempts to extract the success value (always fails for Err).
   *
   * @group Access
   * @returns {never} Never returns
   * @throws {Error} Always throws error with original cause
   *
   * @example
   * Result.err(new Error('fail')).unwrap()
   * // throws Error("Called unwrap on an Err value", {
   * //   cause: Error("fail")
   * // })
   */
  unwrap(): never {
    throw new Error('Called unwrap on an Err value', { cause: this.#error })
  }

  /**
   * Extracts the error.
   *
   * For Err, returns the encapsulated error.
   * Use when you're sure the Result is Err.
   *
   * @group Access
   * @returns {E} The encapsulated error
   *
   * @example
   * const err = Result.err('failed').unwrapErr()
   * console.log(err) // "failed"
   *
   * @example
   * // Usage after checking
   * if (result.isErr()) {
   *   const error = result.unwrapErr() // safe
   *   console.error('Operation failed:', error)
   * }
   */
  unwrapErr(): E {
    return this.#error
  }

  /**
   * Attempts to extract value with custom message (always fails for Err).
   *
   * @group Access
   * @param {string} message - Error message
   * @returns {never} Never returns
   * @throws {Error} Throws with custom message and original error as cause
   *
   * @example
   * Result.err(new Error('fail')).expect('should exist')
   * // throws Error("should exist", {
   * //   cause: Error("fail")
   * // })
   */
  expect(message: string): never {
    throw new Error(message, { cause: this.#error })
  }

  /**
   * Extracts error with custom message.
   *
   * For Err, ignores the message and returns the error.
   *
   * @group Access
   * @param {string} _message - Error message (ignored for Err)
   * @returns {E} The encapsulated error
   *
   * @example
   * Result.err('fail').expectErr('should be error')
   * // "fail"
   */
  expectErr(_message: string): E {
    return this.#error
  }

  // #endregion

  // #region RECOVERY

  /**
   * Extracts value or returns default.
   *
   * For Err, returns the provided default value.
   * For Ok, would return the encapsulated value.
   *
   * @group Recovery
   * @see {@link unwrapOrElse} for computed default
   * @param {T} defaultValue - Default value to return
   * @returns {T} The default value
   *
   * @example
   * Result.err('fail').unwrapOr(42) // 42
   * Result.ok(99).unwrapOr(42) // 99
   *
   * @example
   * // Providing default value in operation
   * const age = getAge().unwrapOr(18)
   */
  unwrapOr(defaultValue: T): T {
    return defaultValue
  }

  /**
   * Extracts value or computes default from error.
   *
   * Allows generating fallback value based on specific error.
   *
   * @group Recovery
   * @see {@link unwrapOr} for static default
   * @param {(error: E) => T} onError - Default value generator
   * @returns {T} Value computed from error
   *
   * @example
   * Result.err('not found').unwrapOrElse(e => {
   *   console.log('Error:', e)
   *   return 0
   * })
   * // logs "Error: not found", returns 0
   *
   * @example
   * // Recovery based on error type
   * result.unwrapOrElse(error => {
   *   if (error.code === 404) return []
   *   if (error.code === 500) throw error
   *   return defaultValue
   * })
   */
  unwrapOrElse(onError: (error: E) => T): T {
    return onError(this.#error)
  }

  // #endregion

  // #region TRANSFORMATION

  /**
   * Transforms the success value (not applicable for Err).
   *
   * For Err, keeps the error and only adjusts value type.
   *
   * @group Transformation
   * @see {@link mapAsync} for async version
   * @see {@link mapOr} for default value
   * @see {@link mapErr} to transform the error part (not the value)
   * @see {@link andThen} for explicit chaining
   * @template U - Transformed value type
   * @param {(value: T) => U} _mapper - Transformation (ignored)
   * @returns {Result<U, E>} Err with same error, different value type
   *
   * @example
   * Result.err('fail').map(x => x * 2)
   * // Err("fail")
   *
   * @example
   * // Chaining maps on error
   * Result.err('fail').map(x => x * 2).map(x => x + 1)
   * // Err("fail")
   */
  map<U>(_mapper: (value: T) => U): Result<U, E> {
    return this as unknown as Result<U, E>
  }

  /**
   * Transforms value or returns default.
   *
   * For Err, ignores mapper and returns default.
   *
   * @group Transformation
   * @see {@link mapOrAsync} for async version
   * @see {@link mapOrElse} for computed default
   * @template U - Transformed value type
   * @param {(value: T) => U} _mapper - Transformation (ignored)
   * @param {U} defaultValue - Default value
   * @returns {U} The default value
   *
   * @example
   * Result.err('fail').mapOr(x => x * 2, 42) // 42
   * Result.ok(5).mapOr(x => x * 2, 42) // 10
   */
  mapOr<U>(_mapper: (value: T) => U, defaultValue: U): U {
    return defaultValue
  }

  /**
   * Transforms value using appropriate mapper.
   *
   * For Err, uses error mapper.
   *
   * @group Transformation
   * @see {@link mapOrElseAsync} for async version
   * @template U - Result type
   * @param {(value: T) => U} _okMapper - Success mapper (ignored)
   * @param {(error: E) => U} errorMapper - Error mapper
   * @returns {U} Result from error mapper
   *
   * @example
   * Result.err('fail').mapOrElse(
   *   x => x * 2,
   *   e => -1
   * )
   * // -1
   *
   * @example
   * // Converting error to valid value
   * const value = result.mapOrElse(
   *   user => user.name,
   *   error => 'Anonymous'
   * )
   */
  mapOrElse<U>(_okMapper: (value: T) => U, errorMapper: (error: E) => U): U {
    return errorMapper(this.#error)
  }

  /**
   * Transforms the error.
   *
   * Applies function to error and returns new Err with result.
   * Useful for normalizing or enriching errors.
   *
   * @group Transformation
   * @see {@link mapErrAsync} for async version
   * @template E2 - New error type
   * @param {(error: E) => E2} mapper - Error transformer
   * @returns {Result<T, E2>} Err with transformed error
   *
   * @example
   * Result.err('not found')
   *   .mapErr(e => new Error(e))
   * // Err(Error: not found)
   *
   * @example
   * // Normalizing error types
   * result.mapErr(error => ({
   *   code: error.code || 'UNKNOWN',
   *   message: error.message,
   *   timestamp: Date.now()
   * }))
   */
  mapErr<E2>(mapper: (error: E) => E2): Result<T, E2> {
    return new Err(mapper(this.#error))
  }

  /**
   * Filters Ok value based on predicate (not applicable for Err).
   *
   * @overload
   * @group Transformation
   * @see {@link isErrAnd} for validation
   * @param predicate - Validation function (ignored)
   * @returns This Err unchanged
   *
   * @example
   * Result.err('fail').filter(x => x > 0)
   * // Err("fail")
   */
  filter(predicate: (value: T) => boolean): Result<T, Error>

  /**
   * Filters Ok value with custom error (not applicable for Err).
   *
   * @overload
   * @group Transformation
   * @see {@link isErrAnd} for validation
   * @param {(value: T) => boolean} predicate - Validation (ignored)
   * @param {(value: T) => E} onReject - Error generator (ignored)
   * @returns {Result<T, E>} This Err unchanged
   *
   * @example
   * Result.err('fail').filter(
   *   x => x > 0,
   *   x => new Error('negative')
   * )
   * // Err("fail")
   */
  filter(predicate: (value: T) => boolean, onReject: (value: T) => E): Result<T, E>

  filter(
    _predicate: (value: T) => boolean,
    _onReject?: (value: T) => E | Error,
  ): Result<T, E | Error> {
    return this
  }

  /**
   * Flattens nested Result (not applicable for Err).
   *
   * @group Transformation
   * @template U - Inner Result value type
   * @template E2 - Inner Result error type
   * @param {Err<Result<U, E2>, E>} this - Nested Result
   * @returns {Result<U, E | E2>} Flattened Err
   *
   * @example
   * Result.err('fail').flatten()
   * // Err("fail")
   */
  flatten<U, E2>(this: Err<Result<U, E2>, E>): Result<U, E | E2> {
    return this as unknown as Result<U, E | E2>
  }

  // #endregion

  // #region CHAINING

  /**
   * Chains operation that returns Result (not applicable for Err).
   *
   * For Err, keeps the error ignoring the function.
   *
   * @group Chaining
   * @see {@link andThenAsync} for async version
   * @template U - New success type
   * @param {(value: T) => Result<U, E>} _flatMapper - Chaining (ignored)
   * @returns {Result<U, E>} Err with same error
   *
   * @example
   * Result.err('fail').andThen(x => Result.ok(x * 2))
   * // Err("fail")
   *
   * Result.err('fail').andThen(x => Result.err('backup'))
   * // Err("fail") - keeps original error
   */
  andThen<U>(_flatMapper: (value: T) => Result<U, E>): Result<U, E> {
    return this as unknown as Result<U, E>
  }

  /**
   * Returns this Result or executes error recovery.
   *
   * For Err, executes recovery function with the error.
   * Allows converting Err to Ok or generating new Err.
   *
   * @group Chaining
   * @see {@link orElseAsync} for async version
   * @see {@link or} for static alternative
   * @param {(error: E) => Result<T, E>} onError - Recovery function
   * @returns {Result<T, E>} Result returned by recovery
   *
   * @example
   * Result.err('not found').orElse(e => Result.ok(null))
   * // Ok(null) - recovered
   *
   * Result.err('fail').orElse(e => Result.err('backup'))
   * // Err("backup") - error replaced
   *
   * @example
   * // Fallback chain
   * fetchFromCache()
   *   .orElse(() => fetchFromDatabase())
   *   .orElse(() => fetchFromAPI())
   */
  orElse(onError: (error: E) => Result<T, E>): Result<T, E> {
    return onError(this.#error)
  }

  /**
   * Returns second Result if this is Ok (not applicable for Err).
   *
   * @group Chaining
   * @see {@link andAsync} for async version
   * @see {@link andThen} for explicit chaining
   * @template U - Second Result success type
   * @param {Result<U, E>} _result - Result (ignored)
   * @returns {Result<U, E>} Err with same error
   *
   * @example
   * Result.err('fail').and(Result.ok(42))
   * // Err("fail")
   */
  and<U>(_result: Result<U, E>): Result<U, E> {
    if (!isResult(_result)) {
      throw new Error('and() called on Err that does not contain a Result')
    }

    return this as unknown as Result<U, E>
  }

  /**
   * Returns this Result or alternative.
   *
   * For Err, returns the provided alternative Result.
   *
   * @group Chaining
   * @see {@link orAsync} for async version
   * @see {@link orElse} for function-based alternative
   * @param {Result<T, E>} result - Alternative Result
   * @returns {Result<T, E>} The alternative Result
   *
   * @example
   * Result.err('fail').or(Result.ok(42))
   * // Ok(42)
   *
   * Result.err('fail').or(Result.err('backup'))
   * // Err("backup")
   */
  or(result: Result<T, E>): Result<T, E> {
    if (!isResult(result)) {
      throw new Error('or() called on Err that does not contain a Result')
    }

    return result
  }

  /**
   * Combines two Results into tuple (fails if any is Err).
   *
   * @group Chaining
   * @see {@link and} for chaining and discarding the first Ok value.
   * @template U - Second Result success type
   * @template E2 - Second Result error type
   * @param {Result<U, E2>} _result - Result to combine (ignored)
   * @returns {Result<[T, U], E | E2>} Err with this error
   *
   * @example
   * Result.err('fail').zip(Result.ok(2))
   * // Err("fail")
   */
  zip<U, E2>(_result: Result<U, E2>): Result<[T, U], E | E2> {
    if (!isResult(_result)) {
      throw new Error('zip() called on Err that does not contain a Result')
    }

    return this as unknown as Result<[T, U], E | E2>
  }

  // #endregion

  // #region INSPECTION

  /**
   * Pattern matching on Result state.
   *
   * Executes error handler for Err.
   *
   * @group Inspection
   * @template L - Ok handler return type
   * @template R - Err handler return type
   * @param {{ ok: (value: T) => L; err: (error: E) => R }} handlers - Handlers
   * @returns {L | R} Result from error handler
   *
   * @example
   * const msg = Result.err('not found').match({
   *   ok: x => `Value: ${x}`,
   *   err: e => `Error: ${e}`
   * })
   * // "Error: not found"
   *
   * @example
   * // Specific handling by error type
   * result.match({
   *   ok: data => processData(data),
   *   err: error => {
   *     if (error.code === 404) return showNotFound()
   *     if (error.code === 500) return showServerError()
   *     return showGenericError()
   *   }
   * })
   */
  match<L, R>(handlers: { ok: (value: T) => L; err: (error: E) => R }): L | R {
    return handlers.err(this.#error)
  }

  /**
   * Performs side effect on success value (not applicable for Err).
   *
   * @group Inspection
   * @see {@link inspectErr} for error inspection
   * @see {@link match} for pattern matching
   * @param {(value: T) => void} _visitor - Side effect (ignored)
   * @returns {Result<T, E>} This Err unchanged
   *
   * @example
   * Result.err('fail').inspect(x => console.log(x))
   * // Err("fail") - nothing is executed
   */
  inspect(_visitor: (value: T) => void): Result<T, E> {
    return this
  }

  /**
   * Performs side effect on error.
   *
   * Useful for logging, metrics, or error debugging.
   *
   * @group Inspection
   * @see {@link inspect} for value inspection
   * @param {(error: E) => void} visitor - Side effect function
   * @returns {Result<T, E>} This instance for chaining
   *
   * @example
   * Result.err('fail')
   *   .inspectErr(e => console.error('Error:', e))
   *   .mapErr(e => new Error(e))
   * // logs "Error: fail", returns Err(Error: fail)
   *
   * @example
   * // Logging and monitoring
   * fetchUser(id)
   *   .inspectErr(error => {
   *     logger.error('Failed to fetch user', { userId: id, error })
   *     metrics.increment('user.fetch.error')
   *   })
   */
  inspectErr(visitor: (error: E) => void): Result<T, E> {
    visitor(this.#error)

    return this
  }

  // #endregion

  // #region COMPARISON

  /**
   * Checks if Ok contains specific value (always false for Err).
   *
   * @group Comparison
   * @param {T} _value - Value to compare (ignored)
   * @param {(actual: T, expected: T) => boolean} [_comparator] - Comparator (ignored)
   * @returns {boolean} Always false
   *
   * @example
   * Result.err('fail').contains(42) // false
   */
  contains(_value: T, _comparator?: (actual: T, expected: T) => boolean): boolean {
    return false
  }

  /**
   * Checks if Err contains specific error.
   *
   * Uses strict equality (===) by default.
   * Custom comparator allows checking complex objects.
   *
   * @group Comparison
   * @param {E} error - Error to compare
   * @param {(actual: E, expected: E) => boolean} [comparator] - Custom comparator
   * @returns {boolean} true if errors match
   *
   * @example
   * Result.err('fail').containsErr('fail') // true
   * Result.err('fail').containsErr('other') // false
   *
   * @example
   * // With objects (different references)
   * Result.err({ code: 500 }).containsErr({ code: 500 })
   * // false
   *
   * @example
   * // With custom comparator
   * Result.err({ code: 500 }).containsErr(
   *   { code: 500 },
   *   (a, b) => a.code === b.code
   * )
   * // true
   */
  containsErr(error: E, comparator?: (actual: E, expected: E) => boolean): boolean {
    return comparator ? comparator(this.#error, error) : this.#error === error
  }

  // #endregion

  // #region CONVERSION

  /**
   * Converts Result to rejected Promise.
   *
   * @group Conversion
   * @returns {Promise<never>} Promise rejecting with the error
   *
   * @example
   * try {
   *   await Result.err('fail').toPromise()
   * } catch (e) {
   *   console.log(e) // "fail"
   * }
   *
   * @example
   * // Integrating with Promise-based code
   * Result.err('fail')
   *   .toPromise()
   *   .catch(err => console.error(err))
   */
  toPromise(): Promise<never> {
    return Promise.reject(this.#error)
  }

  /**
   * Converts Result to string representation.
   *
   * @group Conversion
   * @returns {string} Format "Err(error)"
   *
   * @example
   * Result.err('fail').toString()
   * // "Err(fail)"
   *
   * Result.err(new Error('oops')).toString()
   * // "Err(Error: oops)"
   */
  toString(): string {
    return `Err(${valueToDisplayString(this.#error)})`
  }

  /**
   * Converts Result to JSON object.
   *
   * Useful for serialization and APIs.
   *
   * @group Conversion
   * @returns {{ type: 'err'; error: E }} JSON representation
   *
   * @example
   * Result.err('fail').toJSON()
   * // { type: 'err', error: 'fail' }
   *
   * JSON.stringify(Result.err('fail'))
   * // '{"type":"err","error":"fail"}'
   */
  toJSON(): { type: 'err'; error: E } {
    return { type: 'err', error: this.#error }
  }

  // #endregion

  // #region ASYNC OPERATIONS

  /**
   * Transforms value asynchronously (not applicable for Err).
   *
   * For Err, keeps the error unchanged and only adjusts value type.
   *
   * @group Async Operations
   * @template U - Transformed value type
   * @param {(value: T) => Promise<U>} _mapperAsync - Async Transformation (ignored)
   * @returns {AsyncResult<U, E>} Promise of Err with same error
   *
   * @example
   * await Result.err('fail').mapAsync(async x => x * 2)
   * // Err("fail")
   */
  async mapAsync<U>(_mapperAsync: (value: T) => Promise<U>): AsyncResult<U, E> {
    return this as unknown as Result<U, E>
  }

  /**
   * Transforms error asynchronously.
   *
   * Async version of mapErr().
   *
   * @group Async Operations
   * @template E2 - New error type
   * @param {(error: E) => Promise<E2>} mapperAsync - Async transformation
   * @returns {Promise<Err<T, E2>>} Promise of Err with transformed error
   *
   * @example
   * await Result.err('fail').mapErrAsync(
   *   async e => new Error(e)
   * )
   * // Err(Error: fail)
   *
   * @example
   * // Enriching error with async data
   * await result.mapErrAsync(async error => ({
   *   ...error,
   *   context: await fetchContext(),
   *   timestamp: Date.now()
   * }))
   */
  async mapErrAsync<E2>(mapperAsync: (error: E) => Promise<E2>): AsyncResult<T, E2> {
    return new Err(await mapperAsync(this.#error))
  }

  /**
   * Transforms value asynchronously or returns default.
   *
   * @group Async Operations
   * @template U - Transformed value type
   * @param {(value: T) => Promise<U>} _mapperAsync - Transformation (ignored)
   * @param {U} defaultValue - Default value
   * @returns {Promise<U>} Promise of default value
   *
   * @example
   * await Result.err('fail').mapOrAsync(async x => x * 2, 0)
   * // 0
   */
  mapOrAsync<U>(_mapperAsync: (value: T) => Promise<U>, defaultValue: U): Promise<U> {
    return Promise.resolve(defaultValue)
  }

  /**
   * Transforms using appropriate async mapper.
   *
   * @group Async Operations
   * @template U - Result type
   * @param {(value: T) => Promise<U>} _okAsync - Success mapper (ignored)
   * @param {(error: E) => Promise<U>} errAsync - Async error mapper
   * @returns {Promise<U>} Promise of result from error mapper
   *
   * @example
   * await Result.err('fail').mapOrElseAsync(
   *   async x => x * 2,
   *   async e => -1
   * )
   * // -1
   */
  mapOrElseAsync<U>(
    _okAsync: (value: T) => Promise<U>,
    errAsync: (error: E) => Promise<U>,
  ): Promise<U> {
    return errAsync(this.#error)
  }

  /**
   * Chains async operation that returns Result (not applicable for Err).
   *
   * @group Async Operations
   * @template U - New success type
   * @param {(value: T) => AsyncResult<U, E>} _mapAsync - Chaining (ignored)
   * @returns {AsyncResult<U, E>} Promise of Err with same error
   *
   * @example
   * await Result.err('fail').andThenAsync(
   *   async x => Result.ok(x * 2)
   * )
   * // Err("fail")
   */
  andThenAsync<U>(_mapAsync: (value: T) => AsyncResult<U, E>): AsyncResult<U, E> {
    return Promise.resolve(this as unknown as Result<U, E>)
  }

  /**
   * Returns async Result if this is Ok (not applicable for Err).
   *
   * @group Async Operations
   * @template U - Second Result success type
   * @param {AsyncResult<U, E>} _result - Async Result (ignored)
   * @returns {AsyncResult<U, E>} Promise of Err with same error
   *
   * @example
   * await Result.err('fail').andAsync(
   *   Promise.resolve(Result.ok(42))
   * )
   * // Err("fail")
   */
  andAsync<U>(_result: AsyncResult<U, E>): AsyncResult<U, E> {
    return Promise.resolve(this as unknown as Result<U, E>)
  }

  /**
   * Returns this Result or async alternative.
   *
   * For Err, returns the alternative Promise.
   *
   * @group Async Operations
   * @param {AsyncResult<T, E>} result - Async alternative Result
   * @returns {AsyncResult<T, E>} The provided Promise
   *
   * @example
   * await Result.err('fail').orAsync(
   *   Promise.resolve(Result.ok(42))
   * )
   * // Ok(42)
   */
  orAsync(result: AsyncResult<T, E>): AsyncResult<T, E> {
    return result
  }

  /**
   * Returns this Result or executes async recovery.
   *
   * For Err, executes async recovery function.
   *
   * @group Async Operations
   * @param {(error: E) => AsyncResult<T, E>} onErrorAsync - Async recovery
   * @returns {AsyncResult<T, E>} Promise of recovered Result
   *
   * @example
   * await Result.err('not found').orElseAsync(
   *   async e => Result.ok(await fetchDefault())
   * )
   *
   * @example
   * // Async fallback chain
   * await result
   *   .orElseAsync(async () => fetchFromCache())
   *   .then(r => r.orElseAsync(async () => fetchFromAPI()))
   */
  orElseAsync(onErrorAsync: (error: E) => AsyncResult<T, E>): AsyncResult<T, E> {
    return onErrorAsync(this.#error)
  }

  // #endregion
}
