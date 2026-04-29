import type { AsyncResult, Err, Ok, Result } from '.'

/**
 * Defines the execution branches for pattern matching.
 *
 * @see {@link ResultMethods.match} - Pattern match a result.
 *
 * @template TValue - Success value type
 * @template TError - Error value type
 * @template TOkResult - Return type of the `ok` branch
 * @template TErrResult - Return type of the `err` branch
 *
 * @example
 * const cases: MatchCases<number, string, string, string> = {
 *   ok: (val) => `Success: ${val}`,
 *   err: (err) => `Failed with: ${err}`
 * }
 */
export type MatchCases<TValue, TError, TOkResult, TErrResult> = {
  /**
   * Handles the success case.
   *
   * @see {@link ResultMethods.match} - Pattern match a result.
   *
   * @param {TValue} value - Success value
   * @returns {TOkResult} - Value returned by the `ok` branch
   */
  ok: (value: TValue) => TOkResult

  /**
   * Handles the error case.
   *
   * @see {@link ResultMethods.match}
   *
   * @param {TError} error - Error value
   * @returns {TErrResult} - Value returned by the `err` branch
   */
  err: (error: TError) => TErrResult
}

/**
 * Shared contract implemented by both {@link Ok} and {@link Err}.
 *
 * @template TValue - Success value type
 * @template TError - Error value type
 */
export interface ResultMethods<TValue, TError> {
  // #region Type Guards

  /**
   * Returns `true` when this result is the {@link Ok} variant.
   *
   * @group Type Guards
   *
   * @see {@link isErr} - Opposite check.
   *
   * @example
   * Result.ok(42).isOk()        // => true
   * Result.err('failed').isOk() // => false
   */
  isOk(): this is Ok<TValue, TError>

  /**
   * Returns `true` when this result is the {@link Err} variant.
   *
   * @group Type Guards
   *
   * @see {@link isOk} - Opposite check.
   *
   * @example
   * Result.err('failed').isErr() // => true
   * Result.ok(42).isErr()        // => false
   */
  isErr(): this is Err<TValue, TError>

  /**
   * Returns `true` when this result is {@link Ok} and its value satisfies the provided predicate.
   *
   * @group Type Guards
   *
   * @see {@link isErrAnd} - Opposite check for errors.
   *
   * @param condition - Predicate used to validate the success value.
   *
   * @example
   * Result.ok(42).isOkAnd((x) => x > 40)   // => true
   * Result.ok(10).isOkAnd((x) => x > 40)   // => false
   * Result.err('fail').isOkAnd(() => true) // => false
   */
  isOkAnd(condition: (value: TValue) => boolean): this is Ok<TValue, TError>

  /**
   * Returns `true` when this result is {@link Err} and its error satisfies the provided predicate.
   *
   * @group Type Guards
   *
   * @see {@link isOkAnd} - Opposite check for success values.
   *
   * @param condition - Predicate used to validate the error value.
   *
   * @example
   * Result.err('timeout').isErrAnd((e) => e === 'timeout') // => true
   * Result.ok(42).isErrAnd(() => true)                     // => false
   */
  isErrAnd(condition: (error: TError) => boolean): this is Err<TValue, TError>

  // #endregion

  // #region Extraction

  /**
   * Returns the contained success value.
   *
   * Throws if this result is {@link Err}.
   *
   * @group Extraction
   *
   * @see {@link unwrapErr} - Extract the error value.
   * @see {@link unwrapOr} - Return a fallback value instead.
   *
   * @throws {Error} - If called on an {@link Err} result.
   *
   * @example
   * Result.ok(42).unwrap() // => 42
   *
   * @example
   * Result.err('fail').unwrap()
   * // => throws Error("Called unwrap on an Err value", { cause: "fail" })
   *
   * @example
   * if (result.isOk()) {
   *   result.unwrap() // safe
   * }
   */
  unwrap(): TValue

