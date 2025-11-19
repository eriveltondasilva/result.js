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

// ==================== HELPERS ====================
function unknownToError(error: unknown): Error {
  if (error instanceof Error) return error
  return new Error(String(error ?? 'Unknown error captured'))
}

// ==================== CREATION ====================
function createOk<T, E = never>(value: T): Ok<T, E> {
  return new Ok(value)
}

function createErr<T = never, E = Error>(error: E): Err<T, E> {
  return new Err(error)
}

// ==================== VALIDATION ====================
function createIsResult(value: unknown): value is Result<unknown, unknown> {
  return value instanceof Ok || value instanceof Err
}

// ==================== CONVERSION ====================
function createFromNullable<T>(value: T | null | undefined): Result<NonNullable<T>, Error>

function createFromNullable<T, E>(
  value: T | null | undefined,
  mapError: () => E
): Result<NonNullable<T>, E>

function createFromNullable<T, E = Error>(
  value: T | null | undefined,
  mapError?: () => E
): Result<NonNullable<T>, E | Error> {
  if (value != null) {
    return new Ok<NonNullable<T>, E | Error>(value as NonNullable<T>)
  }

  const error = mapError ? mapError() : new Error('Value is null or undefined')
  return new Err<NonNullable<T>, E | Error>(error)
}

//
function createValidate<T>(value: T, predicate: (value: T) => boolean): Result<T, Error>

function createValidate<T, E>(
  value: T,
  predicate: (value: T) => boolean,
  mapError: (value: T) => E
): Result<T, E>

function createValidate<T, E = Error>(
  value: T,
  predicate: (value: T) => boolean,
  mapError?: (value: T) => E | Error
): Result<T, E | Error> {
  if (predicate(value)) {
    return new Ok<T, E | Error>(value)
  }

  const error = mapError ? mapError(value) : new Error(`Validation failed for value: ${value}`)
  return new Err<T, E | Error>(error)
}

//
function createFromTry<T>(fn: () => T): Result<T, Error>

function createFromTry<T, E>(fn: () => T, mapError: (error: unknown) => E): Result<T, Error>

function createFromTry<T, E>(fn: () => T, mapError?: (error: unknown) => E): Result<T, E | Error> {
  try {
    return new Ok(fn())
  } catch (error) {
    const mappedError = mapError ? mapError(error) : unknownToError(error)
    return new Err(mappedError)
  }
}

// ==================== COMBINATION ====================
function createAll<const T extends readonly Result<unknown, unknown>[]>(
  results: T
): Result<OkTuple<T>, ErrUnion<T>> {
  const okValues: unknown[] = []

  for (const result of results) {
    if (result.isErr()) return result as Err<never, ErrUnion<T>>
    okValues.push(result.ok)
  }

  return new Ok(okValues) as Ok<OkTuple<T>, never>
}

function createAny<const T extends readonly Result<unknown, unknown>[]>(
  results: T
): Result<OkUnion<T>, ErrTuple<T>> {
  const errorValues: unknown[] = []

  for (const result of results) {
    if (result.isOk()) return result as Ok<OkUnion<T>, never>
    errorValues.push(result.err)
  }

  return new Err(errorValues) as Err<never, ErrTuple<T>>
}

function createPartition<T, E>(results: readonly Result<T, E>[]): readonly [T[], E[]] {
  const oks: T[] = []
  const errs: E[] = []

  for (const result of results) {
    // biome-ignore lint/style/noNonNullAssertion: false positive
    result.isOk() ? oks.push(result.ok) : errs.push(result.err!)
  }

  return [oks, errs]
}

function createAllSettled<const T extends readonly Result<unknown, unknown>[]>(
  results: T
): Ok<SettledResult<OkUnion<T>, ErrUnion<T>>[]> {
  const settled: SettledResult<OkUnion<T>, ErrUnion<T>>[] = results.map(
    (result): SettledResult<OkUnion<T>, ErrUnion<T>> =>
      result.isOk()
        ? { status: 'ok', value: result.ok as OkUnion<T> }
        : { status: 'err', reason: result.err as ErrUnion<T> }
  )

  return new Ok(settled)
}

// ==================== ASYNC OPERATIONS ====================
async function createFromPromise<T>(fn: () => Promise<T>): AsyncResult<T, Error>

async function createFromPromise<T, E>(
  fn: () => Promise<T>,
  mapError: (error: unknown) => E
): AsyncResult<T, E>

async function createFromPromise<T, E>(
  fn: () => Promise<T>,
  mapError?: (error: unknown) => E
): AsyncResult<T, E | Error> {
  try {
    return new Ok(await fn())
  } catch (error) {
    const mappedError = mapError ? mapError(error) : unknownToError(error)
    return new Err(mappedError)
  }
}

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
