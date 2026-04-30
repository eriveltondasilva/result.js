import { describe, expectTypeOf, it } from 'vitest';

import type { Err, Ok, Result } from '@/types/index';

import { Result as R } from '@/index';

// ---------------------------------------------------------------------------
// map
// ---------------------------------------------------------------------------

describe('Result#map — type inference', () => {
  it('should infer Result<U, E> after mapping Ok<T, E>', () => {
    const result = R.ok(42).map((x) => String(x));
    expectTypeOf(result).toEqualTypeOf<Result<string, never>>();
  });

  it('should preserve E and change T after map on union Result', () => {
    const result: Result<number, string> = R.ok(1);
    expectTypeOf(result.map((x) => x * 2)).toEqualTypeOf<Result<number, string>>();
  });

  it('should preserve Err type unchanged after map on Err', () => {
    const result = R.err('fail').map((x: number) => x * 2);
    expectTypeOf(result).toEqualTypeOf<Result<number, string>>();
  });

  it('should chain map preserving the final mapped type', () => {
    const result = R.ok('42')
      .map((s) => parseInt(s, 10))
      .map((n) => ({ value: n }));
    expectTypeOf(result).toEqualTypeOf<Result<{ value: number }, never>>();
  });
});

// ---------------------------------------------------------------------------
// mapErr
// ---------------------------------------------------------------------------

describe('Result#mapErr — type inference', () => {
  it('should infer Result<T, E2> after mapping the error', () => {
    const result = R.err('fail').mapErr((e) => new Error(e));
    expectTypeOf(result).toEqualTypeOf<Result<never, Error>>();
  });

  it('should preserve T and change E on union Result', () => {
    const result: Result<number, string> = R.err('fail');
    expectTypeOf(result.mapErr((e) => ({ message: e }))).toEqualTypeOf<
      Result<number, { message: string }>
    >();
  });
});

// ---------------------------------------------------------------------------
// mapOr / mapOrElse
// ---------------------------------------------------------------------------

describe('Result#mapOr — type inference', () => {
  it('should infer U as the return type', () => {
    const value = R.ok(10).mapOr((x) => String(x), 'default');
    expectTypeOf(value).toEqualTypeOf<string>();
  });
});

describe('Result#mapOrElse — type inference', () => {
  it('should infer the union of both handler return types', () => {
    const result: Result<number, string> = R.ok(1);
    const value = result.mapOrElse(
      (x) => x * 2,
      (e) => e.length,
    );
    expectTypeOf(value).toEqualTypeOf<number>();
  });
});

// ---------------------------------------------------------------------------
// filter / filterOrElse
// ---------------------------------------------------------------------------

describe('Result#filter — type inference', () => {
  it('should return Result<T, Error> after filter on Ok', () => {
    const result = R.ok(42).filter((x) => x > 0);
    expectTypeOf(result).toEqualTypeOf<Result<number, Error>>();
  });

  it('should preserve existing Err type through filter on Err', () => {
    const result = (R.err('fail') as Result<number, string>).filter((x) => x > 0);
    expectTypeOf(result).toEqualTypeOf<Result<number, Error>>();
  });
});

describe('Result#filterOrElse — type inference', () => {
  it('should infer Result<T, E | E2> combining existing and new error types', () => {
    const result = R.ok(42).filterOrElse(
      (x) => x > 0,
      (x) => `${x} is invalid`,
    );
    expectTypeOf(result).toEqualTypeOf<Result<number, never | string>>();
  });
});

// ---------------------------------------------------------------------------
// flatten
// ---------------------------------------------------------------------------

describe('Result#flatten — type inference', () => {
  it('should unwrap Ok<Ok<T>> to Result<T>', () => {
    const nested = R.ok(R.ok(42));
    expectTypeOf(nested.flatten()).toEqualTypeOf<Result<number, never>>();
  });

  it('should unwrap Ok<Err<T, E>> to Result<T, E>', () => {
    const nested = R.ok(R.err('inner') as Result<number, string>);
    expectTypeOf(nested.flatten()).toEqualTypeOf<Result<number, string>>();
  });

  it('should preserve Err on Err.flatten', () => {
    const result = R.err('outer') as Result<Result<number, string>, string>;
    expectTypeOf(result.flatten()).toEqualTypeOf<Result<number, string>>();
  });
});

// ---------------------------------------------------------------------------
// match
// ---------------------------------------------------------------------------

describe('Result#match — type inference', () => {
  it('should infer the union of both handler return types', () => {
    const result: Result<number, string> = R.ok(1);
    const value = result.match({
      ok: (x) => x * 2,
      err: (e) => e.length,
    });
    expectTypeOf(value).toEqualTypeOf<number>();
  });

  it('should infer union when handlers return different types', () => {
    const result: Result<number, string> = R.ok(1);
    const value = result.match({
      ok: (x) => x,
      err: (e) => e,
    });
    expectTypeOf(value).toEqualTypeOf<number | string>();
  });
});

