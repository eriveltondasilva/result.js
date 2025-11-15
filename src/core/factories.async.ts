import { Err } from './err.js'
import factories from './factories.sync.js'
import type Result from './index.js'
import { Ok } from './ok.js'
import type { AsyncResult } from './types.js'

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

async function createAllAsync<T, E>(promises: Promise<Result<T, E>>[]): AsyncResult<T[], E> {
  const results = await Promise.all(promises)
  return factories.all(results)
}

export default { fromPromise: createFromPromise, allAsync: createAllAsync }
