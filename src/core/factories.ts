import { Err } from './err.js'
import { Ok } from './ok.js'

import type { AsyncResult, ErrTuple, ErrUnion, OkTuple, OkUnion, Result } from './types.js'

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
    return new Ok<NonNullable<T>, E>(value)
  }

  const error = mapError ? mapError() : new Error('Value is null or undefined')
  return new Err<NonNullable<T>, E | Error>(error)
}

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

function createFromTry<T>(fn: () => T): Result<T, Error>
function createFromTry<T, E>(fn: () => T, mapError: (error: unknown) => E): Result<T, E>
function createFromTry<T, E = Error>(fn: () => T, mapError?: (error: unknown) => E): Result<T, E> {
  try {
    return new Ok<T, E>(fn())
  } catch (error) {
    const mappedError = mapError
      ? mapError(error)
      : ((error instanceof Error ? error : new Error(String(error))) as E)
    return new Err<T, E>(mappedError)
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
    // biome-ignore lint/style/noNonNullAssertion: false positive
    errorValues.push(result.err!)
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

// ==================== ASYNC OPERATIONS ====================
async function createFromPromise<T>(fn: () => Promise<T>): AsyncResult<T, Error>
async function createFromPromise<T, E>(
  fn: () => Promise<T>,
  mapError: (error: unknown) => E
): AsyncResult<T, E>
async function createFromPromise<T, E = Error>(
  fn: () => Promise<T>,
  mapError?: (error: unknown) => E
): AsyncResult<T, E> {
  try {
    const value = await fn()
    return new Ok<T, E>(value)
  } catch (error) {
    const mappedError = mapError
      ? mapError(error)
      : ((error instanceof Error ? error : new Error(String(error))) as E)
    return new Err<T, E>(mappedError)
  }
}

//
export default {
  ok: createOk,
  err: createErr,
  isResult: createIsResult,
  fromNullable: createFromNullable,
  validate: createValidate,
  fromTry: createFromTry,
  all: createAll,
  any: createAny,
  partition: createPartition,
  fromPromise: createFromPromise,
}
