import type { ApiEntry } from '@/lib/content'
import { toContentKind } from '@/lib/content'
import type { MediaEntry } from '@/lib/media-content'

export type AdminEntryKind = 'text' | 'quote' | 'audio' | 'photo'

export type AdminEntry = {
  id: string
  kind: AdminEntryKind
  title: string
  body?: string
  description?: string
  mediaUrl?: string
  slug?: string
}

export function fromApiEntry(entry: ApiEntry): AdminEntry {
  return {
    id: entry.slug,
    slug: entry.slug,
    kind: toContentKind(entry.type),
    title: entry.title,
    body: entry.body,
  }
}

export function fromMediaEntry(entry: MediaEntry): AdminEntry {
  return {
    id: entry.id,
    kind: entry.kind,
    title: entry.title,
    description: entry.description,
    mediaUrl: entry.mediaUrl,
  }
}
