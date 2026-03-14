-- =============================================================================
-- Cron Jobs 설정 (Phase 3 — RSS/YouTube 자동 수집)
-- supabase/cron_setup.sql
--
-- 실행 전 필수:
--   1. Supabase 대시보드 > Database > Extensions > pg_cron 활성화
--   2. Supabase 대시보드 > Database > Extensions > pg_net  활성화
--   3. CRON_SECRET 값을 아래 두 곳에 직접 입력 후 실행
-- =============================================================================

-- 기존 job 삭제 (재실행 안전)
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname IN ('sync-rss-feeds', 'sync-youtube-videos');

-- RSS 동기화: 매 30분
-- anon key 사용 (CRON_SECRET 미설정 시 JWT 검증만)
SELECT cron.schedule(
  'sync-rss-feeds',
  '*/30 * * * *',
  $$
    SELECT net.http_post(
      url     := 'https://slpmknspczdbaowkuftx.supabase.co/functions/v1/sync-rss',
      headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNscG1rbnNwY3pkYmFvd2t1ZnR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNjI0NjksImV4cCI6MjA4ODgzODQ2OX0.34CpTCYofHtlxSXF4or11ObRS_O5IvPRiv6z_eZWM78"}'::jsonb,
      body    := '{}'::jsonb
    );
  $$
);

-- YouTube 동기화: 매 1시간
-- anon key 사용 (CRON_SECRET 미설정 시 JWT 검증만)
SELECT cron.schedule(
  'sync-youtube-videos',
  '0 * * * *',
  $$
    SELECT net.http_post(
      url     := 'https://slpmknspczdbaowkuftx.supabase.co/functions/v1/sync-youtube',
      headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNscG1rbnNwY3pkYmFvd2t1ZnR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNjI0NjksImV4cCI6MjA4ODgzODQ2OX0.34CpTCYofHtlxSXF4or11ObRS_O5IvPRiv6z_eZWM78"}'::jsonb,
      body    := '{}'::jsonb
    );
  $$
);

-- 등록 확인
SELECT jobid, jobname, schedule, active FROM cron.job ORDER BY jobid;

