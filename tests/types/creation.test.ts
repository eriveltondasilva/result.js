import { describe, expectTypeOf, it } from 'vitest'

import type { AsyncResult, Err, Ok, Result } from '@/types/index'

import { Result as R } from '@/index'

// ---------------------------------------------------------------------------
// Result.ok
// ---------------------------------------------------------------------------

describe('Result.ok — type inference', () => {
  it('should infer Ok<number, never>', () => {
    expectTypeOf(R.ok(42)).toExtend<Ok<number, never>>()
  })

  it('should infer Ok<string, never>', () => {
    expectTypeOf(R.ok('hello')).toExtend<Ok<string, never>>()
  })

  it('should infer Ok<null, never>', () => {
    expectTypeOf(R.ok(null)).toExtend<Ok<null, never>>()
  })

  it('should infer Ok<undefined, never>', () => {
    expectTypeOf(R.ok(undefined)).toExtend<Ok<undefined, never>>()
  })

  it('should infer Ok with object type', () => {
    expectTypeOf(R.ok({ id: 1, name: 'John' })).toExtend<Ok<{ id: number; name: string }, never>>()
  })

  it('should infer Ok<number[], never> for array', () => {
    expectTypeOf(R.ok([1, 2, 3])).toExtend<Ok<number[], never>>()
  })
})

// ---------------------------------------------------------------------------
// Result.err
// ---------------------------------------------------------------------------

describe('Result.err — type inference', () => {
  it('should infer Err<never, Error>', () => {
    expectTypeOf(R.err(new Error('fail'))).toExtend<Err<never, Error>>()
  })

  it('should infer Err<never, string>', () => {
    expectTypeOf(R.err('not found')).toExtend<Err<never, string>>()
  })

  it('should infer Err with custom object error', () => {
    const error = { code: 404, message: 'not found' }
    expectTypeOf(R.err(error)).toExtend<Err<never, { code: number; message: string }>>()
  })
})

// ---------------------------------------------------------------------------
// Result<T, E> union
// ---------------------------------------------------------------------------

describe('Result<T, E> union type', () => {
  it('should be assignable from Ok', () => {
    const result: Result<number, string> = R.ok(1)
    expectTypeOf(result).toExtend<Result<number, string>>()
  })

  it('should be assignable from Err', () => {
    const result: Result<number, string> = R.err('fail')
    expectTypeOf(result).toExtend<Result<number, string>>()
  })
})

// ---------------------------------------------------------------------------
// Result.fromTry
// ---------------------------------------------------------------------------

describe('Result.fromTry — type inference', () => {
  it('should infer Result<T, Error> without transformer', () => {
    const result = R.fromTry(() => JSON.parse('{}') as Record<string, unknown>)
    expectTypeOf(result).toEqualTypeOf<Result<Record<string, unknown>, Error>>()
  })

  it('should infer Result<T, E> with custom error transformer', () => {
    const result = R.fromTry(
      () => 42,
      () => ({ type: 'parse_error' as const }),
    )
    expectTypeOf(result).toEqualTypeOf<Result<number, { type: 'parse_error' }>>()
  })
})

// ---------------------------------------------------------------------------
// Result.fromNullable
// ---------------------------------------------------------------------------

describe('Result.fromNullable — type inference', () => {
  it('should infer Result<T, E> from a non-null value', () => {
    const result = R.fromNullable(42, () => 'missing')
    expectTypeOf(result).toExtend<Result<number, string>>()
  })

  it('should infer Result<T, E> from null', () => {
    const value = null as string | null
    const result = R.fromNullable(value, () => 'missing')
    expectTypeOf(result).toExtend<Result<string, string>>()
  })
})

// ---------------------------------------------------------------------------
// Result.fromPromise
// ---------------------------------------------------------------------------

describe('Result.fromPromise — type inference', () => {
  it('should infer AsyncResult<T, Error> without transformer', () => {
    const result = R.fromPromise(async () => 42)
    expectTypeOf(result).toEqualTypeOf<AsyncResult<number, Error>>()
  })

  it('should infer AsyncResult<T, E> with custom transformer', () => {
    const result = R.fromPromise(
      async () => 'hello',
      () => ({ code: 500 }),
    )
    expectTypeOf(result).toEqualTypeOf<AsyncResult<string, { code: number }>>()
  })
})

// ---------------------------------------------------------------------------
// Result.isOk / isErr / isResult (static guards)
// ---------------------------------------------------------------------------

describe('Result static type guards', () => {
  it('Result.isOk should narrow unknown to Ok<unknown, never>', () => {
    const value: unknown = R.ok(1)
    if (R.isOk(value)) {
      expectTypeOf(value).toExtend<Ok<unknown, never>>()
    }
  })

  it('Result.isErr should narrow unknown to Err<never, unknown>', () => {
    const value: unknown = R.err('fail')
    if (R.isErr(value)) {
      expectTypeOf(value).toExtend<Err<never, unknown>>()
    }
  })

  it('Result.isResult should narrow unknown to Result<unknown, unknown>', () => {
    const value: unknown = R.ok(1)
    if (R.isResult(value)) {
      expectTypeOf(value).toEqualTypeOf<Result<unknown, unknown>>()
    }
  })
})
