-- =============================================================================
-- ai_content_outputs: hidden status + published_content_id + hidden_from_status
-- Migration: 20260809000002_ai_content_hidden.sql
-- =============================================================================

-- status CHECK에 hidden 추가
ALTER TABLE ai_content_outputs
  DROP CONSTRAINT ai_content_outputs_status_check;

ALTER TABLE ai_content_outputs
  ADD CONSTRAINT ai_content_outputs_status_check
    CHECK (status IN ('draft', 'approved', 'published', 'hidden'));

-- 공개 시 생성된 contents 레코드 ID 추적 (NULL = 미공개 or 구버전 레코드)
ALTER TABLE ai_content_outputs
  ADD COLUMN published_content_id UUID REFERENCES contents(id) ON DELETE SET NULL;

-- 숨김 전 원래 status 보존 (복원 시 사용)
ALTER TABLE ai_content_outputs
  ADD COLUMN hidden_from_status TEXT;

CREATE INDEX idx_ai_outputs_published_content
  ON ai_content_outputs(published_content_id)
  WHERE published_content_id IS NOT NULL;
