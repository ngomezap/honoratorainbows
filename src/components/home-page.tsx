import Link from 'next/link'
import { fallbackPoems, normalizePoems, poemsApiUrl, type Poem } from '@/lib/poetry'
import { siteDescription, siteName, siteUrl } from '@/lib/site'

async function loadPoems(): Promise<{ poems: Poem[]; error: string | null }> {
  try {
    const response = await fetch(poemsApiUrl(), {
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      throw new Error(`La API devolvio ${response.status}`)
    }

    const payload = (await response.json()) as unknown
    const poems = normalizePoems(payload)

    if (poems.length === 0) {
      throw new Error('La API no devolvio poemas validos')
    }

    return { poems, error: null }
  } catch {
    return {
      poems: fallbackPoems,
      error: 'No se pudo cargar la API, mostrando poemas locales.',
    }
  }
}

function PoemFeed({ poems }: { poems: Poem[] }) {
  return (
    <section className="poem-list" aria-label="Listado de poesias">
      {poems.map((poem, poemIndex) => (
        <article
          className={`poem-card ${poem.type === 'quote' ? 'quote-card' : 'poem-card--poem'}`}
          key={`${poem.type}-${poem.title ?? poemIndex}`}
        >
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

export async function HomePage() {
  const { poems, error } = await loadPoems()
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    description: siteDescription,
    url: siteUrl(),
    inLanguage: 'es',
  }

  return (
    <main className="poetry-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="hero">
        <p className="eyebrow">Cuaderno digital</p>
        <h1>Honorato Rainbows</h1>
        <p className="intro">
          Un espacio minimo para versos breves. Borradores, piezas terminadas y notas que aun
          respiran.
        </p>
      </header>

      {error && <p className="intro">{error}</p>}

      <PoemFeed poems={poems} />

      <footer className="page-footer">
        Santander, palabras entre la bruma y la montana.
        <Link className="admin-link" href="/admin">
          admin
        </Link>
      </footer>
    </main>
  )
}
