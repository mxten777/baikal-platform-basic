-- =============================================================================
-- BAIKAL AI Content Platform - Media Files Metadata
-- Migration: 20260312000005_media_files.sql
-- =============================================================================

CREATE TABLE media_files (
  storage_key   TEXT PRIMARY KEY,          -- Supabase Storage에 저장된 파일명 (UUID 기반)
  original_name TEXT NOT NULL,             -- 업로드 시 원본 파일명
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 불필요 (admin만 사용)
CREATE POLICY "admin_all_media_files"
  ON media_files FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
