import type { AsyncResult, Err, Ok, Result } from '@/types';

import { ErrClass } from '@/lib/err';
import { OkClass } from '@/lib/ok';
import { ensureError } from '@/lib/utils';

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
export function ok<TValue>(value: TValue): Ok<TValue, never> {
  return new OkClass(value);
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
export function err<TError = Error>(error: TError): Err<never, TError> {
  return new ErrClass(error);
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
export function fromTry<TValue>(executor: () => TValue): Result<TValue, Error>;

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
export function fromTry<TValue, TError>(
  executor: () => TValue,
  catchErr: (error: unknown) => TError,
): Result<TValue, TError>;

export function fromTry<TValue, TError = Error>(
  executor: () => TValue,
  catchErr?: (error: unknown) => TError,
): Result<TValue, TError | Error> {
  try {
    return new OkClass(executor());
  } catch (error) {
    return new ErrClass(catchErr ? catchErr(error) : ensureError(error));
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
export function fromPromise<TValue>(executor: () => Promise<TValue>): AsyncResult<TValue, Error>;

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
export function fromPromise<TValue, TError>(
  executor: () => Promise<TValue>,
  catchErr: (error: unknown) => TError,
): AsyncResult<TValue, TError>;

export async function fromPromise<T, E>(
  executor: () => Promise<T>,
  catchErr?: (error: unknown) => E,
): AsyncResult<T, E | Error> {
  try {
    return new OkClass(await executor());
  } catch (error) {
    return new ErrClass(catchErr ? catchErr(error) : ensureError(error));
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
export function fromNullable<TValue>(
  value: TValue | null | undefined,
): Result<NonNullable<TValue>, Error>;

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
export function fromNullable<TValue, TError>(
  value: TValue | null | undefined,
  onNull: () => TError,
): Result<NonNullable<TValue>, TError>;

export function fromNullable<TValue, TError = Error>(
  value: TValue | null | undefined,
  onNull?: () => TError,
): Result<NonNullable<TValue>, TError | Error> {
  if (value == null) {
    return new ErrClass(
      onNull ? onNull() : new Error('Value is null or undefined.', { cause: value }),
    );
  }

  return new OkClass(value as NonNullable<TValue>);
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
export function validate<TValue>(
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
export function validate<TValue, TError>(
  value: TValue,
  condition: (value: TValue) => boolean,
  onFailure: (value: TValue) => TError,
): Result<TValue, TError>;

export function validate<TValue, TError = Error>(
  value: TValue,
  condition: (value: TValue) => boolean,
  onFailure?: (value: TValue) => TError | Error,
): Result<TValue, TError | Error> {
  if (!condition(value)) {
    return new ErrClass(
      onFailure ? onFailure(value) : new Error('Validation failed for value.', { cause: value }),
    );
  }

  return new OkClass(value);
}
