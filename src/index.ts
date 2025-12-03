import {
  createOk,
  createErr,
  createFromTry,
  createFromPromise,
  createFromNullable,
  createValidate,
  createIsResult,
  createAll,
  createAny,
  createPartition,
  createAllSettled,
} from './core/factories.js'

export type { AsyncResultType, ResultType } from './core/types.js'

/**
 * Result factory methods and utilities for error handling.
 *
 * @namespace
 * @readonly
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
  ok: createOk,
  err: createErr,
  fromTry: createFromTry,
  fromPromise: createFromPromise,
  fromNullable: createFromNullable,
  validate: createValidate,
  isResult: createIsResult,
  all: createAll,
  any: createAny,
  partition: createPartition,
  allSettled: createAllSettled,
} as const)

export default Result
