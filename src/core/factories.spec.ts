import { describe, expect, it } from 'vitest'
import { Err } from './err.js'
import factories from './factories.js'
import { Ok } from './ok.js'

describe('Factories', () => {
  // ==================== CREATION ====================
  describe('Result.ok', () => {
    it('should create Ok with value', () => {
      const result = factories.ok(42)
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(42)
    })

    it('should create Ok with null', () => {
      const result = factories.ok(null)
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBeNull()
    })

    it('should create Ok with object', () => {
      const obj = { name: 'test' }
      const result = factories.ok(obj)
      expect(result.unwrap()).toBe(obj)
    })
  })

  describe('Result.err', () => {
    it('should create Err with Error', () => {
      const error = new Error('Failed')
      const result = factories.err(error)
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr()).toBe(error)
    })

    it('should create Err with string', () => {
      const result = factories.err('error message')
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr()).toBe('error message')
    })

    it('should create Err with custom error type', () => {
      const result = factories.err({ code: 404, message: 'Not found' })
      expect(result.unwrapErr()).toEqual({ code: 404, message: 'Not found' })
    })
  })

  // ==================== VALIDATION ====================
  describe('Result.isResult', () => {
    it('should return true for Ok', () => {
      expect(factories.isResult(new Ok(42))).toBe(true)
    })

    it('should return true for Err', () => {
      expect(factories.isResult(new Err(new Error()))).toBe(true)
    })

    it('should return false for plain values', () => {
      expect(factories.isResult(42)).toBe(false)
      expect(factories.isResult('string')).toBe(false)
      expect(factories.isResult(null)).toBe(false)
      expect(factories.isResult(undefined)).toBe(false)
    })

    it('should return false for plain objects', () => {
      expect(factories.isResult({ ok: 42 })).toBe(false)
      expect(factories.isResult({ err: new Error() })).toBe(false)
    })
  })

  // ==================== CONVERSION ====================
  describe('Result.fromNullable', () => {
    it('should create Ok for non-null value', () => {
      const result = factories.fromNullable(42)
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(42)
    })

    it('should create Err for null', () => {
      const result = factories.fromNullable(null)
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr().message).toBe('Value is null or undefined')
    })

    it('should create Err for undefined', () => {
      const result = factories.fromNullable(undefined)
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr().message).toBe('Value is null or undefined')
    })

    it('should use custom error mapper', () => {
      const result = factories.fromNullable(null, () => new Error('Custom error'))
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr().message).toBe('Custom error')
    })

    it('should handle zero as valid value', () => {
      const result = factories.fromNullable(0)
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(0)
    })

    it('should handle empty string as valid value', () => {
      const result = factories.fromNullable('')
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe('')
    })

    it('should handle false as valid value', () => {
      const result = factories.fromNullable(false)
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(false)
    })
  })

  describe('Result.validate', () => {
    it('should create Ok when predicate passes', () => {
      const result = factories.validate(42, (x) => x > 0)
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(42)
    })

    it('should create Err when predicate fails', () => {
      const result = factories.validate(-1, (x) => x > 0)
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr().message).toContain('Validation failed')
    })

    it('should use custom error mapper', () => {
      const result = factories.validate(
        -1,
        (x) => x > 0,
        (value) => new Error(`${value} is negative`)
      )
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr().message).toBe('-1 is negative')
    })

    it('should validate complex predicates', () => {
      const result = factories.validate(
        { age: 25, name: 'John' },
        (person) => person.age >= 18 && person.name.length > 0
      )
      expect(result.isOk()).toBe(true)
    })

    it('should pass value to error mapper', () => {
      const result = factories.validate(
        5,
        (x) => x > 10,
        (value) => new Error(`Expected > 10, got ${value}`)
      )
      expect(result.unwrapErr().message).toBe('Expected > 10, got 5')
    })
  })

  describe('Result.fromTry', () => {
    it('should create Ok when function succeeds', () => {
      const result = factories.fromTry(() => 42)
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(42)
    })

    it('should create Err when function throws', () => {
      const result = factories.fromTry(() => {
        throw new Error('Failed')
      })
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr().message).toBe('Failed')
    })

    it('should handle JSON.parse success', () => {
      const result = factories.fromTry(() => JSON.parse('{"a":1}'))
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toEqual({ a: 1 })
    })

    it('should handle JSON.parse failure', () => {
      const result = factories.fromTry(() => JSON.parse('invalid'))
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr()).toBeInstanceOf(SyntaxError)
    })

    it('should use custom error mapper', () => {
      const result = factories.fromTry(
        () => JSON.parse('invalid'),
        (error) => `Parse error: ${(error as Error).message}`
      )
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr()).toContain('Parse error')
    })

    it('should handle non-Error throws', () => {
      const result = factories.fromTry(() => {
        throw 'string error'
      })
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr().message).toBe('string error')
    })

    it('should handle null throws', () => {
      const result = factories.fromTry(() => {
        throw null
      })
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr()).toBeInstanceOf(Error)
    })
  })

  // ==================== COMBINATION ====================
  describe('Result.all', () => {
    it('should return Ok with all values when all are Ok', () => {
      const results = [factories.ok(1), factories.ok(2), factories.ok(3)]
      const result = factories.all(results)

      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toEqual([1, 2, 3])
    })

    it('should return first Err when any is Err', () => {
      const results = [
        factories.ok(1),
        factories.err(new Error('First error')),
        factories.err(new Error('Second error')),
      ]
      const result = factories.all(results)

      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr().message).toBe('First error')
    })

    it('should handle empty array', () => {
      const result = factories.all([])
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toEqual([])
    })

    it('should handle single Ok', () => {
      const result = factories.all([factories.ok(42)])
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toEqual([42])
    })

    it('should handle single Err', () => {
      const result = factories.all([factories.err(new Error('Failed'))])
      expect(result.isErr()).toBe(true)
    })

    it('should preserve types in tuple', () => {
      const results = [factories.ok(1), factories.ok('hello'), factories.ok(true)] as const
      const result = factories.all(results)

      if (result.isOk()) {
        const [num, str, bool] = result.unwrap()
        expect(typeof num).toBe('number')
        expect(typeof str).toBe('string')
        expect(typeof bool).toBe('boolean')
      }
    })
  })

  describe('Result.any', () => {
    it('should return first Ok', () => {
      const results = [factories.err(new Error('First')), factories.ok(42), factories.ok(100)]
      const result = factories.any(results)

      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(42)
    })

    it('should return Err with all errors when all are Err', () => {
      const results = [
        factories.err(new Error('First')),
        factories.err(new Error('Second')),
        factories.err(new Error('Third')),
      ]
      const result = factories.any(results)

      expect(result.isErr()).toBe(true)
      const errors = result.unwrapErr() as Error[]
      expect(errors).toHaveLength(3)
      expect(errors[0]?.message).toBe('First')
      expect(errors[1]?.message).toBe('Second')
      expect(errors[2]?.message).toBe('Third')
    })

    it('should handle empty array', () => {
      const result = factories.any([])
      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr()).toEqual([])
    })

    it('should return first Ok even if others are Ok', () => {
      const results = [factories.ok(1), factories.ok(2), factories.ok(3)]
      const result = factories.any(results)

      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(1)
    })

    it('should handle mixed types', () => {
      const results = [factories.err('error1'), factories.err('error2'), factories.ok('success')]
      const result = factories.any(results)

      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe('success')
    })
  })

  describe('Result.partition', () => {
    it('should partition mixed results', () => {
      const results = [
        factories.ok(1),
        factories.err(new Error('First')),
        factories.ok(2),
        factories.err(new Error('Second')),
        factories.ok(3),
      ]
      const [oks, errs] = factories.partition(results)

      expect(oks).toEqual([1, 2, 3])
      expect(errs).toHaveLength(2)
      expect(errs[0]?.message).toBe('First')
      expect(errs[1]?.message).toBe('Second')
    })

    it('should handle all Ok', () => {
      const results = [factories.ok(1), factories.ok(2), factories.ok(3)]
      const [oks, errs] = factories.partition(results)

      expect(oks).toEqual([1, 2, 3])
      expect(errs).toEqual([])
    })

    it('should handle all Err', () => {
      const results = [factories.err(new Error('1')), factories.err(new Error('2'))]
      const [oks, errs] = factories.partition(results)

      expect(oks).toEqual([])
      expect(errs).toHaveLength(2)
    })

    it('should handle empty array', () => {
      const [oks, errs] = factories.partition([])
      expect(oks).toEqual([])
      expect(errs).toEqual([])
    })

    it('should preserve order', () => {
      const results = [
        factories.ok(1),
        factories.ok(2),
        factories.err('a'),
        factories.ok(3),
        factories.err('b'),
      ]
      const [oks, errs] = factories.partition(results)

      expect(oks).toEqual([1, 2, 3])
      expect(errs).toEqual(['a', 'b'])
    })
  })

  // ==================== FROM PROMISE ====================
  describe('Result.fromPromise', () => {
    it('should create Ok when promise resolves', async () => {
      const result = await factories.fromPromise(async () => 42)

      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(42)
    })

    it('should create Err when promise rejects with Error', async () => {
      const result = await factories.fromPromise(async () => {
        throw new Error('Failed')
      })

      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr().message).toBe('Failed')
    })

    it('should handle async operations', async () => {
      const result = await factories.fromPromise(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        return 'success'
      })

      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe('success')
    })

    it('should handle fetch-like operations', async () => {
      const mockFetch = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        return { data: 'response' }
      }

      const result = await factories.fromPromise(mockFetch)
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toEqual({ data: 'response' })
    })

    it('should use custom error mapper', async () => {
      const result = await factories.fromPromise(
        async () => {
          throw new Error('Network error')
        },
        (error) => `Custom: ${(error as Error).message}`
      )

      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr()).toBe('Custom: Network error')
    })

    it('should handle non-Error throws', async () => {
      const result = await factories.fromPromise(async () => {
        throw 'string error'
      })

      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr().message).toBe('string error')
    })

    it('should handle null throws', async () => {
      const result = await factories.fromPromise(async () => {
        throw null
      })

      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr()).toBeInstanceOf(Error)
    })

    it('should handle undefined throws', async () => {
      const result = await factories.fromPromise(async () => {
        throw undefined
      })

      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr()).toBeInstanceOf(Error)
    })

    it('should map error object to custom type', async () => {
      interface ApiError {
        code: number
        message: string
      }

      const result = await factories.fromPromise(
        async () => {
          throw new Error('404: Not found')
        },
        (error): ApiError => ({
          code: 404,
          message: (error as Error).message,
        })
      )

      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr()).toEqual({
        code: 404,
        message: '404: Not found',
      })
    })

    it('should handle Promise.resolve', async () => {
      const result = await factories.fromPromise(() => Promise.resolve(100))

      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(100)
    })

    it('should handle Promise.reject', async () => {
      const result = await factories.fromPromise(() => Promise.reject(new Error('Rejected')))

      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr().message).toBe('Rejected')
    })
  })

  // ==================== INTEGRATION ====================
  describe('Integration', () => {
    it('should work with fromTry in async context', async () => {
      const result = await factories.fromPromise(async () => {
        const parsed = factories.fromTry(() => JSON.parse('{"value":42}'))
        return parsed.unwrap()
      })

      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toEqual({ value: 42 })
    })

    it('should chain async and sync operations', async () => {
      const result = await factories
        .fromPromise(async () => '{"value":42}')
        .then((r) => r.andThen((json) => factories.fromTry(() => JSON.parse(json))))
        .then((r) => r.map((obj) => obj.value))

      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(42)
    })
  })

  // ==================== EDGE CASES ====================
  describe('Edge Cases', () => {
    it('should handle chaining factory methods', () => {
      const result = factories
        .fromTry(() => JSON.parse('{"value":42}'))
        .andThen((obj) => factories.validate(obj.value, (x) => x > 0))
        .map((x) => x * 2)

      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(84)
    })

    it('should handle nested Results in all', () => {
      const results = [factories.ok(factories.ok(1)), factories.ok(factories.ok(2))]
      const result = factories.all(results)

      expect(result.isOk()).toBe(true)
      const values = result.unwrap()
      expect(values[0]?.unwrap()).toBe(1)
      expect(values[1]?.unwrap()).toBe(2)
    })

    it('should handle large arrays in all', () => {
      const results = Array.from({ length: 1000 }, (_, i) => factories.ok(i))
      const result = factories.all(results)

      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toHaveLength(1000)
    })

    it('should validate with multiple conditions', () => {
      const validateUser = (user: { name: string; age: number; email: string }) =>
        factories.validate(
          user,
          (u) => u.age >= 18 && u.name.length > 0 && u.email.includes('@'),
          (u) => new Error(`Invalid user: ${JSON.stringify(u)}`)
        )

      const valid = validateUser({ name: 'John', age: 25, email: 'john@test.com' })
      expect(valid.isOk()).toBe(true)

      const invalid = validateUser({ name: '', age: 15, email: 'invalid' })
      expect(invalid.isErr()).toBe(true)
    })

    it('should compose fromTry with other factories', () => {
      const parseAndValidate = (json: string) =>
        factories
          .fromTry(() => JSON.parse(json))
          .andThen((data) => factories.fromNullable(data.value))
          .andThen((value) => factories.validate(value, (x) => typeof x === 'number'))

      const valid = parseAndValidate('{"value":42}')
      expect(valid.isOk()).toBe(true)

      const invalid = parseAndValidate('{"value":null}')
      expect(invalid.isErr()).toBe(true)
    })

    it('should handle null resolution', async () => {
      const result = await factories.fromPromise(async () => null)

      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBeNull()
    })

    it('should handle undefined resolution', async () => {
      const result = await factories.fromPromise(async () => undefined)

      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBeUndefined()
    })

    it('should handle complex error mapping', async () => {
      class NetworkError extends Error {
        constructor(
          public statusCode: number,
          message: string
        ) {
          super(message)
          this.name = 'NetworkError'
        }
      }

      const result = await factories.fromPromise(
        async () => {
          throw new Error('404: Not found')
        },
        (error) => {
          const match = (error as Error).message.match(/^(\d+):/)
          const code = match ? Number.parseInt(match[1] ?? '500', 10) : 500
          return new NetworkError(code, (error as Error).message)
        }
      )

      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr()).toBeInstanceOf(NetworkError)
      expect(result.unwrapErr().statusCode).toBe(404)
    })

    it('should handle nested async operations', async () => {
      const result = await factories.fromPromise(async () => {
        const inner = await factories.fromPromise(async () => 42)
        return inner.unwrap()
      })

      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toBe(42)
    })

    it('should preserve error types across async operations', async () => {
      type ValidationError = { field: string; message: string }

      const result = await factories.fromPromise(
        async () => {
          throw new Error('Invalid field: email')
        },
        (error): ValidationError => ({
          field: 'email',
          message: (error as Error).message,
        })
      )

      expect(result.isErr()).toBe(true)
      expect(result.unwrapErr()).toEqual({
        field: 'email',
        message: 'Invalid field: email',
      })
    })

    it('should compose multiple fromPromise calls', async () => {
      const fetchUser = () => factories.fromPromise(async () => ({ id: 1, name: 'John' }))

      const fetchPosts = (userId: number) =>
        factories.fromPromise(async () => [
          { id: 1, userId, title: 'Post 1' },
          { id: 2, userId, title: 'Post 2' },
        ])

      const result = await fetchUser().then((r) => r.andThenAsync((user) => fetchPosts(user.id)))

      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toHaveLength(2)
    })
  })
})
