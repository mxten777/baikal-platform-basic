-- =============================================================================
-- contents.content_type CHECK 확장: threads, facebook 추가
-- Migration: 20260809000001_contents_type_threads_facebook.sql
-- =============================================================================

ALTER TABLE contents
  DROP CONSTRAINT contents_content_type_check,
  ADD  CONSTRAINT contents_content_type_check
       CHECK (content_type IN (
         'article', 'note', 'experiment', 'research',
         'rss', 'x_post', 'instagram', 'threads', 'facebook', 'youtube',
         'external_link', 'curated'
       ));
