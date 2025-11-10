/**
 * Result type for handling success and error cases without exceptions.
 *
 * @template T - Success value type
 * @template E - Error type (defaults to Error)
 *
 * @example
 * const success = Result.ok(42) // => Result<number, never>
 * const failure = Result.err(new Error('Failed')) // => Result<never, Error>
 */
export class Result<T, E = Error> {
  /**
   * Private token to prevent external instantiation.
   * Only accessible within the class via static factory methods.
   */
  static readonly #token = Symbol('private-constructor-token')

  /** Indicates if this Result is successful (true) or failed (false) */
  readonly #success: boolean
  /** Holds the success value when #success is true, null otherwise */
  readonly #value: T | null
  /** Holds the error value when #success is false, null otherwise */
  readonly #error: E | null

  /**
   * Private constructor to enforce creation via static factory methods.
   * Validates token to prevent direct instantiation from outside the class.
   *
   * @param success - Whether this Result represents success or failure
   * @param value - The success value (null if error)
   * @param error - The error value (null if success)
   * @param token - Security token to validate legitimate instantiation
   * @throws {Error} If token doesn't match the private static token
   */
  private constructor(success: boolean, value: T | null, error: E | null, token: symbol) {
    if (token !== Result.#token) {
      throw new Error('Result constructor is private. Use Result.ok() or Result.err()')
    }

    this.#success = success
    this.#value = value
    this.#error = error
  }

