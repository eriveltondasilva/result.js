import { describe, expect, it } from 'vitest';

import { ensureError, formatForDisplay, isEmptyArray, ResultTypeError } from '@/utils';

// ---------------------------------------------------------------------------
// ResultTypeError
// ---------------------------------------------------------------------------

describe('ResultTypeError', () => {
  it('should be an instance of TypeError', () => {
    expect(new ResultTypeError('bad input')).toBeInstanceOf(TypeError);
  });

  it('should set name to ResultTypeError', () => {
    expect(new ResultTypeError('bad input').name).toBe('ResultTypeError');
  });

  it('should include the original message in the error message', () => {
    const error = new ResultTypeError('invalid element');
    expect(error.message).toContain('invalid element');
  });

  it('should append the usage hint to the message', () => {
    const error = new ResultTypeError('invalid element');
    expect(error.message).toContain(
      'Make sure element is created with Result.ok() or Result.err().',
    );
  });

  it('should set cause correctly', () => {
    const cause = { bad: true };
    const error = new ResultTypeError('msg', cause);
    expect(error.cause).toBe(cause);
  });

  it('should be catchable as TypeError', () => {
    expect(() => {
      throw new ResultTypeError('msg');
    }).toThrow(TypeError);
  });
});

// ---------------------------------------------------------------------------
// isEmptyArray
// ---------------------------------------------------------------------------

describe('isEmptyArray', () => {
  it('should return true for an empty array', () => {
    expect(isEmptyArray([])).toBe(true);
  });

  it('should return false for a non-empty array', () => {
    expect(isEmptyArray([1, 2, 3])).toBe(false);
  });

  it('should throw TypeError when receiving a string', () => {
    expect(() => isEmptyArray('hello')).toThrow(TypeError);
  });

  it('should throw TypeError when receiving null', () => {
    expect(() => isEmptyArray(null)).toThrow(TypeError);
  });

  it('should throw TypeError when receiving a number', () => {
    expect(() => isEmptyArray(42)).toThrow(TypeError);
  });

  it('should throw TypeError when receiving a plain object', () => {
    expect(() => isEmptyArray({ length: 0 })).toThrow(TypeError);
  });

  it('should include the received type in the error message', () => {
    expect(() => isEmptyArray('x')).toThrow('string');
  });
});

// ---------------------------------------------------------------------------
// ensureError
// ---------------------------------------------------------------------------

describe('ensureError', () => {
  it('should return the same Error instance when already an Error', () => {
    const error = new Error('original');
    expect(ensureError(error)).toBe(error);
  });

  it('should wrap a string into an Error', () => {
    const result = ensureError('something went wrong');
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('something went wrong');
  });

  it('should wrap a number into an Error', () => {
    const result = ensureError(404);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('404');
  });

  it('should handle null with a descriptive message', () => {
    const result = ensureError(null);
    expect(result.message).toContain('null');
  });

  it('should handle undefined with a descriptive message', () => {
    const result = ensureError(undefined);
    expect(result.message).toContain('undefined');
  });

  it('should preserve the original cause on wrapped errors', () => {
    const raw = { code: 500 };
    const result = ensureError(raw);
    expect(result.cause).toBe(raw);
  });

  it('should preserve subclasses of Error', () => {
    const typeError = new TypeError('bad type');
    expect(ensureError(typeError)).toBe(typeError);
  });
});

// ---------------------------------------------------------------------------
// formatForDisplay
// ---------------------------------------------------------------------------

describe('formatForDisplay', () => {
  it('should format null as "null"', () => {
    expect(formatForDisplay(null)).toBe('null');
  });

  it('should format undefined as "undefined"', () => {
    expect(formatForDisplay(undefined)).toBe('undefined');
  });

  it('should format a number as its string representation', () => {
    expect(formatForDisplay(42)).toBe('42');
  });

  it('should format a boolean as its string representation', () => {
    expect(formatForDisplay(true)).toBe('true');
  });

  it('should format a bigint with "n" suffix', () => {
    expect(formatForDisplay(9007199254740991n)).toBe('9007199254740991n');
  });

  it('should format a symbol using its toString', () => {
    const sym = Symbol('test');
    expect(formatForDisplay(sym)).toBe('Symbol(test)');
  });

  it('should wrap a string in double quotes', () => {
    expect(formatForDisplay('hello')).toBe('"hello"');
  });

  it('should truncate a string longer than 100 chars', () => {
    const long = 'a'.repeat(200);
    const result = formatForDisplay(long);
    expect(result).toContain('...');
    expect(result.length).toBe(105);
  });

  it('should format an Error as "Name: message"', () => {
    expect(formatForDisplay(new Error('oops'))).toBe('Error: oops');
  });

  it('should include cause when Error has one', () => {
    const error = new Error('outer', { cause: new Error('inner') });
    const result = formatForDisplay(error);
    expect(result).toContain('cause');
    expect(result).toContain('inner');
  });

  it('should format a TypeError with its name', () => {
    expect(formatForDisplay(new TypeError('bad'))).toBe('TypeError: bad');
  });

  it('should format a small array inline', () => {
    expect(formatForDisplay([1, 2, 3])).toBe('[1, 2, 3]');
  });

  it('should format an array with more than 5 elements as Array(n)', () => {
    expect(formatForDisplay([1, 2, 3, 4, 5, 6])).toBe('Array(6)');
  });

  it('should format an empty array as "[]"', () => {
    expect(formatForDisplay([])).toBe('[]');
  });

  it('should format a plain object as JSON', () => {
    expect(formatForDisplay({ a: 1 })).toBe('{"a":1}');
  });

  it('should truncate a long JSON object to 100 chars', () => {
    const obj = { key: 'a'.repeat(200) };
    const result = formatForDisplay(obj);
    expect(result).toContain('...');
  });

  it('should fall back to constructor name for non-serializable objects', () => {
    const circular: Record<string, unknown> = {};
    // biome-ignore lint/complexity/useLiteralKeys: test
    circular['self'] = circular;
    const result = formatForDisplay(circular);
    expect(result).toBe('Object');
  });
});
