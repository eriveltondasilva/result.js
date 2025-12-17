import { Err } from './err.js'
import { Ok } from './ok.js'

import { assertArray, unknownToError, valueToDisplayString } from './utils.js'

import type {
  AsyncResult,
  ErrTuple,
  ErrUnion,
  OkTuple,
  OkUnion,
  Result,
  SettledResult,
} from './types.d.ts'

// #region CREATING: ok, err, fromTry, fromPromise, fromNullable, validate

/**
 * Creates a success Result containing a value.
 *
 * Use when you have a valid value and want to encapsulate it in a Result
 * to work with the fluent API or maintain consistency in function returns.
 *
 * @group Creating
 * @template T - Success value type
 * @template E - Error type (never used in Ok, but needed for typing)
 * @param {T} value - Success value to encapsulate
 * @returns {Ok<T, E>} An Ok Result containing the value
 *
 * @example
 * // Basic usage
 * const result = Result.ok(42)
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
 * const result = Result.ok(user)
 */
export function ok<T, E = never>(value: T): Ok<T, E> {
  return new Ok(value)
}

/**
 * Creates an error Result containing an error.
 *
 * Use when an operation fails and you want to encapsulate the error in a Result
 * instead of throwing an exception.
 *
 * @group Creating
 * @template T - Success value type (never used in Err, but needed for typing)
 * @template E - Error type
 * @param {E} error - Error to encapsulate
 * @returns {Err<T, E>} An Err Result containing the error
 *
 * @example
 * // With native Error
 * const result = Result.err(new Error('something went wrong'))
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
export function err<T = never, E = Error>(error: E): Err<T, E> {
  return new Err(error)
}

/**
 * Wraps function execution in a Result, capturing exceptions.
 *
 * Converts code that may throw exceptions into a Result, allowing
 * explicit error handling without try/catch.
 *
 * @overload
 * @group Creating
 * @template T - Return value type
 * @param {() => T} executor - Function to execute
 * @returns {Result<T, Error>} Ok with return value or Err if throws exception
 *
 * @example
 * // JSON parsing
 * const data = Result.fromTry(() => JSON.parse('{"name":"John"}'))
 * // Ok({name: "John"})
 *
 * const invalid = Result.fromTry(() => JSON.parse('invalid json'))
 * // Err(SyntaxError: ...)
 *
 * @example
 * // Operations that can fail
 * const result = Result.fromTry(() => {
 *   const file = readFileSync('config.json', 'utf-8')
 *   return JSON.parse(file)
 * })
 */
export function fromTry<T>(executor: () => T): Result<T, Error>

/**
 * Wraps function execution in Result with custom error transformation.
 *
 * @overload
 * @group Creating
 * @template T - Return value type
 * @template E - Error type
 * @param {() => T} executor - Function to execute
 * @param {(error: unknown) => E} onError - Function that transforms the caught exception
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
export function fromTry<T, E>(executor: () => T, onError: (error: unknown) => E): Result<T, E>

export function fromTry<T, E>(
  executor: () => T,
  onError?: (error: unknown) => E,
): Result<T, E | Error> {
  try {
    const value = executor()
    return new Ok(value)
  } catch (error) {
    return new Err(onError ? onError(error) : unknownToError(error))
  }
}

/**
 * Wraps async function execution in Result, capturing rejections.
 *
 * Converts Promises that may reject into Results, allowing explicit
 * handling without try/catch or .catch().
 *
 * @overload
 * @group Creating
 * @template T - Resolved value type
 * @param {() => Promise<T>} executor - Async function to execute
 * @returns {AsyncResult<T, Error>} Promise of Ok with value or Err if rejects
 *
 * @example
 * // Fetch API
 * const response = await Result.fromPromise(
 *   async () => {
 *     const res = await fetch('/api/user')
 *     return res.json()
 *   }
 * )
 *
 * if (response.isOk()) {
 *   console.log(response.unwrap())
 * }
 *
 * @example
 * // Chained async operations
 * const user = await Result.fromPromise(async () => {
 *   const data = await db.query('SELECT * FROM users WHERE id = ?', [id])
 *   if (!data[0]) throw new Error('User not found')
 *   return data[0]
 * })
 *
 * @example
 * // Async file I/O
 * const content = await Result.fromPromise(
 *   () => fs.promises.readFile('file.txt', 'utf-8')
 * )
 */
export async function fromPromise<T>(executor: () => Promise<T>): AsyncResult<T, Error>

