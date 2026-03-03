import './app.css'
import type { Metadata } from 'next'
import { HomePage } from '@/components/home-page'
import { siteDescription, siteName } from '@/lib/site'

export const metadata: Metadata = {
  title: siteName,
  description: siteDescription,
  alternates: {
    canonical: '/',
  },
}

export default async function Page() {
  return <HomePage />
}
