/**
 * Asserts that the input is an array and not empty.
 *
 * @internal
 */
export function assertArray(array: unknown): boolean {
  return Array.isArray(array) && array.length > 0
}

/**
 * Converts an unknown value to an Error object.
 *
 * @internal
 */
export function unknownToError(error: unknown): Error {
  if (error instanceof Error) {
    return error
  }

  if (error === null || error === undefined) {
    return new Error('Unknown error: null or undefined value')
  }

  return new Error(String(error))
}

/**
 * Formats a value for display in error messages and string representations.
 *
 * @internal
 */
export function valueToDisplayString(value: unknown): string {
  if (value instanceof Error) return `[Error: ${value.message}]`
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'

  const type = typeof value

  if (type === 'string') {
    const str = value as string
    return str.length > 100 ? `"${str.substring(0, 100)}..."` : `"${str}"`
  }

  if (type === 'number' || type === 'boolean') return String(value)
  if (type === 'function') return '[Function]'
  if (Array.isArray(value)) return `[Array(${value.length})]`

  // biome-ignore lint/suspicious/noShadowRestrictedNames: teste
  const constructor = value?.constructor?.name
  return constructor ? `[${constructor}]` : '[Object]'
}
