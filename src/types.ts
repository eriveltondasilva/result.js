// #region INFERENCE

/**
 * Extracts the success value type (T) from a Result.
 * Returns never if the input is not a Result.
 *
 * @internal
 */
export type InferOk<R> = R extends Result<infer T, unknown> ? T : never

/**
 * Extracts the error type (E) from a Result.
 * Returns never if the input is not a Result.
 *
 * @internal
 */
export type InferErr<R> = R extends Result<unknown, infer E> ? E : never

// #endregion

// #region TUPLES

/**
 * Infers a tuple of success types from an array of Results.
 *
 * @internal
 */
export type OkTuple<T extends readonly Result<unknown, unknown>[]> = {
  readonly [K in keyof T]: InferOk<T[K]>
}

/**
 * Infers a tuple of error types from an array of Results.
 *
 * @internal
 */
export type ErrTuple<T extends readonly Result<unknown, unknown>[]> = {
  readonly [K in keyof T]: InferErr<T[K]>
}

// #endregion

// #region UNION

/**
 * Infers a union of all possible success types from an array of Results.
 *
 * @internal
 */
export type OkUnion<T extends readonly Result<unknown, unknown>[]> = InferOk<T[number]>

/**
 * Infers a union of all possible error types from an array of Results.
 *
 * @internal
 */
export type ErrUnion<T extends readonly Result<unknown, unknown>[]> = InferErr<T[number]>

// #endregion

// #region SETTLED

/**
 * Represents a successful outcome in a settled result structure (e.g., from Result.allSettled).
 *
 * @internal
 */
export type SettledOk<T> = { status: 'ok'; value: T }

/**
 * Represents a failed outcome in a settled result structure (e.g., from Result.allSettled).
 *
 * @internal
 */
export type SettledErr<E> = { status: 'err'; reason: E }

/**
 * Represents a final outcome of a Result operation, whether success or failure.
 *
 * @internal
 */
export type SettledResult<T, E> = SettledOk<T> | SettledErr<E>