/**
 * Wraps Promise in Result with custom error transformation.
 *
 * @overload
 * @group Creating
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
 *   () => fetch('/api/data').then(r => r.json()),
 *   (err): NetworkError => ({
 *     type: 'network',
 *     status: err instanceof Response ? err.status : undefined
 *   })
 * )
 *
 * @example
 * // Contextualizing errors
 * const user = await Result.fromPromise(
 *   () => fetchUser(id),
 *   (err) => new Error(`Failed to fetch user ${id}: ${err}`)
 * )
 */
export async function fromPromise<T, E>(
  executor: () => Promise<T>,
  onError: (error: unknown) => E,
): AsyncResult<T, E>

export async function fromPromise<T, E>(
  executor: () => Promise<T>,
  onError?: (error: unknown) => E,
): AsyncResult<T, E | Error> {
  try {
    const value = await executor()
    return new Ok(value)
  } catch (error) {
    return new Err(onError ? onError(error) : unknownToError(error))
  }
}

/**
 * Creates a Result from a value that may be null or undefined.
 *
 * Useful for working with APIs that return nullable values and you want to
 * force explicit handling of the null/undefined case.
 *
 * @overload
 * @group Creating
 * @template T - Value type
 * @param {T | null | undefined} value - Possibly null/undefined value
 * @returns {Result<NonNullable<T>, Error>} Ok if defined, Err with default error if null/undefined
 *
 * @example
 * // With present value
 * const value = Result.fromNullable(42)
 * // Ok(42)
 *
 * @example
 * // With null
 * const empty = Result.fromNullable(null)
 * // Err(Error: Value is null or undefined)
 *
 * @example
 * // Practical usage with find
 * const users = [{ id: 1, name: 'Ana' }, { id: 2, name: 'Bob' }]
 * const user = Result.fromNullable(
 *   users.find((u) => u.id === 3)
 * )
 * // Err(Error: Value is null or undefined)
 */
export function fromNullable<T>(value: T | null | undefined): Result<NonNullable<T>, Error>

/**
 * Creates a Result from nullable value with custom error.
 *
 * @overload
 * @group Creating
 * @template T - Value type
 * @template E - Error type
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
export function fromNullable<T, E>(
  value: T | null | undefined,
  onError: () => E,
): Result<NonNullable<T>, E>

export function fromNullable<T, E = Error>(
  value: T | null | undefined,
  onError?: () => E,
): Result<NonNullable<T>, E | Error> {
  if (value === null || value === undefined) {
    return new Err(onError ? onError() : new Error('Value is null or undefined'))
  }

  return new Ok(value)
}

/**
 * Creates a Result by validating a value with a predicate function.
 *
 * If the predicate returns true, creates Ok with the value.
 * If it returns false, creates Err with default or custom error.
 *
 * @overload
 * @group Creating
 * @template T - Value type
 * @param {T} value - Value to validate
 * @param {(value: T) => boolean} predicate - Function that validates the value
 * @returns {Result<T, Error>} Ok if valid, Err with default error if invalid
 *
 * @example
 * // Simple validation
 * const age = Result.validate(25, (x) => x >= 18)
 * // Ok(25)
 *
 * const invalid = Result.validate(15, (x) => x >= 18)
 * // Err(Error: Validation failed for value: 15)
 */
export function validate<T>(value: T, predicate: (value: T) => boolean): Result<T, Error>

/**
 * Creates a Result by validating a value with predicate and custom error.
 *
 * @overload
 * @group Conditional Creation
 * @template T - Value type
 * @template E - Error type
 * @param {T} value - Value to validate
 * @param {(value: T) => boolean} predicate - Function that validates the value
 * @param {(value: T) => E} onError - Function that generates custom error on rejection
 * @returns {Result<T, E>} Ok if valid, Err with custom error if invalid
 *
 * @example
 * // With personalized error message
 * const age = Result.validate(
 *   15,
 *   (x) => x >= 18,
 *   () => new Error(`${x} years is underage`)
 * )
 * // Err(Error: 15 years is underage)
 *
 * @example
 * // With custom error type
 * type ValidationError = { field: string; value: unknown; rule: string }
 * const result = Result.validate(
 *   -5,
 *   (x) => x > 0,
 *   (x) => ({ field: 'age', value: x, rule: 'must be positive' })
 * )
 */
export function validate<T, E>(
  value: T,
  predicate: (value: T) => boolean,
  onError: (value: T) => E,
): Result<T, E>

