import type { Err, Ok, Result } from '@/types';

import { ERR_TAG } from '@/lib/err';
import { OK_TAG } from '@/lib/ok';
import { isRecord } from '@/lib/utils';

/**
 * Checks whether a value is an {@link Ok} result.
 *
 * @group Type Guards
 *
 * @see {@link isErr} Check for {@link Err}.
 * @see {@link isResult} Check for any result variant.
 *
 * @param value - Value to check
 *
 * @example
 * Result.isOk(Result.ok(1))
 * // true
 *
 * Result.isOk(Result.err('fail'))
 * // false
 *
 * Result.isOk(42)
 * // false
 */
export function isOk(value: unknown): value is Ok<unknown, never> {
  return isRecord(value) && OK_TAG in value;
}

/**
 * Checks whether a value is an {@link Err} result.
 *
 * @group Type Guards
 *
 * @see {@link isOk} - Check for {@link Ok}.
 * @see {@link isResult} - Check for any result variant.
 *
 * @param value - Value to check
 *
 * @example
 * Result.isErr(Result.err('fail'))
 * // true
 *
 * Result.isErr(Result.ok(1))
 * // false
 *
 * Result.isErr(null)
 * // false
 */
export function isErr(value: unknown): value is Err<never, unknown> {
  return isRecord(value) && ERR_TAG in value;
}

/**
 * Checks whether a value is a {@link Result}.
 *
 * Returns `true` for both {@link Ok} and {@link Err} instances.
 *
 * @group Type Guards
 *
 * @see {@link isOk} Check specifically for success values.
 * @see {@link isErr} Check specifically for failure values.
 *
 * @param {unknown} value - Value to check
 *
 * @example
 * Result.isResult(Result.ok(1))
 * // true
 *
 * Result.isResult(Result.err('fail'))
 * // true
 *
 * @example
 * Result.isResult(42)
 * // false
 *
 * Result.isResult({ ok: true })
 * // false
 */
export function isResult(value: unknown): value is Result<unknown, unknown> {
  return isRecord(value) && (OK_TAG in value || ERR_TAG in value);
}