// #endregion

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
   * @see {@link isErr} for the opposite check
   *
   * @returns {boolean}
   *
   * @example
   * Result.ok(42).isOk()         // true
   * Result.err('failed').isOk()  // false
   */
  isOk(): this is Ok<T, E>

  /**
   * Checks if this Result is the Err variant.
   *
   * @group Type Guards
   *
   * @see {@link isOk} for the opposite check
   *
   * @returns {boolean}
   *
   * @example
   * Result.err('failed').isErr()  // true
   * Result.ok(42).isErr()         // false
   */
  isErr(): this is Err<T, E>

  /**
   * Checks if it's Ok and if the value satisfies a predicate.
   * Useful for conditional validations in chains.
   *
   * @group Type Guards
   *
   * @see {@link isErrAnd} for the opposite check
   *
   * @param {(value: T) => boolean} predicate - Validation function
   * @returns {boolean} true if Ok and predicate passes
   *
   * @example
   * Result.ok(42).isOkAnd((x) => x > 40)  // true
   * Result.ok(42).isOkAnd((x) => x < 40)  // false
   * Result.err('fail').isOkAnd(() => true) // false
   */
  isOkAnd(predicate: (value: T) => boolean): this is Ok<T, E>

  /**
   * Checks if it's Err and if the error satisfies a predicate.
   *
   * @group Type Guards
   *
   * @see {@link isOkAnd} for the opposite check
   *
   * @param {(error: E) => boolean} predicate - Validation function
   * @returns {boolean} Always false for Ok
   *
   * @example
   * Result.ok(42).isErrAnd(() => true)  // false
   * Result.err('fail').isErrAnd(() => true) // true
   */
  isErrAnd(predicate: (error: E) => boolean): this is Err<T, E>

  // #endregion

  // #region Extraction

  /**
   * Extracts the success value.
   *
   * @group Extraction
   *
   * @see {@link unwrapErr} for Err variant
   * @see {@link unwrapOr} for default value
   *
   * @returns {T} The encapsulated value
   * @throws {Error} Always throws error with original cause
   *
   * @example
   * Result.ok(42).unwrap()  // 42
   *
   * // Usage after checking
   * if (result.isOk()) {
   *   result.unwrap() // safe
   * }
   *
   * // Usage with error
   * Result.err(new Error('fail')).unwrap()
   * // throws Error("Called unwrap on an Err value", {
   * //   cause: Error("fail")
   * // })
   */
  unwrap(): T

  /**
   * Extracts the error.
   *
   * @group Extraction
   *
   * @returns {E} The encapsulated error
   * @throws {Error} Always throws error indicating incorrect usage
   *
   * @example
   * Result.ok(42).unwrapErr()
   * // throws Error("Called unwrapErr on an Ok value: 42")
   *
   * Result.err('failed').unwrapErr()
   * // "failed"
   *
   * // Usage after checking
   * if (result.isErr()) {
   *   const error = result.unwrapErr() // safe
   *   console.error('Operation failed:', error)
   * }
   */
  unwrapErr(): E

  /**
   * Extracts value or returns default.
   *
   * @group Extraction
   *
   * @see {@link unwrap} for Ok variant
   * @see {@link unwrapOrElse} for computed default
   *
   * @param {T} defaultValue - Default value
   * @returns {T} The encapsulated value
   *
   * @example
   * Result.ok(42).unwrapOr(0)         // 42
   * Result.err('failed').unwrapOr(0)  // 0
   */
  unwrapOr(defaultValue: T): T

  /**
   * Extracts value or computes default from error.
   *
   * @group Extraction
   *
   * @see {@link unwrapOr} for static default
   *
   * @param {(error: E) => T} onError - Default value generator
   * @returns {T} The encapsulated value
   *
   * @example
   * Result.ok(42).unwrapOrElse((e) => 0)         // 42
   * Result.err('failed').unwrapOrElse((e) => 0)  // 0
   */
  unwrapOrElse(onError: (error: E) => T): T

  /**
   * Extracts value with custom error message (for Err).
   *
   * @group Extraction
   *
   * @see {@link expectErr} for Err variant
   *
   * @param {string} message - Error message (ignored for Ok)
   * @returns {T} The encapsulated value
   * @throws {Error} Throws with custom message and original error as cause
   *
   * @example
   * Result.ok(42).expect('should exist')  // 42
   * Result.err('failed').expect('should exist')
   * // throws Error("should exist: failed")
   */
  expect(message: string): T

  /**
   * Extracts error with custom message.
   *
   * @group Extraction
   *
   * @param {string} message - Error message
   * @throws {Error} Always throws with provided message
   *
   * @example
   * Result.ok(42).expectErr('should be error')
   * // throws Error("should be error: 42")
   *
   * Result.err('fail').expectErr('should be error')
   * // "fail"
   */
  expectErr(message: string): E

  // #endregion

  // #region Transformation

  /**
   * Transforms the success value.
   *
   * @group Transformation
   *
   * @see {@link mapAsync} for async version
   * @see {@link mapOr} for default value
   * @see {@link mapErr} to transform the error part (not the value)
   * @see {@link andThen} for automatic flattening of Result returns
   *
   * @template U - Transformed value type
   * @param {(value: T) => U} mapper - Transformation function
   * @returns {IResult<U, E>} Transformed Ok or the original Err
   *
   * @example
   * // Simple transformation
   * Result.ok(42).map((x) => x * 2)  // Ok(84)
   * Result.ok('42').map((s) => parseInt(s, 10)).map((n) => n * 2)
   * // Ok(84)
   *
   *  Result.err('fail').map((x) => x * 2)
   * // Err("fail")
   * Result.err('fail').map((x) => x * 2).map((x) => x + 1)
   * // Err("fail")
   */
  map<U>(mapper: (value: T) => U): Result<U, E>

  /**
   * Transforms value or returns default.
   *
   * @group Transformation
   *
   * @see {@link mapOrAsync} for async version
   * @see {@link mapOrElse} for computed default
   *
   * @template U - Transformed value type
   * @param {(value: T) => U} mapper - Transformation function
   * @param {U} defaultValue - Default value (ignored for Ok)
   * @returns {U} Transformed value
   *
   * @example
   * Result.ok(42).mapOr((x) => x * 2, 0)         // 84
   * Result.err('failed').mapOr((x) => x * 2, 0)  // 0
   */
  mapOr<U>(mapper: (value: T) => U, defaultValue: U): U

  /**
   * Transforms value using appropriate mapper.
   *
   * @group Transformation
   *
   * @see {@link mapOrElseAsync} for async version
   *
   * @template U - Result type
   * @param {(value: T) => U} okMapper - Success mapper
   * @param {(error: E) => U} errorMapper - Error mapper
   * @returns {U} Transformed value
   *
   * @example
   * Result.ok(42).mapOrElse((x) => x * 2, (e) => -1)  // 84
   * Result.err('fail').mapOrElse(
   *   (x) => x * 2,
   *   (e) => -1
   * )
   * // -1
   */
  mapOrElse<U>(okMapper: (value: T) => U, errorMapper: (error: E) => U): U

  /**
   * Transforms the error (not applicable for Ok).
   *
   * @group Transformation
   *
   * @see {@link mapErrAsync} for async version
   *
   * @template E2 - New error type
   * @param {(error: E) => E2} mapper - Error transformer
   * @returns {IResult<T, E2>} Result with same value, different error type
   *
   * @example
   * Result.ok(42).mapErr((e) => new Error(e))
   * // Ok(42)
   *
   * Result.err('not found').mapErr((e) => new Error(e))
   * // Err(Error: not found)
   */
  mapErr<E2>(mapper: (error: E) => E2): Result<T, E2>

  /**
   * Filters Ok value based on predicate.
   *
   * @group Transformation
   *
   * @see {@link isOkAnd} for validation without modification
   * @see {@link isErrAnd} for validation
   *
   * @param predicate - Validation function
   * @returns Ok if passes, Err with default error if fails
   *
   * @example
   * Result.ok(42).filter((x) => x > 40)  // Ok(42)
   * Result.ok(42).filter((x) => x < 40)
   * // Err(Error: Filter predicate failed for value: 42)
   *
   * Result.err('fail').filter((x) => x > 0)
   * // Err("fail")
   */
  filter(predicate: (value: T) => boolean): Result<T, Error>
  filter(predicate: (value: T) => boolean, onReject: (value: T) => E): Result<T, E>

  /**
   * Flattens nested Result.
   *
   * @group Transformation
   *
   * @template U - Inner Result value type
   * @template E2 - Inner Result error type
   * @param {IResult<IResult<U, E2>, E>} this - Nested Result
   * @returns {IResult<U, E | E2>} Result with same value, different error type
   *
   * @example
   * Result.ok(Result.ok(42)).flatten()
   * // Ok(42)
   *
   * Result.ok(Result.err('fail')).flatten()
   * // Err("fail")
   */
  flatten<U, E2>(this: Result<Result<U, E2>, E>): Result<U, E | E2>

  // #endregion

  // #region Alternation

  /**
   * Returns second Result if this is Ok.
   *
   * @group Alternation
   *
   * @see {@link andAsync} for async version
   * @see {@link andThen} for function-based chaining
   *
   * @template U - Second Result success type
   * @param {IResult<U, E>} result - Result to return
   * @returns {IResult<U, E>} The provided Result
   *
   * @example
   * Result.ok(1).and(Result.ok(2))
   * // Ok(2)
   *
   * Result.ok(1).and(Result.err('fail'))
   * // Err("fail")
   *
   * Result.err('fail').and(Result.ok(42))
   * // Err("fail")
   */
  and<U, E2 = E>(result: Result<U, E2>): Result<U, E | E2>

  /**
   * Chains operation that returns Result.
   *
   * @group Alternation
   *
   * @see {@link andThenAsync} for async version
   * @see {@link map} for alternative with auto-flatten
   *
   * @template U - New success type
   * @param {(value: T) => IResult<U, E>} flatMapper - Chaining function
   * @returns {IResult<U, E>} Result returned by flatMapper
   *
   * @example
   * Result.ok(5).andThen((x) => Result.ok(x * 2))
   * // Ok(10)
   * Result.ok(5).andThen((x) => Result.err('failure'))
   * // Err("failure")
   *
   * Result.err('fail').andThen((x) => Result.ok(x * 2))
   * // Err("fail")
   * Result.err('fail').andThen((x) => Result.err('backup'))
   * // Err("fail") - keeps original error
   */
  andThen<U, E2 = E>(flatMapper: (value: T) => Result<U, E2>): Result<U, E | E2>

  /**
   * Returns this Result or alternative.
   *
   * @group Alternation
   *
   * @see {@link orAsync} for async version
   * @see {@link orElse} for function-based alternative
   *
   * @param {IResult<T, E>} result - Alternative Result
   * @returns {IResult<T, E>} This Ok instance
   *
   * @example
   * Result.ok(1).or(Result.ok(2))
   * // Ok(1)
   * Result.ok(1).or(Result.err('fail'))
   * // Ok(1)
   *
   * Result.err('fail').or(Result.ok(42))
   * // Ok(42)
   * Result.err('fail').or(Result.err('backup'))
   * // Err("backup")
   */
  or<E2 = E>(result: Result<T, E2>): Result<T, E2>

  /**
   * Returns this Result or executes error recovery.
   *
   * @group Alternation
   *
   * @see {@link orElseAsync} for async version
   * @see {@link or} for static alternative
   *
   * @param {(error: E) => IResult<T, E>} onError - Recovery
   * @returns {Ok<T, E>} This Ok instance
   *
   * @example
   * Result.ok(42).orElse((e) => Result.ok(0))
   * // Ok(42)
   *
   * Result.err('not found').orElse((e) => Result.ok(null))
   * // Ok(null) - recovered
   * Result.err('fail').orElse((e) => Result.err('backup'))
   * // Err("backup")
   *
   */
  orElse<E2 = E>(onError: (error: E) => Result<T, E2>): Result<T, E2>

  // #endregion

  // #region Combination

  /**
   * Combines two Results into tuple.
   *
   * @group Combination
   *
   * @see {@link and} for chaining and discarding the first Ok value.
   *
   * @template U - Second Result success type
   * @template E2 - Second Result error type
   *
   * @param {IResult<U, E2>} result - Result to combine
   * @returns {IResult<[T, U], E | E2>} Ok with tuple or first Err
   *
   * @example
   * Result.ok(1).zip(Result.ok(2))
   * // Ok([1, 2])
   * Result.ok(1).zip(Result.err('fail'))
   * // Err("fail")
   *
   * Result.err('fail').zip(Result.ok(2))
   * // Err("fail")
   */
  zip<U, E2>(result: Result<U, E2>): Result<[T, U], E | E2>

  // #endregion

  // #region Inspection

  /**
   * Checks if Ok contains specific value.
   *
   * @group Inspection
   *
   * @param {T} value - Value to compare
   * @param {(actual: T, expected: T) => boolean} [comparator] - Custom comparator
   * @returns {boolean} true if values match
   *
   * @example
   * Result.ok(42).contains(42) // true
   * Result.ok(42).contains(99) // false
   *
   * Result.err('fail').contains(42) // false
   *
   * // With objects (needs comparator)
   * Result.ok({ id: 1 }).contains({ id: 1 }, (a, b) => a.id === b.id)
   * // true
   */
  contains(value: T, comparator?: (actual: T, expected: T) => boolean): boolean

  /**
   * Checks if Err contains specific error.
   *
   * @group Inspection
   *
   * @param {E} error - Error to compare
   * @param {(actual: E, expected: E) => boolean} [comparator] - Custom comparator
   * @returns {boolean}
   *
   * @example
   * Result.ok(42).containsErr('fail') // false
   * Result.err('fail').containsErr('fail') // true
   * Result.err('fail').containsErr('other') // false
   *
   * // With objects (different references)
   * Result.err({ code: 500 }).containsErr({ code: 500 })
   * // false
   *
   * // With custom comparator
   * Result.err({ code: 500 }).containsErr(
   *   { code: 500 },
   *   (a, b) => a.code === b.code
   * )
   * // true
   */
  containsErr(error: E, comparator?: (actual: E, expected: E) => boolean): boolean

  /**
   * Pattern matching on Result state.
   *
   * @group Inspection
   *
   * @template L - Ok handler return type
   * @template R - Err handler return type
   * @param {{ ok: (value: T) => L; err: (error: E) => R }} handlers - Handlers for each case
   * @returns {L | R} Result from corresponding handler
   *
   * @example
   * Result.ok(5).match({
   *   ok: (x) => `Success: ${x * 2}`,
   *   err: (e) => `Error: ${e}`
   * })
   * // "Success: 10"
   *
   * Result.err('not found').match({
   *   ok: (x) => `Value: ${x}`,
   *   err: (e) => `Error: ${e}`
   * })
   * // "Error: not found"
   *
   */
  match<L, R>(handlers: { ok: (value: T) => L; err: (error: E) => R }): L | R

  /**
   * Performs side effect on success value.
   *
   * @group Inspection
   *
   * @see {@link inspectErr} for error inspection
   * @see {@link match} for pattern matching
   *
   * @param {(value: T) => void} visitor - Side effect function
   * @returns {IResult<T, E>} This instance for chaining
   *
   * @example
   * Result.ok(42)
   *   .inspect((x) => console.log('value:', x))
   *   .map((x) => x * 2)
   * // logs "value: 42", returns Ok(84)
   *
   * Result.err('fail').inspect((x) => console.log(x))
   * // Err("fail") - nothing is executed
   */
  inspect(visitor: (value: T) => void): Result<T, E>

  /**
   * Performs side effect on error.
   *
   * @group Inspection
   *
   * @see {@link inspect} for value inspection
   *
   * @param {(error: E) => void} visitor - Side effect function
   * @returns {IResult<T, E>} This instance for chaining
   *
   * @example
   * Result.err('fail')
   *   .inspectErr((e) => console.error('Error:', e))
   *   .mapErr((e) => new Error(e))
   * // logs "Error: fail", returns Err(Error: fail)
   *
   * @example
   * // Logging and monitoring
   * fetchUser(id)
   *   .inspectErr((error) => {
   *     logger.error('Failed to fetch user', { userId: id, error })
   *     metrics.increment('user.fetch.error')
   *   })
   */
  inspectErr(visitor: (error: E) => void): Result<T, E>

  // #endregion

  // #region Async Transformation

  /**
   * Transforms value asynchronously.
   *
   * @group Async Transformation
   *
   * @see {@link map} for sync version
   *
   * @template U - Transformed value type
   * @param {(value: T) => Promise<U>} mapperAsync - Async transformation function
   * @returns {AsyncResult<U, E>} Promise of transformed Ok
   *
   * @example
   * await Result.ok(5).mapAsync(async (x) => x * 2)
   * // Ok(10)
   *
   * await Result.ok(userId).mapAsync(async (id) => {
   *   return await fetchUser(id)
   * })
   * // Ok(user)
   *
   * await Result.err('fail').mapAsync(async (x) => x * 2)
   * // Err("fail")
   */
  mapAsync<U>(mapperAsync: (value: T) => Promise<U>): AsyncResult<U, E>

  /**
   * Transforms error asynchronously.
   *
   * @group Async Transformation
   *
   * @see {@link mapErr} for sync version
   *
   * @template E2 - New error type
   * @param {(error: E) => Promise<E2>} mapperAsync - Async transformation
   * @returns {Promise<Err<T, E2>>} Promise of Err with transformed error
   *
   * @example
   * await Result.ok(5).mapErrAsync(async (e) => e + 1)
   * // Ok(5)
   *
   * await Result.err('fail').mapErrAsync(
   *   async (e) => new Error(e)
   * )
   * // Err(Error: fail)
   *
   * // Enriching error with async data
   * await result.mapErrAsync(async (error) => ({
   *   ...error,
   *   context: await fetchContext(),
   *   timestamp: Date.now()
   * }))
   */
  mapErrAsync<E2>(mapperAsync: (error: E) => Promise<E2>): AsyncResult<T, E2>

  /**
   * Transforms value asynchronously or returns default.
   *
   * @group Async Transformation
   *
   * @see {@link mapOr} for sync version
   *
   * @template U - Transformed value type
   * @param {(value: T) => Promise<U>} mapperAsync - Async transformation
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
  mapOrAsync<U>(mapperAsync: (value: T) => Promise<U>, defaultValue: U): Promise<U>

  /**
   * Transforms using appropriate async mapper.
   *
   * @group Async Transformation
   *
   * @see {@link mapOrElse} for sync version
   *
   * @template U - Result type
   * @param {(value: T) => Promise<U>} okAsync - Async success mapper
   * @param {(error: E) => Promise<U>} errAsync - Error mapper
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
    okAsync: (value: T) => Promise<U>,
    errAsync: (error: E) => Promise<U>,
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
   * @param {IAsyncResult<U, E>} result - Async Result
   * @returns {IAsyncResult<U, E>} Promise of Err with same error
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
  andAsync<U, E2 = E>(result: AsyncResult<U, E2>): AsyncResult<U, E | E2>

  /**
   * Chains async operation that returns Result.
   *
   * @group Async Alternation
   *
   * @see {@link andThen} for sync version
   *
   * @template U - New success type
   * @param {(value: T) => AsyncResult<U, E>} mapAsync - Async chaining
   * @returns {AsyncResult<U, E>} Promise of returned Result
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
  andThenAsync<U, E2 = E>(mapAsync: (value: T) => AsyncResult<U, E2>): AsyncResult<U, E | E2>

  /**
   * Returns this Result or async alternative.
   *
   * @group Async Alternation
   *
   * @see {@link or} for sync version
   *
   * @template U - New success type
   * @param {AsyncResult<T, E>} result - Async alternative
   * @returns {AsyncResult<T, E>} Promise of this instance
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
  orAsync<E2 = E>(result: AsyncResult<T, E2>): AsyncResult<T, E2>

  /**
   * Returns this Result or executes async recovery.
   *
   * @group Async Alternation
   *
   * @see {@link orElse} for sync version
   *
   * @param {(error: E) => AsyncResult<T, E>} onErrorAsync - Async recovery (ignored)
   * @returns {AsyncResult<T, E>} Promise of this instance
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
  orElseAsync<E2 = E>(onErrorAsync: (error: E) => AsyncResult<T, E2>): AsyncResult<T, E2>

  // #endregion

  // #region Conversion

  /**
   * Converts Result to string representation.
   *
   * @group Conversion
   *
   * @returns {string} Format "Ok(value)" or "Err(error)"
   *
   * @example
   * Result.ok(42).toString()
   * // "Ok(42)"
   *
   * Result.ok({ name: 'John' }).toString()
   * // "Ok([object Object])"
   *
   * Result.err('fail').toString()
   * // "Err(fail)"
   *
   * Result.err(new Error('oops')).toString()
   * // "Err(Error: oops)"
   */
  toString(): string

  /**
   * Converts the Result into a nullable value (`T | null`).
   *
   * @group Conversion
   *
   * @returns {T | null}
   *
   * @example
   * Result.ok(42).toNullable() // => 42
   * Result.err('failed').toNullable()   // => null
   */
  toNullable(): T | null

  /**
   * Converts Result to JSON object.
   *
   * @group Conversion
   *
   * @returns {{ type: 'ok'; value: T } | { type: 'err'; error: E }} JSON representation
   *
   * @example
   * Result.ok(42).toJSON()
   * // { type: 'ok', value: 42 }
   *
   * JSON.stringify(Result.ok(42))
   * // '{"type":"ok","value":42}'
   *
   * Result.err('fail').toJSON()
   * // { type: 'err', error: 'fail' }
   *
   * JSON.stringify(Result.err('fail'))
   * // '{"type":"err","error":"fail"}'
   */
  toJSON(): { type: 'ok'; value: T } | { type: 'err'; error: E }

  // #endregion
}