  /**
   * Returns the contained error value.
   *
   * Throws if this result is {@link Ok}.
   *
   * @group Extraction
   *
   * @see {@link unwrap} - Extract the success value.
   *
   * @throws {Error} - If called on an {@link Ok} result.
   *
   * @example
   * Result.err('failed').unwrapErr()
   * // => "failed"
   *
   * @example
   * Result.ok(42).unwrapErr()
   * // => throws Error("Called unwrapErr on an Ok value", { cause: 42 })
   *
   * @example
   * if (result.isErr()) {
   *   result.unwrapErr() // safe
   * }
   */
  unwrapErr(): TError

  /**
   * Returns the success value, or the provided fallback when this result is {@link Err}.
   *
   * @group Extraction
   *
   * @see {@link unwrap} - Throw on failure.
   * @see {@link unwrapOrElse} - Compute a fallback lazily.
   *
   * @template TFallback - Type of the fallback value.
   *
   * @param {TValue} defaultValue - Value returned when this result is {@link Err}.
   *
   * @example
   * Result.ok(42).unwrapOr(0)        // => 42
   * Result.err('failed').unwrapOr(0) // => 0
   */
  unwrapOr<TFallback = TValue>(defaultValue: TFallback): TValue | TFallback

  /**
   * Returns the success value, or computes a fallback from the error when this result is {@link Err}.
   *
   * @group Extraction
   *
   * @see {@link unwrapOr} - Use a static fallback value.
   *
   * @template TFallback - Type returned by the fallback function.
   *
   * @param fallback - Function used to derive a fallback from the error.
   *
   * @example
   * Result.ok(42).unwrapOrElse((e) => e.length)        // => 42
   * Result.err('failed').unwrapOrElse((e) => e.length) // => 6
   */
  unwrapOrElse<TFallback = TValue>(fallback: (error: TError) => TFallback): TValue | TFallback

  /**
   * Returns the success value.
   *
   * @group Extraction
   *
   * @see {@link unwrap} - Default error message.
   * @see {@link expectErr} - Expect an error instead.
   *
   * @param reason - Custom error message.
   *
   * @throws {Error} - With `reason` and the original error as `cause`.
   *
   * @example
   * Result.ok(42).expect('should exist')
   * // => 42
   *
   * @example
   * Result.err('failed').expect('should exist')
   * // => throws Error("should exist", { cause: "failed" })
   */
  expect(reason: string): TValue

  /**
   * Returns the error value.
   *
   * Throws with the provided message if this result is {@link Ok}.
   *
   * @group Extraction
   *
   * @see {@link expect} - Expect a success value instead.
   * @see {@link unwrapErr} - Default error message.
   *
   * @param reason - Custom error message.
   *
   * @throws {Error} - With `reason` and the original value as `cause`.
   *
   * @example
   * Result.err('fail').expectErr('should be error')
   * // => 'fail'
   *
   * @example
   * Result.ok(42).expectErr('should be error')
   * // => throws Error("should be error", { cause: 42 })
   */
  expectErr(reason: string): TError

  // #endregion

  // #region Transformation

  /**
   * Transforms the success value using the provided mapper.
   *
   * If this result is {@link Err}, the original error is preserved.
   *
   * @group Transformation
   *
   * @see {@link mapAsync} - Async version.
   * @see {@link mapOr} - Return a fallback value on error.
   * @see {@link mapErr} - Transform the error value instead.
   *
   * @template U - Mapped success value type.
   *
   * @param mapper - Function applied to the success value.
   *
   * @example
   * Result.ok(42).map((x) => x * 2)      // => Ok(84)
   * Result.err('fail').map((x) => x * 2) // => Err("fail")
   */
  map<U>(mapper: (value: TValue) => U): Result<U, TError>

