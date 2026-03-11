-- =============================================================================
-- Migration 003: 헬퍼 함수
-- supabase/migrations/20260312000003_cron_jobs.sql
--
-- NOTE: pg_cron 설정은 Supabase 대시보드에서 Extensions 활성화 후
--       supabase/cron_setup.sql 을 별도 실행하세요 (Phase 3).
-- =============================================================================

-- 소스 에러 카운트 증가 함수
-- Edge Function에서 supabase.rpc('increment_error_count', { source_id: '...' }) 로 호출
CREATE OR REPLACE FUNCTION increment_error_count(source_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE content_sources
  SET error_count = COALESCE(error_count, 0) + 1
  WHERE id = source_id;
END;
$$;

