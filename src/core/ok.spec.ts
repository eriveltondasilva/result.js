import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Err } from './err.js'
import { Ok } from './ok.js'
import type { Result } from './types.js'

describe('Ok', () => {
  let okValue: Ok<number, Error>

  beforeEach(() => {
    okValue = new Ok(42)
  })

  // ==================== CHECKING ====================
  describe('Type Guards', () => {
    it('should return true for isOk', () => {
      expect(okValue.isOk()).toBe(true)
    })

    it('should return false for isErr', () => {
      expect(okValue.isErr()).toBe(false)
    })

    it('should return true for isOkAnd when predicate passes', () => {
      expect(okValue.isOkAnd((x) => x > 40)).toBe(true)
    })

    it('should return false for isOkAnd when predicate fails', () => {
      expect(okValue.isOkAnd((x) => x > 50)).toBe(false)
    })

    it('should return false for isErrAnd', () => {
      expect(okValue.isErrAnd(() => true)).toBe(false)
    })
  })

  // ==================== EXTRACTING ====================
  describe('Extracting Values', () => {
    it('should return value via ok getter', () => {
      expect(okValue.ok).toBe(42)
    })

    it('should return null via err getter', () => {
      expect(okValue.err).toBeNull()
    })

    it('should unwrap the value', () => {
      expect(okValue.unwrap()).toBe(42)
    })

    it('should throw when unwrapErr is called', () => {
      expect(() => okValue.unwrapErr()).toThrow('Called unwrapErr on an Ok value')
    })

    it('should return value with expect', () => {
      expect(okValue.expect('Custom message')).toBe(42)
    })

    it('should throw with expectErr', () => {
      expect(() => okValue.expectErr('Should fail')).toThrow('Should fail')
    })

    it('should return value ignoring default in unwrapOr', () => {
      expect(okValue.unwrapOr(0)).toBe(42)
    })

    it('should return value ignoring function in unwrapOrElse', () => {
      expect(okValue.unwrapOrElse(() => 0)).toBe(42)
    })
  })

  // ==================== TRANSFORMING ====================
  describe('Transforming Values', () => {
    it('should map the value', () => {
      const result = okValue.map((x) => x * 2)
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(84)
    })

    it('should map with complex transformation', () => {
      const result = okValue.map((x) => String(x))
      expect(result.unwrap()).toBe('42')
    })

    it('should mapOr and use mapping function', () => {
      const result = okValue.mapOr((x) => x * 2, 0)
      expect(result).toBe(84)
    })

    it('should mapOrElse and use ok function', () => {
      const result = okValue.mapOrElse(
        (x) => x * 2,
        () => 0
      )
      expect(result).toBe(84)
    })

    it('should preserve Ok in mapErr', () => {
      const result = okValue.mapErr((_e) => new Error('New error'))
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(42)
    })

    it('should keep Ok when filter passes', () => {
      const result = okValue.filter(
        (x) => x > 40,
        () => new Error('Too small')
      )
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(42)
    })

    it('should convert to Err when filter fails', () => {
      const result = okValue.filter(
        (x) => x > 50,
        () => new Error('Too small')
      )
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr().message).toBe('Too small')
    })

    it('should pass value to onReject in filter', () => {
      const result = okValue.filter(
        (x) => x > 50,
        (value) => new Error(`Value ${value} is too small`)
      )
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr().message).toBe('Value 42 is too small')
    })
  })

  // ==================== CHAINING ====================
  describe('Chaining Operations', () => {
    it('should chain with andThen returning Ok', () => {
      const result = okValue.andThen((x) => new Ok(x * 2))
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(84)
    })

    it('should chain with andThen returning Err', () => {
      const result = okValue.andThen(() => new Err(new Error('Failed')))
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr().message).toBe('Failed')
    })

    it('should return self in orElse', () => {
      const result = okValue.orElse(() => new Ok(0))
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(42)
    })

    it('should return other Result in and when other is Ok', () => {
      const other = new Ok<string, Error>('hello')
      const result = okValue.and(other)
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe('hello')
    })

    it('should return other Result in and when other is Err', () => {
      const other = new Err<string, Error>(new Error('Failed'))
      const result = okValue.and(other)
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr().message).toBe('Failed')
    })

    it('should return self in or', () => {
      const other = new Ok(0)
      const result = okValue.or(other)
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(42)
    })

    it('should zip two Ok values', () => {
      const other = new Ok<string, Error>('hello')
      const result = okValue.zip(other)
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toEqual([42, 'hello'])
    })

    it('should return Err when zipping with Err', () => {
      const other = new Err<string, Error>(new Error('Failed'))
      const result = okValue.zip(other)
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr().message).toBe('Failed')
    })

    it('should handle union error types in zip', () => {
      const other = new Err<string, string>('string error')
      const result = okValue.zip(other)
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr()).toBe('string error')
    })
  })

  // ==================== INSPECTING ====================
  describe('Inspecting Values', () => {
    it('should match with ok handler', () => {
      const result = okValue.match({
        ok: (x) => x * 2,
        err: () => 0,
      })
      expect(result).toBe(84)
    })

    it('should match with different return types', () => {
      const result = okValue.match({
        ok: (x) => String(x),
        err: (e) => e.message,
      })
      expect(result).toBe('42')
    })

    it('should inspect the value', () => {
      const fn = vi.fn()
      const result = okValue.inspect(fn)

      expect(fn).toHaveBeenCalledWith(42)
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(42)
    })

    it('should not call inspectErr function', () => {
      const fn = vi.fn()
      const result = okValue.inspectErr(fn)

      expect(fn).not.toHaveBeenCalled()
      expect(result.isOk()).toBe(true)
    })
  })

  // ==================== COMPARING ====================
  describe('Comparing Values', () => {
    it('should return true when contains matching value', () => {
      expect(okValue.contains(42)).toBe(true)
    })

    it('should return false when contains non-matching value', () => {
      expect(okValue.contains(0)).toBe(false)
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

  // ==================== CONVERTING ====================
  describe('Converting', () => {
    it('should flatten nested Ok', () => {
      const nested = new Ok<Result<number, Error>, Error>(new Ok(42))
      const result = nested.flatten()

      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(42)
    })

    it('should flatten Ok containing Err', () => {
      const nested = new Ok<Result<number, Error>, string>(new Err(new Error('Failed')))
      const result = nested.flatten()

      expect(result.isErr()).toBe(true)
      expect((result.unwrapErr() as Error).message).toBe('Failed')
    })

    it('should convert to resolved Promise', async () => {
      const promise = okValue.toPromise()
      await expect(promise).resolves.toBe(42)
    })

    it('should convert to JSON', () => {
      const json = okValue.toJSON()
      expect(json).toEqual({ type: 'ok', value: 42 })
    })

    it('should convert complex types to JSON', () => {
      const ok = new Ok({ name: 'test', age: 30 })
      const json = ok.toJSON()

      expect(json).toEqual({
        type: 'ok',
        value: { name: 'test', age: 30 },
      })
    })
  })

  // ==================== ASYNC OPERATIONS ====================
  describe('Async Operations - Transforming', () => {
    it('should mapAsync the value', async () => {
      const result = await okValue.mapAsync(async (x) => x * 2)

      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(84)
    })

    it('should handle async transformation with Promise', async () => {
      const result = await okValue.mapAsync(async (x) => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        return String(x)
      })

      expect(result.unwrap()).toBe('42')
    })

    it('should preserve Ok in mapErrAsync', async () => {
      const result = await okValue.mapErrAsync(async (_e) => new Error('New'))

      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(42)
    })

    it('should mapOrAsync and use mapping function', async () => {
      const result = await okValue.mapOrAsync(async (x) => x * 2, 0)
      expect(result).toBe(84)
    })

    it('should mapOrElseAsync and use ok function', async () => {
      const result = await okValue.mapOrElseAsync(
        async (x) => x * 2,
        async () => 0
      )
      expect(result).toBe(84)
    })
  })

  describe('Async Operations - Chaining', () => {
    it('should chain with andThenAsync returning Ok', async () => {
      const result = await okValue.andThenAsync(async (x) => new Ok(x * 2))

      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(84)
    })

    it('should chain with andThenAsync returning Err', async () => {
      const result = await okValue.andThenAsync(async () => new Err(new Error('Failed')))

      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr().message).toBe('Failed')
    })

    it('should return other Promise Result in andAsync', async () => {
      const other = Promise.resolve(new Ok<string, Error>('hello'))
      const result = await okValue.andAsync(other)

      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe('hello')
    })

    it('should return self in orAsync', async () => {
      const other = Promise.resolve(new Ok(0))
      const result = await okValue.orAsync(other)

      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(42)
    })

    it('should return self in orElseAsync', async () => {
      const result = await okValue.orElseAsync(async () => new Ok(0))

      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(42)
    })
  })

  // ==================== METADATA ====================
  describe('Metadata', () => {
    it('should have correct Symbol.toStringTag', () => {
      expect(okValue[Symbol.toStringTag]).toBe('Result.Ok')
    })

    it('should display correctly in console', () => {
      expect(Object.prototype.toString.call(okValue)).toBe('[object Result.Ok]')
    })
  })

  // ==================== EDGE CASES ====================
  describe('Edge Cases', () => {
    it('should handle null as value', () => {
      const ok = new Ok<null, Error>(null)
      expect(ok.ok).toBeNull()
      expect(ok.unwrap()).toBeNull()
    })

    it('should handle undefined as value', () => {
      const ok = new Ok<undefined, Error>(undefined)
      expect(ok.ok).toBeUndefined()
      expect(ok.unwrap()).toBeUndefined()
    })

    it('should handle empty string', () => {
      const ok = new Ok<string, Error>('')
      expect(ok.ok).toBe('')
      expect(ok.contains('')).toBe(true)
    })

    it('should handle zero', () => {
      const ok = new Ok<number, Error>(0)
      expect(ok.ok).toBe(0)
      expect(ok.contains(0)).toBe(true)
    })

    it('should handle false', () => {
      const ok = new Ok<boolean, Error>(false)
      expect(ok.ok).toBe(false)
      expect(ok.contains(false)).toBe(true)
    })

    it('should handle complex objects', () => {
      const obj = { a: 1, b: { c: 2 } }
      const ok = new Ok(obj)
      expect(ok.ok).toBe(obj)
      expect(ok.unwrap()).toBe(obj)
    })

    it('should handle arrays', () => {
      const arr = [1, 2, 3]
      const ok = new Ok(arr)
      expect(ok.ok).toBe(arr)
      expect(ok.contains(arr)).toBe(true)
    })

    it('should chain multiple operations', () => {
      const result = okValue
        .map((x) => x * 2)
        .andThen((x) => new Ok(x + 10))
        .map((x) => String(x))
        .inspect((x) => console.log(x))

      expect(result.unwrap()).toBe('94')
    })

    it('should handle multiple filters', () => {
      const result = okValue
        .filter(
          (x) => x > 0,
          () => new Error('Negative')
        )
        .filter(
          (x) => x < 100,
          () => new Error('Too large')
        )

      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(42)
    })

    it('should preserve type through transformations', () => {
      const ok: Ok<number, Error> = new Ok(42)
      const mapped: Ok<string, Error> = ok.map((x) => String(x))
      const chained: Result<number, Error> = mapped.andThen((x) => new Ok(Number.parseInt(x, 10)))

      expect(chained.isOk()).toBe(true)
    })
  })
})
