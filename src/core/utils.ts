import { Err } from './err.js'
import { Ok } from './ok.js'

// @ts-expect-error: process is not typed
const shouldValidate = typeof process === 'undefined' || process.env.NODE_ENV !== 'production'

function getTypeInfo(value: unknown): string {
  return value == null ? 'null or undefined' : typeof value
}

export function isResult(value: unknown): boolean {
  return value instanceof Ok || value instanceof Err
}

export function unknownToError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error || 'Unknown error'))
}

export function assertFunction(fn: unknown, callerName: string, argName: string): void {
  if (!shouldValidate) return

  if (typeof fn === 'function') return

  throw new TypeError(
    `${callerName}: ${argName} must be a function, but received \`${getTypeInfo(fn)}\``
  )
}

export function assertPromise(promise: unknown, callerName: string, argName: string): void {
  if (!shouldValidate) return

  if (promise instanceof Promise) return

  throw new TypeError(
    `${callerName}: ${argName} must be a Promise, but received \`${getTypeInfo(promise)}\``
  )
}

export function assertMatchHandlers(handlers: unknown, callerName: string): void {
  if (!shouldValidate) return

  if (typeof handlers !== 'object' || handlers == null) {
    throw new TypeError(
      `${callerName} expected a handlers object, but received \`${getTypeInfo(handlers)}\``
    )
  }

  const castedHandlers = handlers as { ok: unknown; err: unknown }

  if (typeof castedHandlers.ok !== 'function') {
    throw new TypeError(
      `${callerName} expected "ok" property to be a function, but received \`${getTypeInfo(castedHandlers.ok)}\``
    )
  }

  if (typeof castedHandlers.err !== 'function') {
    throw new TypeError(
      `${callerName} expected "err" property to be a function, but received \`${getTypeInfo(castedHandlers.err)}\``
    )
  }
}

export function assertResult(result: unknown, callerName: string): void {
  if (!shouldValidate) return

  if (isResult(result)) return

  throw new TypeError(`${callerName} expected a Result, but received \`${getTypeInfo(result)}\``)
}

export function assertResults(results: unknown, callerName: string): void {
  if (!shouldValidate) return

  if (!Array.isArray(results)) {
    throw new TypeError(`${callerName} expected an array, but received \`${getTypeInfo(results)}\``)
  }

  if (results.length === 0) return

  results.forEach((result, i) => {
    if (isResult(result)) return

    throw new TypeError(
      `${callerName} expected an array of Results, but received item of type \`${getTypeInfo(result)}\` at index ${i}`
    )
  })
}
