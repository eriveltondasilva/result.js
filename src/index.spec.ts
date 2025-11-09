/** biome-ignore-all lint/suspicious/noExplicitAny: test file */
import { describe, expect, it } from 'vitest'
import { Result } from './index.js'

describe('Result', () => {
  describe('Creation', () => {
    it('should create Ok result', () => {
      const result = Result.ok(42)

      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(42)
    })

    it('should create Err result', () => {
      const error = new Error('failed')
      const result = Result.err(error)

      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr()).toBe(error)
    })

    it('should throw when instantiating directly', () => {
      expect(() => new (Result as any)()).toThrow('Result constructor is private')
    })
  })

  describe('Validation', () => {
    it('should validate Result instance', () => {
      const result = Result.ok(1)

      expect(Result.is(result)).toBe(true)
      expect(Result.is({})).toBe(false)
    })

    it('should check Ok state', () => {
      expect(Result.ok(1).isOk()).toBe(true)
      expect(Result.err('error').isOk()).toBe(false)
    })

    it('should check Err state', () => {
      expect(Result.err('error').isErr()).toBe(true)
      expect(Result.ok(1).isErr()).toBe(false)
    })
  })

  describe('Access', () => {
    it('should get ok value', () => {
      expect(Result.ok(42).ok).toBe(42)
      expect(Result.err('error').ok).toBeNull()
    })

    it('should get err value', () => {
      expect(Result.err('error').err).toBe('error')
      expect(Result.ok(42).err).toBeNull()
    })

    it('should unwrap ok value', () => {
      expect(Result.ok(42).unwrap()).toBe(42)
    })

    it('should throw when unwrapping err', () => {
      expect(() => Result.err('error').unwrap()).toThrow()
    })

    it('should unwrap err value', () => {
      expect(Result.err('error').unwrapErr()).toBe('error')
    })

    it('should throw when unwrapping ok as err', () => {
      expect(() => Result.ok(42).unwrapErr()).toThrow()
    })

    it('should unwrap or return default', () => {
      expect(Result.ok(42).unwrapOr(0)).toBe(42)
      expect(Result.err('error').unwrapOr(0)).toBe(0)
    })

    it('should unwrap or compute default', () => {
      expect(Result.ok(42).unwrapOrElse(() => 0)).toBe(42)
      expect(Result.err('error').unwrapOrElse(() => 0)).toBe(0)
    })

    it('should expect with custom message', () => {
      expect(Result.ok(42).expect('must exist')).toBe(42)
      expect(() => Result.err('error').expect('must exist')).toThrow('must exist')
    })

    it('should expectErr with custom message', () => {
      expect(Result.err('error').expectErr('must fail')).toBe('error')
      expect(() => Result.ok(42).expectErr('must fail')).toThrow('must fail')
    })
  })

  describe('Transformation', () => {
    it('should map ok value', () => {
      const result = Result.ok(21).map((x) => x * 2)

      expect(result.unwrap()).toBe(42)
    })

    it('should propagate error in map', () => {
      const result = Result.err<number, string>('error').map((x) => x * 2)

      expect(result.unwrapErr()).toBe('error')
    })

    it('should mapOr with default', () => {
      expect(Result.ok(21).mapOr(0, (x) => x * 2)).toBe(42)
      expect(Result.err('error').mapOr(0, (x: number) => x * 2)).toBe(0)
    })

    it('should map error', () => {
      const result = Result.err('error').mapErr((e) => new Error(e))

      expect(result.unwrapErr()).toBeInstanceOf(Error)
    })

    it('should chain with andThen', () => {
      const result = Result.ok(5)
        .andThen((x) => Result.ok(x * 2))
        .andThen((x) => Result.ok(x + 10))

      expect(result.unwrap()).toBe(20)
    })

    it('should stop chain on error', () => {
      const result = Result.ok(5)
        .andThen((_x) => Result.err('failed'))
        .andThen((x) => Result.ok(x * 2))

      expect(result.unwrapErr()).toBe('failed')
    })

    it('should flatten nested result', () => {
      const nested = Result.ok(Result.ok(42))

      expect(nested.flatten().unwrap()).toBe(42)
    })
  })

  describe('Combination', () => {
    it('should sequence all ok results', () => {
      const results = [Result.ok(1), Result.ok(2), Result.ok(3)]
      const combined = Result.sequence(results)

      expect(combined.unwrap()).toEqual([1, 2, 3])
    })

    it('should return first error in sequence', () => {
      const results = [Result.ok(1), Result.err('error'), Result.ok(3)]
      const combined = Result.sequence(results)

      expect(combined.unwrapErr()).toBe('error')
    })

    it('should sequence async results', async () => {
      const promises = [Promise.resolve(Result.ok(1)), Promise.resolve(Result.ok(2))]
      const result = await Result.sequenceAsync(promises)

      expect(result.unwrap()).toEqual([1, 2])
    })

    it('should return first async error', async () => {
      const promises = [Promise.resolve(Result.ok(1)), Promise.resolve(Result.err('error'))]
      const result = await Result.sequenceAsync(promises)

      expect(result.unwrapErr()).toBe('error')
    })

    it('should combine with and', () => {
      expect(Result.ok(1).and(Result.ok(2)).unwrap()).toBe(2)
      expect(Result.err('error').and(Result.ok(2)).unwrapErr()).toBe('error')
    })

    it('should provide fallback with or', () => {
      expect(Result.ok(1).or(Result.ok(2)).unwrap()).toBe(1)
      expect(Result.err('error').or(Result.ok(2)).unwrap()).toBe(2)
    })

    it('should compute fallback with orElse', () => {
      const result = Result.err<number, string>('error').orElse(() => Result.ok(42))
      expect(result.unwrap()).toBe(42)
    })
  })

  describe('Conversion', () => {
    it('should convert promise to result', async () => {
      const result = await Result.fromPromise(Promise.resolve(42))
      expect(result.unwrap()).toBe(42)
    })

    it('should catch promise rejection', async () => {
      const result = await Result.fromPromise(Promise.reject(new Error('failed')))
      expect(result.isErr()).toBe(true)
    })

    it('should map error in fromPromise', async () => {
      const result = await Result.fromPromise(Promise.reject('error'), (e) => new Error(String(e)))
      expect(result.unwrapErr()).toBeInstanceOf(Error)
    })

    it('should convert ok to promise', async () => {
      const value = await Result.ok(42).toPromise()
      expect(value).toBe(42)
    })

    it('should reject promise from err', async () => {
      const result = Result.err('error')
      await expect(result.toPromise()).rejects.toBe('error')
    })
  })

  describe('Inspection', () => {
    it('should match on ok', () => {
      const result = Result.ok(42).match({
        err: (e) => `Error: ${e}`,
        ok: (v) => `Success: ${v}`,
      })
      expect(result).toBe('Success: 42')
    })

    it('should match on err', () => {
      const result = Result.err('failed').match({
        err: (e) => `Error: ${e}`,
        ok: (v) => `Success: ${v}`,
      })
      expect(result).toBe('Error: failed')
    })

    it('should inspect without consuming', () => {
      let inspected = ''

      const result = Result.ok(42).inspect({
        err: (e) => {
          inspected = `err: ${e}`
        },
        ok: (v) => {
          inspected = `ok: ${v}`
        },
      })

      expect(inspected).toBe('ok: 42')
      expect(result.unwrap()).toBe(42)
    })

    it('should inspect ok only', () => {
      let value = 0

      Result.ok(42).inspectOk((v) => {
        value = v
      })
      expect(value).toBe(42)

      Result.err('error').inspectOk((_v) => {
        value = 99
      })
      expect(value).toBe(42) // unchanged
    })

    it('should inspect err only', () => {
      let error = ''

      Result.err('failed').inspectErr((e) => {
        error = e
      })
      expect(error).toBe('failed')

      Result.ok(42).inspectErr((_e) => {
        error = 'changed'
      })
      expect(error).toBe('failed') // unchanged
    })
  })
})
