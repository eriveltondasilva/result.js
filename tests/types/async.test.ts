import { describe, expectTypeOf, it } from 'vitest';

import type { AsyncResult, Result } from '@/index';

import { Result as R } from '@/index';

// ---------------------------------------------------------------------------
// mapAsync
// ---------------------------------------------------------------------------

describe('Result#mapAsync — type inference', () => {
  it('should infer AsyncResult<U, E> from async mapper', () => {
    const result: Result<number, string> = R.ok(1);
    expectTypeOf(result.mapAsync(async (x) => String(x))).toEqualTypeOf<
      AsyncResult<string, string>
    >();
  });

  it('should infer AsyncResult<U, E> unchanged on Err', () => {
    const result: Result<number, string> = R.err('fail');
    expectTypeOf(result.mapAsync(async (x) => x * 2)).toEqualTypeOf<AsyncResult<number, string>>();
  });
});

// ---------------------------------------------------------------------------
// mapErrAsync
// ---------------------------------------------------------------------------

describe('Result#mapErrAsync — type inference', () => {
  it('should infer AsyncResult<T, E2> from async error mapper', () => {
    const result: Result<number, string> = R.err('fail');
    expectTypeOf(result.mapErrAsync(async (e) => new Error(e))).toEqualTypeOf<
      AsyncResult<number, Error>
    >();
  });

  it('should preserve T on Ok', () => {
    const result: Result<number, string> = R.ok(1);
    expectTypeOf(result.mapErrAsync(async (e) => new Error(e))).toEqualTypeOf<
      AsyncResult<number, Error>
    >();
  });
});

// ---------------------------------------------------------------------------
// mapOrAsync / mapOrElseAsync
// ---------------------------------------------------------------------------

describe('Result#mapOrAsync — type inference', () => {
  it('should infer Promise<U>', () => {
    const result: Result<number, string> = R.ok(1);
    expectTypeOf(result.mapOrAsync(async (x) => String(x), 'default')).toEqualTypeOf<
      Promise<string>
    >();
  });
});

describe('Result#mapOrElseAsync — type inference', () => {
  it('should infer Promise<U> where U is the common return type', () => {
    const result: Result<number, string> = R.ok(1);
    const value = result.mapOrElseAsync(
      async (x) => x * 2,
      async (e) => e.length,
    );
    expectTypeOf(value).toEqualTypeOf<Promise<number>>();
  });
});

// ---------------------------------------------------------------------------
// andAsync / andThenAsync
// ---------------------------------------------------------------------------

describe('Result#andAsync — type inference', () => {
  it('should infer AsyncResult<U, E | E2>', () => {
    const a: Result<number, string> = R.ok(1);
    const b: AsyncResult<boolean, Error> = Promise.resolve(R.ok(true));
    expectTypeOf(a.andAsync(b)).toEqualTypeOf<AsyncResult<boolean, string | Error>>();
  });
});

describe('Result#andThenAsync — type inference', () => {
  it('should infer AsyncResult<U, E | E2> from async flat mapper', () => {
    const result: Result<number, string> = R.ok(1);
    const chained = result.andThenAsync(async (x): AsyncResult<boolean, Error> => R.ok(x > 0));
    expectTypeOf(chained).toEqualTypeOf<AsyncResult<boolean, string | Error>>();
  });
});

// ---------------------------------------------------------------------------
// orAsync / orElseAsync
// ---------------------------------------------------------------------------

describe('Result#orAsync — type inference', () => {
  it('should infer AsyncResult<T, E2>', () => {
    const result: Result<number, string> = R.err('fail');
    const alternative: AsyncResult<number, Error> = Promise.resolve(R.ok(0));
    expectTypeOf(result.orAsync(alternative)).toEqualTypeOf<AsyncResult<number, Error>>();
  });
});

describe('Result#orElseAsync — type inference', () => {
  it('should infer AsyncResult<T, E2> from async recovery function', () => {
    const result: Result<number, string> = R.err('fail');
    const recovered = result.orElseAsync(async (_e): AsyncResult<number, Error> => R.ok(0));
    expectTypeOf(recovered).toEqualTypeOf<AsyncResult<number, Error>>();
  });
});

// ---------------------------------------------------------------------------
// AsyncResult as Promise<Result<T, E>>
// ---------------------------------------------------------------------------

describe('AsyncResult structural type', () => {
  it('should be assignable to Promise<Result<T, E>>', () => {
    const result: AsyncResult<number, Error> = R.fromPromise(async () => 42);
    expectTypeOf(result).toEqualTypeOf<Promise<Result<number, Error>>>();
  });

  it('should resolve to Result<T, E> after await', async () => {
    const asyncResult: AsyncResult<number, Error> = R.fromPromise(async () => 1);
    const resolved = await asyncResult;
    expectTypeOf(resolved).toEqualTypeOf<Result<number, Error>>();
  });
});
