import { Err } from './err.js'
import { Ok } from './ok.js'
import type {
  AsyncResultType,
  ErrTuple,
  ErrUnion,
  OkTuple,
  OkUnion,
  ResultType,
  SettledResult,
} from './types.js'

import { unknownToError } from './utils.js'

// #region CREATION

/**
 * Creates Ok Result with value.
 *
 * @group Creation
 * @template T - Success value type
 * @template E - Error type
 * @param {T} value - Success value
 * @returns {Ok<T, E>} Ok Result
 * @example
 * ```ts
 * Result.ok(42)
 * // Ok(42)
 * ```
 */
function createOk<T, E = never>(value: T): Ok<T, E> {
  return new Ok(value)
}

/**
 * Creates Err Result with error.
 *
 * @group Creation
 * @template T - Success value type
 * @template E - Error type
 * @param {E} error - Error value
 * @returns {Err<T, E>} Err Result
 * @example
 * ```ts
 * Result.err(new Error("fail"))
 * // Err(Error: fail)
 * ```
 */
function createErr<T = never, E = Error>(error: E): Err<T, E> {
  return new Err(error)
}

// #endregion

// #region CONDITIONAL CREATION

/**
 * Creates Result by validating value with predicate.
 *
 * @overload
 * @group Conditional Creation
 * @template T - Value type
 * @param {T} value - Value to validate
 * @param {(value: T) => boolean} predicate - Validation function
 * @returns {ResultType<T, Error>} Ok if valid, Err otherwise
 * @example
 * ```ts
 * Result.validate(10, (x) => x > 5)
 * // Ok(10)
 *
 * Result.validate(3, (x) => x > 5)
 * // Err(Error: Validation failed for value: 3)
 * ```
 */
function createValidate<T>(value: T, predicate: (value: T) => boolean): ResultType<T, Error>

/**
 * Creates Result by validating value with custom error.
 *
 * @overload
 * @group Conditional Creation
 * @template T - Value type
 * @template E - Error type
 * @param {T} value - Value to validate
 * @param {(value: T) => boolean} predicate - Validation function
 * @param {(value: T) => E} onError - Error generator for rejection
 * @returns {ResultType<T, E>} Ok if valid, Err with custom error otherwise
 * @example
 * ```ts
 * Result.validate(
 *   10,
 *   (x) => x > 5,
 *   (x) => new Error(`Value ${x} is not greater than 5`)
 * )
 * // Ok(10)
 *
 * Result.validate(
 *   3,
 *   (x) => x > 5,
 *   (x) => new Error(`Value ${x} is not greater than 5`)
 * )
 * // Err(Error: Value 3 is not greater than 5)
 * ```
 */
function createValidate<T, E>(
  value: T,
  predicate: (value: T) => boolean,
  onError: (value: T) => E
): ResultType<T, E>

function createValidate<T, E = Error>(
  value: T,
  predicate: (value: T) => boolean,
  onError?: (value: T) => E | Error
): ResultType<T, E | Error> {
  if (!predicate(value)) {
    const mappedError = onError
      ? onError(value)
      : new Error(`Validation failed for value: ${value}`)
    return new Err(mappedError)
  }

  return new Ok(value)
}

/**
 * Creates Result from nullable value.
 *
 * @overload
 * @group Conditional Creation
 * @template T - Value type
 * @param {T | null | undefined} value - Nullable value
 * @returns {ResultType<NonNullable<T>, Error>} Ok if defined, Err otherwise
 * @example
 * ```ts
 * Result.fromNullable(42)
 * // Ok(42)
 *
 * Result.fromNullable(null)
 * // Err(Error: Value is null or undefined)
 * ```
 */
function createFromNullable<T>(value: T | null | undefined): ResultType<NonNullable<T>, Error>

/**
 * Creates Result from nullable value with custom error.
 *
 * @overload
 * @group Conditional Creation
 * @template T - Value type
 * @template E - Error type
 * @param {T | null | undefined} value - Nullable value
 * @param {() => E} onError - Error generator
 * @returns {ResultType<NonNullable<T>, E>} Ok if defined, Err with custom error otherwise
 * @example
 * ```ts
 * Result.fromNullable(
 *   42,
 *   () => new Error('Custom error')
 * )
 * // Ok(42)
 *
 * Result.fromNullable(
 *   null,
 *   () => new Error('Custom error')
 * )
 * // Err(Error: Custom error)
 * ```
 */
function createFromNullable<T, E>(
  value: T | null | undefined,
  onError: () => E
): ResultType<NonNullable<T>, E>

