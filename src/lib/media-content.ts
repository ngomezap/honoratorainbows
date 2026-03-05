import type { AudioFeedEntry, PhotoFeedEntry } from '@/lib/feed-entry'

export type MediaKind = 'audio' | 'photo'

export type MediaEntry = {
  id: string
  kind: MediaKind
  title: string
  description?: string
  mediaUrl: string
  created_at: string
}

type MediaApiEntry = {
  id: string
  type: MediaKind
  title: string
  description?: string | null
  media_url: string
  created_at: string
}

export function mediaApiUrl() {
  return '/api/media'
}

function isMediaKind(value: unknown): value is MediaKind {
  return value === 'audio' || value === 'photo'
}

export function isMediaEntry(value: unknown): value is MediaEntry {
  if (!value || typeof value !== 'object') return false
  const entry = value as Partial<MediaEntry>
  return (
    typeof entry.id === 'string' &&
    isMediaKind(entry.kind) &&
    typeof entry.title === 'string' &&
    typeof entry.mediaUrl === 'string' &&
    typeof entry.created_at === 'string'
  )
}

function isMediaApiEntry(value: unknown): value is MediaApiEntry {
  if (!value || typeof value !== 'object') return false
  const entry = value as Partial<MediaApiEntry>
  return (
    typeof entry.id === 'string' &&
    isMediaKind(entry.type) &&
    typeof entry.title === 'string' &&
    typeof entry.media_url === 'string' &&
    typeof entry.created_at === 'string'
  )
}

function toMediaEntry(value: unknown): MediaEntry | null {
  if (isMediaEntry(value)) return value
  if (!isMediaApiEntry(value)) return null
  return {
    id: value.id,
    kind: value.type,
    title: value.title,
    description: value.description ?? undefined,
    mediaUrl: value.media_url,
    created_at: value.created_at,
  }
}

export function normalizeMediaEntries(payload: unknown): MediaEntry[] {
  if (Array.isArray(payload)) {
    return payload.map(toMediaEntry).filter((entry): entry is MediaEntry => entry !== null)
  }

  if (payload && typeof payload === 'object') {
    const items = (payload as { items?: unknown }).items
    if (Array.isArray(items)) {
      return items.map(toMediaEntry).filter((entry): entry is MediaEntry => entry !== null)
    }
  }

  return []
}

export function toMediaFeedEntry(entry: MediaEntry): AudioFeedEntry | PhotoFeedEntry {
  if (entry.kind === 'audio') {
    return {
      kind: 'audio',
      id: entry.id,
      title: entry.title,
      description: entry.description,
      audioUrl: entry.mediaUrl,
    }
  }

  return {
    kind: 'photo',
    id: entry.id,
    title: entry.title,
    description: entry.description,
    imageUrl: entry.mediaUrl,
  }
}
