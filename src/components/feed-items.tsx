import type { FeedEntry } from '@/lib/feed-entry'

type FeedEntryCardProps = {
  entry: FeedEntry
  entryKey: string
  bindPlayer: (audioTitle: string, player: HTMLAudioElement | null) => void
  onPlay: (audioTitle: string) => void
}

export function FeedEntryCard({ entry, entryKey, bindPlayer, onPlay }: FeedEntryCardProps) {
  const isQuote = entry.kind === 'quote'
  const isAudio = entry.kind === 'audio'
  const cardClassName = `entry-card ${isQuote ? 'quote-card' : 'entry-card--primary'} ${isAudio ? 'audio-card' : ''}`
  const audioTitle = entry.title ?? entryKey
  const lines = 'lines' in entry ? entry.lines : undefined
  const description = 'description' in entry ? entry.description : undefined
  const audioUrl = 'audioUrl' in entry ? entry.audioUrl : undefined

  return (
    <article className={cardClassName.trim()}>
      {entry.title && <h2>{entry.title}</h2>}

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
    </article>
  )
}
