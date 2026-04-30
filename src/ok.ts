import type { AsyncResult, Err as IErr, Ok as IOk, Result } from './types';
import type { MatchCases } from './types/methods';

import { TAG } from './brand';
import { Err } from './err';
import { formatForDisplay } from './utils';

export class Ok<T, E = never> implements IOk<T, E> {
  readonly _tag = TAG.Ok;
  readonly #value: T;

  constructor(value: T) {
    this.#value = value;
  }

  // #region Type Guards

  isOk(): this is IOk<T, E> {
    return true;
  }

  isErr(): this is IErr<T, E> {
    return false;
  }

  isOkAnd(condition: (value: T) => boolean): this is IOk<T, E> {
    return condition(this.#value);
  }

  isErrAnd(_condition: (error: E) => boolean): this is IErr<T, E> {
    return false;
  }

  // #endregion

  // #region Extraction

  unwrap(): T {
    return this.#value;
  }

  unwrapErr(): never {
    throw new Error('Called unwrapErr on an Ok value', { cause: this.#value });
  }

  unwrapOr<U = T>(_defaultValue: U): T | U {
    return this.#value;
  }

  unwrapOrElse<U = T>(_fallback: (error: E) => U): T | U {
    return this.#value;
  }

  expect(_reason: string): T {
    return this.#value;
  }

  expectErr(reason: string): never {
    throw new Error(reason, { cause: this.#value });
  }

  // #endregion

  // #region Transformation

  map<U>(mapper: (value: T) => U): Result<U, E> {
    return new Ok(mapper(this.#value));
  }

  mapOr<U>(mapper: (value: T) => U, _defaultValue: U): U {
    return mapper(this.#value);
  }

  mapOrElse<U>(okMapper: (value: T) => U, _errMapper: (error: E) => U): U {
    return okMapper(this.#value);
  }

  mapErr<E2>(_mapper: (error: E) => E2): Result<T, E2> {
    return this as unknown as Result<T, E2>;
  }

  filter(condition: (value: T) => boolean, reason?: string): Result<T, Error> {
    if (!condition(this.#value)) {
      return new Err(new Error(reason ?? 'Filter predicate failed', { cause: this.#value }));
    }

    return this as unknown as Result<T, Error>;
  }

  filterOrElse<E2>(
    condition: (value: T) => boolean,
    onFailure: (value: T) => E2,
  ): Result<T, E | E2> {
    if (!condition(this.#value)) {
      return new Err(onFailure(this.#value)) as unknown as Result<T, E | E2>;
    }

    return this as unknown as Result<T, E | E2>;
  }

  flatten<U, E2>(this: IOk<Result<U, E2>, E>): Result<U, E | E2> {
    return this.unwrap();
  }

  // #endregion

  // #region Alternation

  and<U, E2 = never>(other: Result<U, E2>): Result<U, E | E2> {
    return other;
  }

  andThen<U, E2 = never>(next: (value: T) => Result<U, E2>): Result<U, E | E2> {
    return next(this.#value);
  }

  or<U = T, E2 = never>(_other: Result<U, E2>): Result<T | U, E2> {
    return this as unknown as Result<T | U, E2>;
  }

  orElse<U = T, E2 = never>(_fallback: (error: E) => Result<U, E2>): Result<T | U, E2> {
    return this as unknown as Result<T | U, E2>;
  }

  // #endregion

  // #region Combination

  zip<U, E2>(other: Result<U, E2>): Result<[T, U], E | E2> {
    if (other.isErr()) {
      return new Err<[T, U], E | E2>(other.unwrapErr());
    }

    return new Ok<[T, U], E | E2>([this.#value, other.unwrap()]);
  }

  zipWith<U, R, E2>(
    other: Result<U, E2>,
    combine: (value: T, otherValue: U) => R,
  ): Result<R, E | E2> {
    if (other.isErr()) {
      return new Err<R, E | E2>(other.unwrapErr());
    }

    return new Ok<R, E | E2>(combine(this.#value, other.unwrap()));
  }

  // #endregion

  // #region Inspection

  contains<U>(value: U, comparator?: (actual: T, expected: U) => boolean): boolean {
    if (comparator) {
      return comparator(this.#value, value);
    }

    if (this.#value != null && typeof this.#value === 'object') {
      try {
        return JSON.stringify(this.#value) === JSON.stringify(value);
      } catch {
        return false;
      }
    }

    return (this.#value as unknown) === value;
  }

  match<L, R>(cases: MatchCases<T, E, L, R>): L | R {
    return cases.ok(this.#value);
  }

  inspect(action: (value: T) => void): this {
    action(this.#value);

    return this;
  }

  inspectErr(_action: (error: E) => void): this {
    return this;
  }

  // #endregion

  // #region Async Transformation

  async mapAsync<U>(mapper: (value: T) => Promise<U>): AsyncResult<U, E> {
    return new Ok(await mapper(this.#value));
  }

  mapErrAsync<E2>(_mapper: (error: E) => Promise<E2>): AsyncResult<T, E2> {
    return Promise.resolve(this as unknown as Result<T, E2>);
  }

  mapOrAsync<U>(mapper: (value: T) => Promise<U>, _defaultValue: U): Promise<U> {
    return mapper(this.#value);
  }

  mapOrElseAsync<U>(
    okMapper: (value: T) => Promise<U>,
    _errMapper: (error: E) => Promise<U>,
  ): Promise<U> {
    return okMapper(this.#value);
  }

  // #endregion

  // #region Async Alternation

  andAsync<U, E2 = never>(other: AsyncResult<U, E2>): AsyncResult<U, E | E2> {
    return other;
  }

  andThenAsync<U, E2 = never>(next: (value: T) => AsyncResult<U, E2>): AsyncResult<U, E | E2> {
    return next(this.#value);
  }

  orAsync<U = T, E2 = never>(_other: AsyncResult<U, E2>): AsyncResult<T | U, E2> {
    return Promise.resolve(this as unknown as Result<T | U, E2>);
  }

  orElseAsync<U = T, E2 = never>(
    _fallback: (error: E) => AsyncResult<U, E2>,
  ): AsyncResult<T | U, E2> {
    return Promise.resolve(this as unknown as Result<T | U, E2>);
  }

  // #endregion

  // #region Conversion

  toString(): string {
    return `Ok(${formatForDisplay(this.#value)})`;
  }

  toJSON(): { type: 'ok'; value: T } {
    return { type: 'ok', value: this.#value };
  }

  toNullable(): T {
    return this.#value;
  }

  toValue(): T {
    return this.#value;
  }

  // #endregion
}
