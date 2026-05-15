import { OkClass } from "@/lib/ok";
import { hasNoItems, ResultTypeError } from "@/lib/utils";
import type { Result } from "@/types";
import type { ErrTuple, ErrUnion, OkTuple, OkUnion, SettledTuple } from "@/types/inference";
import { isResult } from "./type-guards";
import type { SettledResult } from "@/types/settled";
import { ErrClass } from "@/lib/err";

/**
 * Combines multiple {@link Result} values into a single result containing a tuple of success values.
 *
 * Returns {@link OkClass} only when every entry is successful. Stops at the first {@link ErrClass} encountered.
 *
 * @group Collections
 *
 * @see {@link allSettled} - Collect every outcome without short-circuiting.
 *
 * @template TResults - Tuple of result types.
 *
 * @param {TResults} results - Collection of results to combine.
 *
 * @example
 * Result.all([
 *   Result.ok(1),
 *   Result.ok('two'),
 *   Result.ok(true)
 * ])
 * // => Ok([1, "two", true])
 *
 * @example
 * Result.all([
 *   Result.ok(1),
 *   Result.err('error 1'),
 *   Result.err('error 2')
 * ])
 * // => Err("error 1")
 *
 * @example
 * Result.all([])
 * // => Ok([])
 */
export function all<const TResults extends readonly Result<unknown, unknown>[]>(
  results: TResults,
): Result<OkTuple<TResults>, ErrUnion<TResults>> {
  if (hasNoItems(results)) {
    return new OkClass([]) as Result<OkTuple<TResults>, ErrUnion<TResults>>;
  }

  const okValues: unknown[] = [];

  for (const [i, result] of results.entries()) {
    if (!isResult(result)) {
      throw new ResultTypeError(
        `Result.all() received an invalid value at index [${i}]: expected a Result, got "${typeof result}"`,
        result,
      );
    }

    if (result.isErr()) {
      return result as Result<OkTuple<TResults>, ErrUnion<TResults>>;
    }

    okValues.push(result.unwrap());
  }

  return new OkClass(okValues) as Result<OkTuple<TResults>, ErrUnion<TResults>>;
}

/**
 * Collects the settled state of every {@link Result}.
 *
 * Unlike {@link all}, this never short-circuits and always returns {@link OkClass} containing each success or failure outcome.
 *
 * Similar to `Promise.allSettled()`.
 *
 * @group Collections
 *
 * @see {@link all} - Require all results to succeed.
 *
 * @template TResults - Tuple of result types.
 *
 * @param results - Collection of results to inspect.
 *
 * @example
 * const settled = Result.allSettled([
 *   Result.ok(1),
 *   Result.err('fail'),
 * ]).unwrap()
 * // [
 * //   { status: 'ok', value: 1 },
 * //   { status: 'err', reason: 'fail' },
 * // ]
 *
 * @example
 * Result.allSettled([])
 * // => Ok([])
 */
export function allSettled<const TResults extends readonly Result<unknown, unknown>[]>(
  results: TResults,
): OkClass<SettledTuple<TResults>> {
  if (hasNoItems(results)) {
    return new OkClass([]) as OkClass<SettledTuple<TResults>>;
  }

  const settledResults: SettledResult<OkUnion<TResults>, ErrUnion<TResults>>[] = [];

  for (const [i, result] of results.entries()) {
    if (!isResult(result)) {
      throw new ResultTypeError(
        `Result.allSettled() received an invalid value at index [${i}]: expected a Result, got "${typeof result}"`,
        result,
      );
    }

    result.isOk()
      ? settledResults.push({
          status: 'ok',
          value: result.unwrap() as OkUnion<TResults>,
        })
      : settledResults.push({
          status: 'err',
          reason: result.unwrapErr() as ErrUnion<TResults>,
        });
  }

  return new OkClass(settledResults) as OkClass<SettledTuple<TResults>>;
}

/**
 * Returns the first successful {@link Result}.
 *
 * If no entry succeeds, returns {@link ErrClass} containing all collected
 * error values in order.
 *
 * @group Collections
 *
 * @see {@link all} - Require every result to succeed.
 *
 * @template TResults - Tuple of result types.
 *
 * @param results Collection of results to evaluate.
 *
 * @example
 * Result.any([
 *   Result.err('error 1'),
 *   Result.err('error 2'),
 *   Result.err('error 3'),
 * ])
 * // => Err(['error 1', 'error 2', 'error 3'])
 *
 * @example
 * Result.any([
 *   Result.err('error 1'),
 *   Result.ok(42),
 *   Result.ok(99),
 * ])
 * // => Ok(42)
 *
 * @example
 * Result.any([])
 * // => Err([])
 */
