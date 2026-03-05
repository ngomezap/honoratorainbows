'use client'

import { useCallback, useEffect, useState } from 'react'
import { loadApiEntries, loadMediaEntries } from '@/lib/entries-loader'
import { fromApiEntry, fromMediaEntry, type AdminEntry } from '@/lib/admin-entry'
import type { SiteProfile } from '@/lib/site-config'

export function useApiEntries(profile: SiteProfile) {
  const [entries, setEntries] = useState<AdminEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reloadEntries = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true)
      setError(null)

      if (profile === 'poet') {
        const loadedEntries = await loadApiEntries({ signal })
        setEntries(loadedEntries.map(fromApiEntry))
      } else {
        const loadedEntries = await loadMediaEntries({ signal })
        const onlyProfileEntries =
          profile === 'producer'
            ? loadedEntries.filter((entry) => entry.kind === 'audio')
            : loadedEntries.filter((entry) => entry.kind === 'photo')
        setEntries(onlyProfileEntries.map(fromMediaEntry))
      }
    } catch (err) {
      if ((err as DOMException).name !== 'AbortError') {
        setError('No se pudo cargar la API.')
        setEntries([])
      }
    } finally {
      setIsLoading(false)
    }
  }, [profile])

  useEffect(() => {
    const controller = new AbortController()
    void reloadEntries(controller.signal)
    return () => controller.abort()
  }, [reloadEntries])

  return { entries, isLoading, error, reloadEntries }
}
