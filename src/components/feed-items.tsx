import type { FeedEntry } from '@/lib/feed-entry'
import Image from 'next/image'

type FeedEntryCardProps = {
  entry: FeedEntry
  entryKey: string
  bindPlayer: (audioTitle: string, player: HTMLAudioElement | null) => void
  onPlay: (audioTitle: string) => void
}

export function FeedEntryCard({ entry, entryKey, bindPlayer, onPlay }: FeedEntryCardProps) {
  const isQuote = entry.kind === 'quote'
  const isAudio = entry.kind === 'audio'
  const isPhoto = entry.kind === 'photo'
  const cardClassName = `entry-card ${isQuote ? 'quote-card' : 'entry-card--primary'} ${isAudio ? 'audio-card' : ''} ${isPhoto ? 'photo-card' : ''}`
  const audioTitle = entry.title ?? entryKey
  const lines = 'lines' in entry ? entry.lines : undefined
  const description = 'description' in entry ? entry.description : undefined
  const audioUrl = 'audioUrl' in entry ? entry.audioUrl : undefined
  const imageUrl = 'imageUrl' in entry ? entry.imageUrl : undefined

  return (
    <article className={cardClassName.trim()}>
      {!isQuote && entry.title && <h2>{entry.title}</h2>}

      {lines && lines.length > 0 && (
        <div className="entry-lines">
          {lines.map((line, index) => (
            <p key={`${entryKey}-${index}`}>{line}</p>
          ))}
        </div>
      )}

      {description && <p className="entry-description">{description}</p>}

      {isAudio && audioUrl && (
        <audio
          className="audio-player"
          controls
          preload="none"
          ref={(player) => bindPlayer(audioTitle, player)}
          onPlay={() => onPlay(audioTitle)}
        >
          <source src={audioUrl} type="audio/mpeg" />
          Tu navegador no soporta el elemento de audio.
        </audio>
      )}

      {isAudio && !audioUrl && (
        <p className="pending-audio">Audio pendiente de publicar</p>
      )}

      {isPhoto && imageUrl && (
        <Image
          className="entry-photo"
          src={imageUrl}
          alt={description?.trim() || entry.title || 'Fotografia'}
          width={1200}
          height={900}
          unoptimized
        />
      )}

      {isPhoto && !imageUrl && <p className="pending-audio">Imagen pendiente de publicar</p>}
    </article>
  )
}
