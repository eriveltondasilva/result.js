import { describe, expectTypeOf, it } from 'vitest';

import type { Result } from '@/types';
import type { SettledResult } from '@/types/settled';

import { Result as R } from '@/index';

// ---------------------------------------------------------------------------
// Result.all
// ---------------------------------------------------------------------------

describe('Result.all — type inference', () => {
  it('should infer Result<[number, string, boolean], never> for heterogeneous tuple', () => {
    const result = R.all([R.ok(1), R.ok('hello'), R.ok(true)]);
    expectTypeOf(result).toExtend<Result<readonly [number, string, boolean], never>>();
  });

  it('should infer the union of all error types on failure', () => {
    const a: Result<number, string> = R.ok(1);
    const b: Result<boolean, Error> = R.ok(true);
    expectTypeOf(R.all([a, b])).toExtend<Result<readonly [number, boolean], string | Error>>();
  });

  it('should infer Result<[], never> for empty array', () => {
    expectTypeOf(R.all([])).toExtend<Result<readonly [], never>>();
  });

  it('should not widen tuple to array — preserves positional types', () => {
    const result = R.all([R.ok(1), R.ok('x')]);
    // Must be [number, string], not Array<number | string>
    expectTypeOf(result).toExtend<Result<readonly [number, string], never>>();
  });
});

// ---------------------------------------------------------------------------
// Result.allSettled
// ---------------------------------------------------------------------------

describe('Result.allSettled — type inference', () => {
  it('should always return Ok with SettledResult tuple', () => {
    const a: Result<number, string> = R.ok(1);
    const b: Result<boolean, Error> = R.err(new Error());
    const result = R.allSettled([a, b]);
    expectTypeOf(result).toExtend<
      Result<
        readonly [SettledResult<number, string>, SettledResult<boolean, Error>],
        string | Error
      >
    >();
  });

  it('should infer Ok<[]> for empty array', () => {
    expectTypeOf(R.allSettled([])).toExtend<Result<readonly [], never>>();
  });
});

// ---------------------------------------------------------------------------
// Result.any
// ---------------------------------------------------------------------------

describe('Result.any — type inference', () => {
  it('should infer Result<T1 | T2, [E1, E2]> for mixed array', () => {
    const a: Result<number, string> = R.ok(1);
    const b: Result<boolean, Error> = R.ok(true);
    expectTypeOf(R.any([a, b])).toExtend<Result<number | boolean, readonly [string, Error]>>();
  });

  it('should infer Result<never, []> for empty array', () => {
    expectTypeOf(R.any([])).toExtend<Result<never, readonly []>>();
  });
});

// ---------------------------------------------------------------------------
// Result.partition
// ---------------------------------------------------------------------------

describe('Result.partition — type inference', () => {
  it('should infer [T[], E[]] tuple', () => {
    const results: Result<number, string>[] = [R.ok(1), R.err('fail')];
    expectTypeOf(R.partition(results)).toEqualTypeOf<[number[], string[]]>();
  });
});

// ---------------------------------------------------------------------------
// Result.values / Result.errors
// ---------------------------------------------------------------------------

describe('Result.values — type inference', () => {
  it('should infer T[]', () => {
    const results: Result<number, string>[] = [R.ok(1), R.err('fail')];
    expectTypeOf(R.values(results)).toEqualTypeOf<number[]>();
  });
});

describe('Result.errors — type inference', () => {
  it('should infer E[]', () => {
    const results: Result<number, string>[] = [R.ok(1), R.err('fail')];
    expectTypeOf(R.errors(results)).toEqualTypeOf<string[]>();
  });
});