  /**
   * Transforms the error value using the provided mapper.
   *
   * If this result is {@link Ok}, the original success value is preserved.
   *
   * @group Transformation
   *
   * @see {@link mapErrAsync} - Async version.
   *
   * @template E2 - Mapped error type.
   *
   * @param mapper - Function applied to the error value.
   *
   * @example
   * Result.err('not found').mapErr((e) => new Error(e))
   * // => Err(Error: "not found")
   *
   * Result.ok(42).mapErr((e) => new Error(String(e)))
   * // => Ok(42)
   */
  mapErr<E2>(mapper: (error: TError) => E2): Result<TValue, E2>

  /**
   * Maps the success value or returns the provided fallback when this result is {@link Err}.
   *
   * @group Transformation
   *
   * @see {@link mapOrAsync} - Async version.
   * @see {@link mapOrElse} - Compute the fallback lazily.
   *
   * @template U - Return type.
   *
   * @param mapper - Function applied to the success value.
   * @param defaultValue - Value returned when this result is {@link Err}.
   *
   * @example
   * Result.ok(42).mapOr((x) => x * 2, 0)      // 84
   * Result.err('fail').mapOr((x) => x * 2, 0) // 0
   */
  mapOr<U>(mapper: (value: TValue) => U, defaultValue: U): U

  /**
   * Maps either branch of the result into a shared output type.
   *
   * Uses `okMapper` for {@link Ok} and `errMapper` for {@link Err}.
   *
   * @group Transformation
   *
   * @see {@link mapOrElseAsync} - Async version.
   *
   * @template U - Result type.
   *
   * @param okMapper - Function applied to the success value.
   * @param errMapper - Function applied to the error value.
   *
   * @example
   * Result.ok(42).mapOrElse((x) => x * 2, () => -1)
   * // => 84
   *
   * Result.err('fail').mapOrElse((x) => x * 2,() => -1)
   * // => -1
   */
  mapOrElse<U>(okMapper: (value: TValue) => U, errMapper: (error: TError) => U): U

  /**
   * Validates the success value with a predicate.
   *
   * If this result is {@link Ok} and the predicate returns `false`, converts it to {@link Err}.
   *
   * Existing {@link Err} values are preserved.
   *
   * @group Transformation
   *
   * @see {@link isOkAnd} - Validate without transforming.
   * @see {@link filterOrElse} - Provide a custom error value.
   *
   * @param condition - Predicate used to validate the success value.
   * @param reason - Optional custom error message.
   *
   * @example
   * Result.ok(42).filter((x) => x > 10)
   * // => Ok(42)
   *
   * Result.ok(42).filter((x) => x > 50, 'Too small')
   * // => Err(Error: "Too small", { cause: 42 })
   */
  filter(condition: (value: TValue) => boolean, reason?: string): Result<TValue, Error>

  /**
   * Validates the success value with a predicate.
   *
   * If validation fails, converts the result to {@link Err} using the provided error factory.
   *
   * Existing {@link Err} values are preserved.
   *
   * @group Transformation
   *
   * @see {@link filter} - Use a default error message.
   *
   * @template E2 - Additional error type.
   *
   * @param condition - Predicate used to validate the success value.
   * @param onFailure - Function used to create the failure value.
   *
   * @example
   * Result.ok(42).filterOrElse(
   *   (x) => x > 10,
   *   (x) => new Error('Too small')
   * ) // => Ok(42)
   *
   * Result.ok(42).filterOrElse(
   *   (x) => x > 50,
   *   (x) => new Error('Too small')
   * ) // => Err(Error: "Too small", { cause: 42 })
   */
  filterOrElse<E2>(
    condition: (value: TValue) => boolean,
    onFailure: (value: TValue) => E2,
  ): Result<TValue, TError | E2>

  /**
   * Flattens a nested {@link Result}.
   *
   * Converts `Result<Result<U, E2>, TError>` into `Result<U, TError | E2>`.
   *
   * @group Transformation
   *
   * @template U - Inner success value type.
   * @template E2 - Inner error type.
   *
   * @example
   * Result.ok(Result.ok(42)).flatten()      // => Ok(42)
   * Result.ok(Result.err('fail')).flatten() // => Err("fail")
   * Result.err('outer').flatten()           // Err("outer")
   */
  flatten<U, E2>(this: Result<Result<U, E2>, TError>): Result<U, TError | E2>

