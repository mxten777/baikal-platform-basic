-- =============================================================================
-- BAIKAL AI Content Platform - Initial Schema Migration
-- Migration: 20260312000001_init_schema.sql
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- Full-text search trigram

-- =============================================================================
-- authors
-- =============================================================================
CREATE TABLE authors (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  bio         TEXT,
  avatar_url  TEXT,
  website     TEXT,
  x_handle    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- collections (시리즈/컬렉션) - contents보다 먼저 생성
-- =============================================================================
CREATE TABLE collections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  thumbnail_url TEXT,
  is_public     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- projects
-- =============================================================================
CREATE TABLE projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  subtitle      TEXT,
  description   TEXT,
  status        TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'active', 'archived', 'coming_soon')),
  category      TEXT,
  tech_stack    TEXT[] DEFAULT '{}',
  demo_url      TEXT,
  repo_url      TEXT,
  thumbnail_url TEXT,
  og_image_url  TEXT,
  featured      BOOLEAN DEFAULT FALSE,
  sort_order    INT DEFAULT 0,
  launched_at   TIMESTAMPTZ,
  meta_title    TEXT,
  meta_desc     TEXT,
  metrics       JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_slug      ON projects(slug);
CREATE INDEX idx_projects_status    ON projects(status);
CREATE INDEX idx_projects_featured  ON projects(featured) WHERE featured = TRUE;
CREATE INDEX idx_projects_category  ON projects(category);
CREATE INDEX idx_projects_sort      ON projects(sort_order, created_at DESC);

-- =============================================================================
-- content_sources
-- =============================================================================
CREATE TABLE content_sources (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   TEXT NOT NULL,
  source_type            TEXT NOT NULL
                           CHECK (source_type IN ('rss', 'x', 'instagram', 'youtube', 'naver', 'manual', 'webhook')),
  url                    TEXT,
  handle                 TEXT,
  config                 JSONB DEFAULT '{}',
  is_active              BOOLEAN DEFAULT TRUE,
  last_synced_at         TIMESTAMPTZ,
  sync_interval_minutes  INT DEFAULT 60,
  error_count            INT DEFAULT 0,
  created_at             TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sources_type   ON content_sources(source_type);
CREATE INDEX idx_sources_active ON content_sources(is_active) WHERE is_active = TRUE;

-- =============================================================================
-- rss_sources (content_sources의 RSS 전용 확장)
-- =============================================================================
CREATE TABLE rss_sources (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id      UUID REFERENCES content_sources(id) ON DELETE CASCADE,
  feed_url       TEXT NOT NULL,
  feed_type      TEXT DEFAULT 'rss2'
                   CHECK (feed_type IN ('rss2', 'atom', 'json_feed')),
  site_name      TEXT,
  language       TEXT DEFAULT 'ko',
  last_etag      TEXT,
  last_modified  TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- social_accounts
-- =============================================================================
CREATE TABLE social_accounts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id        UUID REFERENCES content_sources(id),
  platform         TEXT NOT NULL
                     CHECK (platform IN ('x', 'instagram', 'youtube', 'naver')),
  account_id       TEXT,
  access_token     TEXT,
  refresh_token    TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes           TEXT[] DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- contents (핵심 통합 콘텐츠 테이블)
-- =============================================================================
CREATE TABLE contents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  summary       TEXT,
  body          TEXT,
  content_type  TEXT NOT NULL
                  CHECK (content_type IN (
                    'article', 'note', 'experiment', 'research',
                    'rss', 'x_post', 'instagram', 'youtube',
                    'external_link', 'curated'
                  )),
  source_id     UUID REFERENCES content_sources(id),
  source_url    TEXT,
  source_raw    JSONB,
  thumbnail_url TEXT,
  og_image_url  TEXT,
  embed_html    TEXT,
  author_id     UUID REFERENCES authors(id),
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'published', 'rejected', 'archived')),
  published_at  TIMESTAMPTZ,
  is_featured   BOOLEAN DEFAULT FALSE,
  is_pinned     BOOLEAN DEFAULT FALSE,
  external_id   TEXT,
  content_hash  TEXT,
  lang          TEXT DEFAULT 'ko',
  view_count    INT DEFAULT 0,
  meta_title    TEXT,
  meta_desc     TEXT,
  canonical_url TEXT,
  series_id     UUID REFERENCES collections(id),
  series_order  INT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contents_slug       ON contents(slug);
CREATE INDEX idx_contents_status     ON contents(status);
CREATE INDEX idx_contents_type       ON contents(content_type);
CREATE INDEX idx_contents_published  ON contents(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_contents_hash       ON contents(content_hash);
CREATE INDEX idx_contents_external   ON contents(external_id) WHERE external_id IS NOT NULL;
CREATE INDEX idx_contents_source     ON contents(source_id);
CREATE INDEX idx_contents_series     ON contents(series_id);
CREATE INDEX idx_contents_featured   ON contents(is_featured) WHERE is_featured = TRUE;
-- Full-text search index (Korean + English)
CREATE INDEX idx_contents_fts ON contents USING gin(
  to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(summary, ''))
);

