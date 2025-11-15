import { Err } from './err.js'
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
    return new Err<T, E>(mapError ? mapError(error) : (error as E))
  }
}

// TODO
// function createAllAsync(){}

export default { fromPromise: createFromPromise }
