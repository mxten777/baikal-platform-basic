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
-- ⚠️  YOUR_CRON_SECRET_HERE 를 실제 시크릿으로 교체하세요
SELECT cron.schedule(
  'sync-rss-feeds',
  '*/30 * * * *',
  $$
    SELECT net.http_post(
      url     := 'https://slpmknspczdbaowkuftx.supabase.co/functions/v1/sync-rss',
      headers := '{"Content-Type":"application/json","Authorization":"Bearer YOUR_CRON_SECRET_HERE"}'::jsonb,
      body    := '{}'::jsonb
    );
  $$
);

-- YouTube 동기화: 매 1시간
-- ⚠️  YOUR_CRON_SECRET_HERE 를 실제 시크릿으로 교체하세요
SELECT cron.schedule(
  'sync-youtube-videos',
  '0 * * * *',
  $$
    SELECT net.http_post(
      url     := 'https://slpmknspczdbaowkuftx.supabase.co/functions/v1/sync-youtube',
      headers := '{"Content-Type":"application/json","Authorization":"Bearer YOUR_CRON_SECRET_HERE"}'::jsonb,
      body    := '{}'::jsonb
    );
  $$
);

-- 등록 확인
SELECT jobid, jobname, schedule, active FROM cron.job ORDER BY jobid;