function createFromNullable<T, E = Error>(
  value: T | null | undefined,
  onError?: () => E
): ResultType<NonNullable<T>, E | Error> {
  if (value === null || value === undefined) {
    const mappedError = onError ? onError() : new Error('Value is null or undefined')
    return new Err(mappedError)
  }

  return new Ok(value)
}

// #endregion

// #region VALIDATION

/**
 * Checks if value is a Result instance.
 *
 * @group Validation
 * @param {unknown} value - Value to check
 * @returns {boolean} True if value is Result
 * @example
 * Result.isResult(Result.ok(1))
 * // true
 *
 * Result.isResult(42)
 * // false
 */
function createIsResult(value: unknown): value is ResultType<unknown, unknown> {
  return value instanceof Ok || value instanceof Err
}

// #endregion

// #region CONVERSION

/**
 * Wraps function execution in Result.
 *
 * @overload
 * @group Conversion
 * @template T - Return value type
 * @param {() => T} executor - Function to execute
 * @returns {ResultType<T, Error>} Ok with return value or Err if throws
 * @example
 * Result.fromTry(
 *   () => JSON.parse('{"a":1}')
 * )
 * // Ok({a: 1})
 *
 * Result.fromTry(
 *   () => JSON.parse('invalid')
 * )
 * // Err(SyntaxError: JSON Parse error: Unexpected identifier "invalid")
 */
function createFromTry<T>(executor: () => T): ResultType<T, Error>

/**
 * Wraps function execution in Result with custom error handler.
 *
 * @overload
 * @group Conversion
 * @template T - Return value type
 * @template E - Error type
 * @param {() => T} executor - Function to execute
 * @param {(error: unknown) => E} onError - Error transformer
 * @returns {ResultType<T, E>} Ok with return value or Err with custom error
 * @example
 * ```ts
 * Result.fromTry(
 *   () => JSON.parse('invalid'),
 *   (e) => new Error("Custom error")
 * )
 * // Err(Error: Custom error)
 * ```
 */
function createFromTry<T, E>(executor: () => T, onError: (error: unknown) => E): ResultType<T, E>

function createFromTry<T, E>(
  executor: () => T,
  onError?: (error: unknown) => E
): ResultType<T, E | Error> {
  try {
    const value = executor()
    return new Ok(value)
  } catch (error) {
    const mappedError = onError ? onError(error) : unknownToError(error)
    return new Err(mappedError)
  }
}

// #endregion

// #region ASYNC CONVERSION

/**
 * Wraps async function execution in Result.
 *
 * @overload
 * @group Async Conversion
 * @template T - Return value type
 * @param {() => Promise<T>} executor - Async function to execute
 * @returns {AsyncResultType<T, Error>} Promise of Ok or Err
 * @example
 * ```ts
 * await Result.fromPromise(
 *   async () => fetch('/api')
 * )
 * // Ok(response) or Err(Error: Network error)
 * ```
 */
async function createFromPromise<T>(executor: () => Promise<T>): AsyncResultType<T, Error>

/**
 * Wraps async function execution with custom error handler.
 *
 * @overload
 * @group Async Conversion
 * @template T - Return value type
 * @template E - Error type
 * @param {() => Promise<T>} executor - Async function to execute
 * @param {(error: unknown) => E} onError - Error transformer
 * @returns {AsyncResultType<T, E>} Promise of Ok or Err with custom error
 * @example
 * ```ts
 * await Result.fromPromise(
 *   async () => fetch('/api'),
 *   (e) => new Error("Custom error")
 * )
 * // Ok(response) or Err(Error: Custom error)
 * ```
 */
async function createFromPromise<T, E>(
  executor: () => Promise<T>,
  onError: (error: unknown) => E
): AsyncResultType<T, E>

async function createFromPromise<T, E>(
  executor: () => Promise<T>,
  onError?: (error: unknown) => E
): AsyncResultType<T, E | Error> {
  try {
    const value = await executor()
    return new Ok(value)
  } catch (error) {
    const mappedError = onError ? onError(error) : unknownToError(error)
    return new Err(mappedError)
  }
}

// #endregion

// #region COLLECTIONS

/**
 * Combines multiple Results into single Result with tuple.
 *
 * @group Collections
 * @template T - Results tuple type
 * @param {T} results - Array of Results
 * @returns {ResultType<OkTuple<T>, ErrUnion<T>>} Ok with all values or first Err
 * @example
 * ```ts
 * Result.all([Result.ok(1), Result.ok(2)])
 * // Ok([1, 2])
 *
 * Result.all([Result.ok(1), Result.err("fail")])
 * // Err("fail")
 *
 * Result.all([])
 * // Ok([])
 * ```
 */
