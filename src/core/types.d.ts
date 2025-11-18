import type { Err } from './err.js'
import type { Ok } from './ok.js'

// #
export type Result<T, E> = Ok<T, E> | Err<T, E>
export type AsyncResult<T, E> = Promise<Result<T, E>>

// #
export type InferOk<R> = R extends Result<infer T, unknown> ? T : never
export type InferErr<R> = R extends Result<unknown, infer E> ? E : never

export type OkTuple<T extends readonly Result<unknown, unknown>[]> = {
  [K in keyof T]: InferOk<T[K]>
}
export type ErrTuple<T extends readonly Result<unknown, unknown>[]> = {
  [K in keyof T]: InferErr<T[K]>
}

export type OkUnion<T extends readonly Result<unknown, unknown>[]> = InferOk<T[number]>
export type ErrUnion<T extends readonly Result<unknown, unknown>[]> = InferErr<T[number]>

export type SettledOk<T> = { status: 'ok'; value: T }
export type SettledErr<E> = { status: 'err'; reason: E }
export type SettledResult<T, E> = SettledOk<T> | SettledErr<E>

/**
 * Interface that both Ok and Err must implement.
 */
export interface IResult<T, E> {
  // ==================== CHECKING ====================
  // Type guards to check Result state
  isOk(): this is Ok<T, never>
  isErr(): this is Err<never, E>
  isOkAnd(fn: (value: T) => boolean): this is Ok<T, never>
  isErrAnd(fn: (error: E) => boolean): this is Err<never, E>

  // ==================== EXTRACTING ====================
  // Access values directly (may be null)
  readonly ok: T | null
  readonly err: E | null

  // Extract values (may throw)
  unwrap(): T
  unwrapErr(): E
  expect(message: string): T
  expectErr(message: string): E

  // Extract with fallback (never throws)
  unwrapOr(defaultValue: T): T
  unwrapOrElse(fn: (error: E) => T): T

  // ==================== TRANSFORMING ====================
  // Transform Ok values
  map<U>(fn: (value: T) => U): Result<U, E>
  mapOr<U>(fn: (value: T) => U, defaultValue: U): U
  mapOrElse<U>(okFn: (value: T) => U, errFn: (error: E) => U): U

  // Transform Err values
  mapErr<F>(fn: (error: E) => F): Result<T, F>

  // Filter Ok values
  filter(predicate: (value: T) => boolean, onReject: (value: T) => E): Result<T, E>

  // ==================== CHAINING ====================
  // Chain operations that return Result
  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E>
  orElse(fn: (error: E) => Result<T, E>): Result<T, E>

  // Combine with other Results
  and<U>(result: Result<U, E>): Result<U, E>
  or(result: Result<T, E>): Result<T, E>
  zip<U, F>(result: Result<U, F>): Result<[T, U], E | F>

  // ==================== INSPECTING ====================
  // Pattern matching
  match<R1, R2>(handlers: { ok: (value: T) => R1; err: (error: E) => R2 }): R1 | R2

  // Side effects (doesn't modify Result)
  inspect(fn: (value: T) => void): Result<T, E>
  inspectErr(fn: (error: E) => void): Result<T, E>

  // ==================== COMPARING ====================
  contains(value: T, equals?: (actual: T, expected: T) => boolean): boolean
  containsErr(error: E, equals?: (actual: E, expected: E) => boolean): boolean

  // ==================== CONVERTING ====================
  flatten<U, F>(this: Result<Result<U, F>, E>): Result<U, E | F>
  toPromise(): Promise<T>
  toString(): string
  toJSON(): { type: 'ok'; value: T } | { type: 'err'; error: E }

  // ==================== ASYNC OPERATIONS ====================
  // Transforming
  mapAsync<U>(fn: (value: T) => Promise<U>): AsyncResult<U, E>
  mapErrAsync<F>(fn: (error: E) => Promise<F>): AsyncResult<T, F>
  mapOrAsync<U>(fn: (value: T) => Promise<U>, defaultValue: U): Promise<U>
  mapOrElseAsync<U>(okFn: (value: T) => Promise<U>, errFn: (error: E) => Promise<U>): Promise<U>

  // Chaining
  andThenAsync<U>(fn: (value: T) => AsyncResult<U, E>): AsyncResult<U, E>
  andAsync<U>(result: AsyncResult<U, E>): AsyncResult<U, E>
  orAsync(result: AsyncResult<T, E>): AsyncResult<T, E>
  orElseAsync(fn: (error: E) => AsyncResult<T, E>): AsyncResult<T, E>

  // ==================== METADATA ====================
  readonly [Symbol.toStringTag]: string
  [Symbol.for('nodejs.util.inspect.custom')]: string
}
