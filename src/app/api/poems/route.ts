import { apiResponse, getDb, parsePayload, readJsonPayload, type PoemRecord } from '@/lib/poems-api'

export async function GET() {
  const db = await getDb()
  const { results } = await db.prepare('SELECT * FROM poems ORDER BY created_at DESC').all<PoemRecord>()
  return apiResponse.json(results)
}

export async function POST(request: Request) {
  const payload = await readJsonPayload(request)
  if (!payload) {
    return apiResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { slug, title, body, type } = parsePayload(payload)
  if (!slug || !title || !body) {
    return apiResponse.json({ error: 'Missing required fields: slug, title, body' }, { status: 400 })
  }

  const db = await getDb()

  try {
    await db
      .prepare("INSERT INTO poems (slug, title, body, type, created_at) VALUES (?, ?, ?, ?, datetime('now'))")
      .bind(slug, title, body, type)
      .run()
  } catch {
    return apiResponse.json({ error: 'Could not insert poem' }, { status: 500 })
  }

  const created = await db.prepare('SELECT * FROM poems WHERE slug = ?').bind(slug).first<PoemRecord>()
  return apiResponse.json(created, { status: 201 })
}
