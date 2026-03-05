import { deleteMediaItem, mediaApiResponse } from '@/lib/media-api'

type Params = { params: Promise<{ id: string }> }

export async function DELETE(_: Request, { params }: Params) {
  const { id: rawId } = await params
  const id = decodeURIComponent(rawId)

  try {
    const deleted = await deleteMediaItem(id)
    if (!deleted) {
      return mediaApiResponse.json({ error: 'Media item not found' }, { status: 404 })
    }
    return new Response(null, { status: 204 })
  } catch {
    return mediaApiResponse.json({ error: 'Could not delete media item' }, { status: 500 })
  }
}