  // #endregion

  // #region Alternation

  /**
   * Returns `other` when this result is {@link Ok}.
   *
   * If this result is {@link Err}, the current error is preserved.
   *
   * Commonly used to sequence results while discarding the current success value.
   *
   * @group Alternation
   *
   * @see {@link andAsync} - Async version.
   * @see {@link andThen} - Chain using a callback.
   *
   * @template U - Next success value type.
   * @template E2 - Next error type.
   *
   * @param other - Result returned when this result is {@link Ok}.
   *
   * @example
   * Result.ok(1).and(Result.ok(2))        // => Ok(2)
   * Result.ok(1).and(Result.err('fail'))  // => Err("fail")
   * Result.err('fail').and(Result.ok(42)) // => Err("fail")
   */
  and<U, E2 = never>(other: Result<U, E2>): Result<U, TError | E2>

  /**
   * Chains a function that returns another {@link Result}.
   *
   * If this result is {@link Ok}, `next` receives the success value.
   * If this result is {@link Err}, the current error is preserved.
   *
   * Also known as `flatMap` or `bind`.
   *
   * @group Alternation
   *
   * @see {@link andThenAsync} - Async version.
   * @see {@link map} - Transform without flattening.
   *
   * @template U - Next success value type.
   * @template E2 - Next error type.
   *
   * @param next - Function that returns the next result.
   *
   * @example
   * Result.ok(5).andThen((x) => Result.ok(x * 2))
   * // => Ok(10)
   *
   * Result.ok(5).andThen(() => Result.err('failure'))
   * // => Err("failure")
   *
   * Result.err('fail').andThen((x) => Result.ok(x * 2))
   * // => Err("fail")
   */
  andThen<U, E2 = never>(next: (value: TValue) => Result<U, E2>): Result<U, TError | E2>

  /**
   * Returns this result when it is {@link Ok}, otherwise returns `other`.
   *
   * Commonly used to provide a fallback result.
   *
   * @group Alternation
   *
   * @see {@link orAsync} - Async version.
   * @see {@link orElse} - Compute a fallback lazily.
   *
   * @template U - Alternative success type
   * @template E2 - Alternative error type
   *
   * @param other - Result used when this result is {@link Err}.
   *
   * @example
   * Result.ok(1).or(Result.ok(2))        // => Ok(1)
   * Result.err('fail').or(Result.ok(42)) // => Ok(42)
   */
  or<U = TValue, E2 = never>(other: Result<U, E2>): Result<TValue | U, E2>

  /**
   * Returns this result when it is {@link Ok}, otherwise invokes `fallback` with the current error.
   *
   * Useful for recovery flows that depend on the failure reason.
   *
   * @group Alternation
   *
   * @see {@link orElseAsync} - Async version.
   * @see {@link or} - Use a static fallback result.
   *
   * @template U - Recovery success type
   * @template E2 - Recovery error type
   *
   * @param fallback - Function used to recover from an error.
   *
   * @example
   * Result.ok(42).orElse(() => Result.ok(0))
   * // => Ok(42)
   *
   * Result.err('not found').orElse(() => Result.ok(null))
   * // => Ok(null)
   *
   * Result.err('fail').orElse(() => Result.err('backup'))
   * // => Err("backup")
   *
   */
  orElse<U = TValue, E2 = never>(fallback: (error: TError) => Result<U, E2>): Result<TValue | U, E2>

  // #endregion

  // #region Combination

