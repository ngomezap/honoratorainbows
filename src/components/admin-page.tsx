'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SquarePen, Trash2 } from 'lucide-react'
import {
  entriesApiUrl,
  isApiQuote,
  slugify,
  toContentKind,
  toApiEntryType,
  type ApiEntry,
  type ContentKind,
} from '@/lib/content'
import { useApiEntries } from '@/hooks/use-api-entries'
import { siteConfig } from '@/lib/site-config'

const ENTRIES_API_URL = entriesApiUrl()

export function AdminPage() {
  const profileFeed = siteConfig.feeds[siteConfig.profile]
  const allowedTypes = profileFeed.items.filter(
    (kind): kind is ContentKind => kind === 'text' || kind === 'quote',
  )
  const defaultType: ContentKind = allowedTypes[0] ?? 'text'
  const { entries, isLoading, error, reloadEntries } = useApiEntries()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [textType, setTextType] = useState<ContentKind>(defaultType)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function resetForm() {
    setTextType(defaultType)
    setTitle('')
    setBody('')
    setEditingSlug(null)
    setSubmitError(null)
  }

  function openCreateModal() {
    resetForm()
    setIsModalOpen(true)
  }

  function openEditModal(entry: ApiEntry) {
    setEditingSlug(entry.slug)
    setTextType(toContentKind(entry.type))
    setTitle(entry.title)
    setBody(entry.body)
    setSubmitError(null)
    setIsModalOpen(true)
  }

  async function handleDelete(slug: string) {
    const confirmed = window.confirm('Se borrara esta entrada. Quieres continuar?')
    if (!confirmed) return

    try {
      const response = await fetch(`${ENTRIES_API_URL}/${encodeURIComponent(slug)}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error(`La API devolvio ${response.status}`)
      }
      await reloadEntries()
    } catch {
      setSubmitError('No se pudo borrar la entrada en la API.')
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const cleanTitle = title.trim()
    const cleanBody = body.trim()

    if (!cleanTitle || !cleanBody) {
      setSubmitError('Titulo y contenido son obligatorios.')
      return
    }
    if (!allowedTypes.includes(textType)) {
      setSubmitError('El tipo seleccionado no esta permitido para este perfil.')
      return
    }

    const isEditing = Boolean(editingSlug)
    const baseSlug = slugify(cleanTitle) || 'entry'
    const slug = isEditing ? baseSlug : `${baseSlug}-${Date.now()}`
    const endpoint = isEditing
      ? `${ENTRIES_API_URL}/${encodeURIComponent(editingSlug as string)}`
      : ENTRIES_API_URL
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
          type: toApiEntryType(textType),
          title: cleanTitle,
          body: cleanBody,
        }),
      })

      if (!response.ok) {
        throw new Error(`La API devolvio ${response.status}`)
      }

      resetForm()
      setIsModalOpen(false)
      await reloadEntries()
    } catch {
      setSubmitError(
        isEditing
          ? 'No se pudo actualizar la entrada en la API.'
          : 'No se pudo guardar la entrada en la API.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="content-page">
      <header className="hero">
        <p className="eyebrow">Panel de gestion</p>
        <h1>Admin</h1>
      </header>

      <section className="admin-actions" aria-label="Acciones de administracion">
        <button className="upload-button" type="button" onClick={openCreateModal}>
          {siteConfig.labels.adminNewItem}
        </button>
        <button className="ghost-button" type="button" onClick={() => void reloadEntries()}>
          Recargar
        </button>
        <Link className="secondary-link" href="/">
          {siteConfig.labels.adminPublicFeed}
        </Link>
      </section>

      {isLoading && <p className="intro">{siteConfig.labels.adminLoading}</p>}
      {error && !isLoading && <p className="intro">{error}</p>}
      {submitError && !isModalOpen && <p className="intro">{submitError}</p>}

      <section className="entry-list" aria-label="Listado de contenido en admin">
        {entries.map((entry) => (
          <article
            className={`entry-card ${isApiQuote(entry.type) ? 'quote-card' : 'entry-card--primary'}`}
            key={entry.slug}
          >
            <h2>{entry.title}</h2>
            <div className="entry-lines">
              {entry.body
                .split(/\r?\n/)
                .map((line) => line.trim())
                .filter((line) => line.length > 0)
                .map((line, index) => (
                  <p key={`${entry.slug}-${index}`}>{line}</p>
                ))}
            </div>
            <div className="admin-card-actions">
              <button
                className="icon-button"
                type="button"
                onClick={() => openEditModal(entry)}
                disabled={isSubmitting}
                aria-label={`Editar ${entry.title}`}
                title="Editar"
              >
                <SquarePen size={16} aria-hidden="true" />
              </button>
              <button
                className="icon-button icon-button--danger"
                type="button"
                onClick={() => void handleDelete(entry.slug)}
                disabled={isSubmitting}
                aria-label={`Borrar ${entry.title}`}
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
            className="entry-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="entry-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="entry-modal__header">
              <h2 id="entry-modal-title">{editingSlug ? 'Editar entrada' : 'Subir entrada'}</h2>
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

            <form className="entry-form" onSubmit={handleSubmit}>
              <label htmlFor="entry-type">Tipo</label>
              <select
                id="entry-type"
                name="type"
                value={textType}
                onChange={(event) => setTextType(event.target.value as ContentKind)}
                disabled={allowedTypes.length === 0}
              >
                {allowedTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === 'text' ? siteConfig.labels.adminTypePrimary : siteConfig.labels.adminTypeQuote}
                  </option>
                ))}
              </select>
              {allowedTypes.length === 0 && (
                <p className="intro">El perfil actual no admite tipos editables en este panel.</p>
              )}

              <label htmlFor="entry-title">Titulo</label>
              <input
                id="entry-title"
                name="title"
                type="text"
                placeholder="Ej: Niebla de enero"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />

              <label htmlFor="entry-body">{siteConfig.labels.adminBody}</label>
              <textarea
                id="entry-body"
                name="body"
                rows={7}
                placeholder="Escribe aqui tu contenido"
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
