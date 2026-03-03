import { poems as fallbackPoems, type Poem, type PoemType } from '@/data/poems'

export type { Poem, PoemType }
export { fallbackPoems }

export type ApiPoem = {
  slug: string
  title: string
  body: string
  type?: PoemType
  created_at: string
}

export function apiBaseUrl() {
  const base = process.env.POEMS_API_BASE ?? process.env.NEXT_PUBLIC_POEMS_API_BASE ?? ''
  return base.endsWith('/') ? base.slice(0, -1) : base
}

export function poemsApiUrl() {
  return `${apiBaseUrl()}/api/poems`
}

export function isApiPoem(value: unknown): value is ApiPoem {
  if (!value || typeof value !== 'object') return false
  const poem = value as Partial<ApiPoem>
  return (
    typeof poem.slug === 'string' &&
    typeof poem.title === 'string' &&
    typeof poem.body === 'string' &&
    typeof poem.created_at === 'string'
  )
}

export function toPoem(apiPoem: ApiPoem): Poem {
  const lines = apiPoem.body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  return {
    type: apiPoem.type ?? 'poem',
    title: apiPoem.title,
    lines: lines.length > 0 ? lines : [apiPoem.body],
  }
}

export function normalizeApiPoems(payload: unknown): ApiPoem[] {
  if (Array.isArray(payload)) {
    return payload.filter(isApiPoem)
  }

  if (payload && typeof payload === 'object') {
    const data = (payload as { poems?: unknown }).poems
    if (Array.isArray(data)) {
      return data.filter(isApiPoem)
    }
  }

  return []
}

export function normalizePoems(payload: unknown): Poem[] {
  return normalizeApiPoems(payload).map(toPoem)
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
