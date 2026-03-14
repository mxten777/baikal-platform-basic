-- =============================================================================
-- BAIKAL AI Content Platform - Sample Data
-- Supabase SQL Editor에서 실행하세요
-- =============================================================================

-- =====================
-- 샘플 프로젝트 6개
-- =====================
INSERT INTO projects (
  slug, title, subtitle, description, category,
  status, featured, tech_stack, sort_order, thumbnail_url
) VALUES
(
  'baikal-rag-search',
  'BAIKAL RAG 검색 시스템',
  '기업 내부 문서를 AI로 검색하는 RAG 파이프라인',
  '## 개요

기업 내부 문서(PDF, Word, 웹페이지)를 벡터 임베딩으로 인덱싱하고,
자연어 질문으로 정확한 답변을 생성하는 RAG(Retrieval-Augmented Generation) 시스템입니다.

## 주요 기능

- 다양한 문서 포맷 자동 파싱 (PDF, DOCX, HTML)
- OpenAI text-embedding-3-small 기반 벡터 검색
- LangChain + pgvector를 활용한 시맨틱 검색
- GPT-4o 기반 답변 생성 및 출처 인용

## 성과

- 검색 정확도 87% 달성
- 평균 응답 시간 1.2초',
  'NLP',
  'active', TRUE,
  ARRAY['Python', 'LangChain', 'pgvector', 'OpenAI', 'FastAPI', 'React'],
  1,
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80'
),
(
  'ai-content-classifier',
  'AI 콘텐츠 분류기',
  'SNS/블로그 콘텐츠 자동 카테고리 분류 시스템',
  '## 개요

멀티채널(X, Instagram, RSS, YouTube)에서 수집된 콘텐츠를
AI로 자동 분류하고 중복 제거하는 파이프라인입니다.

## 주요 기능

- 다중 채널 콘텐츠 수집 자동화
- GPT-4o-mini 기반 카테고리 분류
- 의미적 중복 탐지 (코사인 유사도 0.92 이상 제거)
- Supabase Edge Functions 기반 실시간 처리

## 기술 스택

LangChain, Supabase, TypeScript, OpenAI API를 조합해
서버리스 아키텍처로 구축했습니다.',
  'AI Agent',
  'active', TRUE,
  ARRAY['TypeScript', 'Supabase', 'OpenAI', 'LangChain', 'Deno'],
  2,
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80'
),
(
  'llm-prompt-optimizer',
  'LLM 프롬프트 최적화 도구',
  '프롬프트 버전 관리 및 A/B 테스트 플랫폼',
  '## 개요

LLM 프롬프트를 체계적으로 관리하고 성능을 측정하는 도구입니다.
버전 관리, A/B 테스트, 비용 추적을 한 곳에서 처리합니다.

## 주요 기능

- 프롬프트 버전 관리 (Git-like 히스토리)
- 자동화된 A/B 테스트 실행
- 토큰 비용 추적 및 최적화 제안
- 여러 LLM 모델 비교 (GPT-4o, Claude, Gemini)

## 현황

현재 내부 개발 도구로 활용 중이며
오픈소스 공개를 준비 중입니다.',
  'Platform / Infra',
  'active', TRUE,
  ARRAY['React', 'TypeScript', 'Python', 'FastAPI', 'PostgreSQL', 'Docker'],
  3,
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&q=80'
),
(
  'ai-meeting-summarizer',
  'AI 미팅 요약기',
  '회의 녹음을 자동으로 요약하고 액션 아이템을 추출',
  '## 개요

Zoom/Google Meet 회의 녹음 파일을 업로드하면
Whisper로 전사하고 GPT-4o로 요약 및 액션 아이템을 자동 추출합니다.

## 주요 기능

- OpenAI Whisper 기반 다국어 음성 인식
- 화자 분리 (Pyannote Audio)
- 자동 회의록 생성 및 액션 아이템 추출
- Slack/Notion 연동 자동 발송

## 도전 과제

한국어 기술 용어의 정확한 인식을 위해
커스텀 vocabulary를 추가하는 작업이 핵심이었습니다.',
  'NLP',
  'active', FALSE,
  ARRAY['Python', 'Whisper', 'GPT-4o', 'FastAPI', 'React', 'Slack API'],
  4,
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80'
),
(
  'vector-db-benchmark',
  'Vector DB 벤치마크',
  'pgvector, Pinecone, Weaviate 성능 비교 실험',
  '## 개요

RAG 시스템 구축 시 Vector DB 선택을 위한 체계적인 벤치마크 실험입니다.
100만 개 벡터 기준 검색 속도, 정확도, 비용을 비교했습니다.

## 실험 대상

- pgvector (PostgreSQL 확장)
- Pinecone (매니지드 서비스)
- Weaviate (오픈소스)
- Qdrant (오픈소스)

## 주요 결과

중소규모(< 100만 벡터) 환경에서는 pgvector가
비용 대비 가장 우수한 성능을 보였습니다.',
  'Research / Experiment',
  'active', FALSE,
  ARRAY['Python', 'pgvector', 'Pinecone', 'Weaviate', 'Qdrant', 'Jupyter'],
  5,
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80'
),
(
  'ai-agent-workflow',
  'AI 에이전트 워크플로우',
  '멀티 에이전트 협업으로 복잡한 업무를 자동화',
  '## 개요

여러 AI 에이전트가 협업하여 리서치 → 분석 → 보고서 작성까지
자동으로 처리하는 워크플로우 시스템입니다.

## 아키텍처

- Orchestrator 에이전트: 전체 태스크 분배 및 조율
- Research 에이전트: 웹 검색 및 정보 수집
- Analyst 에이전트: 데이터 분석 및 인사이트 도출
- Writer 에이전트: 최종 보고서 작성

## 기술

LangGraph를 사용해 에이전트 상태 머신을 구현했으며
각 에이전트 간 메모리 공유를 위해 Redis를 활용했습니다.',
  'AI Agent',
  'active', TRUE,
  ARRAY['Python', 'LangGraph', 'LangChain', 'OpenAI', 'Redis', 'FastAPI'],
  6,
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&q=80'
)
ON CONFLICT (slug) DO NOTHING;

