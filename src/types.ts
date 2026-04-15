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
  [K in keyof T]: InferOk<T[K]>
}

/**
 * Infers a tuple of error types from an array of Results.
 *
 * @internal
 */
export type ErrTuple<T extends readonly Result<unknown, unknown>[]> = {
  [K in keyof T]: InferErr<T[K]>
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
  // #region CHECKING
  isOk(): this is Ok<T, E>
  isErr(): this is Err<T, E>
  isOkAnd(predicate: (value: T) => boolean): this is Ok<T, E>
  isErrAnd(predicate: (error: E) => boolean): this is Err<T, E>
  // #endregion

  // #region ACCESSING
  readonly ok: T | null
  readonly err: E | null
  unwrap(): T
  unwrapErr(): E
  unwrapOr(defaultValue: T): T
  unwrapOrElse(onError: (error: E) => T): T
  expect(message: string): T
  expectErr(message: string): E
  // #endregion

  // #region TRANSFORMING
  map<U>(mapper: (value: T) => U): Result<U, E>
  mapOr<U>(mapper: (value: T) => U, defaultValue: U): U
  mapOrElse<U>(okMapper: (value: T) => U, errorMapper: (error: E) => U): U
  mapErr<E2>(mapper: (error: E) => E2): Result<T, E2>
  filter(predicate: (value: T) => boolean, onReject?: (value: T) => E | Error): Result<T, E | Error>
  flatten<U, E2>(this: Result<Result<U, E2>, E>): Result<U, E | E2>
  // #endregion

  // #region CHAINING
  and<U>(result: Result<U, E>): Result<U, E>
  andThen<U>(flatMapper: (value: T) => Result<U, E>): Result<U, E>
  or(result: Result<T, E>): Result<T, E>
  orElse(onError: (error: E) => Result<T, E>): Result<T, E>
  zip<U, E2>(result: Result<U, E2>): Result<[T, U], E | E2>
  // #endregion

  // #region INSPECTING
  contains(value: T, comparator?: (actual: T, expected: T) => boolean): boolean
  containsErr(error: E, comparator?: (actual: E, expected: E) => boolean): boolean
  match<L, R>(handlers: { ok: (value: T) => L; err: (error: E) => R }): L | R
  inspect(visitor: (value: T) => void): Result<T, E>
  inspectErr(visitor: (error: E) => void): Result<T, E>
  // #endregion

  // #region CONVERSION
  toPromise(): Promise<T>
  toString(): string
  toJSON(): { type: 'ok'; value: T } | { type: 'err'; error: E }
  // #endregion

  // #region ASYNC
  mapAsync<U>(mapperAsync: (value: T) => Promise<U>): AsyncResult<U, E>
  mapErrAsync<E2>(mapperAsync: (error: E) => Promise<E2>): AsyncResult<T, E2>
  mapOrAsync<U>(mapperAsync: (value: T) => Promise<U>, defaultValue: U): Promise<U>
  mapOrElseAsync<U>(
    okAsync: (value: T) => Promise<U>,
    errAsync: (error: E) => Promise<U>,
  ): Promise<U>
  andThenAsync<U>(mapAsync: (value: T) => AsyncResult<U, E>): AsyncResult<U, E>
  andAsync<U>(result: AsyncResult<U, E>): AsyncResult<U, E>
  orAsync(result: AsyncResult<T, E>): AsyncResult<T, E>
  orElseAsync(onErrorAsync: (error: E) => AsyncResult<T, E>): AsyncResult<T, E>
  // #endregion
}

export interface Ok<T, E = never> extends ResultMethods<T, E> {
  readonly _tag: 'Ok'
  readonly value: T
}

export interface Err<T = never, E = Error> extends ResultMethods<T, E> {
  readonly _tag: 'Err'
  readonly error: E
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
 *   return Result.ok(a / b)
 * }
 *
 * divide(10, 2)  // => Ok(5)
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
 * async function fetchUser(id: string): AsyncResult<User, Error> {
 *   return Result.fromPromise(async () => {
 *     const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
 *     return response.json()
 *   })
 * }
 */
export type AsyncResult<T, E> = Promise<Result<T, E>>
