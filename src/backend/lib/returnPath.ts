/**
 * Returns `value` when it is a same-origin path such as `/graphs/x?y=1`, otherwise undefined.
 * Rejects absolute URLs and the `//` and `/\` forms that browsers treat as another host.
 */
export function safeReturnPath(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.startsWith('/')) {
    return undefined
  }
  if (value.startsWith('//') || value.includes('\\')) {
    return undefined
  }
  return value
}
