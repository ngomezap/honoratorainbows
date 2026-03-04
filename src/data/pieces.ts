export type Piece = {
  title: string
  description: string
  audioUrl?: string
}

export const pieces: Piece[] = [
  {
    title: 'Organic Flow 1015 (Remastered)',
    description:
      'Primera pieza de muestra publicada en el feed para validar reproduccion y estilo visual.',
    audioUrl: '/audio/aberrantrealities-organic-flow-1015-remastered-485950.mp3',
  },
  {
    title: 'Pieza en desarrollo II',
    description: 'Boceto ritmico para revisar la estructura del feed y el espacio de descripcion.',
  },
  {
    title: 'Pieza en desarrollo III',
    description: 'Maqueta minimal con enfoque en capas y respiracion sonora. Audio pendiente de exportar.',
  },
]
