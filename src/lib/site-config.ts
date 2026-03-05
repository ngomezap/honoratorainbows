import type { FeedKind } from '@/lib/feed-entry'

export type SiteTheme = 'poet' | 'producer-dark' | 'musician' | 'music' | 'photo'
export type SiteProfile = 'poet' | 'producer'
export type FeedItemKind = FeedKind

export type ProfileFeedConfig = {
  items: FeedItemKind[]
  ariaLabel: string
}

export type SiteConfig = {
  name: string
  description: string
  baseUrl: string
  locale: string
  language: string
  theme: SiteTheme
  profile: SiteProfile
  brand: {
    eyebrow: string
    heroTitle: string
    heroIntro: string
    footerLocation: string
  }
  labels: {
    adminNewItem: string
    adminLoading: string
    adminPublicFeed: string
    adminTypePrimary: string
    adminTypeQuote: string
    adminBody: string
  }
  feeds: Record<SiteProfile, ProfileFeedConfig>
}

const DEFAULT_BASE_URL = 'https://honoratorainbows.com'

export const siteConfig: SiteConfig = {
  name: 'H.Rainbows',
  description:
    'Cuaderno digital de versos breves: borradores, piezas terminadas y notas que aun respiran.',
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_BASE_URL,
  locale: 'es_ES',
  language: 'es',
  theme: 'producer-dark',
  profile: 'poet',
  brand: {
    eyebrow: 'Cuaderno digital',
    heroTitle: 'Honorato Rainbows',
    heroIntro:
      'Un espacio minimo para versos breves. Borradores, piezas terminadas y notas que aun respiran.',
    footerLocation: 'Santander, palabras entre la bruma y la montana.',
  },
  labels: {
    adminNewItem: 'Nuevo poema',
    adminLoading: 'Cargando poemas desde la API...',
    adminPublicFeed: 'Ver feed publico',
    adminTypePrimary: 'Poema',
    adminTypeQuote: 'Quote',
    adminBody: 'Poema',
  },
  feeds: {
    poet: {
      items: ['quote', 'text'],
      ariaLabel: 'Listado de contenido',
    },
    producer: {
      items: ['audio'],
      ariaLabel: 'Listado de audios musicales',
    },
  },
}

export function siteUrl() {
  return siteConfig.baseUrl
}
