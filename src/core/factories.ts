import { Err } from './err.js'
import { Ok } from './ok.js'
import type { Result } from './types.js'

function createOk<T, E = never>(value: T): Ok<T, E> {
  return new Ok(value)
}

function createErr<T = never, E = Error>(error: E): Err<T, E> {
  return new Err(error)
}

function createIs<T, E>(value: unknown): value is Result<T, E> {
  return value instanceof Ok || value instanceof Err
}

function createAll<T, E>(results: Result<T, E>[]): Result<T[], E>
function createAll<T extends readonly Result<unknown, unknown>[]>(
  results: T
): Result<
  { [K in keyof T]: T[K] extends Result<infer U, unknown> ? U : never },
  T[number] extends Result<unknown, infer E> ? E : never
>
function createAll<T extends readonly Result<unknown, unknown>[]>(
  results: T
): Result<
  { [K in keyof T]: T[K] extends Result<infer U, unknown> ? U : never },
  T[number] extends Result<unknown, infer E> ? E : never
> {
  const values: unknown[] = []

  for (const result of results) {
    if (result.isErr()) {
      return new Err(result.unwrapErr()) as Err<
        never,
        T[number] extends Result<unknown, infer E> ? E : never
      >
    }
    values.push(result.unwrap())
  }

  return new Ok(
    values as {
      [K in keyof T]: T[K] extends Result<infer U, unknown> ? U : never
    }
  )
}

function createAny<T extends readonly Result<unknown, unknown>[]>(
  results: T
): Result<
  T[number] extends Result<infer U, unknown> ? U : never,
  { [K in keyof T]: T[K] extends Result<unknown, infer E> ? E : never }
> {
  const errors: unknown[] = []

  for (const result of results) {
    if (result.isOk()) {
      // biome-ignore lint/suspicious/noExplicitAny: type-safe cast
      return new Ok(result.unwrap()) as any
    }
    errors.push(result.unwrapErr())
  }

  // biome-ignore lint/suspicious/noExplicitAny: type-safe cast
  return new Err(errors as any)
}

function createFromTry<T>(fn: () => T): Result<T, Error>
function createFromTry<T, E>(fn: () => T, mapError: (error: unknown) => E): Result<T, E>
function createFromTry<T, E = Error>(fn: () => T, mapError?: (error: unknown) => E): Result<T, E> {
  try {
    return new Ok<T, E>(fn())
  } catch (error) {
    return new Err<T, E>(mapError ? mapError(error) : (error as E))
  }
}

function createPartition<T, E>(results: readonly Result<T, E>[]): [T[], E[]] {
  const oks: T[] = []
  const errs: E[] = []

  for (const result of results) {
    if (result.isOk()) {
      oks.push(result.unwrap())
    } else {
      errs.push(result.unwrapErr())
    }
  }

  return [oks, errs]
}

export default {
  ok: createOk,
  err: createErr,
  is: createIs,
  all: createAll,
  any: createAny,
  fromTry: createFromTry,
  partition: createPartition,
}
