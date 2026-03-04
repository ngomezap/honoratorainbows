'use client'

import { useRef } from 'react'
import type { Piece } from '@/data/pieces'

type PieceFeedProps = {
  pieces: Piece[]
}

export function PieceFeed({ pieces }: PieceFeedProps) {
  const playersRef = useRef<Map<string, HTMLAudioElement>>(new Map())

  function bindPlayer(pieceTitle: string, player: HTMLAudioElement | null) {
    if (!player) {
      playersRef.current.delete(pieceTitle)
      return
    }
    playersRef.current.set(pieceTitle, player)
  }

  function handlePlay(currentTitle: string) {
    playersRef.current.forEach((player, title) => {
      if (title !== currentTitle) {
        player.pause()
      }
    })
  }

  return (
    <section className="entry-list piece-list" aria-label="Listado de piezas musicales">
      {pieces.map((piece) => (
        <article className="entry-card piece-card entry-card--primary" key={piece.title}>
          <h2>{piece.title}</h2>
          <p className="piece-description">{piece.description}</p>
          {piece.audioUrl ? (
            <audio
              className="piece-audio"
              controls
              preload="none"
              ref={(player) => bindPlayer(piece.title, player)}
              onPlay={() => handlePlay(piece.title)}
            >
              <source src={piece.audioUrl} type="audio/mpeg" />
              Tu navegador no soporta el elemento de audio.
            </audio>
          ) : (
            <p className="pending-audio">Audio pendiente de publicar</p>
          )}
        </article>
      ))}
    </section>
  )
}
