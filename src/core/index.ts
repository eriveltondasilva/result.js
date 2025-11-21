import factories from './factories.js'

import type { AsyncResult as AsyncResultType, Result as ResultType } from './types.js'

/**
 * Result factory methods and utilities.
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

export const ok = factories.createOk
export const err = factories.createErr

export default Result

Result.ok('teste')