  /**
   * Combines this result with another result into a tuple.
   *
   * Returns {@link Ok} only when both results are successful.
   * If either result is {@link Err}, the first encountered error is returned.
   *
   * @group Combination
   *
   * @see {@link zipWith} - Combine and map in one step.
   *
   * @template U - Second success type
   * @template E2 - Second error type
   *
   * @param other - Result to combine with this one.
   *
   * @example
   * Result.ok(1).zip(Result.ok('a'))  // => Ok([1, 'a'])
   * Result.ok(1).zip(Result.err('b')) // => Err('b')
   */
  zip<U, E2>(other: Result<U, E2>): Result<[TValue, U], TError | E2>

  /**
   * Combines two successful results and maps their values.
   *
   * Returns {@link Ok} only when both results are successful.
   * If either result is {@link Err}, the first encountered error is returned.
   *
   * @group Combination
   *
   * @see {@link zip} - Return a tuple instead of mapping.
   *
   * @template U - Second success value type.
   * @template R - Combined return type.
   * @template E2 - Second error type.
   *
   * @param other - Second result.
   * @param combine - Function applied to both success values.
   *
   * @example
   * Result.ok(2).zipWith(
   *   Result.ok(3),
   *   (a, b) => a + b
   * ) // => Ok(5)
   *
   * Result.ok('hello').zipWith(
   *   Result.ok('world'),
   *   (a, b) => `${a} ${b}`,
   * ) // => Ok("hello world")
   *
   * Result.ok(2).zipWith(
   *   Result.err('fail'),
   *   (a, b) => a + b,
   * ) // => Err("fail")
   */
  zipWith<U, R, E2>(
    other: Result<U, E2>,
    combine: (value: TValue, otherValue: U) => R,
  ): Result<R, TError | E2>

  // #endregion

  // #region Inspection

  /**
   * Returns `true` when this result is {@link Ok} and its value is strictly equal to `value`.
   *
   * Uses `===` comparison.
   *
   * @group Inspection
   *
   * @overload
   *
   * @template U - Comparable value type.
   *
   * @param value - Expected value.
   *
   * @example
   * Result.ok(42).contains(42)                 // => true
   * Result.ok(42).contains(99)                 // => false
   * Result.ok({ id: 42 }).contains({ id: 42 }) // => true
   * Result.err('fail').contains(42)            // => false
   */
  contains<U extends TValue>(value: U): boolean

  /**
   * Returns `true` when this result is {@link Ok} and the comparator determines both values are equivalent.
   *
   * Useful for objects or custom equality rules.
   *
   * @group Inspection
   *
   * @overload
   *
   * @template U - Expected value type.
   *
   * @param value - Expected value.
   * @param comparator - Custom comparison function.
   *
   * @example
   * const user = { id: 1, name: 'John' }
   *
   * Result.ok(user).contains(
   *   { id: 1 },
   *   (actual, expected) => actual.id === expected.id
   * ) // => true
   */
  contains<U>(value: U, comparator: (actual: TValue, expected: U) => boolean): boolean

  /**
   * Pattern matches the current result.
   *
   * Executes `cases.ok` for {@link Ok} or `cases.err` for {@link Err}, returning the selected branch result.
   *
   * @group Inspection
   *
   * @see {@link inspect} - Run side effects for success values.
   * @see {@link inspectErr} - Run side effects for errors.
   *
   * @template L - Return type for the success branch.
   * @template R - Return type for the error branch.
   *
   * @param cases Branch handlers.
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
  match<L, R>(cases: MatchCases<TValue, TError, L, R>): L | R

  /**
   * Runs a callback when this result is {@link Ok}.
   *
   * Intended for side effects such as logging, metrics, or debugging.
   * Returns the original result for chaining.
   *
   * @group Inspection
   *
   * @see {@link inspectErr} - Side effects for errors.
   * @see {@link match} - Branch on both states.
   *
   * @param action Callback invoked with the success value.
   *
   * @example
   * Result.ok(42).inspect((value) => console.log(value))
   * // => logs 42, returns Ok(42)
   */
  inspect(action: (value: TValue) => void): this

