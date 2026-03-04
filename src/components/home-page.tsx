import Link from 'next/link'
import { PieceFeed } from '@/components/piece-feed'
import { pieces } from '@/data/pieces'
import {
  entriesApiUrl,
  fallbackContentEntries,
  normalizeContentEntries,
  type ContentEntry,
} from '@/lib/content'
import { siteConfig, siteUrl } from '@/lib/site-config'

async function loadPoetEntries(): Promise<{ entries: ContentEntry[]; error: string | null }> {
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
      throw new Error('La API no devolvio contenido valido')
    }

    return { entries, error: null }
  } catch {
    return {
      entries: fallbackContentEntries,
      error: 'No se pudo cargar la API, mostrando contenido local.',
    }
  }
}

function EntryFeed({ entries }: { entries: ContentEntry[] }) {
  return (
    <section className="entry-list" aria-label="Listado de contenido">
      {entries.map((entry, entryIndex) => (
        <article
          className={`entry-card ${entry.kind === 'quote' ? 'quote-card' : 'entry-card--primary'}`}
          key={`${entry.kind}-${entry.title ?? entryIndex}`}
        >
          {entry.kind === 'text' && entry.title && <h2>{entry.title}</h2>}
          <div className="entry-lines">
            {entry.lines.map((line, index) => (
              <p key={`${entry.kind}-${entry.title ?? entryIndex}-${index}`}>{line}</p>
            ))}
          </div>
        </article>
      ))}
    </section>
  )
}


function PoetFeed({ entries, error }: { entries: ContentEntry[]; error: string | null }) {
  return (
    <>
      {error && <p className="intro">{error}</p>}
      <EntryFeed entries={entries} />
    </>
  )
}

export async function HomePage() {
  const isProducerProfile = siteConfig.profile === 'producer'
  const { entries, error } = isProducerProfile
    ? { entries: [] as ContentEntry[], error: null }
    : await loadPoetEntries()
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteUrl(),
    inLanguage: siteConfig.language,
  }

  return (
    <main className="content-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="hero">
        <p className="eyebrow">{siteConfig.brand.eyebrow}</p>
        <h1>{siteConfig.brand.heroTitle}</h1>
        <p className="intro">{siteConfig.brand.heroIntro}</p>
      </header>

      {isProducerProfile ? <PieceFeed pieces={pieces} /> : <PoetFeed entries={entries} error={error} />}

      <footer className="page-footer">
        {siteConfig.brand.footerLocation}
        <Link className="admin-link" href="/admin">
          admin
        </Link>
      </footer>
    </main>
  )
}
