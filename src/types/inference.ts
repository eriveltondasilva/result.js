import type { Result } from './index'
import type { SettledResult } from './settled'

/**
 * Extracts the success value type (T) from a Result.
 * Returns never if the input is not a Result.
 *
 * @internal
 *
 * @see {@link InferErr} - Extracts the error type
 *
 * @template R - The Result type to infer from
 *
 * @example
 * type Value = InferOk<Result<number, string>> // => number
 */
export type InferOk<R extends Result<unknown, unknown>> =
  R extends Result<infer T, unknown> ? T : never

/**
 * Extracts the error type (E) from a Result.
 * Returns never if the input is not a Result.
 *
 * @internal
 *
 * @template R - The Result type to infer from
 *
 * @see {@link InferOk} - Extracts the success value type
 *
 * @example
 * type ErrorType = InferErr<Result<number, string>> // => string
 */
export type InferErr<R extends Result<unknown, unknown>> =
  R extends Result<unknown, infer E> ? E : never

// # TUPLES

/**
 * Infers a tuple of success types from an array of Results.
 *
 * @internal
 *
 * @template T - Array of Result types
 *
 * @example
 * type Values = OkTuple<[Result<number, Error>, Result<string, unknown>]>
 * // => [number, string]
 */
export type OkTuple<T extends readonly Result<unknown, unknown>[]> = {
  readonly [K in keyof T]: InferOk<T[K]>
}

/**
 * Infers a tuple of error types from an array of Results.
 *
 * @internal
 *
 * @template E - Array of Result types
 *
 * @example
 * type Errors = ErrTuple<[Result<any, string>, Result<any, Error>]>
 * // => [string, Error]
 */
export type ErrTuple<E extends readonly Result<unknown, unknown>[]> = {
  readonly [K in keyof E]: InferErr<E[K]>
}

// # UNION

/**
 * Infers a union of all possible success types from an array of Results.
 *
 * @internal
 *
 * @template T - Array of Result types
 *
 * @example
 * type Union = OkUnion<[Result<number, Error>, Result<string, Error>]>
 * // => number | string
 */
export type OkUnion<T extends readonly Result<unknown, unknown>[]> = InferOk<T[number]>

/**
 * Infers a union of all possible error types from an array of Results.
 *
 * @internal
 *
 * @template E - Array of Result types
 *
 * @example
 * type Union = ErrUnion<[Result<any, string>, Result<any, TypeError>]>
 * // => string | TypeError
 */
export type ErrUnion<E extends readonly Result<unknown, unknown>[]> = InferErr<E[number]>

/**
 * Infers a tuple of SettledResult types from an array of Results.
 * Maps each Result in the input to its corresponding SettledOk or SettledErr.
 *
 * @internal
 *
 * @template T - Array of Result types
 *
 * @example
 * type Settled = SettledTuple<[Result<number, string>]>
 * // => [SettledResult<number, string>]
 */
export type SettledTuple<T extends readonly Result<unknown, unknown>[]> = {
  readonly [K in keyof T]: SettledResult<InferOk<T[K]>, InferErr<T[K]>>
}
