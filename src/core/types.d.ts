import type { Err } from './err.ts'
import type { Ok } from './ok.ts'

/**
 * Result type for handling success and error cases without exceptions.
 *
 * @template T - Success value type
 * @template E - Error type (defaults to Error)
 */
export type Result<T, E> = Ok<T, E> | Err<T, E>

/**
 * Interface that both Ok and Err must implement.
 */
export interface IResult<T, E> {
  // Validation
  isOk(): this is Ok<T, never>
  isErr(): this is Err<never, E>

  // Access
  readonly ok: T | null
  readonly err: E | null
  unwrap(): T
  unwrapErr(): E
  unwrapOr(defaultValue: T): T
  unwrapOrElse(fn: () => T): T
  expect(message: string): T
  expectErr(message: string): E

  // Transformation
  map<U>(fn: (value: T) => U): Result<U, E>
  mapOr<U>(defaultValue: U, fn: (value: T) => U): U
  mapErr<F>(fn: (error: E) => F): Result<T, F>
  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E>
  flatten<U>(this: Result<Result<U, E>, E>): Result<U, E>

  // Combination
  and<U>(other: Result<U, E>): Result<U, E>
  or(other: Result<T, E>): Result<T, E>
  orElse(fn: (error: E) => Result<T, E>): Result<T, E>

  // Conversion
  toPromise(): Promise<T>

  // Inspection
  match<R>(handlers: { ok: (value: T) => R; err: (error: E) => R }): R
  inspect(handlers: { ok: (value: T) => void; err: (error: E) => void }): Result<T, E>
  inspectOk(fn: (value: T) => void): Result<T, E>
  inspectErr(fn: (error: E) => void): Result<T, E>
}
