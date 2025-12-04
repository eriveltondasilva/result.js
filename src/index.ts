import {
  all,
  allSettled,
  any,
  err,
  fromNullable,
  fromPromise,
  fromTry,
  isResult,
  ok,
  partition,
  validate,
} from './core/factories.js'

export type { AsyncResultType, ResultMethods, ResultType } from './core/types.js'

/**
 * Result factory methods and utilities for error handling.
 *
 * @readonly
 * @namespace Result
 * @group Core
 *
 * @example
 * const result = Result.ok(42)
 * result.map((x) => x * 2)
 * // Ok(84)
 *
 * @example
 * const parsed = Result.fromTry(() => JSON.parse('{"a":1}'))
 * parsed.unwrap()
 * // {a: 1}
 */
export const Result = Object.freeze({
  ok,
  err,
  fromTry,
  fromPromise,
  fromNullable,
  validate,
  isResult,
  all,
  any,
  partition,
  allSettled,
} as const)

export default Result