-- =====================
-- 샘플 콘텐츠 12개
-- =====================
INSERT INTO contents (
  slug, title, summary, body, content_type,
  status, is_featured, published_at, thumbnail_url
) VALUES
(
  'rag-system-architecture-2026',
  '2026년 RAG 시스템 아키텍처 가이드',
  'Naive RAG에서 Advanced RAG, Modular RAG까지 — 실전에서 검증된 아키텍처 패턴과 선택 기준을 정리했습니다.',
  '## RAG 시스템의 진화

2023년 ChatGPT 등장 이후 RAG는 기업 AI 도입의 핵심 패턴이 됐습니다.
하지만 단순한 Naive RAG로는 한계가 명확합니다.

## Naive RAG의 한계

- 고정된 chunk 크기로 인한 문맥 손실
- 단순 코사인 유사도만으로는 부족한 검색 정확도
- 멀티홉 질문 처리 불가

## Advanced RAG 패턴

### HyDE (Hypothetical Document Embedding)
질문으로 가상의 답변 문서를 먼저 생성하고,
그 임베딩으로 실제 문서를 검색합니다.

```python
hypothetical_doc = llm.generate(f"질문: {query}에 대한 이상적인 답변:")
search_results = vector_store.similarity_search(hypothetical_doc)
```

### Reranking
검색된 청크를 Cross-Encoder 모델로 재정렬하여 정확도를 높입니다.

## 결론

프로젝트 규모와 요구사항에 따라 적절한 RAG 패턴을 선택하는 것이 중요합니다.
< 10만 문서: Naive RAG + Reranking
10만~1000만: Advanced RAG + HyDE
> 1000만: Modular RAG + 커스텀 파이프라인',
  'article',
  'published', TRUE,
  NOW() - INTERVAL '2 days',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80'
),
(
  'langchain-vs-llamaindex-2026',
  'LangChain vs LlamaIndex — 2026년 현재 어떤 걸 써야 할까',
  '두 프레임워크의 최신 버전 기준 실제 개발 경험을 비교합니다. 각각 어떤 상황에 적합한지 구체적인 기준을 제시합니다.',
  '## 들어가며

2026년 현재 두 프레임워크는 많이 성숙했습니다.
하지만 여전히 "어떤 걸 써야 하나"는 질문을 많이 받습니다.

## LangChain의 강점

- 풍부한 통합 (200+ 제공자)
- 에이전트/체인 구성의 유연성
- 활발한 커뮤니티와 생태계

## LlamaIndex의 강점

- RAG에 특화된 비율 높은 완성도
- 데이터 커넥터와 인덱스 전략의 다양성
- 더 간결한 RAG 파이프라인 구축 코드

## 선택 기준

**LangChain을 선택하세요:**
→ 복잡한 에이전트 워크플로우가 필요할 때
→ 다양한 외부 도구 통합이 필요할 때




**LlamaIndex를 선택하세요:**
→ 순수 RAG 시스템 구축에 집중할 때
→ 코드 간결성이 중요할 때',
  'article',
  'published', TRUE,
  NOW() - INTERVAL '5 days',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80'
),
(
  'supabase-vector-pgvector-setup',
  'Supabase + pgvector로 5분 만에 벡터 DB 세팅하기',
  'Pinecone 없이도 됩니다. Supabase의 pgvector 확장을 활용해 무료로 프로덕션급 벡터 검색 환경을 구축하는 방법입니다.',
  '## 왜 pgvector인가

Pinecone은 강력하지만 비쌉니다.
소규모~중규모 프로젝트에서는 pgvector가 최고의 선택입니다.

## 세팅 방법

### 1. 확장 활성화

```sql
create extension if not exists vector;
```

### 2. 테이블 생성

```sql
create table documents (
  id bigserial primary key,
  content text,
  embedding vector(1536)
);
```

### 3. 인덱스 생성

```sql
create index on documents
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);
```

### 4. 검색 쿼리

```sql
select content
from documents
order by embedding <=> $1
limit 5;
```

## 성능 팁

- lists는 sqrt(row_count)로 설정
- probes는 lists의 10%로 시작
- 100만 벡터까지는 ivfflat, 그 이상은 hnsw 고려',
  'article',
  'published', FALSE,
  NOW() - INTERVAL '8 days',
  NULL
),
(
  'openai-gpt4o-mini-cost-optimization',
  'GPT-4o-mini로 LLM 비용 90% 줄이기',
  '모든 요청에 GPT-4o를 쓸 필요는 없습니다. 태스크별 모델 라우팅으로 품질은 유지하면서 비용을 대폭 절감하는 전략을 공유합니다.',
  '## 문제: LLM 비용이 너무 비싸다

GPT-4o는 강력하지만 토큰당 비용이 높습니다.
모든 요청에 GPT-4o를 사용하면 월 수백만원이 나올 수도 있습니다.

## 해법: 모델 라우팅

태스크의 복잡도에 따라 적절한 모델을 선택합니다.

### GPT-4o-mini로 처리할 수 있는 것들

- 간단한 분류 작업 (카테고리, 감성 분석)
- 짧은 텍스트 요약
- 포맷 변환 (JSON 구조화)
- 간단한 Q&A

### GPT-4o가 필요한 것들

- 복잡한 추론이 필요한 분석
- 긴 문서의 정교한 요약
- 코드 생성 및 리뷰
- 멀티스텝 에이전트 실행

## 실제 비용 비교

동일한 파이프라인에서:
- 전체 GPT-4o: 월 $320
- 라우팅 적용: 월 $34 (90% 절감)',
  'article',
  'published', TRUE,
  NOW() - INTERVAL '12 days',
  NULL
),
(
  'ai-agent-langraph-intro',
  'LangGraph로 AI 에이전트 상태 머신 만들기',
  'ReAct 패턴의 한계를 넘어 — LangGraph를 사용해 복잡한 멀티스텝 에이전트를 안정적으로 구축하는 방법을 소개합니다.',
  '## 왜 LangGraph인가

기존 LangChain AgentExecutor는 단순한 ReAct 루프입니다.
복잡한 분기 처리, 병렬 실행, 인간 개입이 필요하면 한계가 명확합니다.

LangGraph는 에이전트를 **상태 머신(State Machine)**으로 모델링합니다.

## 핵심 개념

- **State**: 에이전트의 현재 상태 (TypedDict)
- **Node**: 상태를 변환하는 함수
- **Edge**: 노드 간 전환 조건

## 기본 예제

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict

class AgentState(TypedDict):
    messages: list
    next_action: str

graph = StateGraph(AgentState)
graph.add_node("researcher", research_node)
graph.add_node("writer", writer_node)
graph.add_conditional_edges(
    "researcher",
    lambda state: state["next_action"],
    {"write": "writer", "end": END}
)
```

## 장점

- 복잡한 워크플로우를 시각적으로 표현 가능
- Human-in-the-loop 쉽게 구현
- 에러 복구 및 재시도 로직 구조화',
  'article',
  'published', FALSE,
  NOW() - INTERVAL '15 days',
  NULL
),
(
  'baikal-platform-devlog-1',
  '[개발일지 #1] BAIKAL 플랫폼을 만드는 이유',
  '왜 또 새로운 플랫폼인가. AI 개발 과정을 기록하고 공유하는 플랫폼을 직접 만들어야겠다고 결심한 배경을 공유합니다.',
  '## 시작점

AI 프로젝트를 계속 만들다 보니 한 가지 문제가 생겼습니다.
만드는 과정에서 얻은 인사이트가 어딘가에 정리되지 않고 사라진다는 것입니다.

노션에 정리해봤지만 외부와 공유하기 어렵고,
블로그에 쓰면 SEO도 안 되고 콘텐츠가 분산됩니다.

## 해결책: 직접 만들자

개발 과정을 기록하고, 공유하고, SEO로 성장하는 플랫폼.
AI가 도와주니까 혼자서도 충분히 만들 수 있습니다.

## 기술 스택 선택

- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Deployment**: Vercel
- **AI 연동**: OpenAI API

## 목표

6개월 안에 이 플랫폼 자체가 SEO 트래픽을 발생시키는 것.
콘텐츠가 쌓일수록 강해지는 플랫폼을 만들겠습니다.',
  'note',
  'published', TRUE,
  NOW() - INTERVAL '3 days',
  NULL
),
(
  'python-fastapi-async-best-practices',
  'FastAPI 비동기 패턴 실전 가이드',
  'async/await를 제대로 활용해야 FastAPI의 성능이 납니다. 흔한 실수와 올바른 패턴을 정리했습니다.',
  '## FastAPI와 비동기

FastAPI는 ASGI 기반입니다. 하지만 async를 잘못 쓰면 오히려 성능이 저하됩니다.

## 흔한 실수

### 동기 함수를 async로 래핑

```python
# 잘못된 예
@app.get("/items")
async def get_items():
    return sync_db_query()  # blocking!

# 올바른 예
@app.get("/items")
async def get_items():
    return await async_db_query()
```

### CPU-bound 작업을 async로 처리

CPU 집약적 작업은 `run_in_executor`로 스레드풀에 위임해야 합니다.

```python
import asyncio
from concurrent.futures import ThreadPoolExecutor

executor = ThreadPoolExecutor()

@app.get("/compute")
async def heavy_compute():
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(executor, cpu_intensive_task)
    return result
```

## 올바른 패턴

- DB 쿼리: asyncpg, SQLAlchemy async 사용
- HTTP 요청: httpx.AsyncClient 사용
- 파일 I/O: aiofiles 사용',
  'article',
  'published', FALSE,
  NOW() - INTERVAL '20 days',
  NULL
),
(
  'typescript-type-safety-ai-apps',
  'AI 앱에서 TypeScript 타입 안정성 확보하기',
  'LLM API 응답은 항상 불확실합니다. Zod와 TypeScript로 AI 앱의 타입 안정성을 확보하는 실전 패턴을 소개합니다.',
  '## 문제: LLM 응답은 신뢰할 수 없다

```typescript
const response = await openai.chat.completions.create({...})
const data = JSON.parse(response.choices[0].message.content) // 타입 없음!
```

LLM이 항상 올바른 JSON을 반환한다는 보장이 없습니다.

## 해법: Zod로 런타임 검증

```typescript
import { z } from "zod"

const ProjectSchema = z.object({
  title: z.string(),
  category: z.enum(["NLP", "Vision", "Agent"]),
  tech_stack: z.array(z.string()),
  confidence: z.number().min(0).max(1),
})

type Project = z.infer<typeof ProjectSchema>

function parseAIResponse(raw: string): Project {
  const parsed = JSON.parse(raw)
  return ProjectSchema.parse(parsed) // 실패시 ZodError throw
}
```

## 구조화된 출력 활용

OpenAI의 Structured Outputs를 사용하면 JSON Schema를 강제할 수 있습니다.

```typescript
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  response_format: { type: "json_schema", json_schema: {...} },
})
```',
  'article',
  'published', FALSE,
  NOW() - INTERVAL '25 days',
  NULL
),
(
  'x-post-llm-context-window-tip',
  '컨텍스트 윈도우 최대한 활용하는 팁 3가지',
  'GPT-4o의 128k 컨텍스트를 제대로 활용하지 못하고 있다면: 1) 중요 내용 앞뒤 배치 2) 롤링 요약 3) 청크 overlap 조정. 이것만 해도 답변 품질이 확 달라집니다.',
  NULL,
  'x_post',
  'published', FALSE,
  NOW() - INTERVAL '1 day',
  NULL
),
(
  'x-post-rag-retrieval-precision',
  'RAG에서 검색 정확도를 높이는 방법',
  'RAG 시스템의 검색 정확도를 높이는 핵심은 청킹 전략입니다. 문장 단위 청킹 + 슬라이딩 윈도우(overlap 20%) 조합이 대부분의 케이스에서 best. 오늘 실험으로 확인했습니다.',
  NULL,
  'x_post',
  'published', FALSE,
  NOW() - INTERVAL '4 days',
  NULL
),
(
  'note-ai-product-ideation',
  'AI 제품 아이디어 발굴 프레임워크',
  'AI 제품을 기획할 때 사용하는 개인 프레임워크를 공유합니다. "어떤 반복 작업을 AI로 대체하면 가치가 15분/일 이상 절약되는가"를 기준으로 시작합니다.',
  '## AI 제품 아이디어 찾는 법

### 프레임워크

1. **반복 작업 목록 만들기**: 매일/매주 반복하는 작업 10개 나열
2. **시간 측정**: 각 작업에 소요되는 시간 측정
3. **AI 가능성 평가**: LLM/Vision/Speech로 자동화 가능한지 검토
4. **가치 계산**: 절약 시간 × 시급 = 월 절약 금액

### 필터 기준

- 월 절약 금액 > $30: 개인 도구로 만들 가치 있음
- 월 절약 금액 > $300: SaaS로 만들 가치 있음
- 월 절약 금액 > $3,000: 즉시 프로젝트 시작

### 실제 적용 예시

**회의 요약**: 팀원 5명 × 2시간/주 × $30/시간 = $300/월 절약
→ AI 미팅 요약기 프로젝트 시작 결정',
  'note',
  'published', TRUE,
  NOW() - INTERVAL '6 days',
  NULL
),
(
  'research-embedding-model-comparison',
  '임베딩 모델 비교 실험: OpenAI vs Cohere vs BGE',
  '한국어 RAG 시스템을 위한 임베딩 모델 선택 기준 — 3가지 모델을 동일한 데이터셋으로 실험했습니다.',
  '## 실험 목적

한국어 기술 문서 RAG 시스템에 가장 적합한 임베딩 모델을 찾기 위한 비교 실험입니다.

## 실험 환경

- 데이터셋: 기술 블로그 포스트 500개 (한국어 70%, 영어 30%)
- 평가 지표: Recall@5, MRR@10
- 평가 쿼리: 인간이 작성한 100개의 질문-정답 쌍

## 모델

| 모델 | 차원 | 비용/1M 토큰 |
|------|------|-------------|
| text-embedding-3-small | 1536 | $0.02 |
| text-embedding-3-large | 3072 | $0.13 |
| Cohere embed-multilingual-v3 | 1024 | $0.10 |
| BGE-M3 (로컬) | 1024 | 무료 |

## 결과

한국어 기술 문서 기준:
- **Recall@5**: BGE-M3 > text-embedding-3-large > Cohere > text-embedding-3-small
- **비용 효율**: BGE-M3 (무료, 로컬) 압도적 우위

## 결론

한국어 중심이라면 BGE-M3를 로컬에서 실행하는 것이 비용 대비 최선.
API 의존성 없이 사용 가능한 점도 장점입니다.',
  'research',
  'published', TRUE,
  NOW() - INTERVAL '10 days',
  NULL
)
ON CONFLICT (slug) DO NOTHING;
