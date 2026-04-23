export function unknownToError(error: unknown): Error {
  if (error instanceof Error) return error
  if (error == null) return new Error('Unknown error: null or undefined value')

  return new Error(String(error))
}

export function valueToDisplayString(value: unknown): string {
  if (value instanceof Error) return `[Error: ${value.message}]`

  if (value == null) return '[Unknown Error: null or undefined value]'

  if (typeof value === 'string') {
    return value.length > 100 ? `"${value.slice(0, 100)}..."` : `"${value}"`
  }

  if (typeof value === 'number' || typeof value === 'boolean') return String(value)

  if (Array.isArray(value)) return `[Array(${value.length})]`

  return `[${String(typeof value)}]`
}
