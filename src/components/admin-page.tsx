'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SquarePen, Trash2 } from 'lucide-react'
import { entriesApiUrl, slugify, toApiEntryType, type ContentKind } from '@/lib/content'
import { mediaApiUrl } from '@/lib/media-content'
import { useApiEntries } from '@/hooks/use-api-entries'
import { siteConfig, type SiteProfile } from '@/lib/site-config'
import type { AdminEntry } from '@/lib/admin-entry'

const ENTRIES_API_URL = entriesApiUrl()
const MEDIA_API_URL = mediaApiUrl()

async function readApiErrorMessage(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { error?: unknown; details?: unknown; code?: unknown }
    const error = typeof payload.error === 'string' ? payload.error : fallback
    const details = typeof payload.details === 'string' ? payload.details : ''
    const code = typeof payload.code === 'string' ? payload.code : ''
    return [error, code, details].filter(Boolean).join(' | ')
  } catch {
    return fallback
  }
}

function messageFromError(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

function isTextKind(kind: AdminEntry['kind']): kind is ContentKind {
  return kind === 'text' || kind === 'quote'
}

function isContentKind(value: string): value is ContentKind {
  return value === 'text' || value === 'quote'
}

function isMediaProfile(profile: SiteProfile) {
  return profile === 'producer' || profile === 'photographer' || profile === 'fotografo'
}

function newItemLabel(profile: SiteProfile) {
  if (profile === 'producer') return siteConfig.labels.adminNewAudio
  if (profile === 'photographer' || profile === 'fotografo') return siteConfig.labels.adminNewPhoto
  return siteConfig.labels.adminNewPoem
}

function modalHeading(profile: SiteProfile, editing: boolean) {
  if (editing) return 'Editar entrada'
  if (profile === 'producer') return 'Subir audio'
  if (profile === 'photographer' || profile === 'fotografo') return 'Subir foto'
  return 'Subir entrada'
}

function mediaAccept(profile: SiteProfile) {
  return profile === 'producer' ? 'audio/*' : 'image/*'
}

function mediaType(profile: SiteProfile) {
  return profile === 'producer' ? 'audio' : 'photo'
}

export function AdminPage() {
  const profile = siteConfig.profile
  const isPoetProfile = profile === 'poet'
  const profileFeed = siteConfig.feeds[profile]
  const allowedTypes = profileFeed.items.filter((kind): kind is ContentKind => isContentKind(kind))
  const defaultType: ContentKind = allowedTypes[0] ?? 'text'
  const { entries, isLoading, error, reloadEntries } = useApiEntries(profile)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [textType, setTextType] = useState<ContentKind>(defaultType)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [description, setDescription] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function resetForm() {
    setTextType(defaultType)
    setTitle('')
    setBody('')
    setDescription('')
    setUploadFile(null)
    setEditingSlug(null)
    setSubmitError(null)
  }

  function openCreateModal() {
    resetForm()
    setIsModalOpen(true)
  }

  function openEditModal(entry: AdminEntry) {
    if (!entry.slug || !isTextKind(entry.kind)) return
    setEditingSlug(entry.slug)
    setTextType(entry.kind)
    setTitle(entry.title)
    setBody(entry.body ?? '')
    setSubmitError(null)
    setIsModalOpen(true)
  }

  async function handleDelete(entry: AdminEntry) {
    const confirmed = window.confirm('Se borrara esta entrada. Quieres continuar?')
    if (!confirmed) return

    try {
      const endpoint =
        profile === 'poet'
          ? `${ENTRIES_API_URL}/${encodeURIComponent(entry.id)}`
          : `${MEDIA_API_URL}/${encodeURIComponent(entry.id)}`
      const response = await fetch(endpoint, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error(`La API devolvio ${response.status}`)
      }
      await reloadEntries()
    } catch {
      setSubmitError('No se pudo borrar la entrada en la API.')
    }
  }

  async function submitPoem() {
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
  }

  async function submitMedia() {
    const cleanTitle = title.trim()
    if (!cleanTitle) {
      setSubmitError('El titulo es obligatorio.')
      return
    }
    if (!uploadFile) {
      setSubmitError('Debes seleccionar un archivo.')
      return
    }

    const expectedMimePrefix = profile === 'producer' ? 'audio/' : 'image/'
    if (!uploadFile.type.startsWith(expectedMimePrefix)) {
      setSubmitError(
        profile === 'producer'
          ? 'El archivo debe ser un audio valido.'
          : 'El archivo debe ser una imagen valida.',
      )
      return
    }

    const formData = new FormData()
    formData.append('type', mediaType(profile))
    formData.append('title', cleanTitle)
    formData.append('description', description.trim())
    formData.append('file', uploadFile)

    const response = await fetch(MEDIA_API_URL, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const message = await readApiErrorMessage(response, `La API devolvio ${response.status}`)
      throw new Error(message)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setSubmitError(null)

      if (isPoetProfile) {
        await submitPoem()
      } else if (isMediaProfile(profile)) {
        await submitMedia()
      }

      resetForm()
      setIsModalOpen(false)
      await reloadEntries()
    } catch (error) {
      if (isPoetProfile) {
        setSubmitError(
          editingSlug
            ? 'No se pudo actualizar la entrada en la API.'
            : 'No se pudo guardar la entrada en la API.',
        )
      } else {
        setSubmitError(messageFromError(error, 'No se pudo subir el archivo en la API.'))
      }
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
          {newItemLabel(profile)}
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
        {entries.map((entry) => {
          const isQuote = entry.kind === 'quote'
          const isAudio = entry.kind === 'audio'
          const isPhoto = entry.kind === 'photo'
          return (
            <article
              className={`entry-card ${isQuote ? 'quote-card' : 'entry-card--primary'} ${isAudio ? 'audio-card' : ''} ${isPhoto ? 'photo-card' : ''}`}
              key={entry.id}
            >
              <h2>{entry.title}</h2>
              {isTextKind(entry.kind) && (
                <div className="entry-lines">
                  {(entry.body ?? '')
                    .split(/\r?\n/)
                    .map((line) => line.trim())
                    .filter((line) => line.length > 0)
                    .map((line, index) => (
                      <p key={`${entry.id}-${index}`}>{line}</p>
                    ))}
                </div>
              )}

              {isAudio && entry.description && <p className="entry-description">{entry.description}</p>}
              {isAudio && entry.mediaUrl && (
                <audio className="audio-player" controls preload="none">
                  <source src={entry.mediaUrl} />
                  Tu navegador no soporta el elemento de audio.
                </audio>
              )}

              {isPhoto && entry.mediaUrl && (
                <Image
                  className="entry-photo"
                  src={entry.mediaUrl}
                  alt={entry.description?.trim() || entry.title}
                  width={1200}
                  height={900}
                  unoptimized
                />
              )}
              {isPhoto && entry.description && <p className="entry-description">{entry.description}</p>}

              <div className="admin-card-actions">
                {entry.slug && isTextKind(entry.kind) && (
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
                )}
                <button
                  className="icon-button icon-button--danger"
                  type="button"
                  onClick={() => void handleDelete(entry)}
                  disabled={isSubmitting}
                  aria-label={`Borrar ${entry.title}`}
                  title="Borrar"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            </article>
          )
        })}
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
              <h2 id="entry-modal-title">{modalHeading(profile, Boolean(editingSlug))}</h2>
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
              {isPoetProfile && (
                <>
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
                </>
              )}

              <label htmlFor="entry-title">Titulo</label>
              <input
                id="entry-title"
                name="title"
                type="text"
                placeholder={
                  profile === 'producer'
                    ? 'Ej: Resonancia III'
                    : profile === 'photographer' || profile === 'fotografo'
                      ? 'Ej: Niebla en la costa'
                      : 'Ej: Niebla de enero'
                }
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />

              {isPoetProfile && (
                <>
                  <label htmlFor="entry-body">{siteConfig.labels.adminBody}</label>
                  <textarea
                    id="entry-body"
                    name="body"
                    rows={7}
                    placeholder="Escribe aqui tu contenido"
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                  />
                </>
              )}

              {!isPoetProfile && (
                <>
                  <label htmlFor="entry-description">Descripcion</label>
                  <textarea
                    id="entry-description"
                    name="description"
                    rows={4}
                    placeholder={
                      profile === 'producer'
                        ? 'Contexto del track o creditos'
                        : 'Texto alternativo o nota de la imagen'
                    }
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                  />

                  <label htmlFor="entry-file">{profile === 'producer' ? 'Archivo de audio' : 'Archivo de imagen'}</label>
                  <input
                    id="entry-file"
                    name="file"
                    type="file"
                    accept={mediaAccept(profile)}
                    onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
                  />
                </>
              )}

              {submitError && <p className="intro">{submitError}</p>}

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Guardando...'
                  : editingSlug
                    ? 'Actualizar'
                    : profile === 'producer'
                      ? 'Subir audio'
                      : profile === 'photographer' || profile === 'fotografo'
                        ? 'Subir foto'
                        : 'Guardar'}
              </button>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}