export function validate<T, E = Error>(
  value: T,
  predicate: (value: T) => boolean,
  onError?: (value: T) => E | Error,
): Result<T, E | Error> {
  if (!predicate(value)) {
    return new Err(
      onError
        ? onError(value)
        : new Error(`Validation failed for value: ${valueToDisplayString(value)}`),
    )
  }

  return new Ok(value)
}

// #endregion

// #region INSPECTING: isResult

/**
 * Checks if a value is a Result instance (Ok or Err).
 *
 * Useful for type guards and runtime checking when you receive
 * values from external sources or dynamic APIs.
 *
 * @group Inspection
 * @param {unknown} value - Value to check
 * @returns {boolean} true if the value is a Result instance
 *
 * @example
 * // Basic checking
 * Result.isResult(Result.ok(1))        // true
 * Result.isResult(Result.err('fail'))  // true
 * Result.isResult(42)                  // false
 * Result.isResult({ ok: 1 })           // false
 *
 * @example
 * // Usage as type guard
 * function process(value: unknown) {
 *   if (Result.isResult(value)) {
 *     // TypeScript knows value is Result<unknown, unknown>
 *     return value.isOk() ? value.unwrap() : value.unwrapErr()
 *   }
 *
 *   return value
 * }
 *
 * @example
 * // API input validation
 * function handleResponse(data: unknown) {
 *   if (!Result.isResult(data)) {
 *     throw new Error('Invalid response')
 *   }
 *
 *   return data
 * }
 */
