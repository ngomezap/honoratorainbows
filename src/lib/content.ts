import { contentEntries, type ContentEntry, type ContentKind } from '@/data/content'

export type { ContentEntry, ContentKind }
export { contentEntries as fallbackContentEntries }

type ApiEntryType = 'poem' | 'quote'

export type ApiEntry = {
  slug: string
  title: string
  body: string
  type?: ApiEntryType
  created_at: string
}

export function apiBaseUrl() {
  return ''
}

export function entriesApiUrl() {
  return '/api/poems'
}

export function isApiEntry(value: unknown): value is ApiEntry {
  if (!value || typeof value !== 'object') return false
  const entry = value as Partial<ApiEntry>
  return (
    typeof entry.slug === 'string' &&
    typeof entry.title === 'string' &&
    typeof entry.body === 'string' &&
    typeof entry.created_at === 'string'
  )
}

export function toContentEntry(apiEntry: ApiEntry): ContentEntry {
  const lines = apiEntry.body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  return {
    kind: (apiEntry.type ?? 'poem') === 'poem' ? 'text' : 'quote',
    title: apiEntry.title,
    lines: lines.length > 0 ? lines : [apiEntry.body],
  }
}

export function normalizeApiEntries(payload: unknown): ApiEntry[] {
  if (Array.isArray(payload)) {
    return payload.filter(isApiEntry)
  }

  if (payload && typeof payload === 'object') {
    const data = (payload as { poems?: unknown }).poems
    if (Array.isArray(data)) {
      return data.filter(isApiEntry)
    }
  }

  return []
}

export function normalizeContentEntries(payload: unknown): ContentEntry[] {
  return normalizeApiEntries(payload).map(toContentEntry)
}

export function toApiEntryType(kind: ContentKind): ApiEntryType {
  return kind === 'text' ? 'poem' : 'quote'
}

export function toContentKind(type?: ApiEntryType): ContentKind {
  return (type ?? 'poem') === 'poem' ? 'text' : 'quote'
}

export function isApiQuote(type?: ApiEntryType): boolean {
  return type === 'quote'
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
