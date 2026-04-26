import { describe, expect, it, vi } from 'vitest'

import { Result } from '@/index'

// ---------------------------------------------------------------------------
// map
// ---------------------------------------------------------------------------

describe('Result#map', () => {
  it('should transform the Ok value', () => {
    const result = Result.ok(21).map((x) => x * 2)
    expect(result.unwrap()).toBe(42)
  })

  it('should not call the mapper on Err', () => {
    const mapper = vi.fn()
    Result.err('fail').map(mapper)
    expect(mapper).not.toHaveBeenCalled()
  })

  it('should propagate Err unchanged through map', () => {
    const result = Result.err('fail').map((x: number) => x * 2)
    expect(result.unwrapErr()).toBe('fail')
  })

  it('should support chaining multiple maps', () => {
    const result = Result.ok('42')
      .map((s) => parseInt(s, 10))
      .map((n) => n * 2)
    expect(result.unwrap()).toBe(84)
  })
})

// ---------------------------------------------------------------------------
// mapErr
// ---------------------------------------------------------------------------

describe('Result#mapErr', () => {
  it('should transform the Err value', () => {
    const result = Result.err('not found').mapErr((e) => new Error(e))
    expect(result.unwrapErr()).toBeInstanceOf(Error)
    expect(result.unwrapErr().message).toBe('not found')
  })

  it('should not call the mapper on Ok', () => {
    const mapper = vi.fn()
    Result.ok(42).mapErr(mapper)
    expect(mapper).not.toHaveBeenCalled()
  })

  it('should preserve Ok value through mapErr', () => {
    const result = Result.ok(99).mapErr(() => 'never')
    expect(result.unwrap()).toBe(99)
  })
})

// ---------------------------------------------------------------------------
// mapOr
// ---------------------------------------------------------------------------

describe('Result#mapOr', () => {
  it('should apply the mapper on Ok', () => {
    expect(Result.ok(10).mapOr((x) => x * 3, 0)).toBe(30)
  })

  it('should return the default value on Err', () => {
    expect(Result.err('fail').mapOr((x: number) => x * 3, -1)).toBe(-1)
  })
})

// ---------------------------------------------------------------------------
// mapOrElse
// ---------------------------------------------------------------------------

describe('Result#mapOrElse', () => {
  it('should apply the ok mapper on Ok', () => {
    const result = Result.ok(5).mapOrElse(
      (x) => x * 2,
      () => -1,
    )
    expect(result).toBe(10)
  })

  it('should apply the error mapper on Err', () => {
    const result = Result.err('oops').mapOrElse(
      (x: number) => x * 2,
      (e) => e.length,
    )
    expect(result).toBe(4)
  })
})

// ---------------------------------------------------------------------------
// filter / filterOrElse
// ---------------------------------------------------------------------------

describe('Result#filter', () => {
  it('should keep Ok when predicate passes', () => {
    const result = Result.ok(42).filter((x) => x > 40)
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toBe(42)
  })

  it('should return Err with default message when predicate fails', () => {
    const result = Result.ok(5).filter((x) => x > 40)
    expect(result.isErr()).toBe(true)
    expect(result.unwrapErr()).toBeInstanceOf(Error)
  })

  it('should return Err with custom message when predicate fails', () => {
    const result = Result.ok(5).filter((x) => x > 40, 'value too small')
    expect(result.unwrapErr().message).toBe('value too small')
  })

  it('should propagate Err unchanged without calling predicate', () => {
    const predicate = vi.fn()
    const result = Result.err('fail').filter(predicate)
    expect(predicate).not.toHaveBeenCalled()
    expect(result.unwrapErr()).toBe('fail')
  })
})

describe('Result#filterOrElse', () => {
  it('should keep Ok when predicate passes', () => {
    const result = Result.ok(10).filterOrElse(
      (x) => x > 0,
      (x) => `${x} is not positive`,
    )
    expect(result.isOk()).toBe(true)
  })

  it('should return Err from onReject when predicate fails', () => {
    const result = Result.ok(-5).filterOrElse(
      (x) => x > 0,
      (x) => `${x} is not positive`,
    )
    expect(result.unwrapErr()).toBe('-5 is not positive')
  })
})

// ---------------------------------------------------------------------------
// flatten
// ---------------------------------------------------------------------------

