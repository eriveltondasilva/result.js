import type { AsyncResult, Err, Ok, Result } from '.'

/**
 * Defines the execution branches for pattern matching.
 *
 * @group Inspection
 *
 * @internal
 *
 * @template T - Success value type
 * @template E - Error type
 * @template L - Return type for the ok branch
 * @template R - Return type for the err branch
 *
 * @example
 * const handlers: MatchCases<number, string, string, string> = {
 *   ok: (val) => `Success: ${val}`,
 *   err: (err) => `Failed with: ${err}`
 * }
 */
export type MatchCases<T, E, L, R> = {
  /** Branch executed when the Result is Ok */
  ok: (value: T) => L
  /** Branch executed when the Result is Err */
  err: (error: E) => R
}

/**
 * Interface that both Ok and Err must implement.
 *
 * @internal
 *
 * @template T - Success type
 * @template E - Error type
 */
export interface ResultMethods<T, E> {
  // #region Type Guards

  /**
   * Checks if this Result is the Ok variant.
   *
   * @group Type Guards
   *
   * @see {@link isErr} - for the opposite check
   *
   * @returns {boolean} true if Ok
   *
   * @example
   * Result.ok(42).isOk()        // => true
   * Result.err('failed').isOk() // => false
   */
  isOk(): this is Ok<T, E>

  /**
   * Checks if this Result is the Err variant.
   *
   * @group Type Guards
   *
   * @see {@link isOk} - for the opposite check
   *
   * @returns {boolean} true if Err
   *
   * @example
   * Result.err('failed').isErr() // => true
   * Result.ok(42).isErr()        // => false
   */
  isErr(): this is Err<T, E>

  /**
   * Checks if the Result is Ok and the value satisfies a predicate.
   * Useful for conditional validations in functional chains.
   *
   * @group Type Guards
   *
   * @see {@link isErrAnd} - for the opposite check
   *
   * @param {(value: T) => boolean} condition - Function to test the value
   * @returns {boolean} true if Ok and predicate returns true
   *
   * @example
   * Result.ok(42).isOkAnd((x) => x > 40) // => true
   * Result.ok(10).isOkAnd((x) => x > 40) // => false
   * Result.err('fail').isOkAnd(...)      // => false
   */
  isOkAnd(condition: (value: T) => boolean): this is Ok<T, E>

  /**
   * Checks if the Result is Err and the error satisfies a predicate.
   *
   * @group Type Guards
   *
   * @see {@link isOkAnd} - for the opposite check
   *
   * @param {(error: E) => boolean} condition - Function to test the error
   * @returns {boolean} true if Err and predicate returns true
   *
   * @example
   * Result.err('timeout').isErrAnd(e => e === 'timeout') // => true
   * Result.ok(42).isErrAnd(...)                          // => false
   */
  isErrAnd(condition: (error: E) => boolean): this is Err<T, E>

  // #endregion

  // #region Extraction

  /**
   * Extracts the success value.
   *
   * @group Extraction
   *
   * @see {@link unwrapErr} - for Err variant
   * @see {@link unwrapOr} - for default value
   *
   * @returns {T} The encapsulated value
   * @throws {Error} If called on an Err instance
   *
   * @example
   * Result.ok(42).unwrap() // => 42
   * Result.err('fail').unwrap()
   * // => throws Error("Called unwrap on an Err value", { cause: "fail" })
   *
   * @example
   * // Usage after checking
   * if (result.isOk()) {
   *   result.unwrap() // safe
   * }
   */
  unwrap(): T

  /**
   * Extracts the error value.
   *
   * @group Extraction
   *
   * @see {@link unwrap} - for Ok variant
   *
   * @returns {E} The encapsulated error
   * @throws {Error} If called on an Ok instance
   *
   * @example
   * Result.err('failed').unwrapErr()
   * // => "failed"
   * Result.ok(42).unwrapErr()
   * // => throws Error("Called unwrapErr on an Ok value", { cause: 42 })
   *
   * @example
   * // Usage after checking
   * if (result.isErr()) {
   *   result.unwrapErr() // safe
   * }
   */
  unwrapErr(): E

  /**
   * Returns the success value or a default value if it's an Err.
   *
   * @group Extraction
   *
   * @see {@link unwrap} - for Ok variant
   * @see {@link unwrapOrElse} - for computed default
   *
   * @template U - Result type
   *
   * @param {T} defaultValue - Value to return if Result is Err
   * @returns {T | U}
   *
   * @example
   * Result.ok(42).unwrapOr(...)      // => 42
   * Result.err('failed').unwrapOr(0) // => 0
   */
  unwrapOr<U = T>(defaultValue: U): T | U

