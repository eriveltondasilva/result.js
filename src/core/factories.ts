import { Err } from './err.js'
import { Ok } from './ok.js'
import type {
  AsyncResult,
  ErrTuple,
  ErrUnion,
  OkTuple,
  OkUnion,
  Result,
  SettledResult,
} from './types.js'

import { assertFunction, assertResults, isResult, unknownToError } from './utils.js'

//# CREATION ==========================

function createOk<T, E = never>(value: T): Ok<T, E> {
  return new Ok(value)
}

function createErr<T = never, E = Error>(error: E): Err<T, E> {
  return new Err(error)
}

//# CONDITIONAL CREATION ==============

function createValidate<T>(value: T, predicate: (value: T) => boolean): Result<T, Error>

function createValidate<T, E>(
  value: T,
  predicate: (value: T) => boolean,
  onError: (value: T) => E
): Result<T, E>

function createValidate<T, E = Error>(
  value: T,
  predicate: (value: T) => boolean,
  onError?: (value: T) => E | Error
): Result<T, E | Error> {
  assertFunction(predicate, 'Result.validate', 'predicate')
  onError && assertFunction(onError, 'Result.validate', 'onError')

  if (!predicate(value)) {
    const error = onError ? onError(value) : new Error(`Validation failed for value: ${value}`)
    return new Err<never, E | Error>(error)
  }

  return new Ok(value)
}

// ---

function createFromNullable<T>(value: T | null | undefined): Result<NonNullable<T>, Error>

function createFromNullable<T, E>(
  value: T | null | undefined,
  onError: () => E
): Result<NonNullable<T>, E>

function createFromNullable<T, E = Error>(
  value: T | null | undefined,
  onError?: () => E
): Result<NonNullable<T>, E | Error> {
  onError && assertFunction(onError, 'Result.fromNullable', 'onError')

  if (value == null) {
    const error = onError ? onError() : new Error('Value is null or undefined')
    return new Err(error)
  }

  return new Ok(value)
}

//# VALIDATION ========================

function createIsResult(value: unknown): value is Result<unknown, unknown> {
  return isResult(value)
}

//# CONVERSION ========================

function createFromTry<T>(executor: () => T): Result<T, Error>

function createFromTry<T, E>(executor: () => T, onError: (error: unknown) => E): Result<T, Error>

function createFromTry<T, E>(
  executor: () => T,
  onError?: (error: unknown) => E
): Result<T, E | Error> {
  assertFunction(executor, 'Result.fromTry', 'executor')
  onError && assertFunction(onError, 'Result.fromTry', 'onError')

  try {
    return new Ok(executor())
  } catch (error) {
    return new Err(onError ? onError(error) : unknownToError(error))
  }
}

// ---

async function createFromPromise<T>(executor: () => Promise<T>): AsyncResult<T, Error>

async function createFromPromise<T, E>(
  executor: () => Promise<T>,
  onError: (error: unknown) => E
): AsyncResult<T, E>

async function createFromPromise<T, E>(
  executor: () => Promise<T>,
  onError?: (error: unknown) => E
): AsyncResult<T, E | Error> {
  assertFunction(executor, 'Result.fromPromise', 'executor')
  onError && assertFunction(onError, 'Result.fromPromise', 'onError')

  try {
    return new Ok(await executor())
  } catch (error) {
    return new Err(onError ? onError(error) : unknownToError(error))
  }
}

//# COLLECTIONS ========================

function createAll<const T extends readonly Result<unknown, unknown>[]>(
  results: T
): Result<OkTuple<T>, ErrUnion<T>> {
  assertResults(results, 'Result.all')

  if (results.length === 0) {
    return new Ok([]) as Ok<OkTuple<T>, never>
  }

  const okValues: unknown[] = []

  for (const result of results) {
    if (result.isErr()) {
      return result as Err<never, ErrUnion<T>>
    }

    okValues.push(result.unwrap())
  }

  return new Ok(okValues) as Ok<OkTuple<T>, never>
}

// ---

function createAllSettled<const T extends readonly Result<unknown, unknown>[]>(
  results: T
): Ok<SettledResult<OkUnion<T>, ErrUnion<T>>[]> {
  assertResults(results, 'Result.allSettled')

  if (results.length === 0) {
    return new Ok([])
  }

  const settledResults = results.map((result): SettledResult<OkUnion<T>, ErrUnion<T>> => {
    return result.isOk()
      ? { status: 'ok', value: result.unwrap() as OkUnion<T> }
      : { status: 'err', reason: result.unwrapErr() as ErrUnion<T> }
  })

  return new Ok(settledResults)
}

// ---

function createAny<const T extends readonly Result<unknown, unknown>[]>(
  results: T
): Result<OkUnion<T>, ErrTuple<T>> {
  assertResults(results, 'Result.any')

  if (results.length === 0) {
    return new Err([]) as Err<never, ErrTuple<T>>
  }

  const errorValues: unknown[] = []

  for (const result of results) {
    if (result.isOk()) {
      return result as Ok<OkUnion<T>, never>
    }

    errorValues.push(result.unwrapErr())
  }

  return new Err(errorValues) as Err<never, ErrTuple<T>>
}

// ---

function createPartition<T, E>(results: readonly Result<T, E>[]): readonly [T[], E[]] {
  assertResults(results, 'Result.partition')

  if (results.length === 0) {
    return [[], []] as const
  }

  const oks: T[] = []
  const errs: E[] = []

  for (const result of results) {
    if (result.isOk()) {
      oks.push(result.unwrap())
    } else {
      errs.push(result.unwrapErr())
    }
  }

  return [oks, errs] as const
}

//# EXPORTS ===========================
export default {
  createAll,
  createAllSettled,
  createAny,
  createErr,
  createFromNullable,
  createFromPromise,
  createFromTry,
  createIsResult,
  createOk,
  createPartition,
  createValidate,
}
