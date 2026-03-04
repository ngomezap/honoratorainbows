import { getCloudflareContext } from '@opennextjs/cloudflare'

export type PoemType = 'poem' | 'quote'

export type PoemRecord = {
  id: number
  slug: string
  title: string
  body: string
  type: PoemType
  created_at: string
}

export type PoemPayload = Partial<Pick<PoemRecord, 'slug' | 'title' | 'body' | 'type'>>

type D1Result<T> = { results: T[] }
type D1Statement = {
  bind: (...values: unknown[]) => D1Statement
  first: <T>() => Promise<T | null>
  all: <T>() => Promise<D1Result<T>>
  run: () => Promise<unknown>
}
type D1Like = { prepare: (query: string) => D1Statement }

function json(data: unknown, init: ResponseInit = {}) {
  return Response.json(data, init)
}

export async function getDb() {
  const { env } = await getCloudflareContext({ async: true })
  const db = (env as Record<string, unknown>).DB as D1Like | undefined
  if (!db) {
    throw new Error('Missing Cloudflare D1 binding `DB`')
  }
  return db
}

export function parsePayload(payload: PoemPayload) {
  const slug = payload.slug?.trim()
  const title = payload.title?.trim()
  const body = payload.body?.trim()
  const type: PoemType = payload.type === 'quote' ? 'quote' : 'poem'
  return { slug, title, body, type }
}

export async function readJsonPayload(request: Request) {
  try {
    return (await request.json()) as PoemPayload
  } catch {
    return null
  }
}

export const apiResponse = { json }