  // #region CREATION
  /**
   * Creates a successful Result containing a value.
   *
   * @template T - Value type
   * @template E - Error type
   * @param value - The success value
   * @returns Result<T, E>
   *
   * @example
   * const result = Result.ok(42)
   * result.unwrap() // => 42
   */
  static ok<T, E = never>(value: T): Result<T, E> {
    return new Result(true, value, null, Result.#token) as Result<T, E>
  }

  /**
   * Creates a failed Result containing an error.
   *
   * @template T - Value type
   * @template E - Error type
   * @param error - The error value
   * @returns Result<T, E>
   *
   * @example
   * const result = Result.err(new Error('Failed'))
   * result.unwrapErr().message // => 'Failed'
   */
  static err<T = never, E = Error>(error: E): Result<T, E> {
    return new Result(false, null, error, Result.#token) as Result<T, E>
  }
  // #endregion

  // #region VALIDATION
  /**
   * Type guard to check if a value is a Result instance.
   *
   * @template T - Value type
   * @template E - Error type
   * @param value - Value to check
   * @returns true if value is Result<T, E>
   *
   * @example
   * const value = Result.ok(42)
   *
   * if (Result.is(value)) {
   *   value.isOk() // => true
   * }
   */
  static is<T, E>(value: unknown): value is Result<T, E> {
    return value instanceof Result
  }

  /**
   * Type guard to check if Result is successful.
   *
   * @returns true if Result contains a value
   *
   * @example
   * const result = Result.ok(42)
   *
   * if (result.isOk()) {
   *   result.unwrap() // => 42
   * }
   */
  isOk(): this is Result<T, never> {
    return this.#success
  }

  /**
   * Type guard to check if Result is an error.
   *
   * @returns true if Result contains an error
   *
   * @example
   * const result = Result.err(new Error('Failed'))
   *
   * if (result.isErr()) {
   *   result.unwrapErr().message // => 'Failed'
   * }
   */
  isErr(): this is Result<never, E> {
    return !this.#success
  }
  //#endregion

  // #region ACCESS
  /**
   * Gets the success value or null if Result is an error.
   *
   * @returns T | null
   *
   * @example
   * const result = Result.ok(42)
   * result.ok // => 42
   */
  get ok(): T | null {
    return this.#success ? (this.#value as T) : null
  }

  /**
   * Gets the error value or null if Result is successful.
   *
   * @returns E | null
   *
   * @example
   * const result = Result.err(new Error('Failed'))
   * result.err?.message // => 'Failed'
   */
  get err(): E | null {
    return this.#success ? null : (this.#error as E)
  }

  /**
   * Unwraps the success value. Throws the original error if Result is an error.
   *
   * @returns T
   * @throws {E} The original error if Result is Err
   *
   * @example
   * const value = Result.ok(42)
   * value.unwrap() // => 42
   *
   * const error = Result.err(new Error('Failed'))
   * error.unwrap() // => Throws Error('Failed')
   */
  unwrap(): T {
    if (!this.#success) {
      throw this.#error
    }

    return this.#value as T
  }

  /**
   * Unwraps the error value. Throws if Result is successful.
   *
   * @returns E
   * @throws {Error} If Result is Ok
   *
   * @example
   * const error = Result.err(new Error('Failed'))
   * error.unwrapErr().message // => 'Failed'
   */
  unwrapErr(): E {
    return this.expectErr('Called unwrapErr on an Ok value')
  }

  /**
   * Returns the success value or a default value if Result is an error.
   *
   * @param defaultValue - Value to return if Result is Err
   * @returns T
   *
   * @example
   * const value = result.unwrapOr(0) // returns 0 if error
   */
  unwrapOr(defaultValue: T): T {
    return this.#success ? (this.#value as T) : defaultValue
  }

  /**
   * Returns the success value or computes a default value if Result is an error.
   *
   * @param fn - Function to compute default value
   * @returns T
   *
   * @example
   * const value = result.unwrapOrElse(() => getDefaultValue())
   */
  unwrapOrElse(fn: () => T): T {
    return this.#success ? (this.#value as T) : fn()
  }

  /**
   * Unwraps the value or throws with a custom message if Result is an error.
   *
   * @param message - Error message to throw
   * @returns T
   * @throws {Error} with message if Result is Err
   *
   * @example
   * const value = result.expect('User must exist')
   */
  expect(message: string): T {
    if (!this.#success) {
      throw new Error(message, { cause: this.#error })
    }

    return this.#value as T
  }

  /**
   * Unwraps the error or throws with a custom message if Result is successful.
   *
   * @param message - Error message to throw
   * @returns E
   * @throws {Error} with message if Result is Ok
   *
   * @example
   * const error = result.expectErr('Expected an error')
   */
  expectErr(message: string): E {
    if (this.#success) {
      throw new Error(message)
    }

    return this.#error as E
  }
  // #endregion

  // #region TRANSFORMATION
  /**
   * Maps the success value to a new value. Error is propagated unchanged.
   *
   * @template U - New value type
   * @param fn - Function to transform the value
   * @returns Result<U, E>
   *
   * @example
   * const doubled = Result.ok(21).map((x) => x * 2)
   * doubled.unwrap() // => 42
   */
  map<U>(fn: (value: T) => U): Result<U, E> {
    return this.#success
      ? Result.ok<U, E>(fn(this.#value as T))
      : Result.err<U, E>(this.#error as E)
  }

  /**
   * Maps the success value or returns a default value if Result is an error.
   *
   * @template U - Return type
   * @param defaultValue - Value to return if Result is Err
   * @param fn - Function to transform the value
   * @returns U
   *
   * @example
   * const value = Result.ok(21).mapOr(0, (x) => x * 2)
   * // => 42
   *
   * const errorValue = Result.err(new Error('fail')).mapOr(0, (x) => x * 2)
   * // => 0
   */
  mapOr<U>(defaultValue: U, fn: (value: T) => U): U {
    return this.#success ? fn(this.#value as T) : defaultValue
  }

  /**
   * Maps the error value to a new error. Success value is propagated unchanged.
   *
   * @template F - New error type
   * @param fn - Function to transform the error
   * @returns Result<T, F>
   *
   * @example
   * const result = Result.err('error').mapErr((msg) => new Error(msg))
   * result.unwrapErr().message // => 'error'
   */
  mapErr<F>(fn: (error: E) => F): Result<T, F> {
    return !this.#success
      ? Result.err<T, F>(fn(this.#error as E))
      : Result.ok<T, F>(this.#value as T)
  }

  /**
   * Chains Results together. If current Result is Ok, applies fn.
   *
   * @template U - New value type
   * @param fn - Function returning a new Result
   * @returns Result<U, E>
   *
   * @example
   * const result = Result.ok(5)
   *   .andThen(x => Result.ok(x * 2))
   *   .andThen(x => Result.ok(x + 10))
   *
   * result.unwrap() // => 20
   */
  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return this.#success ? fn(this.#value as T) : Result.err<U, E>(this.#error as E)
  }

  /**
   * Flattens a nested Result<Result<U, E>, E> into Result<U, E>.
   *
   * @template U - Inner value type
   * @returns Result<U, E>
   *
   * @example
   * const nested = Result.ok(Result.ok(42))
   * const flat = nested.flatten()
   * flat.unwrap() // => 42
   */
  flatten<U>(this: Result<Result<U, E>, E>): Result<U, E> {
    return this.#success ? (this.#value as Result<U, E>) : Result.err<U, E>(this.#error as E)
  }
  // #endregion

  // #region COMBINATION
  /**
   * Combines multiple Results into a single Result containing an array of values.
   * Returns the first error encountered.
   *
   * @template T - Array of Result types
   * @param results - Array of Results to combine
   * @returns Result containing array of unwrapped values or first error
   *
   * @example
   * const results = [Result.ok(1), Result.ok(2), Result.ok(3)]
   * const combined = Result.sequence(results)
   * combined.unwrap() // => [1, 2, 3]
   */
  static sequence<T extends readonly Result<unknown, unknown>[]>(
    results: T
  ): Result<
    { [K in keyof T]: T[K] extends Result<infer U, unknown> ? U : never },
    T[number] extends Result<unknown, infer E> ? E : never
  > {
    const values: unknown[] = []

    for (const result of results) {
      if (result.isErr()) {
        return Result.err(result.unwrapErr()) as Result<
          never,
          T[number] extends Result<unknown, infer E> ? E : never
        >
      }
      values.push(result.unwrap())
    }

    return Result.ok(
      values as {
        [K in keyof T]: T[K] extends Result<infer U, unknown> ? U : never
      }
    )
  }

  /**
   * Combines multiple async Results into a single Result containing an array of values.
   * Waits for all promises and returns the first error encountered.
   *
   * @template T - Value type
   * @template E - Error type
   * @param promises - Array of Promises resolving to Results
   * @returns Promise<Result<T[], E>>
   *
   * @example
   * const promises = [fetchUser(1), fetchUser(2)]
   * const result = await Result.sequenceAsync(promises)
   */
  static async sequenceAsync<const T extends readonly Promise<Result<unknown, unknown>>[]>(
    promises: T
  ): Promise<
    Result<
      { -readonly [K in keyof T]: T[K] extends Promise<Result<infer U, unknown>> ? U : never },
      T[number] extends Promise<Result<unknown, infer E>> ? E : never
    >
  > {
    const results = await Promise.all(promises)
    const values: unknown[] = []

    for (const result of results) {
      if (result.isErr()) {
        return Result.err(result.unwrapErr()) as Result<
          never,
          T[number] extends Promise<Result<unknown, infer E>> ? E : never
        >
      }

      values.push(result.unwrap())
    }

    // biome-ignore lint/suspicious/noExplicitAny: cast final
    return Result.ok(values) as any
  }

  /**
   * Returns the other Result if this Result is Ok, otherwise returns this error.
   *
   * @template U - Other value type
   * @param other - Result to return if this is Ok
   * @returns Result<U, E>
   *
   * @example
   * const result = validate(data).and(save(data))
   */
  and<U>(other: Result<U, E>): Result<U, E> {
    return this.#success ? other : Result.err<U, E>(this.#error as E)
  }

  /**
   * Returns this Result if Ok, otherwise returns the other Result.
   *
   * @param other - Fallback Result
   * @returns Result<T, E>
   *
   * @example
   * const result = fetchFromCache().or(fetchFromDatabase())
   */
  or(other: Result<T, E>): Result<T, E> {
    return this.#success ? this : other
  }

  /**
   * Returns this Result if Ok, otherwise calls fn with the error.
   *
   * @param fn - Function to compute fallback Result
   * @returns Result<T, E>
   *
   * @example
   * const result = fetchUser(id).orElse(err => fetchUserFromCache(id))
   */
  orElse(fn: (error: E) => Result<T, E>): Result<T, E> {
    return this.#success ? this : fn(this.#error as E)
  }
  // #endregion

  // #region CONVERSION
  /**
   * Converts a Promise into a Result, catching any errors.
   *
   * @template T - Value type
   * @template E - Error type
   * @param promise - Promise to convert
   * @param mapError - Optional function to transform the error
   * @returns Promise<Result<T, E>>
   *
   * @example
   * const result = await Result.fromPromise(
   *   fetch('/api/data'),
   *   (err) => new NetworkError(err)
   * )
   */
  static async fromPromise<T, E = Error>(
    promise: Promise<T>,
    mapError?: (error: unknown) => E
  ): Promise<Result<T, E>> {
    try {
      const value = await promise
      return Result.ok<T, E>(value)
      //
    } catch (error) {
      const mappedError = mapError ? mapError(error) : (error as E)
      return Result.err<T, E>(mappedError)
    }
  }

  /**
   * Converts Result to a Promise. Resolves if Ok, rejects if Err.
   *
   * @returns Promise<T>
   *
   * @example
   * result.toPromise()
   *   .then(value => console.log(value))
   *   .catch(error => console.error(error))
   */
  toPromise(): Promise<T> {
    return this.#success ? Promise.resolve(this.#value as T) : Promise.reject(this.#error)
  }
  // #endregion

  // #region INSPECTION
  /**
   * Pattern matches on Result, executing one of two handlers.
   *
   * @template R - Return type
   * @param handlers - Object with ok and err handlers
   * @returns R
   *
   * @example
   * const message = result.match({
   *   ok: (value) => `Success: ${value}`,
   *   err: (error) => `Error: ${error.message}`
   * })
   */
  match<R>(handlers: { ok: (value: T) => R; err: (error: E) => R }): R {
    return this.#success ? handlers.ok(this.#value as T) : handlers.err(this.#error as E)
  }

  /**
   * Inspects the Result value without consuming it. Calls appropriate handler.
   *
   * @param handlers - Object with ok and err handlers
   * @returns this (for chaining)
   *
   * @example
   * result.inspect({
   *   ok: (value) => console.log('Got:', value),
   *   err: (error) => console.error('Error:', error)
   * })
   */
  inspect(handlers: { ok: (value: T) => void; err: (error: E) => void }): Result<T, E> {
    if (this.#success) {
      handlers.ok(this.#value as T)
    } else {
      handlers.err(this.#error as E)
    }

    return this
  }

  /**
   * Inspects the success value if Result is Ok. Does nothing if Err.
   *
   * @param fn - Function to inspect the value
   * @returns this (for chaining)
   *
   * @example
   * result.inspectOk(value => console.log('Success:', value))
   */
  inspectOk(fn: (value: T) => void): Result<T, E> {
    if (this.#success) {
      fn(this.#value as T)
    }

    return this
  }

  /**
   * Inspects the error value if Result is Err. Does nothing if Ok.
   *
   * @param fn - Function to inspect the error
   * @returns this (for chaining)
   *
   * @example
   * result.inspectErr(error => console.error('Failed:', error))
   */
  inspectErr(fn: (error: E) => void): Result<T, E> {
    if (!this.#success) {
      fn(this.#error as E)
    }

    return this
  }
  // #endregion
}
