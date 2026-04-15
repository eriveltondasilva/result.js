export function unknownToError(error: unknown): Error {
  if (error instanceof Error) return error
  if (error == null) return new Error('Unknown error: null or undefined value')

  return new Error(String(error))
}

export function valueToDisplayString(value: unknown): string {
  if (value instanceof Error) return `[Error: ${value.message}]`
  if (value == null) return '[Unknown Error: null or undefined value]'

  const type = typeof value

  if (type === 'string') {
    const str = value as string
    return str.length > 100 ? `"${str.substring(0, 100)}..."` : `"${str}"`
  }

  if (type === 'number' || type === 'boolean') return String(value)
  if (type === 'function') return '[Function]'
  if (Array.isArray(value)) return `[Array(${value.length})]`

  const constructor = (value as object)?.constructor?.name
  return constructor ? `[${constructor}]` : '[Object]'
}
