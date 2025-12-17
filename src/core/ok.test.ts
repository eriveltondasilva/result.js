import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Err } from './err.js'
import { Ok } from './ok.js'

import { expectErr, expectOk } from './test-helpers.js'

describe('ok.ts', () => {
  let okValue: Ok<number, Error>

  beforeEach(() => {
    okValue = new Ok(42)
  })

  //# ==================== TYPE GUARDS ====================
  describe('Type Guards', () => {
    it('should identify as Ok', () => {
      expect(okValue.isOk()).toBe(true)
      expect(okValue.isErr()).toBe(false)
    })

    it.each([
      { value: 42, predicate: (x: number) => x > 40, expected: true },
      { value: 42, predicate: (x: number) => x > 50, expected: false },
    ])('should evaluate isOkAnd correctly', ({ value, predicate, expected }) => {
      const ok = new Ok(value)
      expect(ok.isOkAnd(predicate)).toBe(expected)
    })

    it('should return false for isErrAnd', () => {
      expect(okValue.isErrAnd(() => true)).toBe(false)
    })
  })

  //# ==================== VALUE EXTRACTION ====================
  describe('Value Extraction', () => {
    it('should extract value via getter and unwrap', () => {
      expect(okValue.ok).toBe(42)
      expect(okValue.unwrap()).toBe(42)
      expect(okValue.expect('message')).toBe(42)
    })

    it('should return null for error getter', () => {
      expect(okValue.err).toBeNull()
    })

    it('should throw when extracting error', () => {
      expect(() => okValue.unwrapErr()).toThrow('Called unwrapErr on an Ok value')
      expect(() => okValue.expectErr('message')).toThrow('message')
    })

    it.each([
      { method: 'unwrapOr', args: [0], expected: 42 },
      { method: 'unwrapOrElse', args: [() => 0], expected: 42 },
    ])('should ignore fallback in $method', ({ method, args, expected }) => {
      // biome-ignore lint/suspicious/noExplicitAny: test file
      expect((okValue as any)[method](...args)).toBe(expected)
    })
  })

  //# ==================== TRANSFORMATIONS ====================
  describe('Transformations', () => {
    it('should transform value with map', () => {
      const doubled = okValue.map((x) => x * 2)
      const stringified = okValue.map((x) => String(x))

      expect(expectOk(doubled)).toBe(84)
      expect(expectOk(stringified)).toBe('42')
    })

    it.each([
      { method: 'mapOr', args: [(x: number) => x * 2, 0], expected: 84 },
      { method: 'mapOrElse', args: [(x: number) => x * 2, () => 0], expected: 84 },
    ])('should use Ok function in $method', ({ method, args, expected }) => {
      // biome-ignore lint/suspicious/noExplicitAny: test file
      expect((okValue as any)[method](...args)).toBe(expected)
    })

    it('should preserve Ok when mapping error', () => {
      const result = okValue.mapErr(() => new Error('New error'))
      expect(expectOk(result)).toBe(42)
    })

    describe('filter', () => {
      it('should keep Ok when predicate passes', () => {
        const result = okValue.filter(
          (x) => x > 40,
          () => new Error('Too small'),
        )
        expect(expectOk(result)).toBe(42)
      })

      it('should keep Ok when predicate passes without onReject', () => {
        const result = okValue.filter((x) => x > 40)
        expect(expectOk(result)).toBe(42)
      })

      it('should convert to Err with default error message when predicate fails', () => {
        const result = okValue.filter((x) => x > 50)
        const error = expectErr(result)
        expect(error.message).toBe('Filter predicate failed for value: 42')
      })

      it('should convert to Err when predicate fails', () => {
        const result = okValue.filter(
          (x) => x > 50,
          (value) => new Error(`Value ${value} is too small`),
        )
        const error = expectErr(result)
        expect(error.message).toBe('Value 42 is too small')
      })
    })
  })

  //# ==================== CHAINING ====================
  describe('Chaining', () => {
    describe('andThen', () => {
      it('should chain with Ok result', () => {
        const result = okValue.andThen((x) => new Ok(x * 2))
        expect(expectOk(result)).toBe(84)
      })

      it('should chain with Err result', () => {
        const result = okValue.andThen(() => new Err(new Error('Failed')))
        const error = expectErr(result)
        expect(error.message).toBe('Failed')
      })
    })

    describe('and/or operations', () => {
      it('should return other in and', () => {
        const other = new Ok('hello')
        const result = okValue.and(other)
        expect(expectOk(result)).toBe('hello')
      })

      it('should return self in or', () => {
        const other = new Ok(0)
        const result = okValue.or(other)
        expect(expectOk(result)).toBe(42)
      })

      it('should return self in orElse', () => {
        const result = okValue.orElse(() => new Ok(0))
        expect(expectOk(result)).toBe(42)
      })
    })

    describe('zip', () => {
      it('should combine two Ok values', () => {
        const other = new Ok('hello')
        const result = okValue.zip(other)
        expect(expectOk(result)).toEqual([42, 'hello'])
      })

      it('should propagate Err from second Result', () => {
        const other = new Err('string error')
        const result = okValue.zip(other)
        expect(expectErr(result)).toBe('string error')
      })
    })
  })

  //# ==================== INSPECTION ====================
  describe('Inspection', () => {
    it('should match with ok handler', () => {
      const doubled = okValue.match({
        ok: (x) => x * 2,
        err: () => 0,
      })

      const stringified = okValue.match({
        ok: (x) => String(x),
        err: (e: Error) => e.message,
      })

      expect(doubled).toBe(84)
      expect(stringified).toBe('42')
    })

    it('should call inspect on value', () => {
      const fn = vi.fn()
      const result = okValue.inspect(fn)

      expect(fn).toHaveBeenCalledWith(42)
      expect(expectOk(result)).toBe(42)
    })

    it('should not call inspectErr', () => {
      const fn = vi.fn()
      const result = okValue.inspectErr(fn)

      expect(fn).not.toHaveBeenCalled()
      expect(result.isOk()).toBe(true)
    })
  })

  //# ==================== COMPARISON ====================
  describe('Comparison', () => {
    it.each([
      { value: 42, expected: true },
      { value: 0, expected: false },
    ])('should check contains for value $value', ({ value, expected }) => {
      expect(okValue.contains(value)).toBe(expected)
    })

    it('should use custom equals function', () => {
      const ok = new Ok({ id: 1 })
      const equals = (a: { id: number }, b: { id: number }) => a.id === b.id

      expect(ok.contains({ id: 1 }, equals)).toBe(true)
      expect(ok.contains({ id: 2 }, equals)).toBe(false)
    })

    it('should return false for containsErr', () => {
      expect(okValue.containsErr(new Error('test'))).toBe(false)
    })
  })

  //# ==================== CONVERSION ====================
  describe('Conversion', () => {
    it('should flatten nested Ok', () => {
      const nested = new Ok(new Ok(42))
      expect(expectOk(nested.flatten())).toBe(42)
    })

    it('should flatten Ok containing Err', () => {
      const nested = new Ok(new Err(new Error('Failed')))
      const error = expectErr(nested.flatten())
      expect(error.message).toBe('Failed')
    })

    it('should convert to resolved Promise', async () => {
      await expect(okValue.toPromise()).resolves.toBe(42)
    })

    it('should convert to string', () => {
      expect(okValue.toString()).toBe('Ok(42)')
    })

    it('should convert to JSON', () => {
      expect(okValue.toJSON()).toEqual({ type: 'ok', value: 42 })
    })
  })
  //# ==================== ASYNC OPERATIONS ====================
  describe('Async Operations', () => {
    describe('Transforming', () => {
      it('should map value asynchronously', async () => {
        const result = await okValue.mapAsync(async (x) => {
          await new Promise((resolve) => setTimeout(resolve, 10))
          return x * 2
        })
        expect(expectOk(result)).toBe(84)
      })

      it('should preserve Ok in mapErrAsync', async () => {
        const result = await okValue.mapErrAsync(async () => new Error('New'))
        expect(expectOk(result)).toBe(42)
      })

      it.each([
        { method: 'mapOrAsync', args: [async (x: number) => x * 2, 0] },
        { method: 'mapOrElseAsync', args: [async (x: number) => x * 2, async () => 0] },
      ])('should use Ok function in $method', async ({ method, args }) => {
        // biome-ignore lint/suspicious/noExplicitAny: test file
        const result = await (okValue as any)[method](...args)
        expect(result).toBe(84)
      })
    })

    describe('Chaining', () => {
      it('should chain asynchronously with andThenAsync', async () => {
        const ok = await okValue.andThenAsync(async (x) => new Ok(x * 2))
        const err = await okValue.andThenAsync(async () => new Err(new Error('Failed')))

        expect(expectOk(ok)).toBe(84)
        expect(expectErr(err).message).toBe('Failed')
      })

      it('should return other Promise in andAsync', async () => {
        const other = Promise.resolve(new Ok('hello'))
        const result = await okValue.andAsync(other)
        expect(expectOk(result)).toBe('hello')
      })

      it('should return self in orAsync and orElseAsync', async () => {
        const result1 = await okValue.orAsync(Promise.resolve(new Ok(0)))
        const result2 = await okValue.orElseAsync(async () => new Ok(0))

        expect(expectOk(result1)).toBe(42)
        expect(expectOk(result2)).toBe(42)
      })
    })
  })

  //# ==================== EDGE CASES ====================
  describe('Edge Cases', () => {
    it.each([
      { name: 'null', value: null },
      { name: 'undefined', value: undefined },
      { name: 'empty string', value: '' },
      { name: 'zero', value: 0 },
      { name: 'false', value: false },
    ])('should handle $name as value', ({ value }) => {
      const ok = new Ok(value)
      expect(ok.ok).toBe(value)
      expect(ok.unwrap()).toBe(value)
      expect(ok.contains(value)).toBe(true)
    })

    it('should handle complex objects and arrays', () => {
      const obj = { a: 1, b: { c: 2 } }
      const arr = [1, 2, 3]

      expect(new Ok(obj).unwrap()).toBe(obj)
      expect(new Ok(arr).contains(arr)).toBe(true)
    })

    it('should chain multiple operations', () => {
      const result = okValue
        .map((x) => x * 2)
        .andThen((x) => new Ok(x + 10))
        .map((x) => String(x))

      expect(expectOk(result)).toBe('94')
    })

    it('should handle multiple filters', () => {
      const result = okValue
        .filter(
          (x) => x > 0,
          () => new Error('Negative'),
        )
        .filter(
          (x) => x < 100,
          () => new Error('Too large'),
        )

      expect(expectOk(result)).toBe(42)
    })
  })
})
