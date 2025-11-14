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
import {
  createErr,
  createFromPromise,
  createFromTry,
  createIs,
  createOk,
  createSequence,
  createSequenceAsync,
} from './factories.js'

import type { Result as ResultType } from './types.js'

export type Result<T, E = Error> = ResultType<T, E>

/**
 * Result factory methods and utilities.
 */
export const Result = {
  /**
   * Creates a successful Result containing a value.
   *
   * @example
   * const result = Result.ok(42)
   * result.unwrap() // => 42
   */
  ok: createOk,

  /**
   * Creates a failed Result containing an error.
   *
   * @example
   * const result = Result.err(new Error('Failed'))
   * result.unwrapErr() // => Error('Failed')
   */
  err: createErr,

  /**
   * Type guard to check if a value is a Result instance.
   *
   * @example
   * if (Result.is(value)) {
   *   value.isOk() // => boolean
   * }
   */
  is: createIs,

  /**
   * Combines multiple Results into a single Result containing an array of values.
   * Returns the first error encountered.
   *
   * @example
   * const results = [Result.ok(1), Result.ok(2), Result.ok(3)]
   * const combined = Result.sequence(results)
   * combined.unwrap() // => [1, 2, 3]
   */
  sequence: createSequence,

  /**
   * Combines multiple async Results into a single Result containing an array/tuple of values.
   * Waits for all promises and returns the first error encountered.
   *
   * @example
   * const promises = [fetchUser(1), fetchUser(2)]
   * const result = await Result.sequenceAsync(promises)
   */
  sequenceAsync: createSequenceAsync,

  /**
   * Converts a Promise into a Result, catching any errors.
   *
   * @example
   * const result = await Result.fromPromise(
   *   fetch('/api/data'),
   *   (err) => new NetworkError(err)
   * )
   */
  fromPromise: createFromPromise,

  /**
   * Creates a Result from a function that might throw an error.
   *
   * @example
   * const result = Result.fromTry(() => JSON.parse(invalidJson))
   * // result.isErr() === true
   */
  fromTry: createFromTry,
} as const
