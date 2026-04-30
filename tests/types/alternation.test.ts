import { describe, expectTypeOf, it } from 'vitest';

import type { Result } from '@/types/index';

import { Result as R } from '@/index';

// ---------------------------------------------------------------------------
// and
// ---------------------------------------------------------------------------

describe('Result#and — type inference', () => {
  it('should infer Result<U, E | E2> combining both error types', () => {
    const a: Result<number, string> = R.ok(1);
    const b: Result<boolean, Error> = R.ok(true);
    expectTypeOf(a.and(b)).toEqualTypeOf<Result<boolean, string | Error>>();
  });

  it('should infer Result<U, E> when E2 is never', () => {
    const result = R.ok(1).and(R.ok('hello'));
    expectTypeOf(result).toEqualTypeOf<Result<string, never>>();
  });
});

// ---------------------------------------------------------------------------
// andThen
// ---------------------------------------------------------------------------

describe('Result#andThen — type inference', () => {
  it('should infer Result<U, E | E2> from flat mapper', () => {
    const result: Result<number, string> = R.ok(1);
    const chained = result.andThen((x) => R.ok(x > 0));
    expectTypeOf(chained).toEqualTypeOf<Result<boolean, string>>();
  });

  it('should accumulate error union across multiple andThen calls', () => {
    const result: Result<number, string> = R.ok(1);
    const chained = result
      .andThen((x): Result<string, Error> => R.ok(String(x)))
      .andThen((s): Result<boolean, RangeError> => R.ok(s.length > 0));

    expectTypeOf(chained).toEqualTypeOf<Result<boolean, string | Error | RangeError>>();
  });
});

// ---------------------------------------------------------------------------
// or
// ---------------------------------------------------------------------------

describe('Result#or — type inference', () => {
  it('should infer Result<T, E2> using the alternative error type', () => {
    const result: Result<number, string> = R.err('fail');
    const alternative: Result<number, Error> = R.ok(0);
    expectTypeOf(result.or(alternative)).toEqualTypeOf<Result<number, Error>>();
  });
});

describe('Result#or — bare Err (T = never)', () => {
  it('should infer Result<U, E2> when called on a bare Err', () => {
    const result = R.err('fail').or(R.ok(0));
    expectTypeOf(result).toEqualTypeOf<Result<number, never>>();
  });

  it('should infer Result<number | string, never> when T and U differ', () => {
    const result: Result<number, string> = R.err('fail');
    expectTypeOf(result.or(R.ok('fallback'))).toEqualTypeOf<Result<number | string, never>>();
  });
});

// ---------------------------------------------------------------------------
// orElse
// ---------------------------------------------------------------------------

describe('Result#orElse — type inference', () => {
  it('should infer Result<T, E2> from recovery function', () => {
    const result: Result<number, string> = R.err('fail');
    const recovered = result.orElse((e) => R.ok(e.length));
    expectTypeOf(recovered).toEqualTypeOf<Result<number, never>>();
  });

  it('should infer Result<T, E2> when recovery returns a new Err type', () => {
    const result: Result<number, string> = R.err('fail');
    const recovered = result.orElse((_e): Result<number, Error> => R.err(new Error('recovered')));
    expectTypeOf(recovered).toEqualTypeOf<Result<number, Error>>();
  });
});

describe('Result#orElse — bare Err (T = never)', () => {
  it('should infer Result<U, never> when called on a bare Err', () => {
    const result = R.err('fail').orElse(() => R.ok(42));
    expectTypeOf(result).toEqualTypeOf<Result<number, never>>();
  });
});

// ---------------------------------------------------------------------------
// zip / zipWith
// ---------------------------------------------------------------------------

describe('Result#zip — type inference', () => {
  it('should infer Result<[T, U], E | E2> from two Ok results', () => {
    const a: Result<number, string> = R.ok(1);
    const b: Result<boolean, Error> = R.ok(true);
    expectTypeOf(a.zip(b)).toEqualTypeOf<Result<[number, boolean], string | Error>>();
  });
});

describe('Result#zipWith — type inference', () => {
  it('should infer Result<R, E | E2> from mapper return type', () => {
    const a: Result<number, string> = R.ok(1);
    const b: Result<number, Error> = R.ok(2);
    const result = a.zipWith(b, (x, y) => ({ sum: x + y }));
    expectTypeOf(result).toEqualTypeOf<Result<{ sum: number }, string | Error>>();
  });
});