function createAll<const T extends readonly ResultType<unknown, unknown>[]>(
  results: T
): ResultType<OkTuple<T>, ErrUnion<T>> {
  if (results.length === 0) {
    return new Ok([]) as Ok<OkTuple<T>, never>
  }

  const okValues: unknown[] = []

  for (const result of results) {
    if (result.isErr()) {
      return result as Err<never, ErrUnion<T>>
    }

    okValues.push(result.unwrap())
  }

  return new Ok(okValues) as Ok<OkTuple<T>, never>
}

/**
 * Collects Results with their status.
 * Unlike all(), this never fails - always returns Ok.
 *
 * @group Collections
 * @template T - Results tuple type
 * @param {T} results - Array of Results
 * @returns {Ok<SettledResult<OkUnion<T>, ErrUnion<T>>[]>} Always Ok with status array
 * @example
 * ```ts
 * Result.allSettled([Result.ok(1), Result.err("fail")])
 * // Ok([{status: 'ok', value: 1}, {status: 'err', reason: "fail"}])
 *
 * Result.allSettled([])
 * // Ok([])
 * ```
 */
function createAllSettled<const T extends readonly ResultType<unknown, unknown>[]>(
  results: T
): Ok<SettledResult<OkUnion<T>, ErrUnion<T>>[]> {
  if (results.length === 0) {
    return new Ok([])
  }

  const settledResults = results.map((result): SettledResult<OkUnion<T>, ErrUnion<T>> => {
    return result.isOk()
      ? { status: 'ok', value: result.unwrap() as OkUnion<T> }
      : { status: 'err', reason: result.unwrapErr() as ErrUnion<T> }
  })

  return new Ok(settledResults)
}

/**
 * Returns first Ok or all errors.
 *
 * @group Collections
 * @template T - Results tuple type
 * @param {T} results - Array of Results
 * @returns {ResultType<OkUnion<T>, ErrTuple<T>>} First Ok or Err with all errors
 * @example
 * ```ts
 * Result.any([Result.err("a"), Result.ok(2)])
 * // Ok(2)
 *
 * Result.any([Result.err("a"), Result.err("b")])
 * // Err(["a", "b"])
 *
 * Result.any([])
 * // Err([])
 * ```
 */
function createAny<const T extends readonly ResultType<unknown, unknown>[]>(
  results: T
): ResultType<OkUnion<T>, ErrTuple<T>> {
  if (results.length === 0) {
    return new Err([]) as Err<never, ErrTuple<T>>
  }

  const errorValues: unknown[] = []

  for (const result of results) {
    if (result.isOk()) {
      return result as Ok<OkUnion<T>, never>
    }

    errorValues.push(result.unwrapErr())
  }

  return new Err(errorValues) as Err<never, ErrTuple<T>>
}

/**
 * Partitions Results into successes and failures.
 *
 * @group Collections
 * @template T - Success value type
 * @template E - Error type
 * @param {readonly ResultType<T, E>[]} results - Array of Results
 * @returns {readonly [T[], E[]]} Tuple of [ok values, errors]
 * @example
 * ```ts
 * Result.partition([Result.ok(1), Result.err("fail"), Result.ok(2)])
 * // [[1, 2], ["fail"]]
 *
 * Result.partition([Result.ok(1), Result.ok(2)])
 * // [[1, 2], []]
 *
 * Result.partition([])
 * // [[], []]
 * ```
 */
function createPartition<T, E>(results: readonly ResultType<T, E>[]): readonly [T[], E[]] {
  if (results.length === 0) {
    return [[], []] as const
  }

  const oks: T[] = []
  const errs: E[] = []

  for (const result of results) {
    if (result.isOk()) {
      oks.push(result.unwrap())
    } else {
      errs.push(result.unwrapErr())
    }
  }

  return [oks, errs] as const
}

// #endregion

export {
  createAll,
  createAllSettled,
  createAny,
  createErr,
  createFromNullable,
  createFromPromise,
  createFromTry,
  createIsResult,
  createOk,
  createPartition,
  createValidate,
}

// export const all = createAll
// export const allSettled = createAllSettled
// export const any = createAny
// export const err = createErr
// export const fromNullable = createFromNullable
// export const fromPromise = createFromPromise
// export const fromTry = createFromTry
// export const isResult = createIsResult
// export const ok = createOk
// export const partition = createPartition
// export const validate = createValidate

// export const factories = {
//   all: createAll,
//   allSettled: createAllSettled,
//   any: createAny,
//   err: createErr,
//   fromNullable: createFromNullable,
//   fromPromise: createFromPromise,
//   fromTry: createFromTry,
//   isResult: createIsResult,
//   ok: createOk,
//   partition: createPartition,
//   validate: createValidate,
// }
