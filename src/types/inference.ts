import type { Result } from './index'
import type { SettledResult } from './settled'

/**
 * Extracts the success value type from a {@link Result}.
 *
 * Returns the inferred `Ok` value type for the provided result type.
 *
 * @internal
 *
 * @see {@link InferErr} - Extracts the error type.
 *
 * @template TResult - Result type to inspect.
 *
 * @example
 * type Value = InferOk<Result<number, string>>
 * // => number
 */
export type InferOk<TResult extends Result<unknown, unknown>> =
  TResult extends Result<infer TValue, unknown> ? TValue : never

/**
 * Extracts the error type from a {@link Result}.
 *
 * Returns the inferred `Err` value type for the provided result type.
 *
 * @internal
 *
 * @see {@link InferOk} - Extracts the success value type.
 *
 * @template TResult - Result type to inspect.
 *
 * @example
 * type ErrorType = InferErr<Result<number, string>>
 * // => string
 */
export type InferErr<TResult extends Result<unknown, unknown>> =
  TResult extends Result<unknown, infer TError> ? TError : never

// # TUPLES

/**
 * Maps a tuple of {@link Result} types to a tuple of success value types.
 *
 * Preserves tuple order and readonly modifiers.
 *
 * @internal
 *
 * @template TResults - Tuple of result types.
 *
 * @example
 * type Values = OkTuple<[Result<number, Error>, Result<string, unknown>]>
 * // => [number, string]
 */
export type OkTuple<TResults extends readonly Result<unknown, unknown>[]> = {
  readonly [K in keyof TResults]: InferOk<TResults[K]>
}

/**
 * Maps a tuple of {@link Result} types to a tuple of error value types.
 *
 * Preserves tuple order and readonly modifiers.
 *
 * @internal
 *
 * @template TResults - Tuple of result types.
 *
 * @example
 * type Errors = ErrTuple<
 *   [Result<any, string>, Result<any, Error>]
 * >
 * // => [string, Error]
 */
export type ErrTuple<TResults extends readonly Result<unknown, unknown>[]> = {
  readonly [K in keyof TResults]: InferErr<TResults[K]>
}

// # UNION

/**
 * Extracts a union of all success value types from a tuple of {@link Result} types.
 *
 * @internal
 *
 * @template TResults - Tuple of result types.
 *
 * @example
 * type Union = OkUnion<
 *   [Result<number, Error>, Result<string, Error>]
 * >
 * // => number | string
 */
export type OkUnion<TResults extends readonly Result<unknown, unknown>[]> = InferOk<
  TResults[number]
>

/**
 * Extracts a union of all error value types from a tuple of {@link Result} types.
 *
 * @internal
 *
 * @template TResults - Tuple of result types.
 *
 * @example
 * type Union = ErrUnion<
 *   [Result<any, string>, Result<any, TypeError>]
 * >
 * // => string | TypeError
 */
export type ErrUnion<TResults extends readonly Result<unknown, unknown>[]> = InferErr<
  TResults[number]
>

/**
 * Maps a tuple of {@link Result} types to a tuple of {@link SettledResult} types.
 *
 * Each entry preserves its original success and error types.
 *
 * @internal
 *
 * @template TResults - Tuple of result types.
 *
 * @example
 * type Settled = SettledTuple<
 *   [Result<number, string>]
 * >
 * // => [SettledResult<number, string>]
 */
export type SettledTuple<TResults extends readonly Result<unknown, unknown>[]> = {
  readonly [K in keyof TResults]: SettledResult<InferOk<TResults[K]>, InferErr<TResults[K]>>
}
