import type { AsyncResult, Result } from './types'
import type { ErrTuple, ErrUnion, OkTuple, OkUnion, SettledTuple } from './types/inference'
import type { SettledResult } from './types/settled'

import { TAG } from './brand'
import { Err } from './err'
import { Ok } from './ok'
import { ensureError, isEmptyArray, ResultTypeError } from './utils'

// #region Type Guards

/**
 * Checks if a value is an Ok Result instance.
 *
 * @group Type Guards
 *
 * @see {@link isErr} for the opposite check
 *
 * @param {unknown} value - Value to check
 * @returns {boolean} true if the value is an Ok Result instance
 *
 * @example
 * Result.isOk(Result.ok(1))       // => true
 * Result.isOk(Result.err('fail')) // => false
 *
 */
function isOk(value: unknown): value is Ok<unknown, never> {
  return value != null && typeof value === 'object' && '_tag' in value && value._tag === TAG.Ok
}

/**
 * Checks if a value is an Err Result instance.
 *
 * @group Type Guards
 *
 * @see {@link isOk} for the opposite check
 *
 * @param {unknown} value - Value to check
 * @returns {boolean} true if the value is an Err Result instance
 *
 * @example
 * Result.isErr(Result.err('fail')) // => true
 * Result.isErr(Result.ok(1))       // => false
 */
function isErr(value: unknown): value is Err<never, unknown> {
  return value != null && typeof value === 'object' && '_tag' in value && value._tag === TAG.Err
}

/**
 * Checks if a value is a Result instance (Ok or Err).
 *
 * @group Type Guards
 *
 * @see {@link isOk} and {@link isErr} for specific checks
 *
 * @param {unknown} value - Value to check
 * @returns {boolean} true if the value is a Result instance
 *
 * @example
 * // Result values
 * Result.isResult(Result.ok(1))        // => true
 * Result.isResult(Result.err('fail'))  // => true
 *
 * @example
 * // Non-Result values
 * Result.isResult(42)                  // => false
 * Result.isResult('hello')             // => false
 * Result.isResult({ ok: 1 })           // => false
 * Result.isResult(null)                // => false
 * Result.isResult(undefined)           // => false
 */
function isResult(value: unknown): value is Result<unknown, unknown> {
  return (
    value != null &&
    typeof value === 'object' &&
    '_tag' in value &&
    (value._tag === TAG.Ok || value._tag === TAG.Err)
  )
}

// #endregion

// #region Creation

/**
 * Creates a success Result containing a value.
 *
 * @group Creation
 *
 * @see {@link err} for error creation
 *
 * @template T - Success value type
 *
 * @param {T} value - Success value to encapsulate
 * @returns {Ok<T, never>} An Ok Result containing the value
 *
 * @example
 * // With primitives
 * Result.ok(42)      // => Ok(42)
 * Result.ok('hello') // => Ok('hello')
 *
 * @example
 * // In functions
 * function divide(a: number, b: number): Result<number, string> {
 *   if (b === 0) return Result.err('division by zero')
 *   return Result.ok(a / b)
 * }
 *
 * @example
 * // With complex types
 * interface User { id: number; name: string }
 * const user: User = { id: 1, name: 'John' }
 * Result.ok(user)
 * // => Ok({ id: 1, name: 'John' })
 */
function ok<T>(value: T): Ok<T, never> {
  return new Ok(value)
}

/**
 * Creates an error Result containing an error.
 *
 * @group Creation
 *
 * @see {@link ok} for success creation
 *
 * @template E - Error type
 *
 * @param {E} error - Error to encapsulate
 * @returns {Err<never, E>} An Err Result containing the error
 *
 * @example
 * // With native Error
 * Result.err(new Error('something went wrong'))
 * // => Err(Error: 'something went wrong')
 *
 * @example
 * // With string
 * function validate(age: number): Result<number, string> {
 *   if (age < 0) return Result.err('age cannot be negative')
 *   if (age > 150) return Result.err('invalid age')
 *
 *   return Result.ok(age)
 * }
 *
 * @example
 * // With custom types
 * type ValidationError = { field: string; message: string }
 * const result = Result.err<number, ValidationError>({
 *   field: 'email',
 *   message: 'invalid format'
 * })
 */
function err<E = Error>(error: E): Err<never, E> {
  return new Err(error)
}