  /**
   * Runs a callback when this result is {@link Err}.
   *
   * Intended for side effects such as logging, metrics, or debugging.
   * Returns the original result for chaining.
   *
   * @group Inspection
   *
   * @see {@link inspect} - Side effects for success values.
   *
   * @param action - Callback invoked with the error value.
   *
   * @example
   * Result.err('fail').inspectErr(e => console.log(e))
   * // => logs "fail", returns Err("fail")
   */
  inspectErr(action: (error: TError) => void): this

  // #endregion

  // #region Async Transformation

  /**
   * Asynchronously transforms the success value.
   *
   * If this result is {@link Err}, the original error is preserved.
   *
   * @group Async Transformation
   *
   * @see {@link map} - sync version
   *
   * @template U - Mapped success value type.
   *
   * @param mapper - Async function applied to the success value.
   *
   * @example
   * await Result.ok(1).mapAsync(async (x) => x + 1)
   * // => Ok(2)
   *
   * await Result.err('fail').mapAsync(async (x) => x + 1)
   * // => Err('fail')
   */
  mapAsync<U>(mapper: (value: TValue) => Promise<U>): AsyncResult<U, TError>

  /**
   * Asynchronously transforms the error value.
   *
   * If this result is {@link Ok}, the original success value is preserved.
   *
   * @group Async Transformation
   *
   * @see {@link mapErr} - Sync version
   *
   * @template E2 - Mapped error type.
   *
   * @param mapper - Async function applied to the error value.
   *
   * @example
   * await Result.ok(5).mapErrAsync(async (e) => e + 1)
   * // => Ok(5)
   *
   * await Result.err('fail').mapErrAsync(
   *   async (e) => new Error(e)
   * )
   * // => Err(Error: "fail")
   */
  mapErrAsync<E2>(mapper: (error: TError) => Promise<E2>): AsyncResult<TValue, E2>

  /**
   * Asynchronously maps the success value or returns the provided fallback when this result is {@link Err}.
   *
   * @group Async Transformation
   *
   * @see {@link mapOr} - Sync version
   *
   * @template U - Return type.
   *
   * @param mapper - Async function applied to the success value.
   * @param defaultValue - Value returned when this result is {@link Err}.
   *
   * @example
   * await Result.ok(5).mapOrAsync(async (x) => x * 2, 0)
   * // => 10
   *
   * await Result.err('fail').mapOrAsync(async (x) => x * 2, 0)
   * // => 0
   */
  mapOrAsync<U>(mapper: (value: TValue) => Promise<U>, defaultValue: U): Promise<U>

  /**
   * Asynchronously maps either branch of the result into a shared output type.
   *
   * Uses `okMapper` for {@link Ok} and `errMapper` for {@link Err}.
   *
   * @group Async Transformation
   *
   * @see {@link mapOrElse} - Sync version
   *
   * @template U - Result type
   *
   * @param okMapper - Async function applied to the success value.
   * @param errMapper - Async function applied to the error value.
   *
   * @example
   * await Result.ok(5).mapOrElseAsync(
   *   async (x) => x * 2,
   *   async () => -1
   * )
   * // => 10
   *
   * await Result.err('fail').mapOrElseAsync(
   *   async (x) => x * 2,
   *   async () => -1
   * )
   * // => -1
   */
  mapOrElseAsync<U>(
    okMapper: (value: TValue) => Promise<U>,
    errMapper: (error: TError) => Promise<U>,
  ): Promise<U>

  // #endregion

  // #region Async Alternation

  /**
   * Returns `other` when this result is {@link Ok}.
   *
   * If this result is {@link Err}, the current error is preserved.
   *
   * @group Async Alternation
   *
   * @see {@link and} - Sync version
   *
   * @template U - Next success value type.
   * @template E2 - Next error type.
   *
   * @param other - Async result returned when this result is {@link Ok}.
   *
   * @example
   * await Result.ok(5).andAsync(
   *   Promise.resolve(Result.ok(10))
   * )
   * // => Ok(10)
   *
   * await Result.err('fail').andAsync(
   *   Promise.resolve(Result.ok(42))
   * )
   * // => Err("fail")
   */
  andAsync<U, E2 = never>(other: AsyncResult<U, E2>): AsyncResult<U, TError | E2>

