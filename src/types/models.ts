// =============================================================================
// BAIKAL AI Content Platform - Domain Model Types
// src/types/models.ts
// =============================================================================

export type ProjectStatus = 'draft' | 'active' | 'archived' | 'coming_soon'
export type ContentType =
  | 'article'
  | 'note'
  | 'experiment'
  | 'research'
  | 'rss'
  | 'x_post'
  | 'instagram'
  | 'youtube'
  | 'external_link'
  | 'curated'
export type ContentStatus = 'pending' | 'approved' | 'published' | 'rejected' | 'archived'
export type MediaAssetType = 'image' | 'video' | 'reel' | 'presentation' | 'og_image' | 'thumbnail'
export type MediaBucket = 'public-media' | 'project-assets' | 'draft-assets' | 'og-images'
export type SyncJobStatus = 'running' | 'completed' | 'failed' | 'partial'
export type SourceType = 'rss' | 'x' | 'instagram' | 'youtube' | 'naver' | 'manual' | 'webhook'
export type Platform = 'x' | 'instagram' | 'youtube' | 'naver'

// =============================================================================
// Core Entities
// =============================================================================

export interface Project {
  id: string
  slug: string
  title: string
  subtitle?: string
  description?: string
  status: ProjectStatus
  category?: string
  tech_stack: string[]
  demo_url?: string
  repo_url?: string
  thumbnail_url?: string
  og_image_url?: string
  featured: boolean
  sort_order: number
  launched_at?: string
  meta_title?: string
  meta_desc?: string
  metrics: Record<string, unknown>
  created_at: string
  updated_at: string
  // Joined fields
  tags?: Tag[]
  related_contents?: Content[]
  content_project_map?: ContentProjectMapEntry[]
  media_assets?: MediaAsset[]
}

export interface ContentProjectMapEntry {
  relation: 'primary' | 'related' | 'mentions'
  content: Content
}

export interface Content {
  id: string
  slug: string
  title: string
  summary?: string
  body?: string
  content_type: ContentType
  source_id?: string
  source_url?: string
  source_raw?: Record<string, unknown>
  thumbnail_url?: string
  og_image_url?: string
  embed_html?: string
  author_id?: string
  status: ContentStatus
  published_at?: string
  is_featured: boolean
  is_pinned: boolean
  external_id?: string
  content_hash?: string
  lang: string
  view_count: number
  meta_title?: string
  meta_desc?: string
  canonical_url?: string
  series_id?: string
  series_order?: number
  created_at: string
  updated_at: string
  // Joined fields
  tags?: Tag[]
  projects?: Project[]
  author?: Author
  source?: ContentSource
  series?: Collection
}

export interface Tag {
  id: string
  slug: string
  name: string
  description?: string
  color: string
  created_at: string
}

export interface Topic {
  id: string
  slug: string
  title: string
  description?: string
  body?: string
  thumbnail_url?: string
  og_image_url?: string
  meta_title?: string
  meta_desc?: string
  sort_order: number
  is_public: boolean
  created_at: string
  // Joined
  tags?: Tag[]
  contents?: Content[]
}

export interface MediaAsset {
  id: string
  filename: string
  storage_path: string
  public_url: string
  asset_type: MediaAssetType
  bucket: MediaBucket
  mime_type?: string
  file_size?: number
  width?: number
  height?: number
  duration_sec?: number
  alt_text?: string
  caption?: string
  project_id?: string
  content_id?: string
  tags: string[]
  is_public: boolean
  created_at: string
}

export interface ContentSource {
  id: string
  name: string
  source_type: SourceType
  url?: string
  handle?: string
  config: Record<string, unknown>
  is_active: boolean
  last_synced_at?: string
  sync_interval_minutes: number
  error_count: number
  created_at: string
}

export interface SyncJob {
  id: string
  source_id?: string
  job_type: string
  status: SyncJobStatus
  started_at: string
  finished_at?: string
  items_fetched: number
  items_new: number
  items_skipped: number
  items_failed: number
  error_log: SyncErrorEntry[]
  retry_count: number
  next_retry_at?: string
  triggered_by: 'scheduled' | 'manual' | 'webhook'
  // Joined fields
  source?: ContentSource
}

export interface SyncErrorEntry {
  item_id?: string
  url?: string
  error: string
  message: string
  occurred_at: string
}

export interface Collection {
  id: string
  slug: string
  title: string
  description?: string
  thumbnail_url?: string
  is_public: boolean
  created_at: string
}

export interface Author {
  id: string
  name: string
  bio?: string
  avatar_url?: string
  website?: string
  x_handle?: string
  created_at: string
}

export interface SeoPage {
  id: string
  url_path: string
  meta_title?: string
  meta_desc?: string
  og_title?: string
  og_desc?: string
  og_image_url?: string
  canonical_url?: string
  structured_data?: Record<string, unknown>
  no_index: boolean
  created_at: string
  updated_at: string
}

// =============================================================================
// Aggregator Types
// =============================================================================

export interface RawItem {
  external_id: string
  title: string
  summary?: string
  body?: string
  source_url: string
  author?: string
  thumbnail_url?: string
  published_at?: string
  embed_html?: string
  raw_data: Record<string, unknown>
}

export interface NormalizedItem {
  slug: string
  title: string
  summary: string
  source_url: string
  source_id: string
  content_type: ContentType
  thumbnail_url?: string
  published_at?: string
  external_id: string
  content_hash: string
  source_raw: Record<string, unknown>
  embed_html?: string
  lang: string
}

// =============================================================================
// API Response Types
// =============================================================================

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  per_page: number
  total_pages: number
}

export interface ContentFilters {
  content_type?: ContentType | ContentType[]
  tag?: string
  project?: string
  topic?: string
  lang?: string
  page?: number
  per_page?: number
  search?: string
}

export interface ProjectFilters {
  category?: string
  tag?: string
  featured?: boolean
  status?: ProjectStatus
}