// ---------------------------------------------------------------------------
// contains
// ---------------------------------------------------------------------------

describe('Result#contains — type inference', () => {
  it('should return boolean', () => {
    expectTypeOf(R.ok(1).contains(1)).toEqualTypeOf<boolean>();
  });
});

// ---------------------------------------------------------------------------
// Extraction methods narrowing
// ---------------------------------------------------------------------------

describe('Extraction narrowing after type guards', () => {
  it('should narrow unwrap() to T after isOk check', () => {
    const result: Result<number, string> = R.ok(1);
    if (result.isOk()) {
      expectTypeOf(result.unwrap()).toEqualTypeOf<number>();
    }
  });

  it('should narrow unwrapErr() to E after isErr check', () => {
    const result: Result<number, string> = R.err('fail');
    if (result.isErr()) {
      expectTypeOf(result.unwrapErr()).toEqualTypeOf<string>();
    }
  });

  it('unwrap() on Ok<T> should be T, not T | never', () => {
    expectTypeOf(R.ok(42).unwrap()).toEqualTypeOf<number>();
  });

  it('unwrapErr() on Err<T, E> should be E, not E | never', () => {
    expectTypeOf(R.err('fail').unwrapErr()).toEqualTypeOf<string>();
  });

  it('unwrap() on Err should be never', () => {
    type UnwrapResult = Err<number, string>['unwrap'];
    expectTypeOf<ReturnType<UnwrapResult>>().toEqualTypeOf<never>();
  });

  it('unwrapErr() on Ok should be never', () => {
    type UnwrapErrResult = Ok<number, string>['unwrapErr'];
    expectTypeOf<ReturnType<UnwrapErrResult>>().toEqualTypeOf<never>();
  });

  it('unwrapOr should return T', () => {
    expectTypeOf(R.ok(1).unwrapOr(0)).toEqualTypeOf<number>();
    expectTypeOf(R.err('fail').unwrapOr(0)).toEqualTypeOf<number>();
  });
});

describe('Result#unwrapOr — bare Err (T = never)', () => {
  it('should infer U when T is never', () => {
    expectTypeOf(R.err('fail').unwrapOr(0)).toEqualTypeOf<number>();
  });
});

describe('Result#unwrapOrElse — bare Err (T = never)', () => {
  it('should infer U when T is never', () => {
    expectTypeOf(R.err('fail').unwrapOrElse(() => 0)).toEqualTypeOf<number>();
  });
});

// ---------------------------------------------------------------------------
// Conversion
// ---------------------------------------------------------------------------

describe('Conversion methods — type inference', () => {
  it('toNullable should return T | null', () => {
    const result: Result<number, string> = R.ok(1);
    expectTypeOf(result.toNullable()).toEqualTypeOf<number | null>();
  });

  it('toValue should return T | undefined', () => {
    const result: Result<number, string> = R.ok(1);
    expectTypeOf(result.toValue()).toEqualTypeOf<number | undefined>();
  });

  it('toJSON on Ok should return { type: "ok"; value: T }', () => {
    expectTypeOf(R.ok(42).toJSON()).toEqualTypeOf<{ type: 'ok'; value: number }>();
  });

  it('toJSON on Err should return { type: "err"; error: E }', () => {
    expectTypeOf(R.err('fail').toJSON()).toEqualTypeOf<{ type: 'err'; error: string }>();
  });
});

// ---------------------------------------------------------------------------
// Type predicate narrowing
// ---------------------------------------------------------------------------

describe('Instance type predicate narrowing', () => {
  it('isOk should narrow Result<T, E> to Ok<T, E>', () => {
    const result: Result<number, string> = R.ok(1);
    if (result.isOk()) {
      expectTypeOf(result).toEqualTypeOf<Ok<number, string>>();
    }
  });

  it('isErr should narrow Result<T, E> to Err<T, E>', () => {
    const result: Result<number, string> = R.err('fail');
    if (result.isErr()) {
      expectTypeOf(result).toEqualTypeOf<Err<number, string>>();
    }
  });

  it('isOkAnd should narrow to Ok<T, E> when true', () => {
    const result: Result<number, string> = R.ok(10);
    if (result.isOkAnd((x) => x > 5)) {
      expectTypeOf(result).toEqualTypeOf<Ok<number, string>>();
    }
  });

  it('isErrAnd should narrow to Err<T, E> when true', () => {
    const result: Result<number, string> = R.err('fail');
    if (result.isErrAnd((e) => e.length > 0)) {
      expectTypeOf(result).toEqualTypeOf<Err<number, string>>();
    }
  });
});
