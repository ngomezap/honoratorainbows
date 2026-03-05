import Link from 'next/link'
import { Feed } from '@/components/feed'
import type { FeedEntry } from '@/lib/feed-entry'
import { toContentEntry } from '@/lib/content'
import { loadApiEntries } from '@/lib/entries-loader'
import { siteConfig, siteUrl } from '@/lib/site-config'

export async function HomePage() {
  const profileFeed = siteConfig.feeds[siteConfig.profile]
  const needsContentEntries = profileFeed.items.includes('text') || profileFeed.items.includes('quote')
  let entries: FeedEntry[] = []
  let error: string | null = null

  if (needsContentEntries) {
    try {
      const apiEntries = await loadApiEntries({ baseUrl: siteUrl(), revalidate: 60 })
      entries = apiEntries.map(toContentEntry)
    } catch {
      error = 'No se pudo cargar la API.'
    }
  }

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

      {error && <p className="intro">{error}</p>}

      <Feed profile={siteConfig.profile} entries={entries} />

      <footer className="page-footer">
        {siteConfig.brand.footerLocation}
        <Link className="admin-link" href="/admin">
          admin
        </Link>
      </footer>
    </main>
  )
}