export function isResult(value: unknown): value is Result<unknown, unknown> {
  return value instanceof Ok || value instanceof Err
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
 * @template T - Results tuple type
 * @param {T} results - Array of Results
 * @returns {Result<OkTuple<T>, ErrUnion<T>>} Ok with tuple of values or first Err
 *
 * @example
 * // All Ok
 * const result = Result.all([
 *   Result.ok(1),
 *   Result.ok('two'),
 *   Result.ok(true)
 * ])
 * result.unwrap() // [1, "two", true]
 *
 * @example
 * // With Err - returns first error
 * const result = Result.all([
 *   Result.ok(1),
 *   Result.err('error 1'),
 *   Result.err('error 2')
 * ])
 * // Err("error 1")
 *
 * @example
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
 * @example
 * // Empty array
 * Result.all([]) // Ok([])
 */
export function all<const T extends readonly Result<unknown, unknown>[]>(
  results: T,
): Result<OkTuple<T>, ErrUnion<T>> {
  if (!assertArray(results)) {
    return new Ok([]) as Result<OkTuple<T>, ErrUnion<T>>
  }

  const okValues: unknown[] = []

  for (const result of results) {
    if (!isResult(result)) {
      throw new Error('all() called with non-Result value')
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
 *
 * Always returns Ok with array of objects indicating status (ok/err)
 * and corresponding value/error. Never fails, unlike all().
 *
 * Similar to Promise.allSettled().
 *
 * @group Collections
 * @template T - Results tuple type
 * @param {T} results - Array of Results
 * @returns {Ok<SettledResult<OkUnion<T>, ErrUnion<T>>[]>} Always Ok with status array
 *
 * @example
 * // Mix of Ok and Err
 * const results = Result.allSettled([
 *   Result.ok(1),
 *   Result.err('failed'),
 *   Result.ok(3)
 * ])
 *
 * results.unwrap() // safely unwrap all results
 * // [
 * //   { status: 'ok', value: 1 },
 * //   { status: 'err', reason: 'failed' },
 * //   { status: 'ok', value: 3 }
 * // ]
 *
 * @example
 * // Processing individual results
 * const settled = Result.allSettled(operations).unwrap()
 * const successes = settled.filter(r => r.status === 'ok')
 * const failures = settled.filter(r => r.status === 'err')
 *
 * @example
 * // Empty array
 * Result.allSettled([]) // Ok([])
 */
export function allSettled<const T extends readonly Result<unknown, unknown>[]>(
  results: T,
): Ok<SettledResult<OkUnion<T>, ErrUnion<T>>[]> {
  if (!assertArray(results)) {
    return new Ok([])
  }

  const settledResults = results.map((result): SettledResult<OkUnion<T>, ErrUnion<T>> => {
    if (!isResult(result)) {
      throw new Error('allSettled() called with non-Result value')
    }

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
 * @template T - Results tuple type
 * @param {T} results - Array of Results
 * @returns {Result<OkUnion<T>, ErrTuple<T>>} First Ok or Err with all errors
 *
 * @example
 * // First Ok
 * const result = Result.any([
 *   Result.err('error 1'),
 *   Result.ok(42),
 *   Result.ok(99)
 * ])
 * result.unwrap() // 42
 *
 * @example
 * // All Err
 * const result = Result.any([
 *   Result.err('error 1'),
 *   Result.err('error 2'),
 *   Result.err('error 3')
 * ])
 * result.unwrapErr()
 * // ["error 1", "error 2", "error 3"]
 *
 * @example
 * // Trying multiple data sources (fallback)
 * const data = Result.any([
 *   fetchFromCache(key),
 *   fetchFromDatabase(key),
 *   fetchFromAPI(key)
 * ])
 *
 * @example
 * // Empty array
 * Result.any([]) // Err([])
 */
export function any<const T extends readonly Result<unknown, unknown>[]>(
  results: T,
): Result<OkUnion<T>, ErrTuple<T>> {
  if (!assertArray(results)) {
    return new Err([]) as Result<OkUnion<T>, ErrTuple<T>>
  }

  const errorValues: unknown[] = []

  for (const result of results) {
    if (!isResult(result)) {
      throw new Error('any() called with non-Result value')
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
 * Useful when you want to process successes and errors separately,
 * instead of failing on the first error occurrence.
 *
 * @group Collections
 * @template T - Success value type
 * @template E - Error type
 * @param {readonly Result<T, E>[]} results - Array of Results
 * @returns {readonly [T[], E[]]} Tuple [Ok values, errors]
 *
 * @example
 * // Partitioning results
 * const operations = [
 *   Result.ok(1),
 *   Result.err('failure A'),
 *   Result.ok(2),
 *   Result.err('failure B'),
 *   Result.ok(3)
 * ]
 *
 * const [successes, errors] = Result.partition(operations)
 * console.log(successes) // [1, 2, 3]
 * console.log(errors) // ["failure A", "failure B"]
 *
 * @example
 * // Batch processing with report
 * const [processed, failures] = Result.partition(
 *   items.map((item) => processItem(item))
 * )
 *
 * console.log(`${processed.length} items processed`)
 * console.log(`${failures.length} failures`)
 *
 * @example
 * // Empty array
 * Result.partition([]) // [[], []]
 */
export function partition<T, E>(results: readonly Result<T, E>[]): [T[], E[]] {
  if (!assertArray(results)) {
    return [[], []]
  }

  const oks: T[] = []
  const errs: E[] = []

  for (const result of results) {
    if (!isResult(result as Result<T, E>)) {
      throw new Error('partition() called with non-Result value')
    }

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
 * @template T - Success value type
 * @template E - Error type
 * @param {readonly Result<T, E>[]} results - Array of Results
 * @returns {T[]} Array containing only Ok values
 *
 * @example
 * // Extracting values
 * const successes = Result.values([
 *   Result.ok(1),
 *   Result.err('fail'),
 *   Result.ok(2)
 * ])
 * // [1, 2]
 *
 * @example
 * // Empty array
 * Result.values([]) // []
 */
export function values<T, E>(results: readonly Result<T, E>[]): T[] {
  if (!assertArray(results)) {
    return []
  }

  const oks: T[] = []

  for (const result of results) {
    if (!isResult(result)) {
      throw new Error('values() called with non-Result value')
    }

    if (result.isOk()) {
      oks.push(result.unwrap() as T)
    }
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
 * @template T - Success value type
 * @template E - Error type
 * @param {readonly Result<T, E>[]} results - Array of Results
 * @returns {E[]} Array containing only errors
 *
 * @example
 * // Extracting errors
 * const failures = Result.errors([
 *   Result.ok(1),
 *   Result.err('fail A'),
 *   Result.ok(2),
 *   Result.err('fail B')
 * ])
 * // ["fail A", "fail B"]
 *
 * @example
 * // Empty array
 * Result.errors([]) // []
 */
export function errors<T, E>(results: readonly Result<T, E>[]): E[] {
  if (!assertArray(results)) {
    return []
  }

  const errs: E[] = []

  for (const result of results) {
    if (!isResult(result)) {
      throw new Error('errors() called with non-Result value')
    }

    if (result.isErr()) {
      errs.push(result.unwrapErr() as E)
    }
  }

  return errs
}

// #endregion
