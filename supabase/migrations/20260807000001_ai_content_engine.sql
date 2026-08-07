-- =============================================================================
-- BAIKAL AI Content Engine — Core Tables
-- Migration: 20260807000001_ai_content_engine.sql
--
-- 신규 테이블: ai_contents, ai_content_outputs
-- 기존 테이블(contents, projects, media_assets) 수정 없음
-- =============================================================================

-- =============================================================================
-- ai_contents
-- AI Content Engine의 원본 콘텐츠 저장소
-- source_type에 따라 직접 입력(body) / blog 참조 / project 참조로 분기
-- =============================================================================
CREATE TABLE ai_contents (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT        NOT NULL,
  body              TEXT,                              -- direct 전용; blog/project는 NULL
  content_kind      TEXT        NOT NULL,              -- column | poem | notice | interview | product | meeting | tech_doc | case_study | article | project (CHECK 없음 — 확장 가능)
  source_type       TEXT        NOT NULL
                      CHECK (source_type IN ('direct', 'blog', 'project')),
  source_content_id UUID        REFERENCES contents(id)     ON DELETE SET NULL,
  source_project_id UUID        REFERENCES projects(id)     ON DELETE SET NULL,
  media_asset_id    UUID        REFERENCES media_assets(id) ON DELETE SET NULL,
  brand             TEXT        NOT NULL DEFAULT 'BAIKAL',
  status            TEXT        NOT NULL DEFAULT 'ready'
                      CHECK (status IN ('draft', 'ready')),
  created_by        UUID        NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- source_type별 필드 유효성 보장
  CONSTRAINT chk_ai_contents_direct
    CHECK (source_type != 'direct'  OR (body IS NOT NULL AND source_content_id IS NULL AND source_project_id IS NULL)),
  CONSTRAINT chk_ai_contents_blog
    CHECK (source_type != 'blog'    OR (source_content_id IS NOT NULL AND body IS NULL AND source_project_id IS NULL)),
  CONSTRAINT chk_ai_contents_project
    CHECK (source_type != 'project' OR (source_project_id IS NOT NULL AND body IS NULL AND source_content_id IS NULL))
);

CREATE INDEX idx_ai_contents_source_type    ON ai_contents(source_type);
CREATE INDEX idx_ai_contents_created_by     ON ai_contents(created_by);
CREATE INDEX idx_ai_contents_created_at     ON ai_contents(created_at DESC);
CREATE INDEX idx_ai_contents_source_content ON ai_contents(source_content_id) WHERE source_content_id IS NOT NULL;
CREATE INDEX idx_ai_contents_source_project ON ai_contents(source_project_id) WHERE source_project_id IS NOT NULL;

-- updated_at 자동 갱신 (기존 함수 재사용)
CREATE TRIGGER trg_ai_contents_updated_at
  BEFORE UPDATE ON ai_contents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- ai_content_outputs
-- AI가 생성한 채널별 Output 저장
-- 재생성 = 기존 행 UPDATE 아닌 신규 INSERT (이력 자동 보존)
-- channel에 CHECK 없음 — linkedin/newsletter/homepage 등 무중단 확장 가능
-- =============================================================================
CREATE TABLE ai_content_outputs (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_content_id  UUID        NOT NULL REFERENCES ai_contents(id) ON DELETE CASCADE,
  channel        TEXT        NOT NULL,                -- instagram | threads | naver_blog | reels | ... (자유값)
  purpose        TEXT        NOT NULL DEFAULT 'promotion',
  tone           TEXT        NOT NULL DEFAULT 'professional',
  output_text    TEXT,                                -- AI 생성 결과
  edited_text    TEXT,                                -- 관리자 수정본 (NULL이면 output_text 사용)
  status         TEXT        NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft', 'approved', 'published')),
  created_by     UUID        NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_outputs_content_id ON ai_content_outputs(ai_content_id);
CREATE INDEX idx_ai_outputs_channel    ON ai_content_outputs(channel);
CREATE INDEX idx_ai_outputs_status     ON ai_content_outputs(status);
CREATE INDEX idx_ai_outputs_created_at ON ai_content_outputs(created_at DESC);

-- =============================================================================
-- RLS
-- 두 테이블 모두 관리자 전용 — 공개 읽기 없음
-- 기존 is_admin() 함수 재사용
-- =============================================================================
ALTER TABLE ai_contents        ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_content_outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_ai_contents"
  ON ai_contents FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "admin_all_ai_content_outputs"
  ON ai_content_outputs FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
