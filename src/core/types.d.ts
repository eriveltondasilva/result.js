import type { Err } from './err.ts'
import type { Ok } from './ok.ts'

/**
 * Result type for handling success and error cases without exceptions.
 *
 * @template T - Success value type
 * @template E - Error type (defaults to Error)
 */
export type Result<T, E> = Ok<T, E> | Err<T, E>
export type AsyncResult<T, E> = Promise<Result<T, E>>
export type ErrorLike = Error | { message: string } | string

/**
 * Interface that both Ok and Err must implement.
 */
export interface IResult<T, E> {
  // # VALIDATION
  isOk(): this is Ok<T, never>
  isErr(): this is Err<never, E>
  isOkAnd(fn: (value: T) => boolean): this is Ok<T, never>
  isErrAnd(fn: (error: E) => boolean): this is Err<never, E>

  // # EXTRACTION
  readonly ok: T | null
  readonly err: E | null
  unwrap(): T
  unwrapErr(): E
  unwrapOr(defaultValue: T): T
  unwrapOrElse(fn: (error: E) => T): T
  expect(message: string): T
  expectErr(message: string): E

  // # TRANSFORMATION
  map<U>(fn: (value: T) => U): Result<U, E>
  mapErr<F>(fn: (error: E) => F): Result<T, F>
  mapOr<U>(defaultValue: U, fn: (value: T) => U): U
  mapOrElse<U>(defaultFn: (error: E) => U, fn: (value: T) => U): U
  filter(predicate: (value: T) => boolean, errorFn: (value: T) => E): Result<T, E>

  // # CHAINING
  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E>
  and<U>(other: Result<U, E>): Result<U, E>
  or(other: Result<T, E>): Result<T, E>
  orElse(fn: (error: E) => Result<T, E>): Result<T, E>

  // # INSPECTION
  match<R1, R2>(handlers: { ok: (value: T) => R1; err: (error: E) => R2 }): R1 | R2
  inspect(fn: (value: T) => void): Result<T, E>
  inspectErr(fn: (error: E) => void): Result<T, E>

  // # CONVERSION
  flatten<U, F>(this: Result<Result<U, F>, E>): Result<U, E | F>
  toPromise(): Promise<T>

  // # ASYNC
  mapAsync<U>(fn: (value: T) => Promise<U>): AsyncResult<U, E>
  mapErrAsync<F>(fn: (error: E) => Promise<F>): AsyncResult<T, F>
  mapOrAsync<U>(defaultValue: U, fn: (value: T) => Promise<U>): Promise<U>
  mapOrElseAsync<U>(defaultFn: (error: E) => Promise<U>, fn: (value: T) => Promise<U>): Promise<U>
  andThenAsync<U>(fn: (value: T) => AsyncResult<U, E>): AsyncResult<U, E>
  andAsync<U>(other: AsyncResult<U, E>): AsyncResult<U, E>
  orAsync(other: AsyncResult<T, E>): AsyncResult<T, E>
  orElseAsync(fn: (error: E) => AsyncResult<T, E>): AsyncResult<T, E>
  inspectAsync(fn: (value: T) => Promise<void>): AsyncResult<T, E>
  inspectErrAsync(fn: (error: E) => Promise<void>): AsyncResult<T, E>
}
