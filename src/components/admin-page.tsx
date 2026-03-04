'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SquarePen, Trash2 } from 'lucide-react'
import { normalizeApiEntries, entriesApiUrl, slugify, type ApiEntry, type ContentKind } from '@/lib/content'
import { siteConfig } from '@/lib/site-config'

const POEMS_API_URL = entriesApiUrl()

function useApiPoems() {
  const [poems, setPoems] = useState<ApiEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadPoems(signal?: AbortSignal) {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(POEMS_API_URL, { signal })
      if (!response.ok) {
        throw new Error(`La API devolvio ${response.status}`)
      }

      const payload = (await response.json()) as unknown
      const normalized = normalizeApiEntries(payload)
      if (normalized.length === 0) {
        throw new Error('La API no devolvio poemas validos')
      }

      setPoems(normalized)
    } catch (err) {
      if ((err as DOMException).name !== 'AbortError') {
        setError('No se pudo cargar la API.')
        setPoems([])
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    void loadPoems(controller.signal)
    return () => controller.abort()
  }, [])

  return { poems, isLoading, error, reloadPoems: () => loadPoems() }
}

export function AdminPage() {
  const { poems, isLoading, error, reloadPoems } = useApiPoems()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [textType, setTextType] = useState<ContentKind>('poem')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function resetForm() {
    setTextType('poem')
    setTitle('')
    setBody('')
    setEditingSlug(null)
    setSubmitError(null)
  }

  function openCreateModal() {
    resetForm()
    setIsModalOpen(true)
  }

  function openEditModal(poem: ApiEntry) {
    setEditingSlug(poem.slug)
    setTextType(poem.type ?? 'poem')
    setTitle(poem.title)
    setBody(poem.body)
    setSubmitError(null)
    setIsModalOpen(true)
  }

  async function handleDelete(slug: string) {
    const confirmed = window.confirm('Se borrara este poema. Quieres continuar?')
    if (!confirmed) return

    try {
      const response = await fetch(`${POEMS_API_URL}/${encodeURIComponent(slug)}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error(`La API devolvio ${response.status}`)
      }
      await reloadPoems()
    } catch {
      setSubmitError('No se pudo borrar el poema en la API.')
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const cleanTitle = title.trim()
    const cleanBody = body.trim()

    if (!cleanTitle || !cleanBody) {
      setSubmitError('Titulo y poema son obligatorios.')
      return
    }

    const isEditing = Boolean(editingSlug)
    const baseSlug = slugify(cleanTitle) || 'poema'
    const slug = isEditing ? baseSlug : `${baseSlug}-${Date.now()}`
    const endpoint = isEditing
      ? `${POEMS_API_URL}/${encodeURIComponent(editingSlug as string)}`
      : POEMS_API_URL
    const method = isEditing ? 'PUT' : 'POST'

    try {
      setIsSubmitting(true)
      setSubmitError(null)

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug,
          type: textType,
          title: cleanTitle,
          body: cleanBody,
        }),
      })

      if (!response.ok) {
        throw new Error(`La API devolvio ${response.status}`)
      }

      resetForm()
      setIsModalOpen(false)
      await reloadPoems()
    } catch {
      setSubmitError(
        isEditing
          ? 'No se pudo actualizar el poema en la API.'
          : 'No se pudo guardar el poema en la API.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="poetry-page">
      <header className="hero">
        <p className="eyebrow">Panel de gestion</p>
        <h1>Admin</h1>
      </header>

      <section className="admin-actions" aria-label="Acciones de administracion">
        <button className="upload-button" type="button" onClick={openCreateModal}>
          {siteConfig.labels.adminNewItem}
        </button>
        <button className="ghost-button" type="button" onClick={() => void reloadPoems()}>
          Recargar
        </button>
        <Link className="secondary-link" href="/">
          {siteConfig.labels.adminPublicFeed}
        </Link>
      </section>

      {isLoading && <p className="intro">{siteConfig.labels.adminLoading}</p>}
      {error && !isLoading && <p className="intro">{error}</p>}
      {submitError && !isModalOpen && <p className="intro">{submitError}</p>}

      <section className="poem-list" aria-label="Listado de poesias en admin">
        {poems.map((poem) => (
          <article
            className={`poem-card ${(poem.type ?? 'poem') === 'quote' ? 'quote-card' : 'poem-card--poem'}`}
            key={poem.slug}
          >
            <h2>{poem.title}</h2>
            <div className="poem-lines">
              {poem.body
                .split(/\r?\n/)
                .map((line) => line.trim())
                .filter((line) => line.length > 0)
                .map((line, index) => (
                  <p key={`${poem.slug}-${index}`}>{line}</p>
                ))}
            </div>
            <div className="admin-card-actions">
              <button
                className="icon-button"
                type="button"
                onClick={() => openEditModal(poem)}
                disabled={isSubmitting}
                aria-label={`Editar ${poem.title}`}
                title="Editar"
              >
                <SquarePen size={16} aria-hidden="true" />
              </button>
              <button
                className="icon-button icon-button--danger"
                type="button"
                onClick={() => void handleDelete(poem.slug)}
                disabled={isSubmitting}
                aria-label={`Borrar ${poem.title}`}
                title="Borrar"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </section>

      {isModalOpen && (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={() => {
            setIsModalOpen(false)
            resetForm()
          }}
        >
          <section
            className="poem-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="poem-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="poem-modal__header">
              <h2 id="poem-modal-title">{editingSlug ? 'Editar poema' : 'Subir poema'}</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setIsModalOpen(false)
                  resetForm()
                }}
                aria-label="Cerrar modal"
              >
                x
              </button>
            </header>

            <form className="poem-form" onSubmit={handleSubmit}>
              <label htmlFor="poem-type">Tipo</label>
              <select
                id="poem-type"
                name="type"
                value={textType}
                onChange={(event) => setTextType(event.target.value as ContentKind)}
              >
                <option value="poem">{siteConfig.labels.adminTypePoem}</option>
                <option value="quote">{siteConfig.labels.adminTypeQuote}</option>
              </select>

              <label htmlFor="poem-title">Titulo</label>
              <input
                id="poem-title"
                name="title"
                type="text"
                placeholder="Ej: Niebla de enero"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />

              <label htmlFor="poem-body">{siteConfig.labels.adminBody}</label>
              <textarea
                id="poem-body"
                name="body"
                rows={7}
                placeholder="Escribe aqui tus versos"
                value={body}
                onChange={(event) => setBody(event.target.value)}
              />

              {submitError && <p className="intro">{submitError}</p>}

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : editingSlug ? 'Actualizar' : 'Guardar'}
              </button>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}