  /**
   * Returns the success value or computes a default from the error.
   *
   * @group Extraction
   *
   * @see {@link unwrapOr} - for static default
   *
   * @template U - Result type
   *
   * @param {(error: E) => T} fallback - Function to compute default value
   * @returns {T | U}
   *
   * @example
   * Result.ok(42).unwrapOrElse(...)                    // => 42
   * Result.err('failed').unwrapOrElse((e) => e.length) // => 6
   */
  unwrapOrElse<U = T>(fallback: (error: E) => U): T | U

  /**
   * Extracts the value with a custom error message if it's an Err.
   *
   * @group Extraction
   *
   * @see {@link unwrap} - for Ok variant
   * @see {@link expectErr} - for Err variant
   *
   * @param {string} reason - Custom message for the error
   * @returns {T} The encapsulated value
   * @throws {Error} With custom message and original error as cause
   *
   * @example
   * Result.ok(42).expect('should exist')  // => 42
   * Result.err('failed').expect('should exist')
   * // => throws Error("should exist", { cause: "failed" })
   */
  expect(reason: string): T

  /**
   * Extracts the error with a custom message if it's an Ok.
   *
   * @group Extraction
   *
   * @see {@link expect} - for Ok variant
   * @see {@link unwrapErr} - for Err variant
   *
   * @param {string} reason - Custom message for the error
   * @returns {E} The encapsulated error
   * @throws {Error} With custom message and original value as cause
   *
   * @example
   * Result.ok(42).expectErr('should be error')
   * // => throws Error("should be error", { cause: 42 })
   *
   * Result.err('fail').expectErr(...)
   * // => "fail"
   */
  expectErr(reason: string): E

  // #endregion

  // #region Transformation

  /**
   * Transforms the success value.
   *
   * @group Transformation
   *
   * @see {@link mapAsync} - for async version
   * @see {@link mapOr} - for default value
   * @see {@link mapErr} - to transform the error part (not the value)
   *
   * @template U - Transformed value type
   *
   * @param {(value: T) => U} mapper - Transformation function
   * @returns {Result<U, E>} Transformed Ok or the original Err
   *
   * @example
   * // Simple transformation
   * Result.ok(42).map((x) => x * 2) // => Ok(84)
   * Result.err('fail').map(...)     // => Err("fail")
   */
  map<U>(mapper: (value: T) => U): Result<U, E>

  /**
   * Transforms the error value.
   *
   * @group Transformation
   *
   * @see {@link mapErrAsync} - for async version
   *
   * @template E2 - New error type
   *
   * @param {(error: E) => E2} mapper - Error transformer
   * @returns {Result<T, E2>} Result with same value, different error type
   *
   * @example
   * Result.err('not found').mapErr(e => new Error(e))
   * // => Err(Error: "not found")
   * Result.ok(42).mapErr(...)
   * // => Ok(42)
   */
  mapErr<E2>(mapper: (error: E) => E2): Result<T, E2>

  /**
   * Transforms value or returns a default.
   *
   * @group Transformation
   *
   * @see {@link mapOrAsync} for async version
   * @see {@link mapOrElse} for computed default
   *
   * @template U - Transformed value type
   *
   * @param {(value: T) => U} mapper - Success transformation
   * @param {U} defaultValue - Default value if Err
   * @returns {U}
   *
   * @example
   * Result.ok(42).mapOr(x => x * 2, 0)      // => 84
   * Result.err('fail').mapOr(x => x * 2, 0) // => 0
   */
  mapOr<U>(mapper: (value: T) => U, defaultValue: U): U

  /**
   * Transforms value using appropriate mappers for both cases.
   *
   * @group Transformation
   *
   * @see {@link mapOrElseAsync} for async version
   *
   * @template U - Result type
   *
   * @param {(value: T) => U} okMapper - Mapper for Ok
   * @param {(error: E) => U} errMapper - Mapper for Err
   * @returns {U}
   *
   * @example
   * Result.ok(42).mapOrElse((x) => x * 2, (e) => -1)
   * // => 84
   * Result.err('fail').mapOrElse(
   *   (x) => x * 2,
   *   (e) => -1
   * )
   * // => -1
   */
  mapOrElse<U>(okMapper: (value: T) => U, errMapper: (error: E) => U): U

