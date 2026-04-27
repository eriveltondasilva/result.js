/** @internal */
export class ResultTypeError extends TypeError {
  constructor(message: string, cause?: unknown) {
    super(`${message}.\nMake sure element is created with Result.ok() or Result.err().`, { cause })

    this.name = 'ResultTypeError'

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/** @internal */
export function isEmptyArray(value: unknown): boolean {
  if (!Array.isArray(value)) {
    throw new TypeError(
      `Expected an array, but received ${typeof value}. Make sure you are passing an array to the collection function.`,
      { cause: value },
    )
  }

  return value.length === 0
}

/** @internal */
export function ensureError(error: unknown): Error {
  if (error instanceof Error) {
    return error
  }

  const message = error == null ? 'Unknown error: null or undefined value' : String(error)
  return new Error(message, { cause: error })
}

/** @internal */
export function formatForDisplay(value: unknown): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'

  if (value instanceof Error) {
    const base = `${value.name}: ${value.message}`
    return value.cause !== undefined ? `${base} (cause: ${formatForDisplay(value.cause)})` : base
  }

  if (typeof value === 'string') {
    const truncated = value.length > 100 ? `${value.slice(0, 100)}...` : value
    return `"${truncated}"`
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (typeof value === 'bigint') return `${value}n`

  if (typeof value === 'symbol') return value.toString()

  if (Array.isArray(value)) {
    return value.length <= 5
      ? `[${value.map(formatForDisplay).join(', ')}]`
      : `Array(${value.length})`
  }

  try {
    const json = JSON.stringify(value)
    return json.length > 100 ? `${json.slice(0, 100)}...` : json
  } catch {
    return value?.constructor?.name ?? 'Object'
  }
}
