import { apiResponse, getDb, parsePayload, readJsonPayload, type PoemRecord } from '@/lib/poems-api'

export const runtime = 'edge'

type Params = { params: Promise<{ slug: string }> }

export async function GET(_: Request, { params }: Params) {
  const { slug } = await params
  const db = await getDb()
  const poem = await db.prepare('SELECT * FROM poems WHERE slug = ?').bind(decodeURIComponent(slug)).first<PoemRecord>()
  if (!poem) return new Response('Not found', { status: 404 })
  return apiResponse.json(poem)
}

export async function PUT(request: Request, { params }: Params) {
  const { slug: rawSlug } = await params
  const targetSlug = decodeURIComponent(rawSlug)

  const payload = await readJsonPayload(request)
  if (!payload) {
    return apiResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = parsePayload(payload)
  const slug = parsed.slug || targetSlug
  if (!slug || !parsed.title || !parsed.body) {
    return apiResponse.json({ error: 'Missing required fields: title, body (slug optional)' }, { status: 400 })
  }

  const db = await getDb()
  const current = await db.prepare('SELECT id FROM poems WHERE slug = ?').bind(targetSlug).first<{ id: number }>()
  if (!current) {
    return apiResponse.json({ error: 'Poem not found' }, { status: 404 })
  }

  try {
    await db
      .prepare('UPDATE poems SET slug = ?, title = ?, body = ?, type = ? WHERE slug = ?')
      .bind(slug, parsed.title, parsed.body, parsed.type, targetSlug)
      .run()
  } catch {
    return apiResponse.json({ error: 'Could not update poem' }, { status: 500 })
  }

  const updated = await db.prepare('SELECT * FROM poems WHERE slug = ?').bind(slug).first<PoemRecord>()
  return apiResponse.json(updated)
}

export async function DELETE(_: Request, { params }: Params) {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)
  const db = await getDb()

  const found = await db.prepare('SELECT id FROM poems WHERE slug = ?').bind(slug).first<{ id: number }>()
  if (!found) {
    return apiResponse.json({ error: 'Poem not found' }, { status: 404 })
  }

  try {
    await db.prepare('DELETE FROM poems WHERE slug = ?').bind(slug).run()
  } catch {
    return apiResponse.json({ error: 'Could not delete poem' }, { status: 500 })
  }

  return new Response(null, { status: 204 })
}
