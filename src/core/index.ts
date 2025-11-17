import factories from './factories.js'

import type { AsyncResult, Result as ResultType } from './types.js'

/**
 * Result factory methods and utilities.
 */
export const Result = {
  ...factories,
} as const

export type Result<T, E = Error> = ResultType<T, E>

export default Result
export type { AsyncResult }
