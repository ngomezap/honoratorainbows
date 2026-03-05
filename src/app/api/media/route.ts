import {
  createMediaItem,
  mapMediaRowsFromDb,
  mediaApiResponse,
  MediaApiError,
  parseMediaFormData,
} from '@/lib/media-api'

function toErrorPayload(error: unknown, fallbackMessage: string) {
  if (error instanceof MediaApiError) {
    return {
      status: error.status,
      body: {
        error: error.message,
        code: error.code,
        details: process.env.NODE_ENV === 'production' ? undefined : error.details,
      },
    }
  }

  if (error instanceof Error) {
    return {
      status: 500,
      body: {
        error: fallbackMessage,
        code: 'UNEXPECTED_ERROR',
        details: process.env.NODE_ENV === 'production' ? undefined : error.message,
      },
    }
  }

  return {
    status: 500,
    body: {
      error: fallbackMessage,
      code: 'UNEXPECTED_ERROR',
    },
  }
}

export async function GET() {
  try {
    const items = await mapMediaRowsFromDb()
    return mediaApiResponse.json(items)
  } catch (error) {
    const payload = toErrorPayload(error, 'Could not load media')
    return mediaApiResponse.json(payload.body, { status: payload.status })
  }
}

export async function POST(request: Request) {
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return mediaApiResponse.json({ error: 'Invalid form body' }, { status: 400 })
  }

  try {
    const parsed = parseMediaFormData(formData)
    const created = await createMediaItem(parsed)
    return mediaApiResponse.json(created, { status: 201 })
  } catch (error) {
    const payload = toErrorPayload(error, 'Could not insert media item')
    return mediaApiResponse.json(payload.body, { status: payload.status })
  }
}
