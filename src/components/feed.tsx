'use client'

import { useRef } from 'react'
import type { FeedEntry } from '@/lib/feed-entry'
import type { SiteProfile } from '@/lib/site-config'
import { siteConfig } from '@/lib/site-config'
import { FeedEntryCard } from '@/components/feed-items'

type FeedProps = {
  profile: SiteProfile
  entries?: FeedEntry[]
}

function defaultKeyForItem(entry: FeedEntry, index: number) {
  if (entry.id) return entry.id
  return `${entry.kind}-${entry.title ?? index}-${index}`
}

export function Feed({ profile, entries = [] }: FeedProps) {
  const playersRef = useRef<Map<string, HTMLAudioElement>>(new Map())
  const profileFeed = siteConfig.feeds[profile]
  const resolvedItems = entries.filter((entry) => profileFeed.items.includes(entry.kind))

  function bindPlayer(audioTitle: string, player: HTMLAudioElement | null) {
    if (!player) {
      playersRef.current.delete(audioTitle)
      return
    }
    playersRef.current.set(audioTitle, player)
  }

  function handlePlay(currentTitle: string) {
    playersRef.current.forEach((player, title) => {
      if (title !== currentTitle) {
        player.pause()
      }
    })
  }

  return (
    <section className="entry-list audio-list" aria-label={profileFeed.ariaLabel}>
      {resolvedItems.map((entry, index) => {
        const itemKey = defaultKeyForItem(entry, index)
        return (
          <FeedEntryCard
            key={itemKey}
            entry={entry}
            entryKey={itemKey}
            bindPlayer={bindPlayer}
            onPlay={handlePlay}
          />
        )
      })}
    </section>
  )
}
