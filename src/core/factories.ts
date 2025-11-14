import { Err } from './err.js'
import { Ok } from './ok.js'
import type { Result } from './types.js'

/**
 * Creates a successful Result containing a value.
 *
 * @example
 * const result = ok(42)
 * result.unwrap() // => 42
 */
export function createOk<T, E = never>(value: T): Ok<T, E> {
  return new Ok(value)
}

/**
 * Creates a failed Result containing an error.
 *
 * @example
 * const result = err(new Error('Failed'))
 * result.unwrapErr() // => Error('Failed')
 */
export function createErr<T = never, E = Error>(error: E): Err<T, E> {
  return new Err(error)
}

/**
 * Type guard to check if a value is a Result instance.
 *
 * @example
 * if (is(value)) {
 *   value.isOk() // => boolean
 * }
 */
export function createIs<T, E>(value: unknown): value is Result<T, E> {
  return value instanceof Ok || value instanceof Err
}

/**
 * Combines multiple Results into a single Result containing an array of values.
 *
 * @example
 * const results = [ok(1), ok(2), ok(3)]
 * const combined = sequence(results)
 * combined.unwrap() // => [1, 2, 3]
 */
export function createSequence<T, E>(results: Result<T, E>[]): Result<T[], E>
export function createSequence<T extends readonly Result<unknown, unknown>[]>(
  results: T
): Result<
  { [K in keyof T]: T[K] extends Result<infer U, unknown> ? U : never },
  T[number] extends Result<unknown, infer E> ? E : never
>
export function createSequence<T extends readonly Result<unknown, unknown>[]>(
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

/**
 * Combines multiple async Results into a single Result containing an array of values.
 *
 * @example
 * const promises = [fetchUser(1), fetchUser(2)]
 * const result = await sequenceAsync(promises)
 */
export async function createSequenceAsync<T, E>(
  promises: Promise<Result<T, E>>[]
): Promise<Result<T[], E>>
export async function createSequenceAsync<
  const T extends readonly Promise<Result<unknown, unknown>>[],
>(
  promises: T
): Promise<
  Result<
    { -readonly [K in keyof T]: T[K] extends Promise<Result<infer U, unknown>> ? U : never },
    T[number] extends Promise<Result<unknown, infer E>> ? E : never
  >
>
export async function createSequenceAsync<
  const T extends readonly Promise<Result<unknown, unknown>>[],
>(
  promises: T
): Promise<
  Result<
    { -readonly [K in keyof T]: T[K] extends Promise<Result<infer U, unknown>> ? U : never },
    T[number] extends Promise<Result<unknown, infer E>> ? E : never
  >
> {
  const results = await Promise.all(promises)
  const values: unknown[] = []

  for (const result of results) {
    if (result.isErr()) {
      return new Err(result.unwrapErr()) as Err<
        never,
        T[number] extends Promise<Result<unknown, infer E>> ? E : never
      >
    }

    values.push(result.unwrap())
  }

  // biome-ignore lint/suspicious/noExplicitAny: type-safe cast
  return new Ok(values) as any
}

/**
 * Converts a Promise into a Result, catching any errors.
 *
 * @example
 * const result = await fromPromise(fetch('/api/data'))
 */
export async function createFromPromise<T>(promise: Promise<T>): Promise<Result<T, Error>>
export async function createFromPromise<T, E>(
  promise: Promise<T>,
  mapError: (error: unknown) => E
): Promise<Result<T, E>>
export async function createFromPromise<T, E = Error>(
  promise: Promise<T>,
  mapError?: (error: unknown) => E
): Promise<Result<T, E>> {
  try {
    const value = await promise
    return new Ok<T, E>(value)
  } catch (error) {
    const mappedError = mapError ? mapError(error) : (error as E)
    return new Err<T, E>(mappedError)
  }
}

/**
 * Creates a Result from a function that might throw an error.
 *
 * @example
 * const result = fromTry(() => JSON.parse(invalidJson))
 */
export function createFromTry<T>(fn: () => T): Result<T, Error>
export function createFromTry<T, E>(fn: () => T, mapError: (error: unknown) => E): Result<T, E>
export function createFromTry<T, E = Error>(
  fn: () => T,
  mapError?: (error: unknown) => E
): Result<T, E> {
  try {
    return new Ok<T, E>(fn())
  } catch (error) {
    const mappedError = mapError ? mapError(error) : (error as E)
    return new Err<T, E>(mappedError)
  }
}
