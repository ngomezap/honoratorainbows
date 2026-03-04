import {
  entriesApiUrl,
  fallbackContentEntries,
  normalizeApiEntries,
  normalizeContentEntries,
  slugify,
  type ApiEntry,
  type ContentKind,
} from '@/lib/content'

export type PoemType = ContentKind
export type Poem = {
  type: PoemType
  title?: string
  lines: string[]
}

export type ApiPoem = ApiEntry

export const fallbackPoems: Poem[] = fallbackContentEntries.map((entry) => ({
  type: entry.kind,
  title: entry.title,
  lines: entry.lines,
}))

export function apiBaseUrl() {
  return ''
}

export function poemsApiUrl() {
  return entriesApiUrl()
}

export function isApiPoem(value: unknown): value is ApiPoem {
  return normalizeApiEntries([value]).length > 0
}

export function toPoem(apiPoem: ApiPoem): Poem {
  const mapped = normalizeContentEntries([apiPoem])[0]
  if (!mapped) {
    return { type: 'poem', title: apiPoem.title, lines: [apiPoem.body] }
  }

  return {
    type: mapped.kind,
    title: mapped.title,
    lines: mapped.lines,
  }
}

export function normalizeApiPoems(payload: unknown): ApiPoem[] {
  return normalizeApiEntries(payload)
}

export function normalizePoems(payload: unknown): Poem[] {
  return normalizeContentEntries(payload).map((entry) => ({
    type: entry.kind,
    title: entry.title,
    lines: entry.lines,
  }))
}

export { slugify }
