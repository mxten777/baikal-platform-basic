# BAIKAL AI Content Platform — 샘플 데이터 문서

> **파일**: `supabase/sample_data.sql`  
> **용도**: 개발·스테이징 환경 초기 데이터 삽입  
> **버전**: v1.0 (2026-03-12)

---

## 1. 개요

`sample_data.sql`은 플랫폼의 두 핵심 테이블(`projects`, `contents`)에 현실적인 샘플 레코드를 채워 넣는 시드 스크립트입니다.  
UI 개발·QA·시연 시 빈 화면 없이 바로 동작하는 플랫폼을 확인할 수 있도록 설계되었습니다.

### 실행 방법

```sql
-- Supabase SQL Editor 또는 psql에서 실행
\i supabase/sample_data.sql
```

> **주의**: 프로덕션 DB에는 절대 실행하지 않습니다.  
> 테이블이 비어 있는 상태에서 실행해야 합니다 (slug 중복 시 오류 발생).

---

## 2. projects 테이블 — 샘플 6건

| # | slug | title | category | status | featured |
|---|------|-------|----------|--------|----------|
| 1 | `baikal-rag-search` | BAIKAL RAG 검색 시스템 | NLP | active | ✅ |
| 2 | `ai-content-classifier` | AI 콘텐츠 분류기 | AI Agent | active | ✅ |
| 3 | `llm-prompt-optimizer` | LLM 프롬프트 최적화 도구 | Platform / Infra | active | ✅ |
| 4 | `ai-meeting-summarizer` | AI 미팅 요약기 | NLP | active | ❌ |
| 5 | `vector-db-benchmark` | Vector DB 벤치마크 | Research / Experiment | active | ❌ |
| 6 | `ai-agent-workflow` | AI 에이전트 워크플로우 | AI Agent | active | ✅ |

### 카테고리 분포

| category | 건수 |
|----------|------|
| NLP | 2 |
| AI Agent | 2 |
| Platform / Infra | 1 |
| Research / Experiment | 1 |

> 카테고리 값은 `src/lib/constants.ts`의 `PROJECT_CATEGORIES`와 정확히 일치해야 합니다.  
> DB 컬럼값 ↔ 프론트엔드 필터값이 동일한 문자열을 사용합니다.

### tech_stack 요약

| 프로젝트 | 주요 기술 |
|---------|-----------|
| RAG 검색 시스템 | Python, LangChain, pgvector, OpenAI, FastAPI, React |
| 콘텐츠 분류기 | TypeScript, Supabase, OpenAI, LangChain, Deno |
| 프롬프트 최적화 | React, TypeScript, Python, FastAPI, PostgreSQL, Docker |
| 미팅 요약기 | Python, Whisper, GPT-4o, FastAPI, React, Slack API |
| Vector DB 벤치마크 | Python, pgvector, Pinecone, Weaviate, Qdrant, Jupyter |
| 에이전트 워크플로우 | Python, LangGraph, LangChain, OpenAI, Redis, FastAPI |

---

## 3. contents 테이블 — 샘플 12건

| # | slug | title | content_type | status | is_featured | published_at (상대) |
|---|------|-------|-------------|--------|-------------|---------------------|
| 1 | `rag-system-architecture-2026` | 2026년 RAG 시스템 아키텍처 가이드 | article | published | ✅ | -2일 |
| 2 | `langchain-vs-llamaindex-2026` | LangChain vs LlamaIndex | article | published | ✅ | -5일 |
| 3 | `supabase-vector-pgvector-setup` | Supabase + pgvector 벡터 DB 세팅 | article | published | ❌ | -8일 |
| 4 | `openai-gpt4o-mini-cost-optimization` | GPT-4o-mini로 LLM 비용 90% 줄이기 | article | published | ✅ | -12일 |
| 5 | `ai-agent-langraph-intro` | LangGraph로 AI 에이전트 상태 머신 만들기 | article | published | ❌ | -15일 |
| 6 | `baikal-platform-devlog-1` | [개발일지 #1] BAIKAL 플랫폼을 만드는 이유 | note | published | ✅ | -3일 |
| 7 | `python-fastapi-async-best-practices` | FastAPI 비동기 패턴 실전 가이드 | article | published | ❌ | -20일 |
| 8 | `typescript-type-safety-ai-apps` | AI 앱에서 TypeScript 타입 안정성 확보하기 | article | published | ❌ | -25일 |
| 9 | `x-post-llm-context-window-tip` | 컨텍스트 윈도우 활용 팁 3가지 | x_post | published | ❌ | -1일 |
| 10 | `x-post-rag-retrieval-precision` | RAG에서 검색 정확도를 높이는 방법 | x_post | published | ❌ | -4일 |
| 11 | `note-ai-product-ideation` | AI 제품 아이디어 발굴 프레임워크 | note | published | ✅ | -6일 |
| 12 | `research-embedding-model-comparison` | 임베딩 모델 비교 실험: OpenAI vs Cohere vs BGE | research | published | ✅ | -10일 |

### content_type 분포

| content_type | 건수 | 설명 |
|-------------|------|------|
| article | 7 | 기술 블로그 글 (본문 `body` 포함) |
| note | 2 | 짧은 개발일지 / 메모 |
| x_post | 2 | X(Twitter) 포스트 요약 (body = NULL) |
| research | 1 | 실험 / 리서치 기록 |

> `x_post` 타입은 `body` 컬럼이 `NULL`입니다. 프론트엔드는 `summary`만 렌더링합니다.

### is_featured 분포

- `is_featured = TRUE`: 6건 (메인 Featured 섹션에 표시)
- `is_featured = FALSE`: 6건 (일반 목록만 표시)

---

## 4. 데이터 설계 의도

### 현실적인 날짜 분산

모든 `published_at`은 `NOW() - INTERVAL 'N days'`로 설정되어 있어  
스크립트를 실행하는 시점 기준으로 자동으로 최근 날짜를 생성합니다.  
→ "최신순 정렬" UI가 항상 올바르게 동작합니다.

### 다양한 content_type 포함

공개 콘텐츠 페이지(`/content`)의 필터 탭(전체 / Article / Note / X Post / Research)이  
모두 데이터가 있는 상태로 표시되도록 각 타입을 포함했습니다.

### featured 믹스

홈페이지 Featured 섹션에 최소 4건 이상의 콘텐츠가 표시되어야 하므로  
`is_featured = TRUE` 레코드를 6건 확보했습니다.

### 프로젝트 category 전 범위 커버

5개 카테고리(`NLP`, `AI Agent`, `Platform / Infra`, `Research / Experiment`, `Computer Vision` 중 4개)를  
사용해 프로젝트 필터가 비어 있지 않도록 설계되었습니다.  
(`Computer Vision` 카테고리는 실제 프로젝트 추가 시 삽입 예정)

---

## 5. 관련 파일

| 파일 | 역할 |
|------|------|
| `supabase/migrations/20260312000001_init_schema.sql` | 테이블 스키마 정의 |
| `supabase/migrations/20260312000002_rls_policies.sql` | Row Level Security 정책 |
| `supabase/seed.sql` | 최소 시드 데이터 (카테고리 등 기준 데이터) |
| `supabase/sample_data.sql` | **이 문서** — 개발용 풍부한 샘플 데이터 |
| `src/lib/constants.ts` | `PROJECT_CATEGORIES` — DB 카테고리값과 동기화 필요 |
