import { describe, expect, it } from 'vitest'

import { Result } from '@/index'

// ---------------------------------------------------------------------------
// Result.all
// ---------------------------------------------------------------------------

describe('Result.all', () => {
  it('should return Ok with a tuple of all values when all are Ok', () => {
    const result = Result.all([Result.ok(1), Result.ok(2), Result.ok(3)])
    expect(result.unwrap()).toEqual([1, 2, 3])
  })

  it('should return the first Err and short-circuit', () => {
    const result = Result.all([Result.ok(1), Result.err('second fails'), Result.ok(3)])
    expect(result.isErr()).toBe(true)
    expect(result.unwrapErr()).toBe('second fails')
  })

  it('should return Ok with an empty array for empty input', () => {
    const result = Result.all([])
    expect(result.unwrap()).toEqual([])
  })

  it('should handle heterogeneous value types', () => {
    const result = Result.all([Result.ok(1), Result.ok('hello'), Result.ok(true)])
    expect(result.unwrap()).toEqual([1, 'hello', true])
  })

  it('should throw ResultTypeError when a non-Result is provided', () => {
    // @ts-expect-error — intentionally passing invalid value
    expect(() => Result.all([Result.ok(1), 42])).toThrow()
  })
})

// ---------------------------------------------------------------------------
// Result.allSettled
// ---------------------------------------------------------------------------

describe('Result.allSettled', () => {
  it('should return Ok with settled status for every result', () => {
    const result = Result.allSettled([Result.ok(1), Result.err('fail'), Result.ok(3)])
    const settled = result.unwrap()

    expect(settled[0]).toEqual({ status: 'ok', value: 1 })
    expect(settled[1]).toEqual({ status: 'err', reason: 'fail' })
    expect(settled[2]).toEqual({ status: 'ok', value: 3 })
  })

  it('should always return Ok even when all results are Err', () => {
    const result = Result.allSettled([Result.err('a'), Result.err('b')])
    expect(result.isOk()).toBe(true)
    expect(result.unwrap()).toEqual([
      { status: 'err', reason: 'a' },
      { status: 'err', reason: 'b' },
    ])
  })

  it('should return Ok with empty array for empty input', () => {
    const result = Result.allSettled([])
    expect(result.unwrap()).toEqual([])
  })

  it('should preserve order of results', () => {
    const results = [Result.ok('z'), Result.ok('a'), Result.err('x')]
    const settled = Result.allSettled(results).unwrap()
    expect(settled.map((s) => ('value' in s ? s.value : s.reason))).toEqual(['z', 'a', 'x'])
  })
})

// ---------------------------------------------------------------------------
// Result.any
// ---------------------------------------------------------------------------

describe('Result.any', () => {
  it('should return the first Ok', () => {
    const result = Result.any([Result.err('a'), Result.ok(42), Result.ok(99)])
    expect(result.unwrap()).toBe(42)
  })

  it('should return Err with all errors when all are Err', () => {
    const result = Result.any([Result.err('a'), Result.err('b'), Result.err('c')])
    expect(result.isErr()).toBe(true)
    expect(result.unwrapErr()).toEqual(['a', 'b', 'c'])
  })

  it('should return Err with empty array for empty input', () => {
    const result = Result.any([])
    expect(result.isErr()).toBe(true)
    expect(result.unwrapErr()).toEqual([])
  })

  it('should short-circuit on first Ok without collecting further errors', () => {
    const result = Result.any([Result.ok(1), Result.err('never collected')])
    expect(result.unwrap()).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// Result.partition
// ---------------------------------------------------------------------------

describe('Result.partition', () => {
  it('should split Ok values and Err errors into separate arrays', () => {
    const [oks, errs] = Result.partition([
      Result.ok(1),
      Result.err('a'),
      Result.ok(2),
      Result.err('b'),
    ])
    expect(oks).toEqual([1, 2])
    expect(errs).toEqual(['a', 'b'])
  })

  it('should return all values in oks when all are Ok', () => {
    const [oks, errs] = Result.partition([Result.ok(1), Result.ok(2)])
    expect(oks).toEqual([1, 2])
    expect(errs).toEqual([])
  })

  it('should return all errors in errs when all are Err', () => {
    const [oks, errs] = Result.partition([Result.err('x'), Result.err('y')])
    expect(oks).toEqual([])
    expect(errs).toEqual(['x', 'y'])
  })

  it('should return two empty arrays for empty input', () => {
    const [oks, errs] = Result.partition([])
    expect(oks).toEqual([])
    expect(errs).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// Result.values
// ---------------------------------------------------------------------------

describe('Result.values', () => {
  it('should return only the Ok values, discarding errors', () => {
    const values = Result.values([Result.ok(1), Result.err('fail'), Result.ok(2)])
    expect(values).toEqual([1, 2])
  })

  it('should return an empty array when all are Err', () => {
    const values = Result.values([Result.err('a'), Result.err('b')])
    expect(values).toEqual([])
  })

  it('should return an empty array for empty input', () => {
    expect(Result.values([])).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// Result.errors
// ---------------------------------------------------------------------------

describe('Result.errors', () => {
  it('should return only the Err values, discarding successes', () => {
    const errs = Result.errors([Result.ok(1), Result.err('a'), Result.ok(2), Result.err('b')])
    expect(errs).toEqual(['a', 'b'])
  })

  it('should return an empty array when all are Ok', () => {
    const errs = Result.errors([Result.ok(1), Result.ok(2)])
    expect(errs).toEqual([])
  })

  it('should return an empty array for empty input', () => {
    expect(Result.errors([])).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// Collection edge cases & compositions
// ---------------------------------------------------------------------------

describe('Collection edge cases', () => {
  it('Result.all should fail on the first Err in a large array', () => {
    const results = [
      Result.ok(1),
      Result.ok(2),
      Result.err('fail at 3'),
      Result.ok(4),
      Result.ok(5),
    ]
    const result = Result.all(results)
    expect(result.unwrapErr()).toBe('fail at 3')
  })

  it('Result.partition result can be piped into Result.all for oks', () => {
    const [oks] = Result.partition([Result.ok(1), Result.err('x'), Result.ok(2)])
    expect(oks).toEqual([1, 2])

    const wrapped = Result.all(oks.map(Result.ok))
    expect(wrapped.unwrap()).toEqual([1, 2])
  })

  it('Result.allSettled followed by filter can separate oks and errs', () => {
    const settled = Result.allSettled([Result.ok(10), Result.err('fail'), Result.ok(20)]).unwrap()
    const oks = settled.filter((r) => r.status === 'ok')
    const errs = settled.filter((r) => r.status === 'err')
    expect(oks.length).toBe(2)
    expect(errs.length).toBe(1)
  })
})
