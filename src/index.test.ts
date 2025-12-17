import { describe, expect, it } from 'vitest'
import { Result } from './index.js'

describe('index.ts', () => {
  const factoryMethods = [
    'all',
    'allSettled',
    'any',
    'err',
    'errors',
    'fromNullable',
    'fromPromise',
    'fromTry',
    'isResult',
    'ok',
    'partition',
    'validate',
    'values',
  ] satisfies (keyof typeof Result)[]

  it.each(factoryMethods)('should export factory method %s', (method) => {
    expect(typeof Result[method]).toBe('function')
  })
})
