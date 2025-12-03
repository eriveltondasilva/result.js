/** biome-ignore-all lint/suspicious/noExplicitAny: test file */
import { describe, expect, it } from 'vitest'

import { Err } from './err.js'
import { Ok } from './ok.js'
import {
  createOk,
  createErr,
  createIsResult,
  createValidate,
  createFromTry,
  createFromNullable,
  createAll,
  createAny,
  createPartition,
  createAllSettled,
  createFromPromise,
} from './factories.js'

import { expectErr, expectOk } from './test-helpers.js'

describe('Factories', () => {
  //# ==================== CREATION ====================
  describe('Basic Creation', () => {
    it.each([
      {
        name: 'ok with value',
        fn: () => createOk(42),
        check: (r: any) => expectOk(r) === 42,
      },
      {
        name: 'ok with null',
        fn: () => createOk(null),
        check: (r: any) => expectOk(r) === null,
      },
      {
        name: 'err with Error',
        fn: () => createErr(new Error('Failed')),
        check: (r: any) => expectErr(r) instanceof Error,
      },
      {
        name: 'err with string',
        fn: () => createErr('error'),
        check: (r: any) => expectErr(r) === 'error',
      },
    ])('should create $name', ({ fn, check }) => {
      expect(check(fn())).toBeTruthy()
    })
  })

  //# ==================== VALIDATION ====================
  describe('Result Validation', () => {
    it.each([
      { value: new Ok(42), expected: true },
      { value: new Err(new Error()), expected: true },
      { value: 42, expected: false },
      { value: null, expected: false },
      { value: { ok: 42 }, expected: false },
    ])('should validate isResult for $value', ({ value, expected }) => {
      expect(createIsResult(value)).toBe(expected)
    })
  })

  //# ==================== CONVERSION ====================
  describe('fromNullable', () => {
    it.each([
      { value: 42, isOk: true, result: 42 },
      { value: 0, isOk: true, result: 0 },
      { value: '', isOk: true, result: '' },
      { value: false, isOk: true, result: false },
      { value: null, isOk: false, result: 'Value is null or undefined' },
      { value: undefined, isOk: false, result: 'Value is null or undefined' },
    ])('should handle $value', ({ value, isOk, result }) => {
      const r = createFromNullable(value)

      if (isOk) {
        expect(expectOk(r)).toBe(result)
      } else {
        expect(expectErr(r).message).toBe(result)
      }
    })

    it('should use custom error mapper', () => {
      const result = createFromNullable(null, () => new Error('Custom'))
      expect(expectErr(result).message).toBe('Custom')
    })
  })

  describe('validate', () => {
    it('should validate based on predicate', () => {
      const valid = createValidate(42, (x) => x > 0)
      const invalid = createValidate(-1, (x) => x > 0)

      expect(expectOk(valid)).toBe(42)
      expect(expectErr(invalid).message).toContain('Validation failed')
    })

    it('should use custom error mapper with value', () => {
      const result = createValidate(
        5,
        (x) => x > 10,
        (value) => new Error(`Expected > 10, got ${value}`)
      )

      expect(expectErr(result).message).toBe('Expected > 10, got 5')
    })

    it('should validate complex predicates', () => {
      const person = { age: 25, name: 'John' }
      const result = createValidate(person, (p) => p.age >= 18 && p.name.length > 0)

      expect(expectOk(result)).toBe(person)
    })
  })

  describe('fromTry', () => {
    it('should handle success and failure', () => {
      const success = createFromTry(() => 42)
      const failure = createFromTry(() => {
        throw new Error('Failed')
      })

      expect(expectOk(success)).toBe(42)
      expect(expectErr(failure).message).toBe('Failed')
    })

    it('should handle JSON parsing', () => {
      const valid = createFromTry(() => JSON.parse('{"a":1}'))
      const invalid = createFromTry(() => JSON.parse('invalid'))

      expect(expectOk(valid)).toEqual({ a: 1 })
      expect(expectErr(invalid)).toBeInstanceOf(SyntaxError)
    })

    it('should use custom error mapper', () => {
      const result = createFromTry(
        () => JSON.parse('invalid'),
        (error) => `Parse error: ${(error as Error).message}`
      )

      expect(expectErr(result)).toContain('Parse error')
    })

    it.each([
      { thrown: 'string error', expected: 'string error' },
      { thrown: null, isError: true },
    ])('should handle non-Error throws', ({ thrown, expected, isError }) => {
      const result = createFromTry(() => {
        throw thrown
      })
      const err = expectErr(result)

      if (isError) {
        expect(err).toBeInstanceOf(Error)
      } else {
        expect(err.message).toBe(expected)
      }
    })
  })

  // ==================== COMBINATION ====================
  describe('all', () => {
    it('should combine all Ok values', () => {
      const results = [createOk(1), createOk(2), createOk(3)]
      expect(expectOk(createAll(results))).toEqual([1, 2, 3])
    })

    it('should return first Err', () => {
      const results = [createOk(1), createErr(new Error('First')), createErr(new Error('Second'))]

      expect(expectErr(createAll(results)).message).toBe('First')
    })

    it.each([
      { results: [], expected: [] },
      { results: [createOk(42)], expected: [42] },
    ])('should handle edge case: $results.length items', ({ results, expected }) => {
      expect(expectOk(createAll(results as any))).toEqual(expected)
    })

    it('should preserve types in tuple', () => {
      const results = [createOk(1), createOk('hello'), createOk(true)] as const
      const [num, str, bool] = expectOk(createAll(results))

      expect(typeof num).toBe('number')
      expect(typeof str).toBe('string')
      expect(typeof bool).toBe('boolean')
    })
  })

  describe('any', () => {
    it('should return first Ok', () => {
      const results = [createErr(new Error('First')), createOk(42), createOk(100)]

      expect(expectOk(createAny(results))).toBe(42)
    })

    it('should collect all errors when all are Err', () => {
      const results = [createErr(new Error('First')), createErr(new Error('Second'))]

      const errors = expectErr(createAny(results)) as Error[]
      expect(errors).toHaveLength(2)
      expect(errors.map((e) => e.message)).toEqual(['First', 'Second'])
    })

    it('should handle empty array', () => {
      expect(expectErr(createAny([]))).toEqual([])
    })
  })

  describe('partition', () => {
    it('should separate Ok and Err values', () => {
      const results = [
        createOk(1),
        createErr(new Error('First')),
        createOk(2),
        createErr(new Error('Second')),
      ]

      const [oks, errs] = createPartition(results)

      expect(oks).toEqual([1, 2])
      expect(errs.map((e) => e.message)).toEqual(['First', 'Second'])
    })

    it.each([
      {
        name: 'all Ok',
        results: [createOk(1), createOk(2)],
        oks: [1, 2],
        errs: [],
      },
      {
        name: 'all Err',
        results: [createErr('a'), createErr('b')],
        oks: [],
        errs: ['a', 'b'],
      },
      { name: 'empty', results: [], oks: [], errs: [] },
    ])('should handle $name', ({ results, oks, errs }) => {
      const [okValues, errValues] = createPartition(results as any)
      expect(okValues).toEqual(oks)
      expect(errValues).toEqual(errs)
    })
  })

  describe('allSettled', () => {
    it('should transform all results to settled format', () => {
      const results = [createOk(1), createErr(new Error('Failed')), createOk(2)]

      const settled = expectOk(createAllSettled(results))

      expect(settled).toHaveLength(3)
      expect(settled[0]).toEqual({ status: 'ok', value: 1 })
      expect(settled[1]).toEqual({ status: 'err', reason: expect.any(Error) })
      expect(settled[2]).toEqual({ status: 'ok', value: 2 })
    })

    it.each([
      {
        name: 'all Ok',
        results: [createOk(1), createOk(2)],
        expected: [
          { status: 'ok', value: 1 },
          { status: 'ok', value: 2 },
        ],
      },
      {
        name: 'all Err',
        results: [createErr('a'), createErr('b')],
        expected: [
          { status: 'err', reason: 'a' },
          { status: 'err', reason: 'b' },
        ],
      },
      { createAe: 'empty', results: [], expected: [] },
    ])('should handle $name', ({ results, expected }) => {
      const settled = expectOk(createAllSettled(results as any))
      expect(settled).toEqual(expected)
    })

    it('should always return Ok with settled results', () => {
      const results = [createErr(new Error('1')), createErr(new Error('2'))]

      const result = createAllSettled(results)

      expect(result.isOk()).toBe(true)
      expect(expectOk(result)).toHaveLength(2)
    })
  })

  //# ==================== ASYNC OPERATIONS ====================
  describe('fromPromise', () => {
    it('should handle resolution and rejection', async () => {
      const success = await createFromPromise(async () => 42)
      const failure = await createFromPromise(async () => {
        throw new Error('Failed')
      })

      expect(expectOk(success)).toBe(42)
      expect(expectErr(failure).message).toBe('Failed')
    })

    it('should handle async operations', async () => {
      const result = await createFromPromise(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        return { data: 'response' }
      })

      expect(expectOk(result)).toEqual({ data: 'response' })
    })

    it('should use custom error mapper', async () => {
      const result = await createFromPromise(
        async () => {
          throw new Error('Network error')
        },
        (error) => `Custom: ${(error as Error).message}`
      )

      expect(expectErr(result)).toBe('Custom: Network error')
    })

    it.each([
      { thrown: 'string error', expected: 'string error' },
      { thrown: null, isError: true },
      { thrown: undefined, isError: true },
    ])('should handle non-Error throws: $thrown', async ({ thrown, expected, isError }) => {
      const result = await createFromPromise(async () => {
        throw thrown
      })
      const err = expectErr(result)

      if (isError) {
        expect(err).toBeInstanceOf(Error)
      } else {
        expect(err.message).toBe(expected)
      }
    })

    it('should map error to custom type', async () => {
      interface ApiError {
        code: number
        message: string
      }

      const result = await createFromPromise(
        async () => {
          throw new Error('404: Not found')
        },
        (error): ApiError => ({
          code: 404,
          message: (error as Error).message,
        })
      )

      expect(expectErr(result)).toEqual({
        code: 404,
        message: '404: Not found',
      })
    })

    it.each([
      { value: 100, name: 'value' },
      { value: null, name: 'null' },
      { value: undefined, name: 'undefined' },
    ])('should handle Promise.resolve with $name', async ({ value }) => {
      const result = await createFromPromise(() => Promise.resolve(value))
      expect(expectOk(result)).toBe(value)
    })
  })

  // ==================== INTEGRATION ====================
  describe('Integration', () => {
    it('should compose fromTry with async context', async () => {
      const result = await createFromPromise(async () => {
        const parsed = createFromTry(() => JSON.parse('{"value":42}'))
        return expectOk(parsed)
      })

      expect(expectOk(result)).toEqual({ value: 42 })
    })

    it('should chain async and sync operations', async () => {
      const result = await createFromPromise(async () => '{"value":42}')
        .then((r) => r.andThen((json) => createFromTry(() => JSON.parse(json))))
        .then((r) => r.map((obj) => obj.value))

      expect(expectOk(result)).toBe(42)
    })

    it('should compose multiple factory methods', () => {
      const result = createFromTry(() => JSON.parse('{"value":42}'))
        .andThen((obj) => createValidate(obj.value, (x) => x > 0))
        .map((x) => x * 2)

      expect(expectOk(result)).toBe(84)
    })

    it('should validate with multiple conditions', () => {
      type User = { name: string; age: number; email: string }

      const validateUser = (user: User) =>
        createValidate(
          user,
          (u) => u.age >= 18 && u.name.length > 0 && u.email.includes('@'),
          (u) => new Error(`Invalid user: ${JSON.stringify(u)}`)
        )

      const valid = validateUser({ name: 'John', age: 25, email: 'john@test.com' })
      const invalid = validateUser({ name: '', age: 15, email: 'invalid' })

      expect(valid.isOk()).toBe(true)
      expect(invalid.isErr()).toBe(true)
    })

    it('should compose async operations', async () => {
      const fetchUser = () => createFromPromise(async () => ({ id: 1, name: 'John' }))
      const fetchPosts = (userId: number) =>
        createFromPromise(async () => [{ id: 1, userId, title: 'Post 1' }])

      const result = await fetchUser().then((r) => r.andThenAsync((user) => fetchPosts(user.id)))

      expect(expectOk(result)).toHaveLength(1)
    })
  })

  // ==================== EDGE CASES ====================
  describe('Edge Cases', () => {
    it('should handle nested Results in all', () => {
      const results = [createOk(createOk(1)), createOk(createOk(2))]
      const values = expectOk(createAll(results))

      expect(expectOk(values[0])).toBe(1)
      expect(expectOk(values[1])).toBe(2)
    })

    it('should handle large arrays', () => {
      const results = Array.from({ length: 1000 }, (_, i) => createOk(i))
      expect(expectOk(createAll(results))).toHaveLength(1000)
    })

    it('should compose parseAndValidate pattern', () => {
      const parseAndValidate = (json: string) =>
        createFromTry(() => JSON.parse(json))
          .andThen((data) => createFromNullable(data.value))
          .andThen((value) => createValidate(value, (x) => typeof x === 'number'))

      expect(parseAndValidate('{"value":42}').isOk()).toBe(true)
      expect(parseAndValidate('{"value":null}').isErr()).toBe(true)
    })
  })
})
