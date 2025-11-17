import { Err } from './err.js'
import syncFactories from './factories.sync.js'
import { Ok } from './ok.js'

import type { AsyncResult, ErrUnion, OkTuple } from './types.js'

//
async function createAllAsync<const T extends readonly AsyncResult<unknown, unknown>[]>(
  promises: T
): AsyncResult<
  OkTuple<{ [K in keyof T]: Awaited<T[K]> }>,
  ErrUnion<{ [K in keyof T]: Awaited<T[K]> }>
> {
  return syncFactories.all(await Promise.all(promises))
}

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

export default { fromPromise: createFromPromise, allAsync: createAllAsync }