/**
 * Wraps function execution in a Result, capturing exceptions.
 *
 * @group Creation
 *
 * @overload
 *
 * @see {@link fromPromise} - Wraps a Promise in a Result
 *
 * @template T - Return value type
 *
 * @param {() => T} executor - Function to execute
 * @returns {Result<T, Error>} Ok with return value or Err if throws exception
 *
 * @example
 * // JSON parsing
 * Result.fromTry(() => JSON.parse('{"name":"John"}'))
 * // => Ok({name: "John"})
 * Result.fromTry(() => JSON.parse('invalid json'))
 * // => Err(SyntaxError: ...)
 *
 * @example
 * // Operations that can fail
 * const result = Result.fromTry(() => {
 *   const file = readFileSync('config.json', 'utf-8')
 *   return JSON.parse(file)
 * })
 */
function fromTry<T>(executor: () => T): Result<T, Error>

/**
 * Wraps function execution in Result with custom error transformation.
 *
 * @group Creation
 *
 * @overload
 *
 * @see {@link fromPromise} - Wraps a Promise in a Result
 *
 * @template T - Return value type
 * @template E - Error type
 *
 * @param {() => T} executor - Function to execute
 * @param {(error: unknown) => E} catchErr - Function that transforms the caught exception
 * @returns {Result<T, E>} Ok with return or Err with custom error
 *
 * @example
 * // Custom typed error
 * type ParseError = { type: 'parse_error'; input: string }
 * const result = Result.fromTry(
 *   () => JSON.parse(input),
 *   (): ParseError => ({ type: 'parse_error', input })
 * )
 *
 * @example
 * // Enriching the error
 * const config = Result.fromTry(
 *   () => loadConfig(),
 *   (err) => new Error(`Failed to load config: ${err}`)
 * )
 */
function fromTry<T, E>(executor: () => T, catchErr: (error: unknown) => E): Result<T, E>

function fromTry<T, E = Error>(
  executor: () => T,
  onError?: (error: unknown) => E,
): Result<T, E | Error> {
  try {
    return new Ok(executor())
  } catch (error) {
    return new Err(onError ? onError(error) : ensureError(error))
  }
}

/**
 * Wraps async function execution in Result, capturing rejections.
 *
 * @group Creation
 *
 * @overload
 *
 * @see {@link fromTry} - Wraps a function in a Result
 *
 * @template T - Resolved value type
 *
 * @param {() => Promise<T>} executor - Async function to execute
 * @returns {AsyncResult<T, Error>} Promise of Ok with value or Err if rejects
 *
 * @example
 * // Fetch API
 * await Result.fromPromise(async () => {
 *   const res = await fetch('https://jsonplaceholder.typicode.com/todos/1')
 *   return res.json()
 * })
 * // => Ok({ userId: 1, id: 1, title: 'delectus aut autem', ... })
 *
 * @example
 * // Async file I/O
 * await Result.fromPromise(
 *   () => fs.promises.readFile('file.txt', 'utf-8')
 * )
 * // => Ok('Hello world')
 */
function fromPromise<T>(executor: () => Promise<T>): AsyncResult<T, Error>

/**
 * Wraps Promise in Result with custom error transformation.
 *
 * @group Creation
 *
 * @overload
 *
 * @see {@link fromTry} - Wraps a function in a Result
 *
 * @template T - Resolved value type
 * @template E - Error type
 *
 * @param {() => Promise<T>} executor - Async function to execute
 * @param {(error: unknown) => E} catchErr - Function that transforms the rejection error
 * @returns {AsyncResult<T, E>} Promise of Ok or Err with custom error
 *
 * @example
 * // Contextualizing errors
 * const user = await Result.fromPromise(
 *   () => fetchUser(id),
 *   (err) => new Error(`Failed to fetch user ${id}: ${err}`)
 * )
 */
function fromPromise<T, E>(
  executor: () => Promise<T>,
  catchErr: (error: unknown) => E,
): AsyncResult<T, E>

async function fromPromise<T, E>(
  executor: () => Promise<T>,
  catchErr?: (error: unknown) => E,
): AsyncResult<T, E | Error> {
  try {
    return new Ok(await executor())
  } catch (error) {
    return new Err(catchErr ? catchErr(error) : ensureError(error))
  }
}

