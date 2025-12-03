import { Err } from './err.js'
import { Ok } from './ok.js'

export function isResult(value: unknown): boolean {
  return value instanceof Ok || value instanceof Err
}

export function unknownToError(error: unknown): Error {
  if (error instanceof Error) {
    return error
  }

  if (error === null || error === undefined) {
    return new Error('Unknown error: null or undefined value')
  }

  return new Error(String(error))
}
