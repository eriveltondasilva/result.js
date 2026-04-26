import { describe, expect, it, vi } from 'vitest'

import { Result } from '../src/index'

// ---------------------------------------------------------------------------
// and
// ---------------------------------------------------------------------------

describe('Result#and', () => {
  it('should return the second result when first is Ok', () => {
    const result = Result.ok(1).and(Result.ok('hello'))
    expect(result.unwrap()).toBe('hello')
  })

  it('should return the first Err without evaluating the second', () => {
    const second = Result.ok(99)
    const result = Result.err('first error').and(second)
    expect(result.unwrapErr()).toBe('first error')
  })

  it('should return the second result even if it is Err', () => {
    const result = Result.ok(1).and(Result.err('second error'))
    expect(result.unwrapErr()).toBe('second error')
  })
})

// ---------------------------------------------------------------------------
// andThen
// ---------------------------------------------------------------------------

describe('Result#andThen', () => {
  it('should chain Ok into a new Result', () => {
    const result = Result.ok(10).andThen((x) => Result.ok(x * 2))
    expect(result.unwrap()).toBe(20)
  })

  it('should propagate Err without calling the mapper', () => {
    const mapper = vi.fn()
    Result.err('fail').andThen(mapper)
    expect(mapper).not.toHaveBeenCalled()
  })

  it('should allow returning Err from the flat mapper', () => {
    const result = Result.ok(0).andThen((x) =>
      x === 0 ? Result.err('division by zero') : Result.ok(10 / x),
    )
    expect(result.isErr()).toBe(true)
    expect(result.unwrapErr()).toBe('division by zero')
  })

  it('should compose multiple andThen calls', () => {
    const result = Result.ok(1)
      .andThen((x) => Result.ok(x + 1))
      .andThen((x) => Result.ok(x * 10))
    expect(result.unwrap()).toBe(20)
  })
})

// ---------------------------------------------------------------------------
// or
// ---------------------------------------------------------------------------

describe('Result#or', () => {
  it('should return the original Ok without touching the alternative', () => {
    const result = Result.ok(42).or(Result.ok(99))
    expect(result.unwrap()).toBe(42)
  })

  it('should return the alternative when first is Err', () => {
    const result = Result.err('fail').or(Result.ok(0))
    expect(result.unwrap()).toBe(0)
  })

  it('should return the alternative Err when both are Err', () => {
    const result = Result.err('first').or(Result.err('second'))
    expect(result.unwrapErr()).toBe('second')
  })
})

// ---------------------------------------------------------------------------
// orElse
// ---------------------------------------------------------------------------

describe('Result#orElse', () => {
  it('should not call recovery function for Ok', () => {
    const recovery = vi.fn()
    Result.ok(5).orElse(recovery)
    expect(recovery).not.toHaveBeenCalled()
  })

  it('should call recovery function with the error and return its result', () => {
    const result = Result.err('not found').orElse((e) => Result.ok(`fallback for: ${e}`))
    expect(result.unwrap()).toBe('fallback for: not found')
  })

  it('should allow recovery to also return Err', () => {
    const result = Result.err('original').orElse(() => Result.err('recovered error'))
    expect(result.unwrapErr()).toBe('recovered error')
  })
})

// ---------------------------------------------------------------------------
// zip / zipWith
// ---------------------------------------------------------------------------

describe('Result#zip', () => {
  it('should combine two Ok results into a tuple', () => {
    const result = Result.ok(1).zip(Result.ok('hello'))
    expect(result.unwrap()).toEqual([1, 'hello'])
  })

  it('should return Err when the first is Err', () => {
    const result = Result.err('first').zip(Result.ok('hello'))
    expect(result.isErr()).toBe(true)
  })

  it('should return Err when the second is Err', () => {
    const result = Result.ok(1).zip(Result.err('second'))
    expect(result.unwrapErr()).toBe('second')
  })
})

describe('Result#zipWith', () => {
  it('should apply mapper to values from two Ok results', () => {
    const result = Result.ok(10).zipWith(Result.ok(5), (a, b) => a + b)
    expect(result.unwrap()).toBe(15)
  })

  it('should return Err when the second result is Err', () => {
    const result = Result.ok(10).zipWith(Result.err('oops'), (a, b: number) => a + b)
    expect(result.unwrapErr()).toBe('oops')
  })
})

// ---------------------------------------------------------------------------
// Alternation chain composition
// ---------------------------------------------------------------------------

describe('Alternation chain composition', () => {
  it('should compose andThen → or → unwrap', () => {
    const result = Result.ok(0)
      .andThen((x) => (x > 0 ? Result.ok(x) : Result.err('zero')))
      .or(Result.ok(42))
      .unwrap()

    expect(result).toBe(42)
  })

  it('should compose orElse → andThen → match', () => {
    const result = (Result.err('not found') as Result<number, string>)
      .orElse(() => Result.ok(0))
      .andThen((x) => Result.ok(x + 100))
      .match({
        ok: (x) => x,
        err: () => -1,
      })

    expect(result).toBe(100)
  })

  it('should short-circuit on first Err in a chain of andThen', () => {
    const log: string[] = []
    const result = Result.ok(1)
      .andThen((x) => {
        log.push('first')
        return Result.err(`stopped at ${x}`)
      })
      .andThen((x: number) => {
        log.push('second')
        return Result.ok(x * 2)
      })

    expect(log).toEqual(['first'])
    expect(result.unwrapErr()).toBe('stopped at 1')
  })
})