  /**
   * Filters an Ok value. If the predicate fails, returns an Err.
   *
   * @group Transformation
   *
   * @see {@link isOkAnd} - for validation without modification
   * @see {@link isErrAnd} - for validation
   *
   * @param {(value: T) => boolean} condition - Validation function
   * @param {string} [reason] - Custom error message if predicate fails
   * @returns {Result<T, Error>}
   *
   * @example
   * Result.ok(42).filter(x => x > 10)
   * // => Ok(42)
   * Result.ok(42).filter(x => x > 50, 'Too small')
   * // => Err(Error: "Too small", { cause: 42 })
   */
  filter(condition: (value: T) => boolean, reason?: string): Result<T, Error>

  /**
   * Filters an Ok value with a custom error on failure.
   *
   * @group Transformation
   *
   * @see {@link filter} for default error message
   *
   * @template E2 - New error type
   *
   * @param {(value: T) => boolean} condition - Validation function
   * @param {(value: T) => E2} onFailure - Error transformer
   * @returns {Result<T, E | E2>}
   *
   * @example
   * Result.ok(42).filterOrElse(x => x > 10, x => new Error('Too small'))
   * // => Ok(42)
   * Result.ok(42).filterOrElse(x => x > 50, x => new Error('Too small'))
   * // => Err(Error: "Too small", { cause: 42 })
   */
  filterOrElse<E2>(condition: (value: T) => boolean, onFailure: (value: T) => E2): Result<T, E | E2>

  /**
   * Flattens a nested Result.
   *
   * @group Transformation
   *
   * @template U - Inner success type
   * @template E2 - Inner error type
   *
   * @returns {Result<U, E | E2>} Flattened Result
   *
   * @example
   * Result.ok(Result.ok(42)).flatten()
   * // => Ok(42)
   * Result.ok(Result.err('fail')).flatten()
   * // => Err("fail")
   */
  flatten<U, E2>(this: Result<Result<U, E2>, E>): Result<U, E | E2>

  // #endregion

  // #region Alternation

  /**
   * Returns the provided Result if the current one is Ok.
   *
   * @group Alternation
   *
   * @see {@link andAsync} for async version
   * @see {@link andThen} for function-based chaining
   *
   * @template U - Second Result success type
   * @template E2 - Second Result error type
   *
   * @param {Result<U, E>} other - Result to return
   * @returns {Result<U, E | E2>}
   *
   * @example
   * Result.ok(1).and(Result.ok(2))
   * // => Ok(2)
   *
   * Result.ok(1).and(Result.err('fail'))
   * // => Err("fail")
   *
   * Result.err('fail').and(Result.ok(42))
   * // => Err("fail")
   */
  and<U, E2 = never>(other: Result<U, E2>): Result<U, E | E2>

  /**
   * Chains an operation that returns another Result.
   * Also known as `flatMap` or `bind`.
   *
   * @group Alternation
   *
   * @see {@link andThenAsync} - for async version
   * @see {@link map} - for transformation
   *
   * @template U - New success type
   * @template E2 - New error type
   *
   * @param {(value: T) => Result<U, E2>} next - Function that receives the success value and returns a new Result
   * @returns {Result<U, E | E2>} Result from flatMapper or original Err
   *
   * @example
   * Result.ok(5).andThen((x) => Result.ok(x * 2))
   * // => Ok(10)
   * Result.ok(5).andThen(() => Result.err('failure'))
   * // => Err("failure")
   *
   * Result.err('fail').andThen((x) => Result.ok(x * 2))
   * // => Err("fail")
   * Result.err('fail').andThen((x) => Result.err('backup'))
   * // => Err("fail")
   */
  andThen<U, E2 = never>(next: (value: T) => Result<U, E2>): Result<U, E | E2>

  /**
   * Returns this Result or an alternative if it's an Err.
   *
   * @group Alternation
   *
   * @see {@link orAsync} - for async version
   * @see {@link orElse} - for function-based chaining
   *
   * @template U - Alternative success type
   * @template E2 - Alternative error type
   *
   * @param {Result<U, E2>} other - Alternative Result
   * @returns {Result<T | U, E2>} Original Ok or the alternative
   *
   * @example
   * Result.ok(1).or(Result.ok(2))        // => Ok(1)
   * Result.err('fail').or(Result.ok(42)) // => Ok(42)
   */
  or<U = T, E2 = never>(other: Result<U, E2>): Result<T | U, E2>

