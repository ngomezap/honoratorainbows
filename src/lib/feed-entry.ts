export type KnownFeedKind = 'text' | 'quote' | 'audio' | 'photo'
export type FeedKind = KnownFeedKind | (string & {})

export interface FeedEntryBase<K extends FeedKind = FeedKind> {
  id?: string
  kind: K
  title?: string
}

export interface LinesFeedEntryBase<K extends 'text' | 'quote'> extends FeedEntryBase<K> {
  lines: string[]
}

export interface TextFeedEntry extends LinesFeedEntryBase<'text'> {
  title: string
}

export type QuoteFeedEntry = LinesFeedEntryBase<'quote'>

export interface AudioFeedEntry extends FeedEntryBase<'audio'> {
  title: string
  description?: string
  audioUrl?: string
}

export interface PhotoFeedEntry extends FeedEntryBase<'photo'> {
  title?: string
  description?: string
  imageUrl?: string
}

export interface GenericFeedEntry extends FeedEntryBase {
  lines?: string[]
  description?: string
  audioUrl?: string
  imageUrl?: string
}

export type FeedEntry = TextFeedEntry | QuoteFeedEntry | AudioFeedEntry | PhotoFeedEntry | GenericFeedEntry
