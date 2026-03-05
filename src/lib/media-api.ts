import { apiResponse, getDb } from '@/lib/poems-api'

export type MediaType = 'audio' | 'photo'

export type MediaRow = {
  id: string
  type: MediaType
  title: string
  description: string | null
  media_url: string
  created_at: string
}

type MediaDbRow = {
  id: string
  type: string
  caption: string | null
  created_at: string
  audio_url: string | null
  image_url: string | null
  audio_description: string | null
  photo_description: string | null
}

type CreateMediaInput = {
  type: MediaType
  title: string
  description?: string
  file: File
}

const MAX_INLINE_MEDIA_BYTES = 2 * 1024 * 1024

export class MediaApiError extends Error {
  status: number
  code: string
  details?: string

  constructor(status: number, code: string, message: string, details?: string) {
    super(message)
    this.name = 'MediaApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

function isMediaType(value: string): value is MediaType {
  return value === 'audio' || value === 'photo'
}

function valueOrNull(value: string | null) {
  const clean = value?.trim()
  return clean && clean.length > 0 ? clean : null
}

function toBase64(data: ArrayBuffer) {
  const bytes = new Uint8Array(data)
  let binary = ''
  const chunkSize = 0x8000
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  return btoa(binary)
}

export async function mapMediaRowsFromDb() {
  const db = await getDb()
  const query = `
    SELECT
      fi.id,
      fi.type,
      fi.caption,
      fi.created_at,
      ai.audio_url,
      ai.transcript AS audio_description,
      pi.image_url,
      pi.alt_text AS photo_description
    FROM feed_items fi
    LEFT JOIN audio_items ai ON ai.item_id = fi.id
    LEFT JOIN photo_items pi ON pi.item_id = fi.id
    WHERE fi.type IN ('audio', 'photo')
    ORDER BY fi.created_at DESC
  `
  const { results } = await db.prepare(query).all<MediaDbRow>()
  return results
    .map((row) => {
      const type = isMediaType(row.type) ? row.type : null
      if (!type) return null

      const mediaUrl = type === 'audio' ? row.audio_url : row.image_url
      if (!mediaUrl) return null

      const description = type === 'audio' ? row.audio_description : row.photo_description
      return {
        id: row.id,
        type,
        title: row.caption?.trim() || 'Sin titulo',
        description,
        media_url: mediaUrl,
        created_at: row.created_at,
      } satisfies MediaRow
    })
    .filter((entry): entry is MediaRow => entry !== null)
}

export async function createMediaItem(input: CreateMediaInput) {
  if (input.file.size > MAX_INLINE_MEDIA_BYTES) {
    const maxMb = (MAX_INLINE_MEDIA_BYTES / (1024 * 1024)).toFixed(1)
    throw new MediaApiError(
      413,
      'FILE_TOO_LARGE',
      `El archivo pesa ${Math.ceil(input.file.size / 1024)} KB y supera el limite de ${maxMb} MB.`,
      'Este proyecto guarda el binario en D1 como data URL; para audios grandes conviene R2.',
    )
  }

  const db = await getDb()
  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()
  const description = valueOrNull(input.description ?? null)
  const mimeType = input.file.type || (input.type === 'audio' ? 'audio/mpeg' : 'image/jpeg')
  const binary = await input.file.arrayBuffer()
  const base64 = toBase64(binary)
  const dataUrl = `data:${mimeType};base64,${base64}`

  try {
    await db
      .prepare(
        "INSERT INTO feed_items (id, author_id, type, visibility, status, caption, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .bind(id, 'admin', input.type, 'public', 'published', input.title, createdAt, createdAt)
      .run()

    if (input.type === 'audio') {
      await db
        .prepare(
          'INSERT INTO audio_items (item_id, audio_url, mime_type, duration_ms, transcript) VALUES (?, ?, ?, ?, ?)',
        )
        .bind(id, dataUrl, mimeType, null, description)
        .run()
    } else {
      await db
        .prepare('INSERT INTO photo_items (item_id, image_url, alt_text) VALUES (?, ?, ?)')
        .bind(id, dataUrl, description)
        .run()
    }
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown database error'
    throw new MediaApiError(500, 'DB_WRITE_FAILED', 'No se pudo guardar el archivo en D1.', details)
  }

  return {
    id,
    type: input.type,
    title: input.title,
    description,
    media_url: dataUrl,
    created_at: createdAt,
  } satisfies MediaRow
}

export async function deleteMediaItem(id: string) {
  const db = await getDb()
  const found = await db
    .prepare("SELECT id, type FROM feed_items WHERE id = ? AND type IN ('audio', 'photo')")
    .bind(id)
    .first<{ id: string; type: string }>()
  if (!found) return false

  await db.prepare('DELETE FROM audio_items WHERE item_id = ?').bind(id).run()
  await db.prepare('DELETE FROM photo_items WHERE item_id = ?').bind(id).run()
  await db.prepare('DELETE FROM feed_items WHERE id = ?').bind(id).run()
  return true
}

export function parseMediaFormData(formData: FormData): CreateMediaInput {
  const typeValue = formData.get('type')
  const titleValue = formData.get('title')
  const descriptionValue = formData.get('description')
  const fileValue = formData.get('file')

  const type = typeof typeValue === 'string' ? typeValue.trim() : ''
  const title = typeof titleValue === 'string' ? titleValue.trim() : ''
  const description = typeof descriptionValue === 'string' ? descriptionValue.trim() : undefined
  const file = fileValue instanceof File ? fileValue : null

  if (!isMediaType(type)) {
    throw new MediaApiError(400, 'INVALID_TYPE', 'Tipo invalido. Usa "audio" o "photo".')
  }
  if (!title) {
    throw new MediaApiError(400, 'MISSING_TITLE', 'El titulo es obligatorio.')
  }
  if (!file) {
    throw new MediaApiError(400, 'MISSING_FILE', 'Debes adjuntar un archivo.')
  }
  if (file.size === 0) {
    throw new MediaApiError(400, 'EMPTY_FILE', 'El archivo esta vacio.')
  }
  if (type === 'audio' && !file.type.startsWith('audio/')) {
    throw new MediaApiError(400, 'INVALID_AUDIO_MIME', `MIME no valido para audio: ${file.type || 'desconocido'}.`)
  }
  if (type === 'photo' && !file.type.startsWith('image/')) {
    throw new MediaApiError(400, 'INVALID_IMAGE_MIME', `MIME no valido para imagen: ${file.type || 'desconocido'}.`)
  }

  return { type, title, description, file }
}

export const mediaApiResponse = apiResponse
