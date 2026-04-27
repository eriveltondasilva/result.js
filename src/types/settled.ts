/**
 * Represents a successful outcome in a settled result structure (e.g., from Result.allSettled).
 *
 * @see {@link SettledErr} - A failed outcome
 * @see {@link SettledResult} - A successful or failed outcome
 *
 * @template T - Success value type
 *
 * @example
 * const success: SettledOk<number> = { status: 'ok', value: 42 }
 */
export interface SettledOk<T> {
  readonly status: 'ok'
  readonly value: T
}

/**
 * Represents a failed outcome in a settled result structure (e.g., from Result.allSettled).
 *
 * @see {@link SettledOk} - A successful outcome
 * @see {@link SettledResult} - A successful or failed outcome
 *
 * @template E - Error type
 *
 * @example
 * const failure: SettledErr<string> = { status: 'err', reason: 'Failed' }
 */
export interface SettledErr<E> {
  readonly status: 'err'
  readonly reason: E
}

/**
 * Useful for processing a collection of results where you need to check the status of each.
 *
 * @see {@link SettledOk} - A successful outcome
 * @see {@link SettledErr} - A failed outcome
 *
 * @template T - Success value type
 * @template E - Error type
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
export type SettledResult<T, E> = SettledOk<T> | SettledErr<E>