/**
 * Creates a Result from a value that may be null or undefined.
 *
 * @group Creation
 *
 * @overload
 *
 * @template T - Value type
 *
 * @param {T | null | undefined} value - Possibly null/undefined value
 * @returns {Result<NonNullable<T>, Error>} Ok if defined, Err with default error (includes value as cause)
 *
 * @example
 * Result.fromNullable(42)
 * // => Ok(42)
 * Result.fromNullable(null)
 * // => Err(Error: Value is null or undefined)
 *
 * @example
 * // Practical usage with find
 * const users = [{ id: 1, name: 'Ana' }, { id: 2, name: 'Bob' }]
 * const user = Result.fromNullable(
 *   users.find((u) => u.id === 3)
 * )
 * // => Err(Error: Value is null or undefined)
 */
function fromNullable<T>(value: T | null | undefined): Result<NonNullable<T>, Error>

/**
 * Creates a Result from nullable value with custom error.
 *
 * @group Creation
 *
 * @overload
 *
 * @template T - Value type
 * @template E - Error type
 *
 * @param {T | null | undefined} value - Possibly null/undefined value
 * @param {() => E} onError - Function that generates custom error
 * @returns {Result<NonNullable<T>, E>} Ok if defined, Err with custom error if null/undefined
 *
 * @example
 * // With personalized error
 * const config = Result.fromNullable(
 *   process.env.API_KEY,
 *   () => new Error('API_KEY not configured')
 * )
 *
 * @example
 * // With custom error type
 * type NotFoundError = { code: 'NOT_FOUND'; resource: string }
 * const user = Result.fromNullable(
 *   userMap.get(userId),
 *   (): NotFoundError => ({ code: 'NOT_FOUND', resource: 'user' })
 * )
 */
function fromNullable<T, E>(value: T | null | undefined, onNull: () => E): Result<NonNullable<T>, E>

function fromNullable<T, E = Error>(
  value: T | null | undefined,
  onNull?: () => E,
): Result<NonNullable<T>, E | Error> {
  if (value == null) {
    return new Err(onNull ? onNull() : new Error('Value is null or undefined', { cause: value }))
  }

  return new Ok(value as NonNullable<T>)
}

/**
 * Creates a Result by validating a value with a predicate function.
 *
 * @group Creation
 *
 * @overload
 *
 * @template T - Value type
 *
 * @param {T} value - Value to validate
 * @param {(value: T) => boolean} condition - Function that validates the value
 * @returns {Result<T, Error>} Ok if valid, Err with default error if invalid
 *
 * @example
 * // Simple validation
 * Result.validate(42, (x) => x > 40)  // => Ok(42)
 * Result.validate(42, (x) => x  < 18)
 * // => Err(Error: 'Validation failed for value: 42')
 */
function validate<T>(value: T, condition: (value: T) => boolean): Result<T, Error>

/**
 * Creates a Result by validating a value with predicate and custom error.
 *
 * @group Creation
 *
 * @overload
 *
 * @template T - Value type
 * @template E - Error type
 *
 * @param {T} value - Value to validate
 * @param {(value: T) => boolean} condition - Function that validates the value
 * @param {(value: T) => E} onFailure - Function that generates custom error on rejection
 * @returns {Result<T, E>} Ok if valid, Err with custom error if invalid
 *
 * @example
 * // With personalized error message
 * const age = Result.validate(
 *   42,
 *   (x) => x < 40,
 *   (e) => new Error(`${e} is too small`)
 * )
 * // Err(Error: '42 is too small')
 */
function validate<T, E>(
  value: T,
  condition: (value: T) => boolean,
  onFailure: (value: T) => E,
): Result<T, E>

function validate<T, E = Error>(
  value: T,
  condition: (value: T) => boolean,
  onFailure?: (value: T) => E | Error,
): Result<T, E | Error> {
  if (!condition(value)) {
    return new Err(
      onFailure ? onFailure(value) : new Error('Validation failed for value', { cause: value }),
    )
  }

  return new Ok(value)
}

// #endregion

// #region Collections

