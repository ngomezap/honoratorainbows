import { entriesApiUrl, normalizeApiEntries, type ApiEntry } from '@/lib/content'
import { mediaApiUrl, normalizeMediaEntries, type MediaEntry } from '@/lib/media-content'

type LoadEntriesOptions = {
  signal?: AbortSignal
  revalidate?: number
  baseUrl?: string
}

export async function loadApiEntries(options: LoadEntriesOptions = {}): Promise<ApiEntry[]> {
  const { signal, revalidate, baseUrl } = options
  const requestInit: RequestInit = {}

  if (signal) requestInit.signal = signal
  if (typeof revalidate === 'number') {
    ;(requestInit as RequestInit & { next?: { revalidate: number } }).next = { revalidate }
  }

  const url = baseUrl ? new URL(entriesApiUrl(), baseUrl).toString() : entriesApiUrl()
  const response = await fetch(url, requestInit)
  if (!response.ok) {
    throw new Error(`La API devolvio ${response.status}`)
  }

  const payload = (await response.json()) as unknown
  return normalizeApiEntries(payload)
}

export async function loadMediaEntries(options: LoadEntriesOptions = {}): Promise<MediaEntry[]> {
  const { signal, revalidate, baseUrl } = options
  const requestInit: RequestInit = {}

  if (signal) requestInit.signal = signal
  if (typeof revalidate === 'number') {
    ;(requestInit as RequestInit & { next?: { revalidate: number } }).next = { revalidate }
  }

  const url = baseUrl ? new URL(mediaApiUrl(), baseUrl).toString() : mediaApiUrl()
  const response = await fetch(url, requestInit)
  if (!response.ok) {
    throw new Error(`La API devolvio ${response.status}`)
  }

  const payload = (await response.json()) as unknown
  return normalizeMediaEntries(payload)
}
