-- =============================================================================
-- BAIKAL AI Content Platform - RLS Policies
-- Migration: 20260312000002_rls_policies.sql
-- =============================================================================

-- Helper: admin 여부 확인
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
    FALSE
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- =============================================================================
-- projects
-- =============================================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_active_projects"
  ON projects FOR SELECT
  USING (status IN ('active', 'archived'));

CREATE POLICY "admin_all_projects"
  ON projects FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- =============================================================================
-- contents
-- =============================================================================
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_published_contents"
  ON contents FOR SELECT
  USING (status = 'published');

CREATE POLICY "admin_all_contents"
  ON contents FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- =============================================================================
-- collections
-- =============================================================================
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_collections"
  ON collections FOR SELECT
  USING (is_public = TRUE);

CREATE POLICY "admin_all_collections"
  ON collections FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- =============================================================================
-- tags / topics
-- =============================================================================
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_tags" ON tags FOR SELECT USING (TRUE);
CREATE POLICY "admin_all_tags" ON tags FOR ALL USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_topics" ON topics FOR SELECT USING (is_public = TRUE);
CREATE POLICY "admin_all_topics" ON topics FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- =============================================================================
-- media_assets
-- =============================================================================
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_media"
  ON media_assets FOR SELECT
  USING (is_public = TRUE);

CREATE POLICY "admin_all_media"
  ON media_assets FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- =============================================================================
-- Relation tables (content_project_map, content_tag_map, topic_tag_map)
-- =============================================================================
ALTER TABLE content_project_map ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_cpm" ON content_project_map FOR SELECT USING (TRUE);
CREATE POLICY "admin_all_cpm" ON content_project_map FOR ALL USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE content_tag_map ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_ctm" ON content_tag_map FOR SELECT USING (TRUE);
CREATE POLICY "admin_all_ctm" ON content_tag_map FOR ALL USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE topic_tag_map ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_ttm" ON topic_tag_map FOR SELECT USING (TRUE);
CREATE POLICY "admin_all_ttm" ON topic_tag_map FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- =============================================================================
-- content_sources, rss_sources, social_accounts (admin only)
-- =============================================================================
ALTER TABLE content_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_all_sources" ON content_sources FOR ALL USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE rss_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_all_rss_sources" ON rss_sources FOR ALL USING (is_admin()) WITH CHECK (is_admin());

ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_all_social" ON social_accounts FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- =============================================================================
-- sync_jobs (admin only)
-- =============================================================================
ALTER TABLE sync_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_all_jobs" ON sync_jobs FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- =============================================================================
-- seo_pages
-- =============================================================================
ALTER TABLE seo_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_seo" ON seo_pages FOR SELECT USING (TRUE);
CREATE POLICY "admin_all_seo" ON seo_pages FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- =============================================================================
-- redirects (public read for middleware)
-- =============================================================================
ALTER TABLE redirects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_redirects" ON redirects FOR SELECT USING (TRUE);
CREATE POLICY "admin_all_redirects" ON redirects FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- =============================================================================
-- analytics_events (insert only for all, read for admin)
-- =============================================================================
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_insert_events" ON analytics_events FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "admin_read_events" ON analytics_events FOR SELECT USING (is_admin());

-- =============================================================================
-- authors
-- =============================================================================
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_authors" ON authors FOR SELECT USING (TRUE);
CREATE POLICY "admin_all_authors" ON authors FOR ALL USING (is_admin()) WITH CHECK (is_admin());
