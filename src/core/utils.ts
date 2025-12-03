import { Err } from './err.js'
import { Ok } from './ok.js'

/**
 * Checks if a value is an instance of Result (Ok or Err).
 */
export function isResult(value: unknown): boolean {
  return value instanceof Ok || value instanceof Err
}

/**
 * Converts an unknown value to an Error object.
 * Useful for try/catch blocks where the error type is unknown.
 */
export function unknownToError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error || 'Unknown error'))
}
