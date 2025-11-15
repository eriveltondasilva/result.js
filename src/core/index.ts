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
import asyncFactories from './factories.async.js'
import factories from './factories.sync.js'

import type { AsyncResult, Result as ResultType } from './types.js'

/**
 * Result factory methods and utilities.
 */
export const Result = {
  ...factories,
  ...asyncFactories,
} as const

export type Result<T, E = Error> = ResultType<T, E>

export default Result
export type { AsyncResult }
