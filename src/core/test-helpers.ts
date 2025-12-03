import { expect } from 'vitest'

import type { ResultType } from './types.js'

export function expectOk<T, E>(result: ResultType<T, E>): T {
  expect(result.isOk()).toBe(true)
  return result.unwrap()
}

export function expectErr<T, E>(result: ResultType<T, E>): E {
  expect(result.isErr()).toBe(true)
  return result.unwrapErr()
}
