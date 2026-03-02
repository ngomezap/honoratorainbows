import './App.css'
import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { poems as fallbackPoems, type Poem, type PoemType } from './data/poems'

const POEMS_API_URL = '/api/poems'

type ApiPoem = {
  slug: string
  title: string
  body: string
  type?: PoemType
  created_at: string
}

function isApiPoem(value: unknown): value is ApiPoem {
  if (!value || typeof value !== 'object') return false
  const poem = value as Partial<ApiPoem>
  return (
    typeof poem.slug === 'string' &&
    typeof poem.title === 'string' &&
    typeof poem.body === 'string' &&
    typeof poem.created_at === 'string'
  )
}

function toPoem(apiPoem: ApiPoem): Poem {
  const lines = apiPoem.body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  return {
    type: apiPoem.type ?? 'poem',
    title: apiPoem.title,
    lines: lines.length > 0 ? lines : [apiPoem.body],
  }
}

function normalizeApiPoems(payload: unknown): ApiPoem[] {
  if (Array.isArray(payload)) {
    return payload.filter(isApiPoem)
  }

  if (payload && typeof payload === 'object') {
    const data = (payload as { poems?: unknown }).poems
    if (Array.isArray(data)) {
      return data.filter(isApiPoem)
    }
  }

  return []
}

function normalizePoems(payload: unknown): Poem[] {
  return normalizeApiPoems(payload).map(toPoem)
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function usePoems() {
  const [poems, setPoems] = useState<Poem[]>(fallbackPoems)
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
      const normalized = normalizePoems(payload)
      if (normalized.length === 0) {
        throw new Error('La API no devolvio poemas validos')
      }

      setPoems(normalized)
    } catch (err) {
      if ((err as DOMException).name !== 'AbortError') {
        setError('No se pudo cargar la API, mostrando poemas locales.')
        setPoems(fallbackPoems)
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

function useApiPoems() {
  const [poems, setPoems] = useState<ApiPoem[]>([])
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
      const normalized = normalizeApiPoems(payload)
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

function PoemFeed({ poems }: { poems: Poem[] }) {
  return (
    <section className="poem-list" aria-label="Listado de poesias">
      {poems.map((poem, poemIndex) => (
        <article className={`poem-card ${poem.type === 'quote' ? 'quote-card' : 'poem-card--poem'}`} key={`${poem.type}-${poem.title ?? poemIndex}`}>
          {poem.type === 'poem' && poem.title && <h2>{poem.title}</h2>}
          <div className="poem-lines">
            {poem.lines.map((line, index) => (
              <p key={`${poem.type}-${poem.title ?? poemIndex}-${index}`}>{line}</p>
            ))}
          </div>
        </article>
      ))}
    </section>
  )
}

function HomePage() {
  const { poems, isLoading, error } = usePoems()

  return (
    <main className="poetry-page">
      <header className="hero">
        <p className="eyebrow">Cuaderno digital</p>
        <h1>Honorato Rainbows</h1>
        <p className="intro">
          Un espacio minimo para versos breves. Borradores, piezas terminadas y
          notas que aun respiran.
        </p>
      </header>

      {isLoading && <p className="intro">Cargando poemas desde la API...</p>}
      {error && !isLoading && <p className="intro">{error}</p>}

      <PoemFeed poems={poems} />

      <footer className="page-footer">
        Santander, palabras entre la bruma y la montana.
        <a className="admin-link" href="/admin">
          admin
        </a>
      </footer>
    </main>
  )
}

function AdminPage() {
  const { poems, isLoading, error, reloadPoems } = useApiPoems()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function resetForm() {
    setTitle('')
    setBody('')
    setEditingSlug(null)
    setSubmitError(null)
  }

  function openCreateModal() {
    resetForm()
    setIsModalOpen(true)
  }

  function openEditModal(poem: ApiPoem) {
    setEditingSlug(poem.slug)
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
          Nuevo poema
        </button>
        <button className="ghost-button" type="button" onClick={() => void reloadPoems()}>
          Recargar
        </button>
        <a className="secondary-link" href="/">
          Ver feed publico
        </a>
      </section>

      {isLoading && <p className="intro">Cargando poemas desde la API...</p>}
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
                className="ghost-button"
                type="button"
                onClick={() => openEditModal(poem)}
                disabled={isSubmitting}
              >
                Editar
              </button>
              <button
                className="danger-button"
                type="button"
                onClick={() => void handleDelete(poem.slug)}
                disabled={isSubmitting}
              >
                Borrar
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
              <label htmlFor="poem-title">Titulo</label>
              <input
                id="poem-title"
                name="title"
                type="text"
                placeholder="Ej: Niebla de enero"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />

              <label htmlFor="poem-body">Poema</label>
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