/**
 * Combines multiple Results into a single Result containing tuple of values.
 * Short-circuits on the first Err encountered.
 *
 * @group Collections
 *
 * @see {@link allSettled} - Combines multiple Results into a single Result containing tuple of results
 *
 * @template T - Results tuple type
 *
 * @param {T} results - Array of Results
 * @returns {Result<OkTuple<T>, ErrUnion<T>>} Ok with tuple of values or first Err
 *
 * @example
 * // All Ok
 * Result.all([Result.ok(1), Result.ok('two'), Result.ok(true)])
 * // => Ok([1, "two", true])
 *
 * @example
 * // With Err - returns first error
 * Result.all([Result.ok(1), Result.err('error 1'), Result.err('error 2')])
 * // => Err("error 1")
 *
 * @example
 * // Empty array
 * Result.all([])  // => Ok([])
 */
function all<const T extends readonly Result<unknown, unknown>[]>(
  results: T,
): Result<OkTuple<T>, ErrUnion<T>> {
  if (isEmptyArray(results)) {
    return new Ok([]) as Result<OkTuple<T>, ErrUnion<T>>
  }

  const okValues: unknown[] = []

  for (const [i, result] of results.entries()) {
    if (!isResult(result)) {
      throw new ResultTypeError(
        `Result.all() received an invalid value at index [${i}]: expected a Result, got "${typeof result}"`,
        result,
      )
    }

    if (result.isErr()) {
      return result as Result<OkTuple<T>, ErrUnion<T>>
    }

    okValues.push(result.unwrap())
  }

  return new Ok(okValues) as Result<OkTuple<T>, ErrUnion<T>>
}

/**
 * Collects the status of all Results without failing.
 * Similar to Promise.allSettled().
 *
 * @group Collections
 *
 * @see {@link all} - Combines multiple Results into a single Result containing tuple of values
 *
 * @template T - Results tuple type
 *
 * @param {T} results - Array of Results
 * @returns {Ok<SettledTuple<T>>} Always Ok containing an array of status objects
 *
 * @example
 * // Mix of Ok and Err
 * const res = Result.allSettled([Result.ok(1), Result.err('fail')])
 * const settled = res.unwrap()
 * // => [{ status: 'ok', value: 1 }, { status: 'err', reason: 'fail' }]
 *
 * @example
 * // Empty array
 * Result.allSettled([]) // => Ok([])
 */
function allSettled<const T extends readonly Result<unknown, unknown>[]>(
  results: T,
): Ok<SettledTuple<T>> {
  if (isEmptyArray(results)) {
    return new Ok([]) as Ok<SettledTuple<T>>
  }

  const settledResults: SettledResult<OkUnion<T>, ErrUnion<T>>[] = []

  for (const [i, result] of results.entries()) {
    if (!isResult(result)) {
      throw new ResultTypeError(
        `Result.allSettled() received an invalid value at index [${i}]: expected a Result, got "${typeof result}"`,
        result,
      )
    }

    result.isOk()
      ? settledResults.push({
          status: 'ok',
          value: result.unwrap() as OkUnion<T>,
        })
      : settledResults.push({
          status: 'err',
          reason: result.unwrapErr() as ErrUnion<T>,
        })
  }

  return new Ok(settledResults) as Ok<SettledTuple<T>>
}

/**
 * Returns the first Ok Result, or all errors if none is Ok.
 *
 * @group Collections
 *
 * @see {@link all} - Combines multiple Results into a single Result containing tuple of values
 *
 * @template T - Results tuple type
 *
 * @param {T} results - Array of Results
 * @returns {Result<OkUnion<T>, ErrTuple<T>>} First Ok or Err with array of all errors
 *
 * @example
 * // All Err
 * Result.any([Result.err('error 1'), Result.err('error 2'), Result.err('error 3')])
 * // => Err(["error 1", "error 2", "error 3"])
 *
 * @example
 * // First Ok
 * Result.any([Result.err('error 1'), Result.ok(42), Result.ok(99)])
 * // => Ok(42)
 *
 * @example
 * // Empty array
 * Result.any([]) // => Err([])
 */
