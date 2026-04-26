/**
 * Represents a successful outcome in a settled result structure (e.g., from Result.allSettled).
 *
 * @internal
 */
export interface SettledOk<T> {
  readonly status: 'ok'
  readonly value: T
}

/**
 * Represents a failed outcome in a settled result structure (e.g., from Result.allSettled).
 *
 * @internal
 */
export interface SettledErr<E> {
  readonly status: 'err'
  readonly reason: E
}

/**
 * Represents a final outcome of a Result operation, whether success or failure.
 *
 * @internal
 */
export type SettledResult<T, E> = SettledOk<T> | SettledErr<E>

// #endregion