  /**
   * Returns this Result or executes error recovery.
   *
   * @group Alternation
   *
   * @see {@link orElseAsync} for async version
   * @see {@link or} for static alternative
   *
   * @template U - Recovery success type
   * @template E2 - Recovery error type
   *
   * @param {(error: E) => Result<U, E2>} fallback - Recovery
   * @returns {Result<T | U, E2>}
   *
   * @example
   * Result.ok(42).orElse((e) => Result.ok(0))
   * // => Ok(42)
   * Result.err('not found').orElse((e) => Result.ok(null))
   * // => Ok(null)
   * Result.err('fail').orElse((e) => Result.err('backup'))
   * // => Err("backup")
   *
   */
  orElse<U = T, E2 = never>(fallback: (error: E) => Result<U, E2>): Result<T | U, E2>

  // #endregion

  // #region Combination

  /**
   * Combines two Results into a single Result containing a tuple of their values.
   *
   * @group Combination
   *
   * @see {@link zipWith} for function-based version
   *
   * @template U - Second success type
   * @template E2 - Second error type
   *
   * @param {Result<U, E2>} other - Result to combine
   * @returns {Result<[T, U], E | E2>}
   *
   * @example
   * Result.ok(1).zip(Result.ok('a'))  // => Ok([1, 'a'])
   * Result.ok(1).zip(Result.err('b')) // => Err('b')
   */
  zip<U, E2>(other: Result<U, E2>): Result<[T, U], E | E2>

  /**
   * Combines two Results applying a function to their values.
   *
   * @group Combination
   *
   * @see {@link zip} for tuple version
   *
   * @template U - Second Result success type
   * @template R - Mapped result type
   * @template E2 - Second Result error type
   *
   * @param {Result<U, E2>} other - Second Result
   * @param {(value: T, otherValue: U) => R} combine - Function applied to both values if Ok
   * @returns {Result<R, E | E2>} Ok with mapped value, or first Err encountered
   *
   * @example
   * Result.ok(2).zipWith(Result.ok(3), (a, b) => a + b)
   * // Ok(5)
   *
   * Result.ok('hello').zipWith(Result.ok('world'), (a, b) => `${a} ${b}`)
   * // Ok('hello world')
   *
   * Result.err('fail').zipWith(Result.ok(3), (a, b) => a + b)
   * // Err('fail')
   *
   * Result.ok(2).zipWith(Result.err('fail'), (a, b) => a + b)
   * // Err('fail')
   */
  zipWith<U, R, E2>(
    other: Result<U, E2>,
    combine: (value: T, otherValue: U) => R,
  ): Result<R, E | E2>

  // #endregion

  // #region Inspection

  /**
   * Checks if an Ok Result contains a specific value using strict equality.
   *
   * @group Inspection
   *
   * @overload
   *
   * @template U - Value type to check (must extend T)
   *
   * @param {U} value - Value to search for
   * @returns {boolean} true if Result is Ok and value matches strictly
   *
   * @example
   * Result.ok(42).contains(42)                 // => true
   * Result.ok(42).contains(99)                 // => false
   * Result.ok({ id: 42 }).contains({ id: 42 }) // => true
   * Result.err('fail').contains(42)            // => false
   */
  contains<U extends T>(value: U): boolean

  /**
   * Checks if an Ok Result contains a value using a custom comparator.
   * Useful for comparing objects or complex types.
   *
   * @group Inspection
   *
   * @overload
   *
   * @template U - Type of the expected value
   *
   * @param {U} value - Value to compare against
   * @param {(actual: T, expected: U) => boolean} comparator - Custom comparison logic
   * @returns {boolean} true if Result is Ok and comparator returns true
   *
   * @example
   * const user = { id: 1, name: 'John' }
   * Result.ok(user).contains({ id: 1 }, (a, b) => a.id === b.id)
   * // => true
   */
  contains<U>(value: U, comparator: (actual: T, expected: U) => boolean): boolean

  /**
   * Pattern matching based on the Result state.
   *
   * @group Inspection
   *
   * @see {@link inspect} for success inspection
   * @see {@link inspectErr} for error inspection
   *
   * @template L - Ok branch return type
   * @template R - Err branch return type
   *
   * @param {MatchCases<T, E, L, R>} cases - Object defining the ok and err branches
   * @returns {L | R} Value returned by the executed branch
   *
   * @example
   * Result.ok(5).match({
   *   ok: (x) => `Success: ${x * 2}`,
   *   err: (e) => `Error: ${e}`
   * })
   * // => "Success: 10"
   *
   * @example
   * Result.err('not found').match({
   *   ok: (x) => `Value: ${x}`,
   *   err: (e) => `Error: ${e}`
   * })
   * // => "Error: not found"
   *
   */
  match<L, R>(cases: MatchCases<T, E, L, R>): L | R