export function any<const TResults extends readonly Result<unknown, unknown>[]>(
  results: TResults,
): Result<OkUnion<TResults>, ErrTuple<TResults>> {
  if (hasNoItems(results)) {
    return new ErrClass([]) as Result<OkUnion<TResults>, ErrTuple<TResults>>;
  }

  const errorValues: unknown[] = [];

  for (const [i, result] of results.entries()) {
    if (!isResult(result)) {
      throw new ResultTypeError(
        `Result.any() received an invalid value at index [${i}]: expected a Result, got "${typeof result}"`,
        result,
      );
    }

    if (result.isOk()) {
      return result as Result<OkUnion<TResults>, ErrTuple<TResults>>;
    }

    errorValues.push(result.unwrapErr());
  }

  return new ErrClass(errorValues) as Result<OkUnion<TResults>, ErrTuple<TResults>>;
}

/**
 * Splits a collection of {@link Result} values into successes and failures.
 *
 * Returns a tuple containing:
 *
 * - index `0`: all success values
 * - index `1`: all error values
 *
 * @group Collections
 *
 * @see {@link values} - Collect only success values.
 * @see {@link errors} - Collect only error values.
 *
 * @template T - Success value type.
 * @template E - Error value type.
 *
 * @param results - Collection of results to partition.
 *
 * @example
 * const [oks, errs] = Result.partition([
 *   Result.ok(1),
 *   Result.err('failure A'),
 *   Result.ok(2),
 *   Result.err('failure B'),
 * ])
 * // => [[1, 2], ["failure A", "failure B"]]
 *
 * @example
 * Result.partition([])
 * // => [[], []]
 */
export function partition<T, E>(results: readonly Result<T, E>[]): [T[], E[]] {
  if (hasNoItems(results)) {
    return [[], []];
  }

  const oks: T[] = [];
  const errs: E[] = [];

  for (const [i, result] of results.entries()) {
    if (!isResult(result)) {
      throw new ResultTypeError(
        `Result.partition() received an invalid value at index [${i}]: expected a Result, got "${typeof result}"`,
        result,
      );
    }

    result.isOk() ? oks.push(result.unwrap()) : errs.push(result.unwrapErr());
  }

  return [oks, errs];
}

/**
 * Extracts only success values from a collection of {@link Result} values.
 *
 * All {@link ErrClass} entries are ignored.
 *
 * @group Collections
 *
 * @see {@link errors} - Extract only error values.
 *
 * @template T - Success value type
 * @template E - Error value type
 *
 * @param results - Collection of results.
 *
 * @example
 * Result.values([
 *   Result.ok(1),
 *   Result.err('fail'),
 *   Result.ok(2),
 * ])
 * // [1, 2]
 *
 * @example
 * Result.values([])
 * // []
 */
export function values<T, E>(results: readonly Result<T, E>[]): T[] {
  if (hasNoItems(results)) {
    return [];
  }

  const oks: T[] = [];

  for (const [i, result] of results.entries()) {
    if (!isResult(result)) {
      throw new ResultTypeError(
        `Result.values() received an invalid value at index [${i}]: expected a Result, got "${typeof result}"`,
        result,
      );
    }

    if (result.isOk()) {
      oks.push(result.unwrap());
    }
  }

  return oks;
}

/**
 * Extracts only error values from a collection of {@link Result} values.
 *
 * All {@link OkClass} entries are ignored.
 *
 * @group Collections
 *
 * @see {@link values} Extract only success values.
 *
 * @template T - Success value type
 * @template E - Error value type
 *
 * @param results - Collection of results.
 *
 * @example
 * Result.errors([
 *   Result.ok(1),
 *   Result.err('fail A'),
 *   Result.ok(2),
 *   Result.err('fail B'),
 * ])
 * // => ['fail A', 'fail B']
 *
 * @example
 * Result.errors([])
 * // => []
 */
export function errors<T, E>(results: readonly Result<T, E>[]): E[] {
  if (hasNoItems(results)) {
    return [];
  }

  const errs: E[] = [];

  for (const [i, result] of results.entries()) {
    if (!isResult(result)) {
      throw new ResultTypeError(
        `Result.errors() received an invalid value at index [${i}]: expected a Result, got "${typeof result}"`,
        result,
      );
    }

    if (result.isErr()) {
      errs.push(result.unwrapErr());
    }
  }

  return errs;
}
