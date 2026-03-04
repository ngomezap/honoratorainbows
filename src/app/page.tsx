import './app.css'
import type { Metadata } from 'next'
import { HomePage } from '@/components/home-page'
import { siteConfig } from '@/lib/site-config'

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  alternates: {
    canonical: '/',
  },
}

export default async function Page() {
  return <HomePage />
}
