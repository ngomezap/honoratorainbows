export type ContentKind = 'text' | 'quote'

export type ContentEntry = {
  kind: ContentKind
  title?: string
  lines: string[]
}

export const contentEntries: ContentEntry[] = [
  {
    kind: 'quote',
    lines: ['"La unica carrera que me interesa', 'es la de tus medias"'],
  },
  {
    kind: 'text',
    title: 'Ruido de taza',
    lines: [
      'La manana cabe en una taza pequena,',
      'humea lento sobre la mesa,',
      'y en el borde del silencio',
      'se despierta mi nombre.',
    ],
  },
  {
    kind: 'text',
    title: 'Ventana de febrero',
    lines: [
      'La luz entra en puntillas,',
      'como quien no quiere romper nada.',
      'Todo parece quieto,',
      'menos el pulso de las cortinas.',
    ],
  },
  {
    kind: 'text',
    title: 'Papel doblado',
    lines: [
      'Guardo palabras en el bolsillo,',
      'por si el dia se vuelve invierno.',
      'Cuando cae la tarde,',
      'las desdoblo y vuelve el fuego.',
    ],
  },
]
