import type { AsyncResult, Result } from './types';
import type { ErrTuple, ErrUnion, OkTuple, OkUnion, SettledTuple } from './types/inference';
import type { SettledResult } from './types/settled';

import { TAG } from './brand';
import { Err } from './err';
import { Ok } from './ok';
import { ensureError, isEmptyArray, ResultTypeError } from './utils';

// #region Type Guards

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
function isOk(value: unknown): value is Ok<unknown, never> {
  return value != null && typeof value === 'object' && '_tag' in value && value._tag === TAG.Ok;
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
function isErr(value: unknown): value is Err<never, unknown> {
  return value != null && typeof value === 'object' && '_tag' in value && value._tag === TAG.Err;
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
function isResult(value: unknown): value is Result<unknown, unknown> {
  return (
    value != null &&
    typeof value === 'object' &&
    '_tag' in value &&
    (value._tag === TAG.Ok || value._tag === TAG.Err)
  );
}

// #endregion

// #region Creation

/**
 * Creates a successful {@link Result} containing the provided value.
 *
 * Returns an {@link Ok} wrapping the given value.
 *
 * @group Creation
 *
 * @see {@link err} - Create a failed result.
 *
 * @template TValue - Success value type.
 *
 * @param {TValue} value - Value to wrap.
 *
 * @example
 * Result.ok(42)      // => Ok(42)
 * Result.ok('hello') // => Ok('hello')
 *
 * @example
 * function divide(a: number, b: number): Result<number, string> {
 *   if (b === 0) return Result.err('division by zero')
 *   return Result.ok(a / b)
 * }
 *
 * @example
 * interface User { id: number; name: string }
 * const user: User = { id: 1, name: 'John' }
 *
 * Result.ok(user)
 * // => Ok({ id: 1, name: 'John' })
 */
function ok<TValue>(value: TValue): Ok<TValue, never> {
  return new Ok(value);
}

/**
 * Creates a failed {@link Result} containing the provided error.
 *
 * Returns an {@link Err} wrapping the given error value.
 *
 * @group Creation
 *
 * @see {@link ok} - Create a successful result.
 *
 * @template TError - Error value type.
 *
 * @param {TError} error - Error to wrap.
 *
 * @example
 * Result.err(new Error('something went wrong'))
 * // => Err(Error: "something went wrong")
 *
 * @example
 * function validate(age: number): Result<number, string> {
 *   if (age < 0) return Result.err('age cannot be negative')
 *   if (age > 150) return Result.err('invalid age')
 *
 *   return Result.ok(age)
 * }
 *
 * @example
 * type ValidationError = { field: string; message: string }
 * const result = Result.err<number, ValidationError>({
 *   field: 'email',
 *   message: 'invalid format'
 * })
 */
function err<TError = Error>(error: TError): Err<never, TError> {
  return new Err(error);
}

/**
 * Executes a function and converts the outcome into a {@link Result}.
 *
 * Returns {@link Ok} with the returned value, or {@link Err} if the function throws.
 *
 * @group Creation
 *
 * @overload
 *
 * @see {@link fromPromise} - Async equivalent.
 *
 * @template TValue - Success value type.
 *
 * @param executor - Function to execute.
 *
 * @example
 * Result.fromTry(() => JSON.parse('{"name":"John"}'))
 * // => Ok({name: "John"})
 *
 * Result.fromTry(() => JSON.parse('invalid json'))
 * // => Err(SyntaxError: "...")
 */
function fromTry<TValue>(executor: () => TValue): Result<TValue, Error>;

/**
 * Executes a function and converts thrown errors using a custom mapper.
 *
 * Returns {@link Ok} with the returned value, or {@link Err} with the transformed error.
 *
 * @group Creation
 *
 * @overload
 *
 * @see {@link fromPromise} - Async equivalent.
 *
 * @template TValue - Success value type.
 * @template TError - Error value type.
 *
 * @param executor - Function to execute.
 * @param catchErr - Maps thrown values into a typed error.
 *
 * @example
 * Result.fromTry(
 *   () => JSON.parse(input),
 *   () => ({ type: 'parse_error' }),
 * )
 */
function fromTry<TValue, TError>(
  executor: () => TValue,
  catchErr: (error: unknown) => TError,
): Result<TValue, TError>;

function fromTry<TValue, TError = Error>(
  executor: () => TValue,
  catchErr?: (error: unknown) => TError,
): Result<TValue, TError | Error> {
  try {
    return new Ok(executor());
  } catch (error) {
    return new Err(catchErr ? catchErr(error) : ensureError(error));
  }
}

/**
 * Executes an async function and converts the outcome into a {@link Result}.
 *
 * Resolves to {@link Ok} with the fulfilled value, or {@link Err} if the promise rejects.
 *
 * @group Creation
 *
 * @overload
 *
 * @see {@link fromTry} - Sync equivalent.
 *
 * @template TValue - Success value type.
 *
 * @param executor Async function to execute.
 *
 * @example
 * await Result.fromPromise(() => fetchUser(id))
 * // Ok(user) | Err(Error)
 */
function fromPromise<TValue>(executor: () => Promise<TValue>): AsyncResult<TValue, Error>;

/**
 * Executes an async function and maps rejections using a custom mapper.
 *
 * Resolves to {@link Ok} on success, or {@link Err} with the transformed rejection reason.
 *
 * @group Creation
 *
 * @overload
 *
 * @see {@link fromTry} - Sync equivalent.
 *
 * @template TValue - Resolved value type
 * @template TError - Error value type.
 *
 * @param executor - Async function to execute.
 * @param catchErr - Maps rejected values into a typed error.
 *
 * @example
 * await Result.fromPromise(
 *   () => fetchUser(id),
 *   () => ({ code: 'USER_FETCH_FAILED' }),
 * )
 */
function fromPromise<TValue, TError>(
  executor: () => Promise<TValue>,
  catchErr: (error: unknown) => TError,
): AsyncResult<TValue, TError>;

async function fromPromise<T, E>(
  executor: () => Promise<T>,
  catchErr?: (error: unknown) => E,
): AsyncResult<T, E | Error> {
  try {
    return new Ok(await executor());
  } catch (error) {
    return new Err(catchErr ? catchErr(error) : ensureError(error));
  }
}

/**
 * Creates a {@link Result} from a nullable value.
 *
 * Returns {@link Ok} when the value is neither `null` nor `undefined`, otherwise returns {@link Err} with a default error.
 *
 * @group Creation
 *
 * @overload
 *
 * @template TValue - Input value type.
 *
 * @param value - Nullable value.
 *
 * @example
 * Result.fromNullable(42)
 * // => Ok(42)
 *
 * Result.fromNullable(null)
 * // => Err(Error: "Value is null or undefined")
 *
 * @example
 * const users = [{ id: 1, name: 'Ana' }, { id: 2, name: 'Bob' }]
 * const user = Result.fromNullable(
 *   users.find((u) => u.id === 3)
 * )
 * // => Err(Error: "Value is null or undefined")
 */
function fromNullable<TValue>(value: TValue | null | undefined): Result<NonNullable<TValue>, Error>;

/**
 * Creates a {@link Result} from a nullable value using a custom error.
 *
 * Returns {@link Ok} when the value exists, otherwise returns {@link Err} with the generated error.
 *
 * @group Creation
 *
 * @overload
 *
 * @template TValue - Input value type.
 * @template TError - Error value type.
 *
 * @param value - Nullable value.
 * @param onNull - Produces an error when value is nullish.
 *
 * @example
 * // With personalized error
 * const config = Result.fromNullable(
 *   process.env.API_KEY,
 *   () => new Error('API_KEY missing')
 * )
 * // => Err(Error: "API_KEY missing")
 */
function fromNullable<TValue, TError>(
  value: TValue | null | undefined,
  onNull: () => TError,
): Result<NonNullable<TValue>, TError>;

function fromNullable<TValue, TError = Error>(
  value: TValue | null | undefined,
  onNull?: () => TError,
): Result<NonNullable<TValue>, TError | Error> {
  if (value == null) {
    return new Err(onNull ? onNull() : new Error('Value is null or undefined', { cause: value }));
  }

  return new Ok(value as NonNullable<TValue>);
}

/**
 * Validates a value using a predicate.
 *
 * Returns {@link Ok} when the predicate succeeds, otherwise returns {@link Err} with a default error.
 *
 * @group Creation
 *
 * @overload
 *
 * @template TValue - Value type
 *
 * @param {TValue} value - Value to validate
 * @param condition - Validation predicate.
 *
 * @example
 * Result.validate(42, (x) => x > 40)
 * // => Ok(42)
 *
 * Result.validate(42, (x) => x  < 18)
 * // => Err(Error: "Validation failed for value")
 */
function validate<TValue>(
  value: TValue,
  condition: (value: TValue) => boolean,
): Result<TValue, Error>;

/**
 * Validates a value using a predicate and custom error factory.
 *
 * Returns {@link Ok} when valid, otherwise returns {@link Err} with the generated error.
 *
 * @group Creation
 *
 * @overload
 *
 * @template T - Value type
 * @template TError - Error type
 *
 * @param value - Value to validate.
 * @param condition - Validation predicate.
 * @param onFailure - Produces an error when validation fails.
 *
 * @example
 * const age = Result.validate(
 *   42,
 *   (x) => x < 40,
 *   (x) => new Error(`${x} is too small`)
 * )
 * // Err(Error: '42 is too small')
 */
function validate<TValue, TError>(
  value: TValue,
  condition: (value: TValue) => boolean,
  onFailure: (value: TValue) => TError,
): Result<TValue, TError>;

function validate<TValue, TError = Error>(
  value: TValue,
  condition: (value: TValue) => boolean,
  onFailure?: (value: TValue) => TError | Error,
): Result<TValue, TError | Error> {
  if (!condition(value)) {
    return new Err(
      onFailure ? onFailure(value) : new Error('Validation failed for value', { cause: value }),
    );
  }

  return new Ok(value);
}

// #endregion

// #region Collections

/**
 * Combines multiple {@link Result} values into a single result containing a tuple of success values.
 *
 * Returns {@link Ok} only when every entry is successful. Stops at the first {@link Err} encountered.
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
function all<const TResults extends readonly Result<unknown, unknown>[]>(
  results: TResults,
): Result<OkTuple<TResults>, ErrUnion<TResults>> {
  if (isEmptyArray(results)) {
    return new Ok([]) as Result<OkTuple<TResults>, ErrUnion<TResults>>;
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

  return new Ok(okValues) as Result<OkTuple<TResults>, ErrUnion<TResults>>;
}

/**
 * Collects the settled state of every {@link Result}.
 *
 * Unlike {@link all}, this never short-circuits and always returns {@link Ok} containing each success or failure outcome.
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
function allSettled<const TResults extends readonly Result<unknown, unknown>[]>(
  results: TResults,
): Ok<SettledTuple<TResults>> {
  if (isEmptyArray(results)) {
    return new Ok([]) as Ok<SettledTuple<TResults>>;
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

  return new Ok(settledResults) as Ok<SettledTuple<TResults>>;
}

/**
 * Returns the first successful {@link Result}.
 *
 * If no entry succeeds, returns {@link Err} containing all collected
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
function any<const TResults extends readonly Result<unknown, unknown>[]>(
  results: TResults,
): Result<OkUnion<TResults>, ErrTuple<TResults>> {
  if (isEmptyArray(results)) {
    return new Err([]) as Result<OkUnion<TResults>, ErrTuple<TResults>>;
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

  return new Err(errorValues) as Result<OkUnion<TResults>, ErrTuple<TResults>>;
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
function partition<T, E>(results: readonly Result<T, E>[]): [T[], E[]] {
  if (isEmptyArray(results)) {
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
 * All {@link Err} entries are ignored.
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
function values<T, E>(results: readonly Result<T, E>[]): T[] {
  if (isEmptyArray(results)) {
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
 * All {@link Ok} entries are ignored.
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
function errors<T, E>(results: readonly Result<T, E>[]): E[] {
  if (isEmptyArray(results)) {
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

// #endregion

// biome-ignore format: off
export default {
  // Type guards
  isOk,
  isErr,
  isResult,
  // Creation
  ok,
  err,
  fromTry,
  fromNullable,
  fromPromise,
  validate,
  // Collection
  all,
  allSettled,
  any,
  partition,
  values,
  errors,
}
