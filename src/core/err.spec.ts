import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Err } from './err.js'
import { Ok } from './ok.js'

import type { Result } from './types.js'

describe('Err', () => {
  let errValue: Err<number, Error>

  beforeEach(() => {
    errValue = new Err(new Error('Test error'))
  })

  // ==================== CHECKING ====================
  describe('Type Guards', () => {
    it('should return false for isOk', () => {
      expect(errValue.isOk()).toBe(false)
    })

    it('should return true for isErr', () => {
      expect(errValue.isErr()).toBe(true)
    })

    it('should return false for isOkAnd', () => {
      expect(errValue.isOkAnd(() => true)).toBe(false)
    })

    it('should return true for isErrAnd when predicate passes', () => {
      expect(errValue.isErrAnd((e) => e.message === 'Test error')).toBe(true)
    })

    it('should return false for isErrAnd when predicate fails', () => {
      expect(errValue.isErrAnd((e) => e.message === 'Other error')).toBe(false)
    })
  })

  // ==================== EXTRACTING ====================
  describe('Extracting Values', () => {
    it('should return null via ok getter', () => {
      expect(errValue.ok).toBeNull()
    })

    it('should return error via err getter', () => {
      expect(errValue.err).toBeInstanceOf(Error)
      expect(errValue.err?.message).toBe('Test error')
    })

    it('should throw when unwrap is called', () => {
      expect(() => errValue.unwrap()).toThrow('Called unwrap on an Err value')
    })

    it('should include cause in unwrap error', () => {
      try {
        errValue.unwrap()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).cause).toBe(errValue.err)
      }
    })

    it('should unwrapErr the error', () => {
      expect(errValue.unwrapErr()).toBeInstanceOf(Error)
      expect(errValue.unwrapErr().message).toBe('Test error')
    })

    it('should throw with custom message in expect', () => {
      expect(() => errValue.expect('Custom message')).toThrow('Custom message')
    })

    it('should include cause in expect error', () => {
      try {
        errValue.expect('Custom message')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).cause).toBe(errValue.err)
      }
    })

    it('should return error with expectErr', () => {
      expect(errValue.expectErr('Should not throw')).toBeInstanceOf(Error)
    })

    it('should return default value in unwrapOr', () => {
      expect(errValue.unwrapOr(0)).toBe(0)
    })

    it('should compute value from error in unwrapOrElse', () => {
      const result = errValue.unwrapOrElse((e) => e.message.length)
      expect(result).toBe(10) // 'Test error'.length
    })
  })

  // ==================== TRANSFORMING ====================
  describe('Transforming Values', () => {
    it('should preserve Err in map', () => {
      const result = errValue.map((x) => x * 2)
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr().message).toBe('Test error')
    })

    it('should return default value in mapOr', () => {
      const result = errValue.mapOr((x) => x * 2, 0)
      expect(result).toBe(0)
    })

    it('should use error function in mapOrElse', () => {
      const result = errValue.mapOrElse(
        (x) => x * 2,
        (e) => e.message.length
      )
      expect(result).toBe(10)
    })

    it('should map the error', () => {
      const result = errValue.mapErr((e) => new Error(`Wrapped: ${e.message}`))
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr().message).toBe('Wrapped: Test error')
    })

    it('should map error to different type', () => {
      const result = errValue.mapErr((e) => e.message)
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr()).toBe('Test error')
    })

    it('should preserve Err in filter', () => {
      const result = errValue.filter(
        (x) => x > 0,
        () => new Error('Filter failed')
      )
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr().message).toBe('Test error')
    })
  })

  // ==================== CHAINING ====================
  describe('Chaining Operations', () => {
    it('should preserve Err in andThen', () => {
      const result = errValue.andThen((x) => new Ok(x * 2))
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr().message).toBe('Test error')
    })

    it('should recover with orElse returning Ok', () => {
      const result = errValue.orElse(() => new Ok(42))
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(42)
    })

    it('should chain errors with orElse returning Err', () => {
      const result = errValue.orElse((e) => new Err(new Error(`Chained: ${e.message}`)))
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr().message).toBe('Chained: Test error')
    })

    it('should preserve Err in and', () => {
      const other = new Ok<string, Error>('hello')
      const result = errValue.and(other)
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr().message).toBe('Test error')
    })

    it('should return other Result in or when other is Ok', () => {
      const other = new Ok(42)
      const result = errValue.or(other)
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(42)
    })

    it('should return other Result in or when other is Err', () => {
      const other = new Err<number, Error>(new Error('Other error'))
      const result = errValue.or(other)
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr().message).toBe('Other error')
    })

    it('should return Err in zip', () => {
      const other = new Ok<string, Error>('hello')
      const result = errValue.zip(other)
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr().message).toBe('Test error')
    })

    it('should handle union error types in zip', () => {
      const err = new Err<number, string>('string error')
      const other = new Ok<string, Error>('hello')
      const result = err.zip(other)
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr()).toBe('string error')
    })
  })

  // ==================== INSPECTING ====================
  describe('Inspecting Values', () => {
    it('should match with err handler', () => {
      const result = errValue.match({
        ok: (x) => x * 2,
        err: (e) => e.message.length,
      })
      expect(result).toBe(10)
    })

    it('should match with different return types', () => {
      const result = errValue.match({
        ok: (x) => String(x),
        err: (e) => e.message,
      })
      expect(result).toBe('Test error')
    })

    it('should not call inspect function', () => {
      const fn = vi.fn()
      const result = errValue.inspect(fn)

      expect(fn).not.toHaveBeenCalled()
      expect(result.isErr()).toBe(true)
    })

    it('should inspectErr the error', () => {
      const fn = vi.fn()
      const result = errValue.inspectErr(fn)

      expect(fn).toHaveBeenCalledWith(errValue.err)
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr().message).toBe('Test error')
    })
  })

  // ==================== COMPARING ====================
  describe('Comparing Values', () => {
    it('should return false for contains', () => {
      expect(errValue.contains(42)).toBe(false)
    })

    it('should return true when containsErr matches', () => {
      expect(errValue.containsErr(errValue.err)).toBe(true)
    })

    it('should return false when containsErr does not match', () => {
      expect(errValue.containsErr(new Error('Different error'))).toBe(false)
    })

    it('should use custom equals function in containsErr', () => {
      const err = new Err({ code: 404, message: 'Not found' })
      const equals = (a: { code: number }, b: { code: number }) => a.code === b.code

      expect(err.containsErr({ code: 404, message: 'Different' }, equals)).toBe(true)
      expect(err.containsErr({ code: 500, message: 'Not found' }, equals)).toBe(false)
    })
  })

  // ==================== CONVERTING ====================
  describe('Converting', () => {
    it('should flatten Err', () => {
      const nested = new Err<Result<number, Error>, string>('outer error')
      const result = nested.flatten()

      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr()).toBe('outer error')
    })

    it('should convert to rejected Promise', async () => {
      const promise = errValue.toPromise()
      await expect(promise).rejects.toThrow('Test error')
    })

    it('should convert to JSON', () => {
      const json = errValue.toJSON()
      expect(json.type).toBe('err')
      expect(json.error).toBeInstanceOf(Error)
      expect(json.error.message).toBe('Test error')
    })

    it('should convert string error to JSON', () => {
      const err = new Err<number, string>('simple error')
      const json = err.toJSON()

      expect(json).toEqual({
        type: 'err',
        error: 'simple error',
      })
    })
  })

  // ==================== ASYNC OPERATIONS ====================
  describe('Async Operations - Transforming', () => {
    it('should preserve Err in mapAsync', async () => {
      const result = await errValue.mapAsync(async (x) => x * 2)

      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr().message).toBe('Test error')
    })

    it('should mapErrAsync the error', async () => {
      const result = await errValue.mapErrAsync(async (e) => new Error(`Async: ${e.message}`))

      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr().message).toBe('Async: Test error')
    })

    it('should handle async error transformation', async () => {
      const result = await errValue.mapErrAsync(async (e) => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        return e.message
      })

      expect(result.unwrapErr()).toBe('Test error')
    })

    it('should return default value in mapOrAsync', async () => {
      const result = await errValue.mapOrAsync(async (x) => x * 2, 0)
      expect(result).toBe(0)
    })

    it('should use error function in mapOrElseAsync', async () => {
      const result = await errValue.mapOrElseAsync(
        async (x) => x * 2,
        async (e) => e.message.length
      )
      expect(result).toBe(10)
    })
  })

  describe('Async Operations - Chaining', () => {
    it('should preserve Err in andThenAsync', async () => {
      const result = await errValue.andThenAsync(async (x) => new Ok(x * 2))

      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr().message).toBe('Test error')
    })

    it('should preserve Err in andAsync', async () => {
      const other = Promise.resolve(new Ok<string, Error>('hello'))
      const result = await errValue.andAsync(other)

      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr().message).toBe('Test error')
    })

    it('should return other Promise Result in orAsync', async () => {
      const other = Promise.resolve(new Ok(42))
      const result = await errValue.orAsync(other)

      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(42)
    })

    it('should recover with orElseAsync returning Ok', async () => {
      const result = await errValue.orElseAsync(async () => new Ok(42))

      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(42)
    })

    it('should chain errors with orElseAsync', async () => {
      const result = await errValue.orElseAsync(
        async (e) => new Err(new Error(`Async chained: ${e.message}`))
      )

      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr().message).toBe('Async chained: Test error')
    })
  })

  // ==================== METADATA ====================
  describe('Metadata', () => {
    it('should have correct Symbol.toStringTag', () => {
      expect(errValue[Symbol.toStringTag]).toBe('Result.Err')
    })

    it('should display correctly in console', () => {
      expect(Object.prototype.toString.call(errValue)).toBe('[object Result.Err]')
    })
  })

  // ==================== EDGE CASES ====================
  describe('Edge Cases', () => {
    it('should handle string as error', () => {
      const err = new Err<number, string>('simple error')
      expect(err.err).toBe('simple error')
      expect(err.unwrapErr()).toBe('simple error')
    })

    it('should handle number as error', () => {
      const err = new Err<string, number>(404)
      expect(err.err).toBe(404)
      expect(err.containsErr(404)).toBe(true)
    })

    it('should handle null as error', () => {
      const err = new Err<number, null>(null)
      expect(err.err).toBeNull()
      expect(err.unwrapErr()).toBeNull()
    })

    it('should handle undefined as error', () => {
      const err = new Err<number, undefined>(undefined)
      expect(err.err).toBeUndefined()
      expect(err.unwrapErr()).toBeUndefined()
    })

    it('should handle object as error', () => {
      const errorObj = { code: 500, message: 'Server error' }
      const err = new Err<number, typeof errorObj>(errorObj)
      expect(err.err).toBe(errorObj)
      expect(err.unwrapErr()).toBe(errorObj)
    })

    it('should chain multiple error operations', () => {
      const result = errValue
        .mapErr((e) => new Error(`First: ${e.message}`))
        .mapErr((e) => new Error(`Second: ${e.message}`))
        .inspectErr((e) => console.log(e))

      expect(result.unwrapErr().message).toBe('Second: First: Test error')
    })

    it('should handle recovery chain', () => {
      const result = errValue
        .orElse(() => new Err(new Error('Second error')))
        .orElse(() => new Ok(42))

      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(42)
    })

    it('should preserve type through transformations', () => {
      const err: Err<number, Error> = new Err(new Error('test'))
      const mapped: Err<string, Error> = err.map((x) => String(x))
      const errorMapped: Err<string, string> = mapped.mapErr((e) => e.message)

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
          message: string
        ) {
          super(message)
          this.name = 'CustomError'
        }
      }

      const err = new Err<number, CustomError>(new CustomError(404, 'Not found'))
      expect(err.unwrapErr().code).toBe(404)
      expect(err.unwrapErr().message).toBe('Not found')
    })
  })
})