describe('Result#flatten', () => {
  it('should unwrap a nested Ok(Ok)', () => {
    const nested = Result.ok(Result.ok(42))
    expect(nested.flatten().unwrap()).toBe(42)
  })

  it('should unwrap a nested Ok(Err) to the inner Err', () => {
    const nested = Result.ok(Result.err('inner error'))
    const result = nested.flatten()
    expect(result.isErr()).toBe(true)
    expect(result.unwrapErr()).toBe('inner error')
  })

  it('should propagate Err unchanged on Err.flatten', () => {
    const result = (Result.err('outer') as Result<Result<number, string>, string>).flatten()
    expect(result.unwrapErr()).toBe('outer')
  })
})

// ---------------------------------------------------------------------------
// Inspection side-effects
// ---------------------------------------------------------------------------

describe('Result#inspect', () => {
  it('should call visitor with the Ok value', () => {
    const spy = vi.fn()
    Result.ok(7).inspect(spy)
    expect(spy).toHaveBeenCalledWith(7)
  })

  it('should not call visitor on Err', () => {
    const spy = vi.fn()
    Result.err('x').inspect(spy)
    expect(spy).not.toHaveBeenCalled()
  })

  it('should return the same instance for chaining', () => {
    const original = Result.ok(1)
    const returned = original.inspect(() => {})
    expect(returned).toBe(original)
  })
})

