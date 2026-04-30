import { describe, expect, it } from 'vitest';

import { Result } from '@/index';

// ---------------------------------------------------------------------------
// Result.ok / Result.err
// ---------------------------------------------------------------------------

describe('Result.ok', () => {
  it('should create an Ok result with a primitive value', () => {
    const result = Result.ok(42);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe(42);
  });

  it('should create an Ok result with an object value', () => {
    const user = { id: 1, name: 'John' };
    const result = Result.ok(user);
    expect(result.unwrap()).toEqual({ id: 1, name: 'John' });
  });

  it('should create an Ok result with null', () => {
    const result = Result.ok(null);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBeNull();
  });

  it('should create an Ok result with undefined', () => {
    const result = Result.ok(undefined);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBeUndefined();
  });
});

describe('Result.err', () => {
  it('should create an Err result with an Error instance', () => {
    const error = new Error('something went wrong');
    const result = Result.err(error);
    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr()).toBe(error);
  });

  it('should create an Err result with a string', () => {
    const result = Result.err('not found');
    expect(result.unwrapErr()).toBe('not found');
  });

  it('should create an Err result with a custom error object', () => {
    const validationError = { field: 'email', message: 'invalid format' };
    const result = Result.err(validationError);
    expect(result.unwrapErr()).toEqual({ field: 'email', message: 'invalid format' });
  });
});

// ---------------------------------------------------------------------------
// Result.isOk / Result.isErr / Result.isResult (static guards)
// ---------------------------------------------------------------------------

describe('Result.isOk (static)', () => {
  it('should return true for an Ok instance', () => {
    expect(Result.isOk(Result.ok(1))).toBe(true);
  });

  it('should return false for an Err instance', () => {
    expect(Result.isOk(Result.err('fail'))).toBe(false);
  });

  it('should return false for plain objects', () => {
    expect(Result.isOk({ value: 1 })).toBe(false);
  });

  it('should return false for null', () => {
    expect(Result.isOk(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(Result.isOk(undefined)).toBe(false);
  });
});

describe('Result.isErr (static)', () => {
  it('should return true for an Err instance', () => {
    expect(Result.isErr(Result.err('fail'))).toBe(true);
  });

  it('should return false for an Ok instance', () => {
    expect(Result.isErr(Result.ok(42))).toBe(false);
  });

  it('should return false for null', () => {
    expect(Result.isErr(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(Result.isErr(undefined)).toBe(false);
  });
});

describe('Result.isResult (static)', () => {
  it('should return true for Ok', () => {
    expect(Result.isResult(Result.ok(1))).toBe(true);
  });

  it('should return true for Err', () => {
    expect(Result.isResult(Result.err('x'))).toBe(true);
  });

  it('should return false for a plain object', () => {
    expect(Result.isResult({ _tag: 'something' })).toBe(false);
  });

  it('should return false for primitives', () => {
    expect(Result.isResult(42)).toBe(false);
    expect(Result.isResult('hello')).toBe(false);
  });

  it('should return false for null', () => {
    expect(Result.isResult(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(Result.isResult(undefined)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Result.fromTry
// ---------------------------------------------------------------------------

describe('Result.fromTry', () => {
  it('should return Ok when the function succeeds', () => {
    const result = Result.fromTry(() => JSON.parse('{"a":1}'));
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toEqual({ a: 1 });
  });

  it('should return Err when the function throws', () => {
    const result = Result.fromTry(() => JSON.parse('invalid'));
    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr()).toBeInstanceOf(Error);
  });

  it('should apply the onError transformer when provided', () => {
    const result = Result.fromTry(
      () => JSON.parse('bad'),
      () => ({ type: 'parse_error' as const }),
    );
    expect(result.unwrapErr()).toEqual({ type: 'parse_error' });
  });

  it('should wrap a non-Error thrown value into an Error', () => {
    const result = Result.fromTry(() => {
      throw 'raw string thrown';
    });
    expect(result.unwrapErr()).toBeInstanceOf(Error);
  });
});

// ---------------------------------------------------------------------------
// Result.fromNullable
// ---------------------------------------------------------------------------

describe('Result.fromNullable', () => {
  it('should return Ok for a defined value', () => {
    const result = Result.fromNullable(42, () => 'missing');
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe(42);
  });

  it('should return Err for null', () => {
    const result = Result.fromNullable(null, () => 'was null');
    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr()).toBe('was null');
  });

  it('should return Err for undefined', () => {
    const result = Result.fromNullable(undefined, () => 'was undefined');
    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr()).toBe('was undefined');
  });

  it('should return Ok for the value 0 (falsy but valid)', () => {
    const result = Result.fromNullable(0, () => 'missing');
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe(0);
  });

  it('should return Ok for an empty string (falsy but valid)', () => {
    const result = Result.fromNullable('', () => 'missing');
    expect(result.isOk()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Result.validate
// ---------------------------------------------------------------------------

describe('Result.validate', () => {
  it('should return Ok when the predicate passes', () => {
    const result = Result.validate(
      10,
      (x) => x > 0,
      () => 'must be positive',
    );
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe(10);
  });

  it('should return Err when the predicate fails', () => {
    const result = Result.validate(
      -1,
      (x) => x > 0,
      () => 'must be positive',
    );
    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr()).toBe('must be positive');
  });
});
