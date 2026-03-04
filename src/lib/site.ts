import { siteConfig } from '@/lib/site-config'

export function siteUrl() {
  return siteConfig.baseUrl
}

export const siteName = siteConfig.name
export const siteDescription = siteConfig.description
