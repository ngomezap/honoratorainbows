export type SiteTheme = 'poet' | 'music' | 'photo'

export type SiteConfig = {
  name: string
  description: string
  baseUrl: string
  locale: string
  language: string
  theme: SiteTheme
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
    adminTypePoem: string
    adminTypeQuote: string
    adminBody: string
  }
}

const DEFAULT_BASE_URL = 'https://honoratorainbows.com'

export const siteConfig: SiteConfig = {
  name: 'Honorato Rainbows',
  description:
    'Cuaderno digital de versos breves: borradores, piezas terminadas y notas que aun respiran.',
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_BASE_URL,
  locale: 'es_ES',
  language: 'es',
  theme: 'poet',
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
    adminTypePoem: 'Poema',
    adminTypeQuote: 'Quote',
    adminBody: 'Poema',
  },
}

export function siteUrl() {
  return siteConfig.baseUrl
}
