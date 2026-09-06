const REDACTED_VALUE = '[REDACTED]'
const CIRCULAR_VALUE = '[Circular]'
const MAX_DEPTH = 8
const MAX_OBJECT_KEYS = 100
const MAX_ARRAY_ITEMS = 50
const MAX_STRING_LENGTH = 1000

const SENSITIVE_KEY_PATTERNS = [
  'authorization',
  'cookie',
  'password',
  'secret',
  'token',
  'apikey',
  'api_key',
  'key_secret',
  'keysecret',
  'webhook_secret',
  'webhooksecret',
  'signature',
  'credential',
]

function isSensitiveKey(key: string): boolean {
  const normalized = key.toLowerCase().replace(/[\s.-]/g, '_')
  return SENSITIVE_KEY_PATTERNS.some((pattern) => normalized.includes(pattern))
}

function sanitizeValue(
  value: unknown,
  depth: number,
  seen: WeakSet<object>
): unknown {
  if (typeof value === 'undefined') return undefined
  if (value === null) return null

  if (
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value
  }

  if (typeof value === 'string') {
    return value.slice(0, MAX_STRING_LENGTH)
  }

  if (typeof value === 'bigint' || typeof value === 'symbol') {
    return String(value).slice(0, MAX_STRING_LENGTH)
  }

  if (typeof value === 'function') {
    return `[Function ${value.name || 'anonymous'}]`
  }

  if (value instanceof Date) {
    return value
  }

  if (value instanceof Error) {
    const errorPayload: Record<string, unknown> = {
      name: value.name,
      message: value.message.slice(0, MAX_STRING_LENGTH),
    }

    if (value.stack) {
      errorPayload.stack = value.stack.slice(0, MAX_STRING_LENGTH)
    }

    return errorPayload
  }

  if (depth >= MAX_DEPTH) {
    return '[MaxDepth]'
  }

  if (Array.isArray(value)) {
    if (seen.has(value)) return CIRCULAR_VALUE
    seen.add(value)

    return value
      .slice(0, MAX_ARRAY_ITEMS)
      .map((item) => sanitizeValue(item, depth + 1, seen))
      .filter((item) => typeof item !== 'undefined')
  }

  if (typeof value === 'object') {
    if (seen.has(value)) return CIRCULAR_VALUE
    seen.add(value)

    const output: Record<string, unknown> = {}
    const entries = Object.entries(value as Record<string, unknown>).slice(
      0,
      MAX_OBJECT_KEYS
    )

    for (const [key, item] of entries) {
      if (isSensitiveKey(key)) {
        output[key] = REDACTED_VALUE
        continue
      }

      const sanitized = sanitizeValue(item, depth + 1, seen)
      if (typeof sanitized !== 'undefined') {
        output[key] = sanitized
      }
    }

    return output
  }

  return String(value).slice(0, MAX_STRING_LENGTH)
}

export function sanitizeLogPayload<T = unknown>(payload: T): T {
  return sanitizeValue(payload, 0, new WeakSet<object>()) as T
}
