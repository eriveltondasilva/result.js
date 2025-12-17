import { describe, it, expect } from 'vitest'
import { assertArray, unknownToError, valueToDisplayString } from './utils' // Assumindo que './utils' é o caminho correto

describe('utils.ts', () => {
  describe('assertArray', () => {
    it('should return true for a non-empty array', () => {
      expect(assertArray([1, 2, 3])).toBe(true)
    })

    it('should return false for an empty array', () => {
      expect(assertArray([])).toBe(false)
    })

    // Agrupando todos os casos de falha (não-array ou null/undefined)
    it.each([
      ['string', 'hello'],
      ['object', { a: 1 }],
      ['null', null],
      ['undefined', undefined],
      ['number', 123],
      ['boolean', true],
    ])('should return false for non-array type: %s', (_, value) => {
      expect(assertArray(value)).toBe(false)
    })
  })

  describe('unknownToError', () => {
    it('should return the original error if input is an Error object', () => {
      const originalError = new Error('Test Message')
      expect(unknownToError(originalError)).toBe(originalError)
    })

    // Agrupando null e undefined, que resultam na mesma mensagem padrão
    it.each([
      ['null', null],
      ['undefined', undefined],
    ])('should create a new Error for %s input with default message', (_, value) => {
      const error = unknownToError(value)
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('Unknown error: null or undefined value')
    })

    // Agrupando outros tipos que são convertidos para string
    it.each([
      ['string', 'A generic failure', 'A generic failure'],
      ['number', 404, '404'],
      ['plain object', { code: 500, detail: 'Server fail' }, '[object Object]'],
    ])('should create a new Error, converting %s input to message', (_, input, expectedMessage) => {
      const error = unknownToError(input)
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe(expectedMessage)
    })
  })

  describe('valueToDisplayString', () => {
    // Testes para casos de saída imediata ou tipos primitivos
    it.each([
      [new Error('Auth failed'), '[Error: Auth failed]'],
      [null, 'null'],
      [undefined, 'undefined'],
      [12345, '12345'],
      [true, 'true'],
      [() => {}, '[Function]'],
      [[], '[Array(0)]'],
      [[1, 2, 3], '[Array(3)]'],
    ])('should format value %s correctly', (value, expected) => {
      expect(valueToDisplayString(value)).toBe(expected)
    })

    describe('String Formatting', () => {
      it('should wrap short strings in quotes', () => {
        expect(valueToDisplayString('short string')).toBe('"short string"')
      })

      it('should truncate and add ellipsis for long strings (> 100 chars)', () => {
        const longString = 'a'.repeat(150)
        const expected = `"${'a'.repeat(100)}..."`
        expect(valueToDisplayString(longString)).toBe(expected)
      })
    })

    describe('Object Formatting', () => {
      it('should format plain objects as [Object]', () => {
        expect(valueToDisplayString({})).toBe('[Object]')
      })

      it('should format objects using their constructor name (e.g., [Map])', () => {
        expect(valueToDisplayString(new Map())).toBe('[Map]')
      })

      it('should format built-in types using their constructor name (e.g., [Date])', () => {
        expect(valueToDisplayString(new Date('2025-01-01'))).toBe('[Date]')
      })

      it('should handle objects with a null constructor (Object.create(null))', () => {
        const objWithNullConstructor = Object.create(null)
        expect(valueToDisplayString(objWithNullConstructor)).toBe('[Object]')
      })
    })
  })
})
