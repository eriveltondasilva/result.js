import type {
  AsyncResult,
  ErrTuple,
  ErrUnion,
  Err as IErr,
  Ok as IOk,
  Result as IResult,
  OkTuple,
  OkUnion,
  SettledResult,
} from './types'

import { Err } from './err'
import { Ok } from './ok'
import { ensureError, formatForDisplay } from './utils'

// #region TYPE GUARDS: isOk, isErr, isResult

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
 * // Basic checking
 * Result.isOk(Result.ok(1))        // => true
 * Result.isOk(Result.err('fail'))  // => false
 *
 */
function isOk<T>(value: unknown): value is IOk<T, never> {
  return value != null && typeof value === 'object' && '_tag' in value && value._tag === 'Ok'
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
 * // Basic checking
 * Result.isErr(Result.err('fail'))  // => true
 * Result.isErr(Result.ok(1))        // => false
 */
function isErr<E>(value: unknown): value is IErr<never, E> {
  return value != null && typeof value === 'object' && '_tag' in value && value._tag === 'Err'
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
 * // Basic checking
 * Result.isResult(Result.ok(1))        // => true
 * Result.isResult(Result.err('fail'))  // => true
 *
 * // Non-Result values
 * Result.isResult(42)                  // => false
 * Result.isResult('hello')             // => false
 * Result.isResult({ ok: 1 })           // => false
 * Result.isResult(null)                // => false
 * Result.isResult(undefined)           // => false
 */
function isResult<T, E>(value: unknown): value is IResult<T, E> {
  return (
    value != null &&
    typeof value === 'object' &&
    '_tag' in value &&
    (value._tag === 'Ok' || value._tag === 'Err')
  )
}

// #endregion

// #region CREATION: ok, err, fromTry, fromPromise, fromNullable, validate

/**
 * Creates a success Result containing a value.
 *
 * @group Creation
 *
 * @template T - Success value type
 * @template E - Error type (never used in Ok, but needed for typing)
 * @param {T} value - Success value to encapsulate
 * @returns {Ok<T, E>} An Ok Result containing the value
 *
 * @example
 * // Basic usage
 * Result.ok(42)      // => Ok(42)
 * Result.ok('hello') // => Ok('hello')
 *
 * // In functions
 * function divide(a: number, b: number): Result<number, string> {
 *   if (b === 0) return Result.err('division by zero')
 *   return Result.ok(a / b)
 * }
 *
 * // With complex types
 * interface User { id: number; name: string }
 * const user: User = { id: 1, name: 'John' }
 * Result.ok(user)
 * // => Ok({ id: 1, name: 'John' })
 */
function ok<T, E>(value: T): IOk<T, E> {
  return new Ok<T, E>(value)
}

/**
 * Creates an error Result containing an error.
 *
 * @group Creation
 *
 * @template T - Success value type (never used in Err, but needed for typing)
 * @template E - Error type
 * @param {E} error - Error to encapsulate
 * @returns {Err<T, E>} An Err Result containing the error
 *
 * @example
 * // With native Error
 * Result.err(new Error('something went wrong'))
 * // => Err(Error: 'something went wrong')
 *
 * // With string
 * function validate(age: number): Result<number, string> {
 *   if (age < 0) return Result.err('age cannot be negative')
 *   if (age > 150) return Result.err('invalid age')
 *
 *   return Result.ok(age)
 * }
 *
 * // With custom types
 * type ValidationError = { field: string; message: string }
 * const result = Result.err<number, ValidationError>({
 *   field: 'email',
 *   message: 'invalid format'
 * })
 */
function err<E = Error>(error: E): Err<never, E> {
  return new Err<never, E>(error)
}

/**
 * Wraps function execution in a Result, capturing exceptions.
 *
 * @group Creation
 *
 * @overload
 *
 * @template T - Return value type
 * @param {() => T} executor - Function to execute
 * @returns {IResult<T, Error>} Ok with return value or Err if throws exception
 *
 * @example
 * // JSON parsing
 * Result.fromTry(() => JSON.parse('{"name":"John"}'))
 * // => Ok({name: "John"})
 *
 * Result.fromTry(() => JSON.parse('invalid json'))
 * // => Err(SyntaxError: ...)
 *
 * // Operations that can fail
 * const result = Result.fromTry(() => {
 *   const file = readFileSync('config.json', 'utf-8')
 *   return JSON.parse(file)
 * })
 */

/**
 * Wraps function execution in Result with custom error transformation.
 *
 * @overload
 * @group Creation
 * @template T - Return value type
 * @template E - Error type
 * @param {() => T} executor - Function to execute
 * @param {(error: unknown) => E} onError - Function that transforms the caught exception
 * @returns {IResult<T, E>} Ok with return or Err with custom error
 *
 * @example
 * // Custom typed error
 * type ParseError = { type: 'parse_error'; input: string }
 * const result = Result.fromTry(
 *   () => JSON.parse(input),
 *   (): ParseError => ({ type: 'parse_error', input })
 * )
 *
 * // Enriching the error
 * const config = Result.fromTry(
 *   () => loadConfig(),
 *   (err) => new Error(`Failed to load config: ${err}`)
 * )
 */
function fromTry<T, E = Error>(
  executor: () => T,
  onError?: (error: unknown) => E,
): IResult<T, E | Error> {
  try {
    return new Ok(executor())
  } catch (error) {
    return new Err(onError ? onError(error) : ensureError(error))
  }
}

/**
 * Wraps async function execution in Result, capturing rejections.
 *
 * Converts Promises that may reject into Results, allowing explicit
 * handling without try/catch or .catch().
 *
 * @overload
 * @group Creation
 * @template T - Resolved value type
 * @param {() => Promise<T>} executor - Async function to execute
 * @returns {AsyncResult<T, Error>} Promise of Ok with value or Err if rejects
 *
 * @example
 * // Fetch API
 * await Result.fromPromise(async () => {
 *   const res = await fetch('https://jsonplaceholder.typicode.com/todos/1')
 *   return res.json()
 * })
 *
 * // Chained async operations
 * await Result.fromPromise(async () => {
 *   const data = await db.query('SELECT * FROM users WHERE id = ?', [id])
 *   if (!data[0]) throw new Error('User not found')
 *   return data[0].json()
 * })
 *
 * // Async file I/O
 * await Result.fromPromise(
 *   () => fs.promises.readFile('file.txt', 'utf-8')
 * )
 */
async function fromPromise<T>(executor: () => Promise<T>): AsyncResult<T, Error>

/**
 * Wraps Promise in Result with custom error transformation.
 *
 * @overload
 * @group Creation
 *
 * @template T - Resolved value type
 * @template E - Error type
 * @param {() => Promise<T>} executor - Async function to execute
 * @param {(error: unknown) => E} onError - Function that transforms the rejection error
 * @returns {AsyncResult<T, E>} Promise of Ok or Err with custom error
 *
 * @example
 * // Typed error
 * type NetworkError = { type: 'network'; status?: number }
 * const data = await Result.fromPromise(
 *   () => fetch('https://jsonplaceholder.typicode.com/todos/1').then(r => r.json()),
 *   (err): NetworkError => ({
 *     type: 'network',
 *     status: err instanceof Response ? err.status : undefined
 *   })
 * )
 *
 * // Contextualizing errors
 * const user = await Result.fromPromise(
 *   () => fetchUser(id),
 *   (err) => new Error(`Failed to fetch user ${id}: ${err}`)
 * )
 */
async function fromPromise<T, E>(
  executor: () => Promise<T>,
  onError: (error: unknown) => E,
): AsyncResult<T, E>

async function fromPromise<T, E>(
  executor: () => Promise<T>,
  onError?: (error: unknown) => E,
): AsyncResult<T, E | Error> {
  try {
    return new Ok(await executor())
  } catch (error) {
    return new Err(onError ? onError(error) : ensureError(error))
  }
}

/**
 * Creates a Result from a value that may be null or undefined.
 *
 * Useful for working with APIs that return nullable values and you want to
 * force explicit handling of the null/undefined case.
 *
 * @overload
 * @group Creation
 *
 * @template T - Value type
 * @param {T | null | undefined} value - Possibly null/undefined value
 * @returns {IResult<NonNullable<T>, Error>} Ok if defined, Err with default error if null/undefined
 *
 * @example
 * // With present value
 * Result.fromNullable(42)
 * // => Ok(42)
 *
 * // With null
 * Result.fromNullable(null)
 * // => Err(Error: Value is null or undefined)
 *
 * // Practical usage with find
 * const users = [{ id: 1, name: 'Ana' }, { id: 2, name: 'Bob' }]
 * const user = Result.fromNullable(
 *   users.find((u) => u.id === 3)
 * )
 * // => Err(Error: Value is null or undefined)
 */
function fromNullable<T>(value: T | null | undefined): IResult<NonNullable<T>, Error>

/**
 * Creates a Result from nullable value with custom error.
 *
 * @overload
 * @group Creation
 * @template T - Value type
 * @template E - Error type
 * @param {T | null | undefined} value - Possibly null/undefined value
 * @param {() => E} onError - Function that generates custom error
 * @returns {IResult<NonNullable<T>, E>} Ok if defined, Err with custom error if null/undefined
 *
 * @example
 * // With personalized error
 * const config = Result.fromNullable(
 *   process.env.API_KEY,
 *   () => new Error('API_KEY not configured')
 * )
 *
 * // With custom error type
 * type NotFoundError = { code: 'NOT_FOUND'; resource: string }
 * const user = Result.fromNullable(
 *   userMap.get(userId),
 *   (): NotFoundError => ({ code: 'NOT_FOUND', resource: 'user' })
 * )
 */
function fromNullable<T, E>(
  value: T | null | undefined,
  onError: () => E,
): IResult<NonNullable<T>, E>

function fromNullable<T, E = Error>(
  value: T | null | undefined,
  onError?: () => E,
): IResult<NonNullable<T>, E | Error> {
  if (value == null) {
    return new Err(onError ? onError() : new Error('Value is null or undefined'))
  }

  return new Ok(value as NonNullable<T>)
}

/**
 * Creates a Result by validating a value with a predicate function.
 *
 * If the predicate returns true, creates Ok with the value.
 * If it returns false, creates Err with default or custom error.
 *
 * @overload
 * @group Creation
 *
 * @template T - Value type
 * @param {T} value - Value to validate
 * @param {(value: T) => boolean} predicate - Function that validates the value
 * @returns {IResult<T, Error>} Ok if valid, Err with default error if invalid
 *
 * @example
 * // Simple validation
 * Result.validate(42, (x) => x > 40)  // => Ok(42)
 *
 * Result.validate(42, (x) => x  < 18)
 * // => Err(Error: 'Validation failed for value: 42')
 */
function validate<T>(value: T, predicate: (value: T) => boolean): IResult<T, Error>

/**
 * Creates a Result by validating a value with predicate and custom error.
 *
 * @overload
 * @group Conditional Creation
 *
 * @template T - Value type
 * @template E - Error type
 * @param {T} value - Value to validate
 * @param {(value: T) => boolean} predicate - Function that validates the value
 * @param {(value: T) => E} onError - Function that generates custom error on rejection
 * @returns {IResult<T, E>} Ok if valid, Err with custom error if invalid
 *
 * @example
 * // With personalized error message
 * const age = Result.validate(
 *   42,
 *   (x) => x < 40,
 *   (e) => new Error(`${e} is too small`)
 * )
 * // Err(Error: '42 is too small')
 *
 * // With custom error type
 * type ValidationError = { field: string; value: unknown; rule: string }
 * const result = Result.validate(
 *   -5,
 *   (x) => x > 0,
 *   (e) => ({ field: 'age', value: e, rule: 'must be positive' })
 * )
 */
function validate<T, E>(
  value: T,
  predicate: (value: T) => boolean,
  onError: (value: T) => E,
): IResult<T, E>

function validate<T, E = Error>(
  value: T,
  predicate: (value: T) => boolean,
  onError?: (value: T) => E | Error,
): IResult<T, E | Error> {
  if (!predicate(value)) {
    return new Err(
      onError
        ? onError(value)
        : new Error(`Validation failed for value: ${formatForDisplay(value)}`),
    )
  }

  return new Ok(value)
}

// #endregion

// #region COLLECTIONS: all, allSettled, any, partition, values, errors

/**
 * Combines multiple Results into a single Result containing tuple of values.
 *
 * If all are Ok, returns Ok with array of all values.
 * If any is Err, returns the first Err encountered (short-circuit).
 *
 * Similar to Promise.all(), but for Results.
 *
 * @group Collections
 *
 * @template T - Results tuple type
 * @param {T} results - Array of Results
 * @returns {IResult<OkTuple<T>, ErrUnion<T>>} Ok with tuple of values or first Err
 *
 * @example
 * // All Ok
 * Result.all([Result.ok(1), Result.ok('two'), Result.ok(true)])
 * // => Ok([1, "two", true])
 *
 * // With Err - returns first error
 * Result.all([Result.ok(1), Result.err('error 1'), Result.err('error 2')])
 * // => Err("error 1")
 *
 * // Validating multiple fields
 * const validated = Result.all([
 *   validateEmail(form.email),
 *   validatePassword(form.password),
 *   validateAge(form.age)
 * ])
 *
 * if (validated.isOk()) {
 *   const [email, password, age] = validated.unwrap()
 *   // All valid
 * }
 *
 * // Empty array
 * Result.all([])  // => Ok([])
 */
function all<const T extends readonly IResult<unknown, unknown>[]>(
  results: T,
): IResult<OkTuple<T>, ErrUnion<T>> {
  if (!Array.isArray(results) || results.length === 0)
    return new Ok([]) as IResult<OkTuple<T>, ErrUnion<T>>

  const okValues: unknown[] = []

  for (const result of results) {
    if (!isResult(result)) throw new Error('all() called with non-Result value')
    if (result.isErr()) return result as IResult<OkTuple<T>, ErrUnion<T>>

    okValues.push(result.unwrap())
  }

  return new Ok(okValues) as IResult<OkTuple<T>, ErrUnion<T>>
}

/**
 * Collects the status of all Results without failing.
 *
 * Always returns Ok with array of objects indicating status (ok/err)
 * and corresponding value/error. Never fails, unlike all().
 *
 * Similar to Promise.allSettled().
 *
 * @group Collections
 *
 * @template T - Results tuple type
 * @param {T} results - Array of Results
 * @returns {Ok<SettledResult<OkUnion<T>, ErrUnion<T>>[]>} Always Ok with status array
 *
 * @example
 * // Mix of Ok and Err
 * const result = Result.allSettled([Result.ok(1), Result.err('failed'), Result.ok(3)])
 * results.unwrap() // safely unwrap all results
 * // =>
 * // [
 * //   { status: 'ok', value: 1 },
 * //   { status: 'err', reason: 'failed' },
 * //   { status: 'ok', value: 3 }
 * // ]
 *
 * // Processing individual results
 * const settled = Result.allSettled(operations).unwrap()
 * const successes = settled.filter(r => r.status === 'ok')
 * const failures = settled.filter(r => r.status === 'err')
 *
 * // Empty array
 * Result.allSettled([])  // => Ok([])
 */
function allSettled<const T extends readonly IResult<unknown, unknown>[]>(
  results: T,
): Ok<SettledResult<OkUnion<T>, ErrUnion<T>>[]> {
  if (!Array.isArray(results) || results.length === 0) return new Ok([])

  const settledResults = results.map((result): SettledResult<OkUnion<T>, ErrUnion<T>> => {
    if (!isResult(result)) throw new Error('allSettled() called with non-Result value')

    return result.isOk()
      ? { status: 'ok', value: result.unwrap() as OkUnion<T> }
      : { status: 'err', reason: result.unwrapErr() as ErrUnion<T> }
  })

  return new Ok(settledResults)
}

/**
 * Returns the first Ok Result, or all errors if none is Ok.
 *
 * Scans the array until it finds an Ok (short-circuit).
 * If no Ok is found, returns Err with array of all errors.
 *
 * Similar to Promise.any().
 *
 * @group Collections
 *
 * @template T - Results tuple type
 * @param {T} results - Array of Results
 * @returns {IResult<OkUnion<T>, ErrTuple<T>>} First Ok or Err with all errors
 *
 * @example
 * // First Ok
 * Result.any([Result.err('error 1'), Result.ok(42), Result.ok(99)])
 * // => Ok(42)
 *
 * // All Err
 * Result.any([Result.err('error 1'), Result.err('error 2'), Result.err('error 3')])
 * // => Err(["error 1", "error 2", "error 3"])
 *
 * // Trying multiple data sources (fallback)
 * Result.any([fetchFromCache(key), fetchFromDatabase(key), fetchFromAPI(key)])
 *
 * @example
 * // Empty array
 * Result.any([])  // => Err([])
 */
function any<const T extends readonly IResult<unknown, unknown>[]>(
  results: T,
): IResult<OkUnion<T>, ErrTuple<T>> {
  if (!Array.isArray(results) || results.length === 0)
    return new Err([]) as IResult<OkUnion<T>, ErrTuple<T>>

  const errorValues: unknown[] = []

  for (const result of results) {
    if (!isResult(result)) throw new Error('any() called with non-Result value')
    if (result.isOk()) return result as IResult<OkUnion<T>, ErrTuple<T>>

    errorValues.push(result.unwrapErr())
  }

  return new Err(errorValues) as IResult<OkUnion<T>, ErrTuple<T>>
}

/**
 * Separates Results into two arrays: successes and failures.
 *
 * Useful when you want to process successes and errors separately,
 * instead of failing on the first error occurrence.
 *
 * @group Collections
 *
 * @template T - Success value type
 * @template E - Error type
 * @param {readonly IResult<T, E>[]} results - Array of Results
 * @returns {readonly [T[], E[]]} Tuple [Ok values, errors]
 *
 * @example
 * // Partitioning results
 * const operations = [
 *   Result.ok(1),
 *   Result.err('failure A'),
 *   Result.ok(2),
 *   Result.err('failure B'),
 * ]
 *
 * const [oks, errors] = Result.partition(operations)
 * // => [[1, 2], ["failure A", "failure B"]]
 *
 * // Empty array
 * Result.partition([])  // => [[], []]
 */
function partition<T, E>(results: readonly IResult<T, E>[]): [T[], E[]] {
  if (!Array.isArray(results) || results.length === 0) return [[], []]

  const oks: T[] = []
  const errs: E[] = []

  for (const result of results) {
    if (!isResult(result as IResult<T, E>))
      throw new Error('partition() called with non-Result value')

    result.isOk() ? oks.push(result.unwrap()) : errs.push(result.unwrapErr())
  }

  return [oks, errs]
}

/**
 * Extracts only the success values from an array of Results.
 *
 * Filters and returns only the values from Results that are Ok, discarding errors.
 * Useful when you want to process only the successes without worrying about failures.
 *
 * @group Collections
 *
 * @template T - Success value type
 * @template E - Error type
 * @param {readonly IResult<T, E>[]} results - Array of Results
 * @returns {T[]} Array containing only Ok values
 *
 * @example
 * // Extracting values
 * Result.values([Result.ok(1), Result.err('fail'), Result.ok(2)])
 * // => Ok([1, 2])
 *
 * // Empty array
 * Result.values([]) // => []
 */
function values<T, E>(results: readonly IResult<T, E>[]): T[] {
  if (!Array.isArray(results) || results.length === 0) return []

  const oks: T[] = []

  for (const result of results) {
    if (!isResult(result)) throw new Error('values() called with non-Result value')
    if (result.isOk()) oks.push(result.unwrap() as T)
  }

  return oks
}

/**
 * Extracts only the errors from an array of Results.
 *
 * Filters and returns only the errors from Results that are Err, discarding successes.
 * Useful when you want to analyze or log only the failures that occurred.
 *
 * @group Collections
 *
 * @template T - Success value type
 * @template E - Error type
 * @param {readonly IResult<T, E>[]} results - Array of Results
 * @returns {E[]} Array containing only errors
 *
 * @example
 * // Extracting errors
 * Result.errors([Result.ok(1), Result.err('fail A'), Result.ok(2), Result.err('fail B')])
 * // => Err(["fail A", "fail B"])
 *
 * // Empty array
 * Result.errors([])  // => []
 */
function errors<T, E>(results: readonly IResult<T, E>[]): E[] {
  if (!Array.isArray(results) || results.length === 0) return []

  const errs: E[] = []

  for (const result of results) {
    if (!isResult(result)) throw new Error('errors() called with non-Result value')
    if (result.isErr()) errs.push(result.unwrapErr() as E)
  }

  return errs
}

// #endregion

export default {
  all,
  allSettled,
  any,
  err,
  errors,
  fromNullable,
  fromPromise,
  fromTry,
  isErr,
  isOk,
  isResult,
  ok,
  partition,
  validate,
  values,
}
