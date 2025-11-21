/** biome-ignore-all lint/suspicious/noExplicitAny: test file */
import { describe, expect, it } from 'vitest'

import { Err } from './err.js'
import factories from './factories.js'
import { Ok } from './ok.js'

import { expectErr, expectOk } from './test-helpers.js'

describe('Factories', () => {
  //# ==================== CREATION ====================
  describe('Basic Creation', () => {
    it.each([
      {
        name: 'ok with value',
        fn: () => factories.createOk(42),
        check: (r: any) => expectOk(r) === 42,
      },
      {
        name: 'ok with null',
        fn: () => factories.createOk(null),
        check: (r: any) => expectOk(r) === null,
      },
      {
        name: 'err with Error',
        fn: () => factories.createErr(new Error('Failed')),
        check: (r: any) => expectErr(r) instanceof Error,
      },
      {
        name: 'err with string',
        fn: () => factories.createErr('error'),
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
      expect(factories.createIsResult(value)).toBe(expected)
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
      const r = factories.createFromNullable(value)

      if (isOk) {
        expect(expectOk(r)).toBe(result)
      } else {
        expect(expectErr(r).message).toBe(result)
      }
    })

    it('should use custom error mapper', () => {
      const result = factories.createFromNullable(null, () => new Error('Custom'))
      expect(expectErr(result).message).toBe('Custom')
    })
  })

  describe('validate', () => {
    it('should validate based on predicate', () => {
      const valid = factories.createValidate(42, (x) => x > 0)
      const invalid = factories.createValidate(-1, (x) => x > 0)

      expect(expectOk(valid)).toBe(42)
      expect(expectErr(invalid).message).toContain('Validation failed')
    })

    it('should use custom error mapper with value', () => {
      const result = factories.createValidate(
        5,
        (x) => x > 10,
        (value) => new Error(`Expected > 10, got ${value}`)
      )

      expect(expectErr(result).message).toBe('Expected > 10, got 5')
    })

    it('should validate complex predicates', () => {
      const person = { age: 25, name: 'John' }
      const result = factories.createValidate(person, (p) => p.age >= 18 && p.name.length > 0)

      expect(expectOk(result)).toBe(person)
    })
  })

  describe('fromTry', () => {
    it('should handle success and failure', () => {
      const success = factories.createFromTry(() => 42)
      const failure = factories.createFromTry(() => {
        throw new Error('Failed')
      })

      expect(expectOk(success)).toBe(42)
      expect(expectErr(failure).message).toBe('Failed')
    })

    it('should handle JSON parsing', () => {
      const valid = factories.createFromTry(() => JSON.parse('{"a":1}'))
      const invalid = factories.createFromTry(() => JSON.parse('invalid'))

      expect(expectOk(valid)).toEqual({ a: 1 })
      expect(expectErr(invalid)).toBeInstanceOf(SyntaxError)
    })

    it('should use custom error mapper', () => {
      const result = factories.createFromTry(
        () => JSON.parse('invalid'),
        (error) => `Parse error: ${(error as Error).message}`
      )

      expect(expectErr(result)).toContain('Parse error')
    })

    it.each([
      { thrown: 'string error', expected: 'string error' },
      { thrown: null, isError: true },
    ])('should handle non-Error throws', ({ thrown, expected, isError }) => {
      const result = factories.createFromTry(() => {
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
      const results = [factories.createOk(1), factories.createOk(2), factories.createOk(3)]
      expect(expectOk(factories.createAll(results))).toEqual([1, 2, 3])
    })

    it('should return first Err', () => {
      const results = [
        factories.createOk(1),
        factories.createErr(new Error('First')),
        factories.createErr(new Error('Second')),
      ]

      expect(expectErr(factories.createAll(results)).message).toBe('First')
    })

    it.each([
      { results: [], expected: [] },
      { results: [factories.createOk(42)], expected: [42] },
    ])('should handle edge case: $results.length items', ({ results, expected }) => {
      expect(expectOk(factories.createAll(results as any))).toEqual(expected)
    })

    it('should preserve types in tuple', () => {
      const results = [
        factories.createOk(1),
        factories.createOk('hello'),
        factories.createOk(true),
      ] as const
      const [num, str, bool] = expectOk(factories.createAll(results))

      expect(typeof num).toBe('number')
      expect(typeof str).toBe('string')
      expect(typeof bool).toBe('boolean')
    })
  })

  describe('any', () => {
    it('should return first Ok', () => {
      const results = [
        factories.createErr(new Error('First')),
        factories.createOk(42),
        factories.createOk(100),
      ]

      expect(expectOk(factories.createAny(results))).toBe(42)
    })

    it('should collect all errors when all are Err', () => {
      const results = [
        factories.createErr(new Error('First')),
        factories.createErr(new Error('Second')),
      ]

      const errors = expectErr(factories.createAny(results)) as Error[]
      expect(errors).toHaveLength(2)
      expect(errors.map((e) => e.message)).toEqual(['First', 'Second'])
    })

    it('should handle empty array', () => {
      expect(expectErr(factories.createAny([]))).toEqual([])
    })
  })

  describe('partition', () => {
    it('should separate Ok and Err values', () => {
      const results = [
        factories.createOk(1),
        factories.createErr(new Error('First')),
        factories.createOk(2),
        factories.createErr(new Error('Second')),
      ]

      const [oks, errs] = factories.createPartition(results)

      expect(oks).toEqual([1, 2])
      expect(errs.map((e) => e.message)).toEqual(['First', 'Second'])
    })

    it.each([
      {
        name: 'all Ok',
        results: [factories.createOk(1), factories.createOk(2)],
        oks: [1, 2],
        errs: [],
      },
      {
        name: 'all Err',
        results: [factories.createErr('a'), factories.createErr('b')],
        oks: [],
        errs: ['a', 'b'],
      },
      { name: 'empty', results: [], oks: [], errs: [] },
    ])('should handle $name', ({ results, oks, errs }) => {
      const [okValues, errValues] = factories.createPartition(results as any)
      expect(okValues).toEqual(oks)
      expect(errValues).toEqual(errs)
    })
  })

  describe('allSettled', () => {
    it('should transform all results to settled format', () => {
      const results = [
        factories.createOk(1),
        factories.createErr(new Error('Failed')),
        factories.createOk(2),
      ]

      const settled = expectOk(factories.createAllSettled(results))

      expect(settled).toHaveLength(3)
      expect(settled[0]).toEqual({ status: 'ok', value: 1 })
      expect(settled[1]).toEqual({ status: 'err', reason: expect.any(Error) })
      expect(settled[2]).toEqual({ status: 'ok', value: 2 })
    })

    it.each([
      {
        name: 'all Ok',
        results: [factories.createOk(1), factories.createOk(2)],
        expected: [
          { status: 'ok', value: 1 },
          { status: 'ok', value: 2 },
        ],
      },
      {
        name: 'all Err',
        results: [factories.createErr('a'), factories.createErr('b')],
        expected: [
          { status: 'err', reason: 'a' },
          { status: 'err', reason: 'b' },
        ],
      },
      { createAe: 'empty', results: [], expected: [] },
    ])('should handle $name', ({ results, expected }) => {
      const settled = expectOk(factories.createAllSettled(results as any))
      expect(settled).toEqual(expected)
    })

    it('should always return Ok with settled results', () => {
      const results = [factories.createErr(new Error('1')), factories.createErr(new Error('2'))]

      const result = factories.createAllSettled(results)

      expect(result.isOk()).toBe(true)
      expect(expectOk(result)).toHaveLength(2)
    })
  })

  //# ==================== ASYNC OPERATIONS ====================
  describe('fromPromise', () => {
    it('should handle resolution and rejection', async () => {
      const success = await factories.createFromPromise(async () => 42)
      const failure = await factories.createFromPromise(async () => {
        throw new Error('Failed')
      })

      expect(expectOk(success)).toBe(42)
      expect(expectErr(failure).message).toBe('Failed')
    })

    it('should handle async operations', async () => {
      const result = await factories.createFromPromise(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        return { data: 'response' }
      })

      expect(expectOk(result)).toEqual({ data: 'response' })
    })

    it('should use custom error mapper', async () => {
      const result = await factories.createFromPromise(
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
      const result = await factories.createFromPromise(async () => {
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

      const result = await factories.createFromPromise(
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
      const result = await factories.createFromPromise(() => Promise.resolve(value))
      expect(expectOk(result)).toBe(value)
    })
  })

  // ==================== INTEGRATION ====================
  describe('Integration', () => {
    it('should compose fromTry with async context', async () => {
      const result = await factories.createFromPromise(async () => {
        const parsed = factories.createFromTry(() => JSON.parse('{"value":42}'))
        return expectOk(parsed)
      })

      expect(expectOk(result)).toEqual({ value: 42 })
    })

    it('should chain async and sync operations', async () => {
      const result = await factories
        .createFromPromise(async () => '{"value":42}')
        .then((r) => r.andThen((json) => factories.createFromTry(() => JSON.parse(json))))
        .then((r) => r.map((obj) => obj.value))

      expect(expectOk(result)).toBe(42)
    })

    it('should compose multiple factory methods', () => {
      const result = factories
        .createFromTry(() => JSON.parse('{"value":42}'))
        .andThen((obj) => factories.createValidate(obj.value, (x) => x > 0))
        .map((x) => x * 2)

      expect(expectOk(result)).toBe(84)
    })

    it('should validate with multiple conditions', () => {
      type User = { name: string; age: number; email: string }

      const validateUser = (user: User) =>
        factories.createValidate(
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
      const fetchUser = () => factories.createFromPromise(async () => ({ id: 1, name: 'John' }))
      const fetchPosts = (userId: number) =>
        factories.createFromPromise(async () => [{ id: 1, userId, title: 'Post 1' }])

      const result = await fetchUser().then((r) => r.andThenAsync((user) => fetchPosts(user.id)))

      expect(expectOk(result)).toHaveLength(1)
    })
  })

  // ==================== EDGE CASES ====================
  describe('Edge Cases', () => {
    it('should handle nested Results in all', () => {
      const results = [
        factories.createOk(factories.createOk(1)),
        factories.createOk(factories.createOk(2)),
      ]
      const values = expectOk(factories.createAll(results))

      expect(expectOk(values[0])).toBe(1)
      expect(expectOk(values[1])).toBe(2)
    })

    it('should handle large arrays', () => {
      const results = Array.from({ length: 1000 }, (_, i) => factories.createOk(i))
      expect(expectOk(factories.createAll(results))).toHaveLength(1000)
    })

    it('should compose parseAndValidate pattern', () => {
      const parseAndValidate = (json: string) =>
        factories
          .createFromTry(() => JSON.parse(json))
          .andThen((data) => factories.createFromNullable(data.value))
          .andThen((value) => factories.createValidate(value, (x) => typeof x === 'number'))

      expect(parseAndValidate('{"value":42}').isOk()).toBe(true)
      expect(parseAndValidate('{"value":null}').isErr()).toBe(true)
    })
  })
})
