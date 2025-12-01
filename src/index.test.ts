import { describe, expect, it } from 'vitest'

import Result from './index.js'

describe('Module Exports', () => {
  it('should export all factory methods', () => {
    const methods = [
      'ok',
      'err',
      'fromTry',
      'fromPromise',
      'fromNullable',
      'validate',
      'isResult',
      'all',
      'any',
      'partition',
      'allSettled',
    ]

    methods.forEach((method) => {
      expect(Result[method as keyof typeof Result]).toBeTypeOf('function')
    })
  })
})
