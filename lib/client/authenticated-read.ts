type CachedRead = {
  expiresAt: number
  value: unknown
}

const inflightReads = new Map<string, Promise<unknown>>()
const cachedReads = new Map<string, CachedRead>()

const DEFAULT_DEDUPE_TTL_MS = 1500

export type AuthenticatedReadOptions = {
  ttlMs?: number
  force?: boolean
}

function readCached<T>(key: string): T | undefined {
  const cached = cachedReads.get(key)
  if (!cached) return undefined

  if (cached.expiresAt <= Date.now()) {
    cachedReads.delete(key)
    return undefined
  }

  return cached.value as T
}

export async function authenticatedJsonRead<T>(
  url: string,
  options: AuthenticatedReadOptions = {}
): Promise<T> {
  const ttlMs = Math.max(0, options.ttlMs ?? DEFAULT_DEDUPE_TTL_MS)
  const key = `GET:${url}`

  if (!options.force && ttlMs > 0) {
    const cached = readCached<T>(key)
    if (cached !== undefined) return cached
  }

  if (!options.force) {
    const inflight = inflightReads.get(key)
    if (inflight) return inflight as Promise<T>
  }

  const request = (async () => {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const error = new Error(
        data?.message || data?.error || `Failed to load ${url}`
      ) as Error & {
        code?: string
        status?: number
      }

      error.code = data?.code || data?.error || undefined
      error.status = response.status
      throw error
    }

    if (ttlMs > 0) {
      cachedReads.set(key, {
        expiresAt: Date.now() + ttlMs,
        value: data,
      })
    }

    return data as T
  })()

  if (!options.force) {
    inflightReads.set(key, request)
  }

  try {
    return await request
  } finally {
    if (!options.force && inflightReads.get(key) === request) {
      inflightReads.delete(key)
    }
  }
}

export function invalidateAuthenticatedRead(url?: string) {
  if (!url) {
    cachedReads.clear()
    return
  }

  cachedReads.delete(`GET:${url}`)
}
