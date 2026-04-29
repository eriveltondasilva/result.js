/**
 * Successful variant of a settled result structure (for example, returned by `Result.allSettled`).
 *
 * @see {@link SettledErr} - Failure variant.
 * @see {@link SettledResult} - Union of both outcomes.
 *
 * @template TValue - Success value type
 *
 * @example
 * const success: SettledOk<number> = {
 *   status: 'ok',
 *   value: 42
 * }
 */
export interface SettledOk<TValue> {
  readonly status: 'ok'
  readonly value: TValue
}

/**
 * Failure variant of a settled result structure (for example, returned by `Result.allSettled`).
 *
 * @see {@link SettledOk} - Success variant.
 * @see {@link SettledResult} - Union of both outcomes.
 *
 * @template TError - Error value type
 *
 * @example
 * const failure: SettledErr<string> = {
 *   status: 'err',
 *   reason: 'Failed'
 * }
 */
export interface SettledErr<TError> {
  readonly status: 'err'
  readonly reason: TError
}

/**
 * Discriminated union representing the final outcome of an operation after it has been settled.
 *
 * Narrow using `status === 'ok'` or `status === 'err'`.
 *
 * @see {@link SettledOk} - Success variant.
 * @see {@link SettledErr} - Failure variant.
 *
 * @template TValue - Success value type
 * @template TError - Error value type
 *
 * @example
 * function process(result: SettledResult<number, Error>) {
 *   if (result.status === 'ok') {
 *     console.log(result.value)
 *   } else {
 *     console.error(result.reason.message)
 *   }
 * }
 */
export type SettledResult<TValue, TError> = SettledOk<TValue> | SettledErr<TError>
