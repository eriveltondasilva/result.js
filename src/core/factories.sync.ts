import { Err } from './err.js'
import { Ok } from './ok.js'
import type { Result } from './types.js'

function createOk<T, E = never>(value: T): Ok<T, E> {
  return new Ok(value)
}

function createErr<T = never, E = Error>(error: E): Err<T, E> {
  return new Err(error)
}

function createIsResult<T = unknown, E = unknown>(value: unknown): value is Result<T, E> {
  return value instanceof Ok || value instanceof Err
}

function createAll<const T extends readonly Result<unknown, unknown>[]>(
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
    values.push(result.ok)
  }

  return new Ok(values) as Ok<
    {
      [K in keyof T]: T[K] extends Result<infer U, unknown> ? U : never
    },
    never
  >
}

function createAny<T extends readonly Result<unknown, unknown>[]>(
  results: T
): Result<
  T[number] extends Result<infer U, unknown> ? U : never,
  { [K in keyof T]: T[K] extends Result<unknown, infer E> ? E : never }
> {
  const errors: Array<T[number] extends Result<unknown, infer E> ? E : never> = []

  for (const result of results) {
    if (result.isOk()) {
      return new Ok(result.unwrap()) as Ok<
        T[number] extends Result<infer U, unknown> ? U : never,
        never
      >
    }

    errors.push(result.err as T[number] extends Result<unknown, infer E> ? E : never)
  }

  return new Err(errors) as Err<
    never,
    { [K in keyof T]: T[K] extends Result<unknown, infer E> ? E : never }
  >
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

function createPartition<T, E>(results: readonly Result<T, E>[]): [T[], E[]] {
  const oks: T[] = []
  const errs: E[] = []

  for (const result of results) {
    result.isOk() ? oks.push(result.ok) : errs.push(result.err as E)
  }

  return [oks, errs] as const
}

export default {
  ok: createOk,
  err: createErr,
  isResult: createIsResult,
  all: createAll,
  any: createAny,
  fromTry: createFromTry,
  partition: createPartition,
}
