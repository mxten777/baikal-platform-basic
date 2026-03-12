-- =============================================================================
-- BAIKAL AI Content Platform - Page Views Analytics
-- Migration: 20260312000004_page_views.sql
-- =============================================================================

-- 방문 로그 테이블 (개인정보 미수집 - session_id는 브라우저 세션 임시 UUID)
CREATE TABLE IF NOT EXISTS page_views (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  path        text        NOT NULL,
  session_id  text        NOT NULL,   -- sessionStorage UUID (탭 닫으면 소멸)
  referrer    text,
  viewed_at   timestamptz NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_page_views_path       ON page_views (path);
CREATE INDEX idx_page_views_viewed_at  ON page_views (viewed_at DESC);
CREATE INDEX idx_page_views_session    ON page_views (session_id);

-- =============================================================================
-- RLS
-- =============================================================================
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- 누구나 INSERT 가능 (익명 방문 기록)
CREATE POLICY "public_insert_page_views"
  ON page_views FOR INSERT
  WITH CHECK (true);

-- 관리자만 SELECT
CREATE POLICY "admin_read_page_views"
  ON page_views FOR SELECT
  USING (is_admin());

-- 관리자만 DELETE (오래된 로그 정리용)
CREATE POLICY "admin_delete_page_views"
  ON page_views FOR DELETE
  USING (is_admin());