function any<const T extends readonly Result<unknown, unknown>[]>(
  results: T,
): Result<OkUnion<T>, ErrTuple<T>> {
  if (isEmptyArray(results)) {
    return new Err([]) as Result<OkUnion<T>, ErrTuple<T>>
  }

  const errorValues: unknown[] = []

  for (const [i, result] of results.entries()) {
    if (!isResult(result)) {
      throw new ResultTypeError(
        `Result.any() received an invalid value at index [${i}]: expected a Result, got "${typeof result}"`,
        result,
      )
    }

    if (result.isOk()) {
      return result as Result<OkUnion<T>, ErrTuple<T>>
    }

    errorValues.push(result.unwrapErr())
  }

  return new Err(errorValues) as Result<OkUnion<T>, ErrTuple<T>>
}

/**
 * Separates Results into two arrays: successes and failures.
 *
 * @group Collections
 *
 * @see {@link all} - Combines multiple Results into a single Result containing tuple of values
 * @see {@link values} - Collects the values of all Results
 * @see {@link errors} - Collects the errors of all Results
 *
 * @template T - Success value type
 * @template E - Error type
 *
 * @param {readonly Result<T, E>[]} results - Array of Results
 * @returns {readonly [T[], E[]]} Tuple of successes and failures
 *
 * @example
 * // Partitioning results
 * const operations = [Result.ok(1), Result.err('failure A'), Result.ok(2), Result.err('failure B')]
 * const [oks, errors] = Result.partition(operations)
 * // => [[1, 2], ["failure A", "failure B"]]
 *
 * @example
 * // Empty array
 * Result.partition([]) // => [[], []]
 */
function partition<T, E>(results: readonly Result<T, E>[]): [T[], E[]] {
  if (isEmptyArray(results)) {
    return [[], []]
  }

  const oks: T[] = []
  const errs: E[] = []

  for (const [i, result] of results.entries()) {
    if (!isResult(result)) {
      throw new ResultTypeError(
        `Result.partition() received an invalid value at index [${i}]: expected a Result, got "${typeof result}"`,
        result,
      )
    }

    result.isOk() ? oks.push(result.unwrap()) : errs.push(result.unwrapErr())
  }

  return [oks, errs]
}

/**
 * Extracts only the success values from an array of Results.
 *
 * @group Collections
 *
 * @see {@link errors} - Extracts only the errors from an array of Results
 *
 * @template T - Success value type
 * @template E - Error type
 *
 * @param {readonly Result<T, E>[]} results - Array of Results
 * @returns {T[]} Array containing only Ok values
 *
 * @example
 * // Extracting values
 * Result.values([Result.ok(1), Result.err('fail'), Result.ok(2)])
 * // => Ok([1, 2])
 *
 * @example
 * // Empty array
 * Result.values([]) // => []
 */
function values<T, E>(results: readonly Result<T, E>[]): T[] {
  if (isEmptyArray(results)) {
    return []
  }

  const oks: T[] = []

  for (const [i, result] of results.entries()) {
    if (!isResult(result)) {
      throw new ResultTypeError(
        `Result.values() received an invalid value at index [${i}]: expected a Result, got "${typeof result}"`,
        result,
      )
    }

    if (result.isOk()) {
      oks.push(result.unwrap())
    }
  }

  return oks
}

/**
 * Extracts only the errors from an array of Results.
 *
 * @group Collections
 *
 * @template T - Success value type
 * @template E - Error type
 *
 * @param {readonly Result<T, E>[]} results - Array of Results
 * @returns {E[]} Array containing only errors
 *
 * @example
 * // Extracting errors
 * Result.errors([Result.ok(1), Result.err('fail A'), Result.ok(2), Result.err('fail B')])
 * // => Err(["fail A", "fail B"])
 *
 * @example
 * // Empty array
 * Result.errors([])  // => []
 */
function errors<T, E>(results: readonly Result<T, E>[]): E[] {
  if (isEmptyArray(results)) {
    return []
  }

  const errs: E[] = []

  for (const [i, result] of results.entries()) {
    if (!isResult(result)) {
      throw new ResultTypeError(
        `Result.errors() received an invalid value at index [${i}]: expected a Result, got "${typeof result}"`,
        result,
      )
    }

    if (result.isErr()) {
      errs.push(result.unwrapErr())
    }
  }

  return errs
}

// #endregion

// biome-ignore format: off
export default {
  // Type guards
  isOk,
  isErr,
  isResult,
  // Creation
  ok,
  err,
  fromTry,
  fromNullable,
  fromPromise,
  validate,
  // Collection
  all,
  allSettled,
  any,
  partition,
  values,
  errors,
}
