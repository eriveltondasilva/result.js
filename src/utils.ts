export function isEmptyArray(value: unknown): value is readonly [] | null | undefined {
  return !Array.isArray(value) || value.length === 0
}

export function ensureError(error: unknown): Error {
  if (error instanceof Error) {
    return error
  }

  return new Error(error == null ? 'Unknown error: null or undefined value' : String(error))
}

export function formatForDisplay(value: unknown): string {
  if (value instanceof Error) {
    return `[Error: ${value.message}]`
  }

  if (value == null) {
    return '[Unknown Error: null or undefined value]'
  }

  if (typeof value === 'string') {
    return value.length > 100 ? `"${value.slice(0, 100)}..."` : `"${value}"`
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (Array.isArray(value)) {
    return `[Array(${value.length})]`
  }

  return `[${String(typeof value)}]`
}
