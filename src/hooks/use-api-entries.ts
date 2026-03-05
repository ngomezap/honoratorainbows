'use client'

import { useEffect, useState } from 'react'
import type { ApiEntry } from '@/lib/content'
import { loadApiEntries } from '@/lib/entries-loader'

export function useApiEntries() {
  const [entries, setEntries] = useState<ApiEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function reloadEntries(signal?: AbortSignal) {
    try {
      setIsLoading(true)
      setError(null)

      const loadedEntries = await loadApiEntries({ signal })
      console.log(loadedEntries)
      setEntries(loadedEntries)
    } catch (err) {
      if ((err as DOMException).name !== 'AbortError') {
        setError('No se pudo cargar la API.')
        setEntries([])
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    void reloadEntries(controller.signal)
    return () => controller.abort()
  }, [])

  return { entries, isLoading, error, reloadEntries }
}