  /**
   * Executes a callback if the Result is Ok.
   * Useful for side effects like logging or analytics without changing the value.
   *
   * @group Inspection
   *
   * @see {@link inspectErr} for error inspection
   * @see {@link match} for pattern matching
   *
   * @param {(value: T) => void} action - Callback function
   * @returns {this} The original Result instance for chaining
   *
   * @example
   * Result.ok(42).inspect(v => console.log(v))
   * // => Prints 42, returns Ok(42)
   */
  inspect(action: (value: T) => void): this

  /**
   * Executes a callback if the Result is Err.
   *
   * @group Inspection
   *
   * @see {@link inspect} for value inspection
   *
   * @param {(error: E) => void} action - Callback function
   * @returns {this} The original Result instance for chaining
   *
   * @example
   * Result.err('fail').inspectErr(e => console.log(e))
   * // => Prints "fail", returns Err("fail")
   */
  inspectErr(action: (error: E) => void): this

  // #endregion

  // #region Async Transformation

  /**
   * Transforms the value asynchronously.
   *
   * @group Async Transformation
   *
   * @see {@link map} for sync version
   *
   * @template U - Transformed value type
   *
   * @param {(value: T) => Promise<U>} mapper - Async transformation function
   * @returns {AsyncResult<U, E>}
   *
   * @example
   * await Result.ok(1).mapAsync(async x => x + 1)
   * // => Ok(2)
   * await Result.err('fail').mapAsync(async x => x + 1)
   * // => Err('fail')
   */
  mapAsync<U>(mapper: (value: T) => Promise<U>): AsyncResult<U, E>

  /**
   * Transforms error asynchronously.
   *
   * @group Async Transformation
   *
   * @see {@link mapErr} for sync version
   *
   * @template E2 - New error type
   *
   * @param {(error: E) => Promise<E2>} mapper - Async transformation
   * @returns {AsyncResult<T, E2>} Promise of Err with transformed error
   *
   * @example
   * await Result.ok(5).mapErrAsync(async (e) => e + 1)
   * // Ok(5)
   *
   * await Result.err('fail').mapErrAsync(
   *   async (e) => new Error(e)
   * )
   * // Err(Error: "fail")
   */
  mapErrAsync<E2>(mapper: (error: E) => Promise<E2>): AsyncResult<T, E2>

  /**
   * Transforms value asynchronously or returns default.
   *
   * @group Async Transformation
   *
   * @see {@link mapOr} for sync version
   *
   * @template U - Transformed value type
   *
   * @param {(value: T) => Promise<U>} mapper - Async transformation
   * @param {U} defaultValue - Default value
   * @returns {Promise<U>} Promise of transformed value
   *
   * @example
   * await Result.ok(5).mapOrAsync(async (x) => x * 2, 0)
   * // 10
   *
   * await Result.err('fail').mapOrAsync(async (x) => x * 2, 0)
   * // 0
   */
  mapOrAsync<U>(mapper: (value: T) => Promise<U>, defaultValue: U): Promise<U>

  /**
   * Transforms using appropriate async mapper.
   *
   * @group Async Transformation
   *
   * @see {@link mapOrElse} for sync version
   *
   * @template U - Result type
   *
   * @param {(value: T) => Promise<U>} ok - Async success mapper
   * @param {(error: E) => Promise<U>} err - Error mapper
   * @returns {Promise<U>} Promise of transformed value
   *
   * @example
   * await Result.ok(5).mapOrElseAsync(
   *   async (x) => x * 2,
   *   async (e) => -1
   * )
   * // 10
   *
   * await Result.err('fail').mapOrElseAsync(
   *   async (x) => x * 2,
   *   async (e) => -1
   * )
   * // -1
   */
  mapOrElseAsync<U>(
    okMapper: (value: T) => Promise<U>,
    errMapper: (error: E) => Promise<U>,
  ): Promise<U>

  // #endregion

  // #region Async Alternation