  /**
   * Chains an asynchronous function that returns another {@link Result}.
   *
   * If this result is {@link Ok}, `next` receives the success value.
   * If this result is {@link Err}, the current error is preserved.
   *
   * @group Async Alternation
   *
   * @see {@link andThen} - Sync version
   *
   * @template U - Next success value type.
   * @template E2 - Next error type.
   *
   * @param next - Async function that returns the next result.
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
   * // => Err("fail")
   *
   */
  andThenAsync<U, E2 = never>(
    next: (value: TValue) => AsyncResult<U, E2>,
  ): AsyncResult<U, TError | E2>

  /**
   * Returns this result when it is {@link Ok}, otherwise returns `other`.
   *
   * @group Async Alternation
   *
   * @see {@link or} - Sync version
   *
   * @template U - Alternative success value type.
   * @template E2 - Alternative error type.
   *
   * @param other - Async fallback result.
   *
   * @example
   * await Result.ok(5).orAsync(
   *   Promise.resolve(Result.ok(10))
   * )
   * // => Ok(5)
   *
   * await Result.err('fail').orAsync(
   *   Promise.resolve(Result.ok(42))
   * )
   * // => Ok(42)
   */
  orAsync<U = TValue, E2 = never>(other: AsyncResult<U, E2>): AsyncResult<TValue | U, E2>

  /**
   * Returns this result when it is {@link Ok}, otherwise invokes `fallback` asynchronously with the current error.
   *
   * Useful for async recovery flows that depend on the failure reason.
   *
   * @group Async Alternation
   *
   * @see {@link orElse} - sync version
   *
   * @template U - Recovery success value type.
   * @template E2 - Recovery error type.
   *
   * @param fallback - Async function used to recover from an error.
   *
   * @example
   * await Result.ok(5).orElseAsync(
   *   async () => Result.ok(0)
   * )
   * // => Ok(5)
   *
   * await Result.err('not found').orElseAsync(
   *   async () => Result.ok(42)
   * )
   * // => Ok(42)
   */
  orElseAsync<U = TValue, E2 = never>(
    fallback: (error: TError) => AsyncResult<U, E2>,
  ): AsyncResult<TValue | U, E2>

  // #endregion

  // #region Conversion

  /**
   * Returns a string representation of this result.
   *
   * Formats the current value as `Ok(value)` or `Err(error)`.
   *
   * @group Conversion
   *
   * @example
   * Result.ok(42).toString()      // => "Ok(42)"
   * Result.err('fail').toString() // => "Err("fail")"
   */
  toString(): string

  /**
   * Converts this result into a plain JSON-serializable object.
   *
   * @group Conversion
   *
   * @example
   * Result.ok(42).toJSON()
   * // { type: 'ok', value: 42 }
   *
   * Result.err('fail').toJSON()
   * // { type: 'err', error: 'fail' }
   */
  toJSON(): { type: 'ok'; value: TValue } | { type: 'err'; error: TError }

  /**
   * Converts this result into a nullable value.
   *
   * Returns the success value when this result is {@link Ok}, otherwise returns `null`.
   *
   * @group Conversion
   *
   * @see {@link toValue} - Return `undefined` on error instead.
   *
   * @example
   * Result.ok(42).toNullable()        // => 42
   * Result.err('failed').toNullable() // => null
   */
  toNullable(): TValue | null

  /**
   * Converts this result into an optional value.
   *
   * Returns the success value when this result is {@link Ok}, otherwise returns `undefined`.
   *
   * @group Conversion
   *
   * @see {@link toNullable} - Return `null` on error instead.
   *
   * @example
   * Result.ok(42).toValue()        // => 42
   * Result.err('failed').toValue() // => undefined
   */
  toValue(): TValue | undefined

  // #endregion
}