/**
 * Represents a successful Result containing a value.
 *
 * @remarks
 * You normally don't instantiate Ok directly. Use `Result.ok(value)`.
 *
 * @internal
 *
 * @see {@link Err}
 *
 * @template T - Success value type
 * @template E - Error type (never used in Ok, but needed for typing)
 *
 * @example
 * Result.ok(42).unwrap()  // 42
 * Result.ok(42).isOk()    // true
 */
export interface Ok<T, E = never> extends ResultMethods<T, E> {
  readonly _tag: 'Ok'
  toJSON(): { type: 'ok'; value: T }
}

/**
 * Represents an error Result containing a failure.
 *
 * @remarks
 * You normally don't instantiate Err directly. Use `Result.err(error)`.
 *
 * @internal
 *
 * @template T - Success value type (for type compatibility)
 * @template E - Error type
 *
 * @example
 * Result.err(new Error('failed')).unwrapErr()  // Error: failed
 * Result.err(new Error('failed')).isErr()      // true
 */
export interface Err<T = never, E = Error> extends ResultMethods<T, E> {
  readonly _tag: 'Err'
  toJSON(): { type: 'err'; error: E }
}

/**
 * Represents a result that can be either success (Ok) or failure (Err).
 *
 * @see {@link AsyncResult} for async version
 *
 * @template T - Success value type
 * @template E - Error type
 *
 * @example
 * function divide(a: number, b: number): Result<number, string> {
 *   if (b === 0) return Result.err('Division by zero')
 *
 *   return Result.ok(a / b)
 * }
 *
 * divide(10, 2) // => Ok(5)
 */
export type Result<T, E> = Ok<T, E> | Err<T, E>

/**
 * Represents a Promise that resolves to a Result.
 *
 * @see {@link Result}
 *
 * @template T - Success value type
 * @template E - Error type
 *
 * @example
 * async function fetchUser(id: number): AsyncResult<User, Error> {
 *   return Result.fromPromise(async () => {
 *     const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
 *     return response.json()
 *   })
 * }
 *
 * await fetchUser(1)
 * // => Ok({ id: 1, name: 'Leanne Graham', ... }) or Err(Error('...'))
 */
export type AsyncResult<T, E> = Promise<Result<T, E>>
