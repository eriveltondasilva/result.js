import { describe, expect, it, vi } from 'vitest';

import { Result } from '@/index';

// ---------------------------------------------------------------------------
// Result.fromPromise
// ---------------------------------------------------------------------------

describe('Result.fromPromise', () => {
  it('should return Ok when the promise resolves', async () => {
    const result = await Result.fromPromise(async () => 42);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe(42);
  });

  it('should return Err when the promise rejects', async () => {
    const result = await Result.fromPromise(async () => {
      throw new Error('network error');
    });
    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr()).toBeInstanceOf(Error);
    expect((result.unwrapErr() as Error).message).toBe('network error');
  });

  it('should apply onError transformer on rejection', async () => {
    const result = await Result.fromPromise(
      async () => {
        throw 'raw rejection';
      },
      () => ({ code: 500, message: 'internal error' }),
    );
    expect(result.unwrapErr()).toEqual({ code: 500, message: 'internal error' });
  });

  it('should wrap a non-Error rejection into an Error without transformer', async () => {
    const result = await Result.fromPromise(async () => {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw 'string rejection';
    });
    expect(result.unwrapErr()).toBeInstanceOf(Error);
  });
});

// ---------------------------------------------------------------------------
// mapAsync — the await behaviour is the unique concern vs sync map
// ---------------------------------------------------------------------------

describe('Result#mapAsync', () => {
  it('should transform Ok value asynchronously', async () => {
    const result = await Result.ok(5).mapAsync(async (x) => x * 2);
    expect(result.unwrap()).toBe(10);
  });

  it('should not call async mapper on Err', async () => {
    const mapper = vi.fn(async (x: number) => x * 2);
    const result = await Result.err('fail').mapAsync(mapper);
    expect(mapper).not.toHaveBeenCalled();
    expect(result.unwrapErr()).toBe('fail');
  });

  it('should allow chaining mapAsync calls', async () => {
    const result = await Result.ok(3)
      .mapAsync(async (x) => x + 1)
      .then((r) => r.mapAsync(async (x) => x * 10));

    expect(result.unwrap()).toBe(40);
  });
});

// ---------------------------------------------------------------------------
// mapErrAsync
// ---------------------------------------------------------------------------

describe('Result#mapErrAsync', () => {
  it('should transform Err error asynchronously', async () => {
    const result = await Result.err('raw').mapErrAsync(async (e) => new Error(e));
    expect(result.unwrapErr()).toBeInstanceOf(Error);
    expect((result.unwrapErr() as Error).message).toBe('raw');
  });

  it('should not call async mapper on Ok', async () => {
    const mapper = vi.fn(async () => new Error('never'));
    const result = await Result.ok(1).mapErrAsync(mapper);
    expect(mapper).not.toHaveBeenCalled();
    expect(result.unwrap()).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// mapOrAsync
// ---------------------------------------------------------------------------

describe('Result#mapOrAsync', () => {
  it('should apply async mapper on Ok', async () => {
    const value = await Result.ok(4).mapOrAsync(async (x) => x * 3, 0);
    expect(value).toBe(12);
  });

  it('should return default value without calling mapper on Err', async () => {
    const mapper = vi.fn(async (x: number) => x * 3);
    const value = await Result.err('fail').mapOrAsync(mapper, -99);
    expect(mapper).not.toHaveBeenCalled();
    expect(value).toBe(-99);
  });
});

// ---------------------------------------------------------------------------
// mapOrElseAsync
// ---------------------------------------------------------------------------

describe('Result#mapOrElseAsync', () => {
  it('should call ok mapper on Ok', async () => {
    const value = await Result.ok(5).mapOrElseAsync(
      async (x) => x + 10,
      async () => -1,
    );
    expect(value).toBe(15);
  });

  it('should call err mapper on Err', async () => {
    const value = await Result.err('oops').mapOrElseAsync(
      async (x: number) => x + 10,
      async (e) => e.length,
    );
    expect(value).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// andAsync / andThenAsync
// ---------------------------------------------------------------------------

describe('Result#andAsync', () => {
  it('should return the async result when this is Ok', async () => {
    const result = await Result.ok(1).andAsync(Promise.resolve(Result.ok('chained')));
    expect(result.unwrap()).toBe('chained');
  });

  it('should ignore the async result and return Err when this is Err', async () => {
    const next = Promise.resolve(Result.ok(42));
    const result = await Result.err('fail').andAsync(next);
    expect(result.unwrapErr()).toBe('fail');
  });
});

describe('Result#andThenAsync', () => {
  it('should chain async operation on Ok', async () => {
    const result = await Result.ok(10).andThenAsync(async (x) => Result.ok(x * 2));
    expect(result.unwrap()).toBe(20);
  });

  it('should not call mapper on Err', async () => {
    const mapper = vi.fn(async () => Result.ok(0));
    await Result.err('fail').andThenAsync(mapper);
    expect(mapper).not.toHaveBeenCalled();
  });

  it('should allow mapper to return Err', async () => {
    const result = await Result.ok(0).andThenAsync(async (x) =>
      x === 0 ? Result.err('zero not allowed') : Result.ok(x),
    );
    expect(result.unwrapErr()).toBe('zero not allowed');
  });
});

// ---------------------------------------------------------------------------
// orAsync / orElseAsync
// ---------------------------------------------------------------------------

describe('Result#orAsync', () => {
  it('should return this Ok without awaiting the alternative', async () => {
    const alternative = Promise.resolve(Result.ok(99));
    const result = await Result.ok(1).orAsync(alternative);
    expect(result.unwrap()).toBe(1);
  });

  it('should return the awaited alternative when this is Err', async () => {
    const result = await Result.err('fail').orAsync(Promise.resolve(Result.ok(42)));
    expect(result.unwrap()).toBe(42);
  });
});

describe('Result#orElseAsync', () => {
  it('should not call async recovery on Ok', async () => {
    const recovery = vi.fn(async () => Result.ok(0));
    const result = await Result.ok(5).orElseAsync(recovery);
    expect(recovery).not.toHaveBeenCalled();
    expect(result.unwrap()).toBe(5);
  });

  it('should call async recovery with error on Err', async () => {
    const result = await Result.err('not found').orElseAsync(async (e) =>
      Result.ok(`recovered from: ${e}`),
    );
    expect(result.unwrap()).toBe('recovered from: not found');
  });

  it('should allow recovery to return Err', async () => {
    const result = await Result.err('original').orElseAsync(async () => Result.err('secondary'));
    expect(result.unwrapErr()).toBe('secondary');
  });
});

// ---------------------------------------------------------------------------
// Async composition chains
// ---------------------------------------------------------------------------

describe('Async chain composition', () => {
  it('should compose fromPromise → andThenAsync → unwrapOr', async () => {
    const result = await Result.fromPromise(async () => 5).then((r) =>
      r.andThenAsync(async (x) => Result.ok(x * 10)),
    );

    expect(result.unwrapOr(-1)).toBe(50);
  });

  it('should recover from fromPromise rejection via orElseAsync', async () => {
    const result = await Result.fromPromise(async () => {
      throw new Error('crash');
    }).then((r) => r.orElseAsync(async () => Result.ok('recovered')));

    expect(result.unwrap()).toBe('recovered');
  });

  it('should propagate Err through multiple async alternations', async () => {
    const result = await Result.err('start' as string)
      .andThenAsync(async (x: string) => Result.ok(`${x}+step`))
      .then((r) => r.mapAsync(async (x) => x.toUpperCase()));

    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr()).toBe('start');
  });
});
