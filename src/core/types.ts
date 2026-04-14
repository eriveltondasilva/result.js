// #region INFERENCE

/**
 * Extracts the success value type (T) from a Result.
 * Returns never if the input is not a Result.
 *
 * @internal
 */
export type InferOk<R> = R extends IResult<infer T, unknown> ? T : never

/**
 * Extracts the error type (E) from a Result.
 * Returns never if the input is not a Result.
 *
 * @internal
 */
export type InferErr<R> = R extends IResult<unknown, infer E> ? E : never

// #endregion

// #region TUPLES

/**
 * Infers a tuple of success types from an array of Results.
 *
 * @internal
 */
export type OkTuple<T extends readonly IResult<unknown, unknown>[]> = {
  [K in keyof T]: InferOk<T[K]>
}

/**
 * Infers a tuple of error types from an array of Results.
 *
 * @internal
 */
export type ErrTuple<T extends readonly IResult<unknown, unknown>[]> = {
  [K in keyof T]: InferErr<T[K]>
}

// #endregion

// #region UNION

/**
 * Infers a union of all possible success types from an array of Results.
 *
 * @internal
 */
export type OkUnion<T extends readonly IResult<unknown, unknown>[]> = InferOk<T[number]>

/**
 * Infers a union of all possible error types from an array of Results.
 *
 * @internal
 */
export type ErrUnion<T extends readonly IResult<unknown, unknown>[]> = InferErr<T[number]>

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
 * @template T - Success type
 */
export interface ResultMethods<T, E> {
  // #region CHECKING
  isOk(): this is IOk<T>
  isErr(): this is IErr<E>
  isOkAnd(predicate: (value: T) => boolean): this is IOk<T>
  isErrAnd(predicate: (error: E) => boolean): this is IErr<E>
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
  map<U>(mapper: (value: T) => U): IResult<U, E>
  mapOr<U>(mapper: (value: T) => U, defaultValue: U): U
  mapOrElse<U>(okMapper: (value: T) => U, errorMapper: (error: E) => U): U
  mapErr<E2>(mapper: (error: E) => E2): IResult<T, E2>
  filter(predicate: (value: T) => boolean, onReject?: (value: T) => E | Error): IResult<T, E | Error>
  flatten<U, E2>(this: IResult<IResult<U, E2>, E>): IResult<U, E | E2>
  // #endregion

  // #region CHAINING
  and<U>(result: IResult<U, E>): IResult<U, E>
  andThen<U>(flatMapper: (value: T) => IResult<U, E>): IResult<U, E>
  or(result: IResult<T, E>): IResult<T, E>
  orElse(onError: (error: E) => IResult<T, E>): IResult<T, E>
  zip<U, E2>(result: IResult<U, E2>): IResult<[T, U], E | E2>
  // #endregion

  // #region INSPECTING
  contains(value: T, comparator?: (actual: T, expected: T) => boolean): boolean
  containsErr(error: E, comparator?: (actual: E, expected: E) => boolean): boolean
  match<L, R>(handlers: { ok: (value: T) => L; err: (error: E) => R }): L | R
  inspect(visitor: (value: T) => void): IResult<T, E>
  inspectErr(visitor: (error: E) => void): IResult<T, E>
  // #endregion

  // #region CONVERSION
  toPromise(): Promise<T>
  toString(): string
  toJSON(): { type: 'ok'; value: T } | { type: 'err'; error: E }
  // #endregion

  // #region ASYNC
  mapAsync<U>(mapperAsync: (value: T) => Promise<U>): IAsyncResult<U, E>
  mapErrAsync<E2>(mapperAsync: (error: E) => Promise<E2>): IAsyncResult<T, E2>
  mapOrAsync<U>(mapperAsync: (value: T) => Promise<U>, defaultValue: U): Promise<U>
  mapOrElseAsync<U>(
    okAsync: (value: T) => Promise<U>,
    errAsync: (error: E) => Promise<U>,
  ): Promise<U>
  andThenAsync<U>(mapAsync: (value: T) => IAsyncResult<U, E>): IAsyncResult<U, E>
  andAsync<U>(result: IAsyncResult<U, E>): IAsyncResult<U, E>
  orAsync(result: IAsyncResult<T, E>): IAsyncResult<T, E>
  orElseAsync(onErrorAsync: (error: E) => IAsyncResult<T, E>): IAsyncResult<T, E>
  // #endregion
}

export interface IOk<T, E = never> extends ResultMethods<T, E> {
  readonly _tag: 'Ok'
  readonly value: T
}

export interface IErr<E = Error, T = never> extends ResultMethods<T, E> {
  readonly _tag: 'Err'
  readonly error: E
}

export type IResult<T, E> = IOk<T, E> | IErr<E, T>

export type IAsyncResult<T, E> = Promise<IResult<T, E>>
