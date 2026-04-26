import type { Result } from './index'
import type { SettledResult } from './settled'

/**
 * Extracts the success value type (T) from a Result.
 * Returns never if the input is not a Result.
 *
 * @internal
 */
export type InferOk<R extends Result<unknown, unknown>> =
  R extends Result<infer T, unknown> ? T : never

/**
 * Extracts the error type (E) from a Result.
 * Returns never if the input is not a Result.
 *
 * @internal
 */
export type InferErr<R extends Result<unknown, unknown>> =
  R extends Result<unknown, infer E> ? E : never

// # TUPLES

/**
 * Infers a tuple of success types from an array of Results.
 *
 * @internal
 */
export type OkTuple<T extends readonly Result<unknown, unknown>[]> = {
  readonly [K in keyof T]: InferOk<T[K]>
}

/**
 * Infers a tuple of error types from an array of Results.
 *
 * @internal
 */
export type ErrTuple<E extends readonly Result<unknown, unknown>[]> = {
  readonly [K in keyof E]: InferErr<E[K]>
}

// # UNION

/**
 * Infers a union of all possible success types from an array of Results.
 *
 * @internal
 */
export type OkUnion<T extends readonly Result<unknown, unknown>[]> = InferOk<T[number]>

/**
 * Infers a union of all possible error types from an array of Results.
 *
 * @internal
 */
export type ErrUnion<E extends readonly Result<unknown, unknown>[]> = InferErr<E[number]>

export type SettledTuple<T extends readonly Result<unknown, unknown>[]> = {
  readonly [K in keyof T]: SettledResult<InferOk<T[K]>, InferErr<T[K]>>
}
