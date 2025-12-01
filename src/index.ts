import factories from './core/factories.js'

import type { AsyncResult as AsyncResultType, Result as ResultType } from './core/types.js'

/**
 * Result factory methods and utilities for error handling.
 *
 * @example
 * const result = Result.ok(42);
 * result.map((x) => x * 2); // Ok(84)
 *
 * @example
 * const parsed = Result.fromTry(() => JSON.parse('{"a":1}'));
 * parsed.unwrap(); // {a: 1}
 */
export const Result = Object.freeze({
  ok: factories.createOk,
  err: factories.createErr,
  fromTry: factories.createFromTry,
  fromPromise: factories.createFromPromise,
  fromNullable: factories.createFromNullable,
  validate: factories.createValidate,
  isResult: factories.createIsResult,
  all: factories.createAll,
  any: factories.createAny,
  partition: factories.createPartition,
  allSettled: factories.createAllSettled,
} as const)

export type Result<T, E = Error> = ResultType<T, E>
export type AsyncResult<T, E = Error> = AsyncResultType<T, E>

export default Result
