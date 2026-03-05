PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS poems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'poem' CHECK (type IN ('poem', 'quote')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS feed_items (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('photo', 'poem', 'audio')),
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted')),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  caption TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS photo_items (
  item_id TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  blurhash TEXT,
  alt_text TEXT,
  FOREIGN KEY (item_id) REFERENCES feed_items(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audio_items (
  item_id TEXT PRIMARY KEY,
  audio_url TEXT NOT NULL,
  duration_ms INTEGER CHECK (duration_ms > 0),
  codec TEXT,
  mime_type TEXT,
  bitrate_kbps INTEGER,
  waveform_json TEXT,
  transcript TEXT,
  FOREIGN KEY (item_id) REFERENCES feed_items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_feed_items_type_created
  ON feed_items (type, created_at DESC);
