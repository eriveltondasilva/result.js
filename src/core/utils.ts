import { Err } from './err.js'
import { Ok } from './ok.js'

function getTypeInfo(value: unknown): string {
  return value == null ? 'null or undefined' : typeof value
}

export function isResult(value: unknown): boolean {
  return value instanceof Ok || value instanceof Err
}

export function unknownToError(error: unknown): Error {
  if (error instanceof Error) return error
  return new Error(String(error ?? 'Unknown error captured'))
}

//
export function assertFunction(fn: unknown, callerName: string, argName: string): void {
  if (typeof fn === 'function') return
  const error = `${callerName} expected argument \`${argName}\` to be a function, but received \`${getTypeInfo(fn)}\``
  throw new TypeError(`${callerName} expected a function, but received \`${getTypeInfo(fn)}\``)
}

export function assertMatchHandlers(handlers: unknown, callerName: string): void {
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
  if (isResult(result)) return
  throw new TypeError(`${callerName} expected a Result, but received \`${getTypeInfo(result)}\``)
}

export function assertResults(results: unknown, callerName: string): void {
  if (!Array.isArray(results)) {
    throw new TypeError(`${callerName} expected an array, but received \`${getTypeInfo(results)}\``)
  }

  if (results.length === 0) {
    return
  }

  results.forEach((result, i) => {
    if (isResult(result)) return

    throw new TypeError(
      `${callerName} expected an array of Results, but received item of type \`${getTypeInfo(result)}\` at index ${i}`
    )
  })
}