-- =============================================================================
-- tags
-- =============================================================================
CREATE TABLE tags (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  color       TEXT DEFAULT '#6B7280',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tags_slug ON tags(slug);

-- =============================================================================
-- topics
-- =============================================================================
CREATE TABLE topics (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  body          TEXT,
  thumbnail_url TEXT,
  og_image_url  TEXT,
  meta_title    TEXT,
  meta_desc     TEXT,
  sort_order    INT DEFAULT 0,
  is_public     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_topics_slug ON topics(slug);

-- =============================================================================
-- media_assets
-- =============================================================================
CREATE TABLE media_assets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename      TEXT NOT NULL,
  storage_path  TEXT NOT NULL,
  public_url    TEXT NOT NULL,
  asset_type    TEXT NOT NULL
                  CHECK (asset_type IN ('image', 'video', 'reel', 'presentation', 'og_image', 'thumbnail')),
  bucket        TEXT NOT NULL
                  CHECK (bucket IN ('public-media', 'project-assets', 'draft-assets', 'og-images')),
  mime_type     TEXT,
  file_size     INT,
  width         INT,
  height        INT,
  duration_sec  INT,
  alt_text      TEXT,
  caption       TEXT,
  project_id    UUID REFERENCES projects(id),
  content_id    UUID REFERENCES contents(id),
  tags          TEXT[] DEFAULT '{}',
  is_public     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_type    ON media_assets(asset_type);
CREATE INDEX idx_media_project ON media_assets(project_id);
CREATE INDEX idx_media_content ON media_assets(content_id);
CREATE INDEX idx_media_bucket  ON media_assets(bucket);

-- =============================================================================
-- Relation tables
-- =============================================================================

-- 콘텐츠 ↔ 프로젝트 연결
CREATE TABLE content_project_map (
  content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  relation   TEXT DEFAULT 'related'
               CHECK (relation IN ('primary', 'related', 'mentions')),
  PRIMARY KEY (content_id, project_id)
);

CREATE INDEX idx_cpm_project ON content_project_map(project_id);
CREATE INDEX idx_cpm_content ON content_project_map(content_id);

-- 콘텐츠 ↔ 태그 연결
CREATE TABLE content_tag_map (
  content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
  tag_id     UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (content_id, tag_id)
);

CREATE INDEX idx_ctm_tag     ON content_tag_map(tag_id);
CREATE INDEX idx_ctm_content ON content_tag_map(content_id);

-- 토픽 ↔ 태그 연결
CREATE TABLE topic_tag_map (
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  tag_id   UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (topic_id, tag_id)
);

-- =============================================================================
-- sync_jobs
-- =============================================================================
CREATE TABLE sync_jobs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id     UUID REFERENCES content_sources(id),
  job_type      TEXT NOT NULL
                  CHECK (job_type IN ('rss', 'x', 'youtube', 'instagram', 'manual')),
  status        TEXT NOT NULL DEFAULT 'running'
                  CHECK (status IN ('running', 'completed', 'failed', 'partial')),
  started_at    TIMESTAMPTZ DEFAULT NOW(),
  finished_at   TIMESTAMPTZ,
  items_fetched INT DEFAULT 0,
  items_new     INT DEFAULT 0,
  items_skipped INT DEFAULT 0,
  items_failed  INT DEFAULT 0,
  error_log     JSONB DEFAULT '[]',
  retry_count   INT DEFAULT 0,
  next_retry_at TIMESTAMPTZ,
  triggered_by  TEXT DEFAULT 'scheduled'
                  CHECK (triggered_by IN ('scheduled', 'manual', 'webhook'))
);

CREATE INDEX idx_jobs_source  ON sync_jobs(source_id);
CREATE INDEX idx_jobs_status  ON sync_jobs(status);
CREATE INDEX idx_jobs_started ON sync_jobs(started_at DESC);

-- =============================================================================
-- seo_pages
-- =============================================================================
CREATE TABLE seo_pages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_path        TEXT UNIQUE NOT NULL,
  meta_title      TEXT,
  meta_desc       TEXT,
  og_title        TEXT,
  og_desc         TEXT,
  og_image_url    TEXT,
  canonical_url   TEXT,
  structured_data JSONB,
  no_index        BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_seo_path ON seo_pages(url_path);

-- =============================================================================
-- redirects
-- =============================================================================
CREATE TABLE redirects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_path   TEXT UNIQUE NOT NULL,
  to_path     TEXT NOT NULL,
  status_code INT DEFAULT 301
                CHECK (status_code IN (301, 302, 307, 308)),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_redirects_from ON redirects(from_path);

-- =============================================================================
-- analytics_events
-- =============================================================================
CREATE TABLE analytics_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type  TEXT NOT NULL,
  entity_type TEXT,
  entity_id   UUID,
  url_path    TEXT,
  referrer    TEXT,
  user_agent  TEXT,
  ip_hash     TEXT,
  session_id  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_type    ON analytics_events(event_type);
CREATE INDEX idx_events_entity  ON analytics_events(entity_type, entity_id);
CREATE INDEX idx_events_created ON analytics_events(created_at DESC);

-- =============================================================================
-- updated_at auto-trigger
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_contents_updated_at
  BEFORE UPDATE ON contents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_seo_pages_updated_at
  BEFORE UPDATE ON seo_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
