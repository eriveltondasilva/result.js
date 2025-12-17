/** biome-ignore-all lint/suspicious/noExplicitAny: test file */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Err } from './err.js'
import { Ok } from './ok.js'

import { expectErr, expectOk } from './test-helpers.js'

import type { Result } from './types.d.ts'

describe('err.ts', () => {
  let errValue: Err<number, Error>

  beforeEach(() => {
    errValue = new Err(new Error('Test error'))
  })

  //# ==================== TYPE GUARDS ====================
  describe('Type Guards', () => {
    it('should identify as Err', () => {
      expect(errValue.isOk()).toBe(false)
      expect(errValue.isErr()).toBe(true)
    })

    it.each([
      {
        error: new Error('Test error'),
        predicate: (e: Error) => e.message === 'Test error',
        expected: true,
      },
      {
        error: new Error('Test error'),
        predicate: (e: Error) => e.message === 'Other error',
        expected: false,
      },
    ])('should evaluate isErrAnd correctly', ({ error, predicate, expected }) => {
      const err = new Err(error)
      expect(err.isErrAnd(predicate)).toBe(expected)
    })

    it('should return false for isOkAnd', () => {
      expect(errValue.isOkAnd(() => true)).toBe(false)
    })
  })

  //# ==================== EXTRACTION ====================
  describe('Value Extraction', () => {
    it('should extract error via getter and unwrapErr', () => {
      expect(errValue.err).toBeInstanceOf(Error)
      expect(errValue.err?.message).toBe('Test error')
      expect(errValue.unwrapErr().message).toBe('Test error')
      expect(errValue.expectErr('message')).toBeInstanceOf(Error)
    })

    it('should return null for ok getter', () => {
      expect(errValue.ok).toBeNull()
    })

    it('should throw when extracting value', () => {
      expect(() => errValue.unwrap()).toThrow('Called unwrap on an Err value')
      expect(() => errValue.expect('Custom message')).toThrow('Custom message')
    })

    it('should include cause in thrown errors', () => {
      try {
        errValue.unwrap()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).cause).toBe(errValue.err)
      }
    })

    it.each([
      { method: 'unwrapOr', args: [0], expected: 0 },
      { method: 'unwrapOrElse', args: [(e: Error) => e.message.length], expected: 10 },
    ])('should use fallback in $method', ({ method, args, expected }) => {
      expect((errValue as any)[method](...args)).toBe(expected)
    })
  })

  //# ==================== TRANSFORMATIONS ====================
  describe('Transformations', () => {
    it('should preserve Err when mapping value', () => {
      const result = errValue.map((x) => x * 2)
      expect(result.isErr()).toBe(true)
      expect(expectErr(result).message).toBe('Test error')
    })

    it.each([
      { method: 'mapOr', args: [(x: number) => x * 2, 0], expected: 0 },
      {
        method: 'mapOrElse',
        args: [(x: number) => x * 2, (e: Error) => e.message.length],
        expected: 10,
      },
    ])('should use Err function in $method', ({ method, args, expected }) => {
      expect((errValue as any)[method](...args)).toBe(expected)
    })

    describe('mapErr', () => {
      it('should transform error', () => {
        const wrapped = errValue.mapErr((e) => new Error(`Wrapped: ${e.message}`))
        const toStr = errValue.mapErr((e) => e.message)

        expect(expectErr(wrapped).message).toBe('Wrapped: Test error')
        expect(expectErr(toStr)).toBe('Test error')
      })
    })

    it('should preserve Err in filter', () => {
      const result = errValue.filter(
        (x) => x > 0,
        () => new Error('Filter failed'),
      )
      expect(expectErr(result).message).toBe('Test error')
    })
  })

  //# ==================== CHAINING ====================
  describe('Chaining', () => {
    describe('andThen/orElse', () => {
      it('should preserve Err in andThen', () => {
        const result = errValue.andThen((x) => new Ok(x * 2))
        expect(expectErr(result).message).toBe('Test error')
      })

      it('should recover with orElse returning Ok', () => {
        const result = errValue.orElse(() => new Ok(42))
        expect(expectOk(result)).toBe(42)
      })

      it('should chain errors with orElse returning Err', () => {
        const result = errValue.orElse((e) => new Err(new Error(`Chained: ${e.message}`)))
        expect(expectErr(result).message).toBe('Chained: Test error')
      })
    })

    describe('and/or operations', () => {
      it('should preserve Err in and', () => {
        const other = new Ok('hello')
        const result = errValue.and(other)
        expect(expectErr(result).message).toBe('Test error')
      })

      it.each([
        { name: 'Ok', other: new Ok(42), expected: 42 },
        { name: 'Err', other: new Err(new Error('Other error')), expectedErr: 'Other error' },
      ])('should return other in or when other is $name', ({ other, expected, expectedErr }) => {
        const result = errValue.or(other as any)

        if (expected !== undefined) {
          expect(expectOk(result)).toBe(expected)
        } else {
          expect(expectErr(result).message).toBe(expectedErr)
        }
      })
    })

    describe('zip', () => {
      it('should return Err when zipping', () => {
        const other = new Ok('hello')
        const result = errValue.zip(other)
        expect(expectErr(result).message).toBe('Test error')
      })

      it('should handle union error types', () => {
        const err = new Err('string error')
        const other = new Ok('hello')
        const result = err.zip(other)
        expect(expectErr(result)).toBe('string error')
      })
    })
  })

  //# ==================== INSPECTION ====================
  describe('Inspection', () => {
    it('should match with err handler', () => {
      const length = errValue.match({
        ok: (x) => x * 2,
        err: (e) => e.message.length,
      })

      const message = errValue.match({
        ok: (x) => String(x),
        err: (e) => e.message,
      })

      expect(length).toBe(10)
      expect(message).toBe('Test error')
    })

    it('should not call inspect', () => {
      const fn = vi.fn()
      const result = errValue.inspect(fn)

      expect(fn).not.toHaveBeenCalled()
      expect(result.isErr()).toBe(true)
    })

    it('should call inspectErr on error', () => {
      const fn = vi.fn()
      const result = errValue.inspectErr(fn)

      expect(fn).toHaveBeenCalledWith(errValue.err)
      expect(expectErr(result).message).toBe('Test error')
    })
  })

  //# ==================== COMPARISON ====================
  describe('Comparison', () => {
    it('should return false for contains', () => {
      expect(errValue.contains(42)).toBe(false)
    })

    it.each([
      {
        error: new Error('Test error'),
        check: new Error('Test error'),
        useRef: true,
        expected: true,
      },
      {
        error: new Error('Test error'),
        check: new Error('Different'),
        useRef: false,
        expected: false,
      },
    ])('should check containsErr', ({ error, check, useRef, expected }) => {
      const err = new Err(error)
      const toCheck = useRef ? error : check
      expect(err.containsErr(toCheck)).toBe(expected)
    })

    it('should use custom equals function', () => {
      const err = new Err({ code: 404, message: 'Not found' })
      const equals = (a: { code: number }, b: { code: number }) => a.code === b.code

      expect(err.containsErr({ code: 404, message: 'Different' }, equals)).toBe(true)
      expect(err.containsErr({ code: 500, message: 'Not found' }, equals)).toBe(false)
    })
  })

  //# ==================== CONVERSION ====================
  describe('Conversion', () => {
    it('should flatten Err', () => {
      const nested = new Err('outer error')
      const result = nested.flatten()

      expect(result.isErr()).toBe(true)
      expect(expectErr(result)).toBe('outer error')
    })

    it('should convert to rejected Promise', async () => {
      await expect(errValue.toPromise()).rejects.toThrow('Test error')
    })

    it('should convert to string', () => {
      expect(errValue.toString()).toBe('Err([Error: Test error])')
    })

    it.each([
      {
        error: new Error('Test error'),
        expected: { type: 'err', error: expect.any(Error) },
      },
      {
        error: 'simple error',
        expected: { type: 'err', error: 'simple error' },
      },
    ])('should convert to JSON', ({ error, expected }) => {
      const err = new Err(error as any)
      expect(err.toJSON()).toEqual(expected)
    })
  })

  //# ==================== ASYNC OPERATIONS ====================
  describe('Async Operations', () => {
    describe('Transforming', () => {
      it('should preserve Err in mapAsync', async () => {
        const result = await errValue.mapAsync(async (x) => x * 2)
        expect(expectErr(result).message).toBe('Test error')
      })

      it('should transform error asynchronously', async () => {
        const wrapped = await errValue.mapErrAsync(async (e) => new Error(`Async: ${e.message}`))
        const delayed = await errValue.mapErrAsync(async (e) => {
          await new Promise((resolve) => setTimeout(resolve, 10))
          return e.message
        })

        expect(expectErr(wrapped).message).toBe('Async: Test error')
        expect(expectErr(delayed)).toBe('Test error')
      })

      it.each([
        { method: 'mapOrAsync', args: [async (x: number) => x * 2, 0] },
        {
          method: 'mapOrElseAsync',
          args: [async (x: number) => x * 2, async (e: Error) => e.message.length],
        },
      ])('should use Err function in $method', async ({ method, args }) => {
        const result = await (errValue as any)[method](...args)
        expect(result).toBe(method === 'mapOrAsync' ? 0 : 10)
      })
    })

    describe('Chaining', () => {
      it('should preserve Err in andThenAsync', async () => {
        const result = await errValue.andThenAsync(async (x) => new Ok(x * 2))
        expect(expectErr(result).message).toBe('Test error')
      })

      it('should preserve Err in andAsync', async () => {
        const other = Promise.resolve(new Ok('hello'))
        const result = await errValue.andAsync(other)
        expect(expectErr(result).message).toBe('Test error')
      })

      it('should return other Promise in orAsync', async () => {
        const other = Promise.resolve(new Ok(42))
        const result = await errValue.orAsync(other)
        expect(expectOk(result)).toBe(42)
      })

      it('should recover with orElseAsync', async () => {
        const ok = await errValue.orElseAsync(async () => new Ok(42))
        const err = await errValue.orElseAsync(
          async (e) => new Err(new Error(`Async chained: ${e.message}`)),
        )

        expect(expectOk(ok)).toBe(42)
        expect(expectErr(err).message).toBe('Async chained: Test error')
      })
    })
  })

  //# ==================== EDGE CASES ====================
  describe('Edge Cases', () => {
    it.each([
      { name: 'string', error: 'simple error' },
      { name: 'number', error: 404 },
      { name: 'null', error: null },
      { name: 'undefined', error: undefined },
      { name: 'object', error: { code: 500, message: 'Server error' } },
    ])('should handle $name as error', ({ error }) => {
      const err = new Err(error as any)
      expect(err.err).toBe(error)
      expect(err.unwrapErr()).toBe(error)
    })

    it('should chain multiple error operations', () => {
      const result = errValue
        .mapErr((e) => new Error(`First: ${e.message}`))
        .mapErr((e) => new Error(`Second: ${e.message}`))

      expect(expectErr(result).message).toBe('Second: First: Test error')
    })

    it('should handle recovery chain', () => {
      const result = errValue
        .orElse(() => new Err(new Error('Second error')))
        .orElse(() => new Ok(42))

      expect(expectOk(result)).toBe(42)
    })

    it('should preserve type through transformations', () => {
      const err: Result<number, Error> = new Err(new Error('test'))
      const mapped: Result<string, Error> = err.map((x) => String(x))
      const errorMapped: Result<string, string> = mapped.mapErr((e) => e.message)

      expect(errorMapped.isErr()).toBe(true)
    })

    it('should handle multiple unwrapOrElse calls', () => {
      const result1 = errValue.unwrapOrElse((e) => e.message.length)
      const result2 = errValue.unwrapOrElse(() => 0)
      const result3 = errValue.unwrapOrElse(() => -1)

      expect(result1).toBe(10)
      expect(result2).toBe(0)
      expect(result3).toBe(-1)
    })

    it('should work with custom error classes', () => {
      class CustomError extends Error {
        constructor(
          public code: number,
          message: string,
        ) {
          super(message)
          this.name = 'CustomError'
        }
      }

      const err = new Err(new CustomError(404, 'Not found'))
      expect(err.unwrapErr().code).toBe(404)
      expect(err.unwrapErr().message).toBe('Not found')
    })
  })
})