  /**
   * Returns async Result if this is Ok.
   *
   * @group Async Alternation
   *
   * @see {@link and} for sync version
   *
   * @template U - Second Result success type
   * @template E2 - Second Result error type
   *
   * @param {AsyncResult<U, E2>} other - Async Result
   * @returns {AsyncResult<U, E | E2>} Promise of Err with same error
   *
   * @example
   * await Result.ok(5).andAsync(
   *   Promise.resolve(Result.ok(10))
   * )
   * // Ok(10)
   *
   * await Result.err('fail').andAsync(
   *   Promise.resolve(Result.ok(42))
   * )
   * // Err("fail")
   */
  andAsync<U, E2 = never>(other: AsyncResult<U, E2>): AsyncResult<U, E | E2>

  /**
   * Chains async operation that returns Result.
   *
   * @group Async Alternation
   *
   * @see {@link andThen} for sync version
   *
   * @template U - New success type
   * @template E2 - New error type
   *
   * @param {(value: T) => AsyncResult<U, E2>} next - Async chaining
   * @returns {AsyncResult<U, E | E2>} Promise of returned Result
   *
   * @example
   * await Result.ok(userId).andThenAsync(async (id) => {
   *   const user = await fetchUser(id)
   *   return user ? Result.ok(user) : Result.err('not found')
   * })
   *
   * await Result.err('fail').andThenAsync(
   *   async (x) => Result.ok(x * 2)
   * )
   * // Err("fail")
   *
   */
  andThenAsync<U, E2 = never>(next: (value: T) => AsyncResult<U, E2>): AsyncResult<U, E | E2>

  /**
   * Returns this Result or async alternative.
   *
   * @group Async Alternation
   *
   * @see {@link or} for sync version
   *
   * @template U - New success type
   * @template E2 - New error type
   *
   * @param {AsyncResult<U, E2>} other - Async alternative
   * @returns {AsyncResult<T | U, E2>} Promise of this instance
   *
   * @example
   * await Result.ok(5).orAsync(
   *   Promise.resolve(Result.ok(10))
   * )
   * // Ok(5)
   *
   * await Result.err('fail').orAsync(
   *   Promise.resolve(Result.ok(42))
   * )
   * // Ok(42)
   */
  orAsync<U = T, E2 = never>(other: AsyncResult<U, E2>): AsyncResult<T | U, E2>

  /**
   * Returns this Result or executes async recovery.
   *
   * @group Async Alternation
   *
   * @see {@link orElse} for sync version
   *
   * @template U - New success type
   * @template E2 - New error type
   *
   * @param {(error: E) => AsyncResult<U, E2>} fallback - Async recovery
   * @returns {AsyncResult<T | U, E2>} Promise of this instance
   *
   * @example
   * await Result.ok(5).orElseAsync(
   *   async (e) => Result.ok(0)
   * )
   * // Ok(5)
   *
   * await Result.err('not found').orElseAsync(
   *   async (e) => Result.ok(42)
   * )
   * // Ok(42)
   */
  orElseAsync<U = T, E2 = never>(fallback: (error: E) => AsyncResult<U, E2>): AsyncResult<T | U, E2>

  // #endregion

  // #region Conversion

  /**
   * Returns a string representation of the Result.
   *
   * @group Conversion
   *
   * @returns {string} Format "Ok(value)" or "Err(error)"
   *
   * @example
   * Result.ok(42).toString()      // => "Ok(42)"
   * Result.err('fail').toString() // => "Err("fail")"
   */
  toString(): string

  /**
   * Converts the Result to a plain JSON-serializable object.
   * Useful for sending results over network or storing in state.
   *
   * @group Conversion
   *
   * @returns {Object} JSON representation { type: 'ok' | 'err', ... }
   *
   * @example
   * Result.ok(42).toJSON() // => { type: 'ok', value: 42 }
   */
  toJSON(): { type: 'ok'; value: T } | { type: 'err'; error: E }

  /**
   * Converts the Result into a nullable value.
   *
   * @group Conversion
   *
   * @see {@link toValue} - converts to `T | undefined`
   *
   * @returns {T | null} Value if Ok, null if Err
   *
   * @example
   * Result.ok(42).toNullable()        // => 42
   * Result.err('failed').toNullable() // => null
   */
  toNullable(): T | null

  /**
   * Converts the Result into an optional value.
   *
   * @group Conversion
   *
   * @see {@link toNullable} - converts to `T | null`
   *
   * @returns {T | undefined} Value if Ok, undefined if Err
   *
   * @example
   * Result.ok(42).toValue()        // => 42
   * Result.err('failed').toValue() // => undefined
   */
  toValue(): T | undefined

  // #endregion
}
