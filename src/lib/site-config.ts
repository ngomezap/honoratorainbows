import type { FeedKind } from '@/lib/feed-entry'

export type SiteTheme = 'poet' | 'producer-dark' | 'musician' | 'music' | 'photo'
export type SiteProfile = 'poet' | 'producer' | 'photographer' | 'fotografo'
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
    adminNewPoem: string
    adminNewAudio: string
    adminNewPhoto: string
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
    adminNewPoem: 'Nuevo poema',
    adminNewAudio: 'Nuevo audio',
    adminNewPhoto: 'Nueva foto',
    adminLoading: 'Cargando contenido desde la API...',
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
    photographer: {
      items: ['photo'],
      ariaLabel: 'Listado de fotografias',
    },
    fotografo: {
      items: ['photo'],
      ariaLabel: 'Listado de fotografias',
    },
  },
}

export function siteUrl() {
  return siteConfig.baseUrl
}
