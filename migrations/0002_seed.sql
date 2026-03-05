PRAGMA foreign_keys = ON;

-- poemas (perfil poet)
INSERT INTO poems (slug, title, body, type, created_at) VALUES
  ('niebla-de-enero', 'Niebla de enero', 'La calle se dobla\nsobre un charco de luz', 'poem', strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  ('nota-breve', 'Nota breve', 'Todo lo que callo\nrespira en el margen', 'quote', strftime('%Y-%m-%dT%H:%M:%fZ','now'));

-- audio demo (perfil producer)
INSERT INTO feed_items (id, author_id, type, visibility, status, caption, created_at, updated_at)
VALUES ('audio-demo-1', 'admin', 'audio', 'public', 'published', 'Resonancia I', strftime('%Y-%m-%dT%H:%M:%fZ','now'), strftime('%Y-%m-%dT%H:%M:%fZ','now'));

INSERT INTO audio_items (item_id, audio_url, mime_type, duration_ms, transcript)
VALUES (
  'audio-demo-1',
  '/audio/aberrantrealities-organic-flow-1015-remastered-485950.mp3',
  'audio/mpeg',
  120000,
  'Demo local de audio'
);

-- foto demo (perfil photographer/fotografo)
INSERT INTO feed_items (id, author_id, type, visibility, status, caption, created_at, updated_at)
VALUES ('photo-demo-1', 'admin', 'photo', 'public', 'published', 'Bruma en la costa', strftime('%Y-%m-%dT%H:%M:%fZ','now'), strftime('%Y-%m-%dT%H:%M:%fZ','now'));

INSERT INTO photo_items (item_id, image_url, alt_text)
VALUES (
  'photo-demo-1',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200',
  'Costa con bruma al amanecer'
);
