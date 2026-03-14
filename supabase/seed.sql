-- =============================================================================
-- BAIKAL AI Content Platform - Seed Data
-- supabase/seed.sql
-- =============================================================================

-- 기본 저자
INSERT INTO authors (id, name, bio, website, x_handle)
VALUES (
  gen_random_uuid(),
  '바이칼시스템즈',
  'AI 소프트웨어 개발 회사',
  'https://www.baikalsys.kr',
  '@baikalsys'
);

-- 기본 태그
INSERT INTO tags (slug, name, color) VALUES
  ('ai', 'AI', '#3b82f6'),
  ('llm', 'LLM', '#8b5cf6'),
  ('nlp', 'NLP', '#06b6d4'),
  ('computer-vision', 'Computer Vision', '#10b981'),
  ('ai-agent', 'AI Agent', '#f59e0b'),
  ('python', 'Python', '#84cc16'),
  ('langchain', 'LangChain', '#64748b'),
  ('rag', 'RAG', '#ec4899'),
  ('fastapi', 'FastAPI', '#22c55e'),
  ('react', 'React', '#0ea5e9'),
  ('typescript', 'TypeScript', '#3b82f6'),
  ('supabase', 'Supabase', '#22c55e'),
  ('open-source', 'Open Source', '#a3a3a3'),
  ('tutorial', 'Tutorial', '#f97316'),
  ('research', 'Research', '#ef4444');

-- 기본 토픽
INSERT INTO topics (slug, title, description, sort_order) VALUES
  ('llm-development', 'LLM 개발', 'Large Language Model 개발 기술과 실전 기록', 1),
  ('ai-agent', 'AI 에이전트', '자율 AI 에이전트 설계 및 구현', 2),
  ('rag-systems', 'RAG 시스템', '검색 증강 생성(RAG) 아키텍처 및 구현', 3),
  ('ai-platform', 'AI 플랫폼', 'AI 서비스 플랫폼 개발 및 인프라', 4),
  ('nlp-applications', 'NLP 응용', '자연어처리 실전 응용 프로젝트', 5);

-- 기본 수집 소스
-- 바이칼 공식 블로그 (아직 운영 전 — is_active = FALSE)
INSERT INTO content_sources (id, name, source_type, url, is_active, sync_interval_minutes)
VALUES (
  'c617ccc2-0000-0000-0000-000000000001',
  '바이칼 공식 블로그',
  'rss',
  'https://www.baikalsys.kr/blog/rss.xml',
  FALSE,
  60
);

-- 네이버 블로그 (운영 중 — is_active = TRUE)
INSERT INTO content_sources (id, name, source_type, url, is_active, sync_interval_minutes)
VALUES (
  'ee63c773-299a-4262-aedc-2954d57e3eb1',
  '네이버 블로그 - jngdy',
  'rss',
  'https://rss.blog.naver.com/jngdy',
  TRUE,
  30
);

-- rss_sources: 네이버 블로그 RSS 피드 등록
INSERT INTO rss_sources (source_id, feed_url, feed_type, site_name, language)
VALUES (
  'ee63c773-299a-4262-aedc-2954d57e3eb1',
  'https://rss.blog.naver.com/jngdy',
  'rss2',
  '네이버 블로그 - jngdy',
  'ko'
);