describe('Result#inspectErr', () => {
  it('should call visitor with the Err value', () => {
    const spy = vi.fn()
    Result.err('oops').inspectErr(spy)
    expect(spy).toHaveBeenCalledWith('oops')
  })

  it('should not call visitor on Ok', () => {
    const spy = vi.fn()
    Result.ok(1).inspectErr(spy)
    expect(spy).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// contains / match
// ---------------------------------------------------------------------------

describe('Result#contains', () => {
  it('should return true when Ok value matches', () => {
    expect(Result.ok(42).contains(42)).toBe(true)
    expect(Result.ok('42').contains('42')).toBe(true)
  })

  it('should return false when Ok value does not match', () => {
    expect(Result.ok(42).contains(99)).toBe(false)
    expect(Result.ok('42').contains('99')).toBe(false)
  })

  it('should return false for Err regardless of value', () => {
    expect(Result.err('x').contains('x')).toBe(false)
  })

  it('should use a custom comparator when provided', () => {
    const result = Result.ok({ id: 1 }).contains({ id: 1 }, (a, b) => a.id === b.id)
    expect(result).toBe(true)
  })

  it('should deep-equal objects when no comparator is given', () => {
    expect(Result.ok({ a: 1 }).contains({ a: 1 })).toBe(true)
    expect(Result.ok({ a: 1 }).contains({ a: '10' })).toBe(false)
  })
})

describe('Result#match', () => {
  it('should call the ok handler for Ok', () => {
    const result = Result.ok(5).match({
      ok: (x) => x * 10,
      err: () => -1,
    })
    expect(result).toBe(50)
  })

  it('should call the err handler for Err', () => {
    const result = Result.err('boom').match({
      ok: () => 0,
      err: (e) => `error: ${e}`,
    })
    expect(result).toBe('error: boom')
  })
})

// ---------------------------------------------------------------------------
// Conversion
// ---------------------------------------------------------------------------

describe('Result#toNullable', () => {
  it('should return the value for Ok', () => {
    expect(Result.ok(7).toNullable()).toBe(7)
  })

  it('should return null for Err', () => {
    expect(Result.err('fail').toNullable()).toBeNull()
  })
})

describe('Result#toValue', () => {
  it('should return the value for Ok', () => {
    expect(Result.ok(7).toValue()).toBe(7)
  })

  it('should return undefined for Err', () => {
    expect(Result.err('fail').toValue()).toBeUndefined()
  })
})

describe('Result#toJSON', () => {
  it('should serialize Ok correctly', () => {
    expect(Result.ok(1).toJSON()).toEqual({ type: 'ok', value: 1 })
  })

  it('should serialize Err correctly', () => {
    expect(Result.err('fail').toJSON()).toEqual({ type: 'err', error: 'fail' })
  })

  it('should produce valid JSON via JSON.stringify', () => {
    const json = JSON.stringify(Result.ok(42))
    expect(JSON.parse(json)).toEqual({ type: 'ok', value: 42 })
  })
})

describe('Result#toString', () => {
  it('should format Ok with primitive', () => {
    expect(Result.ok(42).toString()).toBe('Ok(42)')
  })

  it('should format Err with Error instance', () => {
    expect(Result.err(new Error('oops')).toString()).toBe('Err(Error: oops)')
  })
})

// ---------------------------------------------------------------------------
// Extraction methods
// ---------------------------------------------------------------------------

describe('Result#unwrap', () => {
  it('should return the value for Ok', () => {
    expect(Result.ok('hello').unwrap()).toBe('hello')
  })

  it('should throw when called on Err', () => {
    expect(() => Result.err(new Error('fail')).unwrap()).toThrow('Called unwrap on an Err value')
  })
})

describe('Result#unwrapErr', () => {
  it('should return the error for Err', () => {
    expect(Result.err('oops').unwrapErr()).toBe('oops')
  })

  it('should throw when called on Ok', () => {
    expect(() => Result.ok(1).unwrapErr()).toThrow('Called unwrapErr on an Ok value')
  })
})

describe('Result#unwrapOr', () => {
  it('should return value for Ok', () => {
    expect(Result.ok(5).unwrapOr(0)).toBe(5)
  })

  it('should return default for Err', () => {
    expect(Result.err('fail').unwrapOr(99)).toBe(99)
  })
})

describe('Result#unwrapOrElse', () => {
  it('should return value for Ok without calling fallback', () => {
    const fallback = vi.fn().mockReturnValue(-1)
    expect(Result.ok(5).unwrapOrElse(fallback)).toBe(5)
    expect(fallback).not.toHaveBeenCalled()
  })

  it('should call fallback with error for Err', () => {
    const result = Result.err('not found').unwrapOrElse((e) => `fallback: ${e}`)
    expect(result).toBe('fallback: not found')
  })
})

describe('Result#expect', () => {
  it('should return the value for Ok', () => {
    expect(Result.ok(10).expect('should exist')).toBe(10)
  })

  it('should throw with provided message for Err', () => {
    expect(() => Result.err('fail').expect('value required')).toThrow('value required')
  })
})

describe('Result#expectErr', () => {
  it('should return the error for Err', () => {
    expect(Result.err('oops').expectErr('should be error')).toBe('oops')
  })

  it('should throw with provided message for Ok', () => {
    expect(() => Result.ok(1).expectErr('should have failed')).toThrow('should have failed')
  })
})

// ---------------------------------------------------------------------------
// Type predicates
// ---------------------------------------------------------------------------

describe('Result instance type predicates', () => {
  it('should narrow to Ok via isOk', () => {
    const result = Result.ok(42) as Result<number, string>
    if (result.isOk()) expect(result.unwrap()).toBe(42)
  })

  it('should narrow to Err via isErr', () => {
    const result = Result.err('fail') as Result<number, string>
    if (result.isErr()) expect(result.unwrapErr()).toBe('fail')
  })

  it('should return true for isOkAnd when value satisfies predicate', () => {
    expect(Result.ok(10).isOkAnd((x) => x > 5)).toBe(true)
  })

  it('should return false for isOkAnd when value does not satisfy predicate', () => {
    expect(Result.ok(1).isOkAnd((x) => x > 5)).toBe(false)
  })

  it('should always return false for isOkAnd on Err', () => {
    expect(Result.err('fail').isOkAnd(() => true)).toBe(false)
  })

  it('should return true for isErrAnd when error satisfies predicate', () => {
    expect(Result.err('fail').isErrAnd((e) => e === 'fail')).toBe(true)
  })

  it('should always return false for isErrAnd on Ok', () => {
    expect(Result.ok(1).isErrAnd(() => true)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Composition chains
// ---------------------------------------------------------------------------

describe('Transformation chain composition', () => {
  it('should compose map → mapErr → match', () => {
    const result = (Result.err('not found') as Result<number, string>)
      .map((x) => x * 2)
      .mapErr((e) => new Error(e))
      .match({
        ok: (x) => `value: ${x}`,
        err: (e) => `error: ${e.message}`,
      })

    expect(result).toBe('error: not found')
  })

  it('should compose map → filter → unwrapOr', () => {
    const result = Result.ok(3)
      .map((x) => x * 10)
      .filter((x) => x > 50)
      .unwrapOr(-1)

    expect(result).toBe(-1)
  })

  it('should compose inspect → map without side effects leaking', () => {
    const log: number[] = []
    const result = Result.ok(5)
      .inspect((x) => log.push(x))
      .map((x) => x + 1)
      .unwrap()

    expect(log).toEqual([5])
    expect(result).toBe(6)
  })
})
