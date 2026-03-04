import Link from 'next/link'
import {
  entriesApiUrl,
  fallbackContentEntries,
  normalizeContentEntries,
  type ContentEntry,
} from '@/lib/content'
import { siteConfig, siteUrl } from '@/lib/site-config'

async function loadContentEntries(): Promise<{ entries: ContentEntry[]; error: string | null }> {
  try {
    const response = await fetch(new URL(entriesApiUrl(), siteUrl()).toString(), {
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      throw new Error(`La API devolvio ${response.status}`)
    }

    const payload = (await response.json()) as unknown
    const entries = normalizeContentEntries(payload)

    if (entries.length === 0) {
      throw new Error('La API no devolvio poemas validos')
    }

    return { entries, error: null }
  } catch {
    return {
      entries: fallbackContentEntries,
      error: 'No se pudo cargar la API, mostrando poemas locales.',
    }
  }
}

function PoemFeed({ entries }: { entries: ContentEntry[] }) {
  return (
    <section className="poem-list" aria-label="Listado de poesias">
      {entries.map((entry, entryIndex) => (
        <article
          className={`poem-card ${entry.kind === 'quote' ? 'quote-card' : 'poem-card--poem'}`}
          key={`${entry.kind}-${entry.title ?? entryIndex}`}
        >
          {entry.kind === 'poem' && entry.title && <h2>{entry.title}</h2>}
          <div className="poem-lines">
            {entry.lines.map((line, index) => (
              <p key={`${entry.kind}-${entry.title ?? entryIndex}-${index}`}>{line}</p>
            ))}
          </div>
        </article>
      ))}
    </section>
  )
}

export async function HomePage() {
  const { entries, error } = await loadContentEntries()
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteUrl(),
    inLanguage: siteConfig.language,
  }

  return (
    <main className="poetry-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="hero">
        <p className="eyebrow">{siteConfig.brand.eyebrow}</p>
        <h1>{siteConfig.brand.heroTitle}</h1>
        <p className="intro">{siteConfig.brand.heroIntro}</p>
      </header>

      {error && <p className="intro">{error}</p>}

      <PoemFeed entries={entries} />

      <footer className="page-footer">
        {siteConfig.brand.footerLocation}
        <Link className="admin-link" href="/admin">
          admin
        </Link>
      </footer>
    </main>
  )
}
