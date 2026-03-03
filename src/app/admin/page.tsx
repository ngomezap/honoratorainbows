import '../app.css'
import type { Metadata } from 'next'
import { AdminPage } from '@/components/admin-page'

export const metadata: Metadata = {
  title: 'Admin',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/admin',
  },
}

export default function AdminRoute() {
  return <AdminPage />
}
