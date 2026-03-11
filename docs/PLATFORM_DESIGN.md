# BAIKAL AI Content Platform — 전체 설계 문서

> **회사**: 바이칼시스템즈 (BAIKAL SYSTEMS)  
> **사이트**: https://www.baikalsys.kr  
> **버전**: v1.0 (2026-03-12)  
> **성격**: 자기확장형 AI 개발 콘텐츠 플랫폼 (Content OS)

---

## 1. 프로젝트 개요

### 1.1 정의

BAIKAL AI Content Platform은 단순 회사소개 홈페이지가 아니다.  
바이칼시스템즈의 공식 홈페이지이면서 동시에 다음 기능을 수행하는 **자기확장형 콘텐츠 플랫폼**이다.

| 레이어 | 역할 |
|--------|------|
| Brand Site Layer | 회사 소개, 서비스, 핵심 CTA |
| Project Portfolio Layer | AI MVP 포트폴리오 축적 |
| Content Knowledge Layer | 블로그, 기술문서, 실험노트, 연구기록 |
| Aggregation Layer | RSS, SNS, 외부 채널 수집·정규화·연결 |

### 1.2 핵심 목표

1. 앞으로 개발할 AI MVP 프로젝트를 지속 축적하여 **신뢰 자산화**
2. 외부 채널(블로그, X, 인스타그램, 유튜브 등)로 퍼지는 콘텐츠를 **홈페이지 안으로 회수·자산화**
3. 시간이 지날수록 **SEO 자산이 누적**되는 구조
4. 향후 개별 랜딩페이지/서비스 사이트에 **재사용 가능한 공통 콘텐츠 엔진** 확보

### 1.3 기술 스택

```
Frontend:   Vite + React 18 + TypeScript + TailwindCSS
Platform:   Supabase (PostgreSQL + Storage + Auth + Edge Functions)
Deploy:     Vercel (Frontend) + Supabase Cloud (Backend)
CI/CD:      GitHub Actions
```

---

## 2. 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                     BAIKAL Content OS                          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Brand Site  │  │  Portfolio   │  │  Content Knowledge   │  │
│  │  Layer       │  │  Layer       │  │  Layer               │  │
│  │  /about      │  │  /projects   │  │  /lab  /content      │  │
│  │  /services   │  │  /topics     │  │  /archive  /media    │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Aggregation Layer                        │  │
│  │   RSS → | X(Twitter) → | YouTube → | Instagram →         │  │
│  │   Naver →  Fetch → Normalize → Deduplicate → Store        │  │
│  │                    ↓                                      │  │
│  │              Admin CMS Review → Publish                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Supabase (Data & Auth Layer)                 │  │
│  │  PostgreSQL | Storage | Auth | Edge Functions | Realtime  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

외부 채널
  ├─ 네이버 블로그/카페 RSS
  ├─ 회사 블로그 RSS
  ├─ X(Twitter) API v2
  ├─ YouTube Data API v3
  ├─ Instagram Graph API
  └─ 수기 등록 (Admin CMS)

배포
  ├─ Vercel — Frontend (React + Vite)
  ├─ Supabase Cloud — DB, Storage, Edge Functions
  └─ GitHub — 소스 관리, CI/CD 트리거
```

### 2.1 데이터 흐름

```
[외부 채널] 
    ↓ Scheduled Edge Function (Cron)
[Fetch & Normalize]
    ↓
[Supabase DB: contents 테이블 (status=pending)]
    ↓
[Admin CMS 검수 & 승인]
    ↓
[contents (status=published)]
    ↓
[Public 페이지 노출 + SEO 반영]
```

---

## 3. 사이트 정보 구조 (IA)

```
/
├─ /about                          # 회사 소개, 팀, 기업 가치
├─ /services                       # 서비스 목록, 개발 영역
│
├─ /projects                       # AI MVP 포트폴리오 목록
│   ├─ /projects/:slug             # 프로젝트 상세 (관련 콘텐츠 연결)
│   ├─ /projects/category/:cat     # 카테고리별 필터
│   └─ /projects/tag/:tag          # 태그별 필터
│
├─ /lab                            # 기술/연구 콘텐츠
│   ├─ /lab/articles               # 기술 아티클
│   ├─ /lab/notes                  # 개발 노트 (짧은 글)
│   ├─ /lab/experiments            # 실험 기록
│   └─ /lab/research               # 연구 기록
│
├─ /content                        # 전체 콘텐츠 허브
│   ├─ /content/all                # 모든 채널 통합 피드
│   ├─ /content/blog               # 블로그 글
│   ├─ /content/rss                # RSS 수집 콘텐츠
│   ├─ /content/x                  # X(Twitter) 큐레이션
│   ├─ /content/instagram          # Instagram 큐레이션
│   └─ /content/youtube            # YouTube 영상
│
├─ /media                          # 미디어 자산 허브
│   ├─ /media/videos               # 영상 목록
│   ├─ /media/images               # 이미지 갤러리
│   ├─ /media/reels                # 숏폼/릴스
│   └─ /media/presentations        # 발표자료
│
├─ /topics                         # 토픽(기술 주제) 허브
│   └─ /topics/:slug               # 토픽 상세 + 관련 콘텐츠
│
├─ /archive                        # 날짜 기반 아카이브
│   ├─ /archive/year/:year         # 연도별
│   └─ /archive/month/:yyyy-mm     # 월별
│
├─ /contact                        # 문의
│
├─ /api                            # (내부 API routes, public 노출 없음)
│   ├─ /api/rss.xml                # 사이트 RSS 피드
│   ├─ /api/sitemap.xml            # 사이트맵
│   └─ /api/og                     # OG 이미지 생성
│
└─ /admin                          # 관리자 CMS (인증 필요)
    ├─ /admin/dashboard
    ├─ /admin/contents
    ├─ /admin/projects
    ├─ /admin/media
    ├─ /admin/tags
    ├─ /admin/topics
    ├─ /admin/sources
    ├─ /admin/sync-jobs
    ├─ /admin/seo
    └─ /admin/settings
```

### 3.1 URL Slug 정책

- 소문자, 영문, 숫자, 하이픈만 허용: `[a-z0-9-]`
- 공백 → 하이픈 변환
- 특수문자 제거
- 최대 100자
- 중복 시 `-2`, `-3` suffix 자동 부여
- 변경 시 `redirects` 테이블에 301 등록 필수

---

## 4. 데이터베이스 설계

### 4.1 전체 ERD 개요

```
projects ──< content_project_map >── contents
   │                                      │
   │                                content_tag_map
   └──< media_assets >──              tags ──< topic_tag_map >── topics
                                      │
                               content_sources
                                      │
                               rss_sources / social_accounts
                                      │
                               sync_jobs
```

### 4.2 테이블 상세

---

#### `projects` — AI MVP 프로젝트

**목적**: 각 AI 프로젝트의 마스터 데이터. 포트폴리오의 핵심 단위.

```sql
CREATE TABLE projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  subtitle      TEXT,
  description   TEXT,                    -- 마크다운 지원
  status        TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','active','archived','coming_soon')),
  category      TEXT,                    -- 'nlp','vision','agent','platform' 등
  tech_stack    TEXT[],                  -- ['Python','FastAPI','LangChain']
  demo_url      TEXT,
  repo_url      TEXT,
  thumbnail_url TEXT,
  og_image_url  TEXT,
  featured      BOOLEAN DEFAULT FALSE,
  sort_order    INT DEFAULT 0,
  launched_at   TIMESTAMPTZ,
  meta_title    TEXT,
  meta_desc     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_featured ON projects(featured) WHERE featured = TRUE;
CREATE INDEX idx_projects_category ON projects(category);
```

**확장 포인트**: `metrics` JSONB 컬럼으로 DAU, 평가 점수 등 동적 KPI 저장 가능.

---

#### `contents` — 통합 콘텐츠 (핵심 테이블)

**목적**: 모든 채널의 콘텐츠를 단일 모델로 정규화하여 저장. 플랫폼의 중심 테이블.

```sql
CREATE TABLE contents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  summary         TEXT,                    -- 요약 (자동 생성 또는 수기)
  body            TEXT,                    -- 마크다운 본문 (내부 원고 또는 큐레이션 해설)
  content_type    TEXT NOT NULL
                    CHECK (content_type IN (
                      'article','note','experiment','research',
                      'rss','x_post','instagram','youtube',
                      'external_link','curated'
                    )),
  source_id       UUID REFERENCES content_sources(id),
  source_url      TEXT,                    -- 원문 URL (외부 채널)
  source_raw      JSONB,                   -- 원문 원본 보존 (수집 당시 raw data)
  thumbnail_url   TEXT,
  og_image_url    TEXT,
  embed_html      TEXT,                    -- YouTube/Instagram 임베드 코드
  author_id       UUID REFERENCES authors(id),
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','published','rejected','archived')),
  published_at    TIMESTAMPTZ,
  is_featured     BOOLEAN DEFAULT FALSE,
  is_pinned       BOOLEAN DEFAULT FALSE,
  external_id     TEXT,                    -- 외부 채널 고유 ID (중복 방지용)
  content_hash    TEXT,                    -- SHA256(source_url + title) (중복 감지)
  lang            TEXT DEFAULT 'ko',
  view_count      INT DEFAULT 0,
  meta_title      TEXT,
  meta_desc       TEXT,
  canonical_url   TEXT,                    -- canonical 지정 (외부가 원문인 경우)
  series_id       UUID REFERENCES collections(id),
  series_order    INT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contents_slug ON contents(slug);
CREATE INDEX idx_contents_status ON contents(status);
CREATE INDEX idx_contents_type ON contents(content_type);
CREATE INDEX idx_contents_published ON contents(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_contents_hash ON contents(content_hash);
CREATE INDEX idx_contents_external ON contents(external_id) WHERE external_id IS NOT NULL;
CREATE INDEX idx_contents_source ON contents(source_id);
CREATE INDEX idx_contents_series ON contents(series_id);
```

---

#### `content_sources` — 콘텐츠 수집 소스

**목적**: 어떤 채널에서 수집하는지 소스 메타데이터 관리.

```sql
CREATE TABLE content_sources (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  source_type   TEXT NOT NULL
                  CHECK (source_type IN ('rss','x','instagram','youtube','naver','manual','webhook')),
  url           TEXT,                      -- RSS URL 또는 채널 URL
  handle        TEXT,                      -- @username 또는 channel_id
  config        JSONB DEFAULT '{}',        -- 채널별 설정 (API key ref, polling interval 등)
  is_active     BOOLEAN DEFAULT TRUE,
  last_synced_at TIMESTAMPTZ,
  sync_interval_minutes INT DEFAULT 60,
  error_count   INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sources_type ON content_sources(source_type);
CREATE INDEX idx_sources_active ON content_sources(is_active) WHERE is_active = TRUE;
```

---

#### `media_assets` — 미디어 자산

**목적**: 이미지, 영상, 발표자료 등 모든 미디어 파일 메타데이터 관리.

```sql
CREATE TABLE media_assets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename      TEXT NOT NULL,
  storage_path  TEXT NOT NULL,             -- Supabase Storage path
  public_url    TEXT NOT NULL,
  asset_type    TEXT NOT NULL
                  CHECK (asset_type IN ('image','video','reel','presentation','og_image','thumbnail')),
  bucket        TEXT NOT NULL
                  CHECK (bucket IN ('public-media','project-assets','draft-assets','og-images')),
  mime_type     TEXT,
  file_size     INT,
  width         INT,
  height        INT,
  duration_sec  INT,                       -- 영상 길이(초)
  alt_text      TEXT,                      -- 접근성 + SEO
  caption       TEXT,
  project_id    UUID REFERENCES projects(id),
  content_id    UUID REFERENCES contents(id),
  tags          TEXT[],
  is_public     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_type ON media_assets(asset_type);
CREATE INDEX idx_media_project ON media_assets(project_id);
CREATE INDEX idx_media_content ON media_assets(content_id);
CREATE INDEX idx_media_bucket ON media_assets(bucket);
```

---

#### `tags` — 태그

**목적**: 콘텐츠와 프로젝트를 연결하는 분류 단위.

```sql
CREATE TABLE tags (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  color       TEXT DEFAULT '#6B7280',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tags_slug ON tags(slug);
```

---

#### `topics` — 토픽 (기술 주제 허브)

**목적**: 태그보다 상위 개념. 기술 주제별 랜딩 페이지 생성.

```sql
CREATE TABLE topics (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  body          TEXT,                      -- 토픽 소개 마크다운
  thumbnail_url TEXT,
  og_image_url  TEXT,
  meta_title    TEXT,
  meta_desc     TEXT,
  sort_order    INT DEFAULT 0,
  is_public     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_topics_slug ON topics(slug);
```

---

#### `content_project_map` — 콘텐츠 ↔ 프로젝트 연결

```sql
CREATE TABLE content_project_map (
  content_id  UUID REFERENCES contents(id) ON DELETE CASCADE,
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
  relation    TEXT DEFAULT 'related'
                CHECK (relation IN ('primary','related','mentions')),
  PRIMARY KEY (content_id, project_id)
);

CREATE INDEX idx_cpm_project ON content_project_map(project_id);
CREATE INDEX idx_cpm_content ON content_project_map(content_id);
```

---

#### `content_tag_map` — 콘텐츠 ↔ 태그 연결

```sql
CREATE TABLE content_tag_map (
  content_id  UUID REFERENCES contents(id) ON DELETE CASCADE,
  tag_id      UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (content_id, tag_id)
);

CREATE INDEX idx_ctm_tag ON content_tag_map(tag_id);
```

---

#### `collections` — 시리즈/컬렉션

**목적**: 연재글, 시리즈형 콘텐츠 묶음.

```sql
CREATE TABLE collections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  thumbnail_url TEXT,
  is_public     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

#### `rss_sources` — RSS 소스 전용 확장

```sql
CREATE TABLE rss_sources (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id       UUID REFERENCES content_sources(id) ON DELETE CASCADE,
  feed_url        TEXT NOT NULL,
  feed_type       TEXT DEFAULT 'rss2'
                    CHECK (feed_type IN ('rss2','atom','json_feed')),
  site_name       TEXT,
  language        TEXT DEFAULT 'ko',
  last_etag       TEXT,
  last_modified   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

#### `social_accounts` — SNS 계정 연동

```sql
CREATE TABLE social_accounts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id     UUID REFERENCES content_sources(id),
  platform      TEXT NOT NULL
                  CHECK (platform IN ('x','instagram','youtube','naver')),
  account_id    TEXT,
  access_token  TEXT,                      -- 암호화 저장 필요 (Vault 또는 env)
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes        TEXT[],
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

#### `sync_jobs` — 동기화 작업 로그

**목적**: 각 수집 작업의 실행 기록, 성공/실패, 재시도 관리.

```sql
CREATE TABLE sync_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id       UUID REFERENCES content_sources(id),
  job_type        TEXT NOT NULL
                    CHECK (job_type IN ('rss','x','youtube','instagram','manual')),
  status          TEXT NOT NULL DEFAULT 'running'
                    CHECK (status IN ('running','completed','failed','partial')),
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  finished_at     TIMESTAMPTZ,
  items_fetched   INT DEFAULT 0,
  items_new       INT DEFAULT 0,
  items_skipped   INT DEFAULT 0,
  items_failed    INT DEFAULT 0,
  error_log       JSONB DEFAULT '[]',
  retry_count     INT DEFAULT 0,
  next_retry_at   TIMESTAMPTZ,
  triggered_by    TEXT DEFAULT 'scheduled'
                    CHECK (triggered_by IN ('scheduled','manual','webhook'))
);

CREATE INDEX idx_jobs_source ON sync_jobs(source_id);
CREATE INDEX idx_jobs_status ON sync_jobs(status);
CREATE INDEX idx_jobs_started ON sync_jobs(started_at DESC);
```

---

#### `seo_pages` — SEO 메타 오버라이드

**목적**: 특정 URL에 대한 커스텀 SEO 메타 데이터 관리.

```sql
CREATE TABLE seo_pages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_path        TEXT UNIQUE NOT NULL,    -- '/projects/my-project'
  meta_title      TEXT,
  meta_desc       TEXT,
  og_title        TEXT,
  og_desc         TEXT,
  og_image_url    TEXT,
  canonical_url   TEXT,
  structured_data JSONB,                   -- JSON-LD
  no_index        BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_seo_path ON seo_pages(url_path);
```

---

#### `redirects` — 리다이렉트 관리

```sql
CREATE TABLE redirects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_path   TEXT UNIQUE NOT NULL,
  to_path     TEXT NOT NULL,
  status_code INT DEFAULT 301
                CHECK (status_code IN (301, 302, 307, 308)),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_redirects_from ON redirects(from_path);
```

---

#### `analytics_events` — 내부 분석 이벤트

```sql
CREATE TABLE analytics_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type  TEXT NOT NULL,               -- 'page_view','content_view','project_view'
  entity_type TEXT,                        -- 'content','project','topic'
  entity_id   UUID,
  url_path    TEXT,
  referrer    TEXT,
  user_agent  TEXT,
  ip_hash     TEXT,                        -- SHA256(IP), 개인정보 비저장
  session_id  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_type ON analytics_events(event_type);
CREATE INDEX idx_events_entity ON analytics_events(entity_type, entity_id);
CREATE INDEX idx_events_created ON analytics_events(created_at DESC);
```

---

#### `authors` — 저자 정보

```sql
CREATE TABLE authors (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  bio         TEXT,
  avatar_url  TEXT,
  website     TEXT,
  x_handle    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4.3 RLS(Row Level Security) 기본 정책

```sql
-- contents: published만 public 조회 가능
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read published contents"
  ON contents FOR SELECT
  USING (status = 'published');

CREATE POLICY "admin full access contents"
  ON contents FOR ALL
  USING (auth.role() = 'service_role' OR
         EXISTS (
           SELECT 1 FROM auth.users
           WHERE auth.users.id = auth.uid()
           AND (auth.users.raw_user_meta_data->>'role') = 'admin'
         ));

-- projects: active만 public 조회 가능
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read active projects"
  ON projects FOR SELECT
  USING (status IN ('active','archived'));

CREATE POLICY "admin full access projects"
  ON projects FOR ALL
  USING (auth.role() = 'service_role' OR
         EXISTS (
           SELECT 1 FROM auth.users
           WHERE auth.users.id = auth.uid()
           AND (auth.users.raw_user_meta_data->>'role') = 'admin'
         ));
```

---

## 5. Content Aggregator 설계

### 5.1 파이프라인 전체 흐름

```
[Trigger]
    │ (Cron: 매 30분 또는 수동)
    ▼
[Fetch Stage]
    │ - 채널별 Adapter 호출
    │ - 원문 데이터 수신
    ▼
[Normalize Stage]
    │ - 채널별 포맷 → Canonical Content Model 변환
    │ - title, summary, source_url, published_at, thumbnail_url 추출
    ▼
[Clean Stage]
    │ - HTML 태그 제거 (텍스트 추출)
    │ - 불필요 whitespace 정리
    │ - URL 정규화
    ▼
[Deduplicate Stage]
    │ - content_hash = SHA256(source_url + title) 계산
    │ - DB에서 동일 hash 조회 → 존재 시 skip
    │ - external_id 기반 중복 체크 (YouTube video_id 등)
    ▼
[Classify Stage]
    │ - content_type 자동 분류 (source_type 기반)
    │ - 공통 키워드 매칭으로 tag 자동 추천
    │ - project 키워드 매칭으로 project 연결 후보 추천
    ▼
[Enrich Stage]
    │ - OG 이미지 추출 (외부 URL fetch)
    │ - 썸네일 저장 (Supabase Storage)
    │ - 길이 계산, 언어 감지
    ▼
[Store Stage]
    │ - contents 테이블 INSERT (status='pending')
    │ - content_tag_map 후보 저장
    │ - content_project_map 후보 저장
    │ - sync_jobs 업데이트
    ▼
[Review Stage]           (Admin CMS)
    │ - 관리자 검수
    │ - 요약/해설 수정
    │ - 태그/프로젝트 연결 확정
    │ - canonical/출처 명시 확인
    ▼
[Publish Stage]
    │ - status → 'published'
    │ - published_at 설정
    ▼
[SEO Reflect Stage]
    │ - sitemap.xml 재생성 트리거
    │ - OG 메타 확인
    │ - structured_data 자동 생성
```

### 5.2 Adapter 인터페이스

```typescript
// src/lib/aggregator/types.ts
export interface RawItem {
  external_id: string;
  title: string;
  summary?: string;
  body?: string;
  source_url: string;
  author?: string;
  thumbnail_url?: string;
  published_at?: string;
  raw_data: Record<string, unknown>;
}

export interface SourceAdapter {
  sourceType: string;
  fetch(source: ContentSource): Promise<RawItem[]>;
}

export interface NormalizedItem {
  slug: string;
  title: string;
  summary: string;
  source_url: string;
  source_id: string;
  content_type: ContentType;
  thumbnail_url?: string;
  published_at?: string;
  external_id: string;
  content_hash: string;
  source_raw: Record<string, unknown>;
  embed_html?: string;
  tag_candidates?: string[];
  project_candidates?: string[];
}
```

### 5.3 중복 제거 전략

1. **content_hash**: `SHA256(source_url + '::' + title)` — 동일 URL이어도 제목을 포함하여 수정된 글도 구분 가능
2. **external_id**: YouTube video ID, X tweet ID 등 플랫폼 고유 ID 별도 관리
3. **source_url 정규화**: trailing slash, utm 파라미터 제거, 소문자 통일

### 5.4 에러 처리 및 재시도 정책

```
실패 분류:
  - NETWORK_ERROR       → 최대 3회 재시도 (지수 백오프: 5분, 15분, 45분)
  - PARSE_ERROR         → 재시도 없음, 에러 로그만 기록
  - AUTH_ERROR          → 재시도 없음, 알림 발송
  - RATE_LIMIT          → 1회 재시도 (1시간 후)
  - DUPLICATE_SKIP      → 정상 처리로 기록 (skip 카운트 증가)

sync_jobs.error_log 예시:
[
  {
    "item_id": "yt-abc123",
    "url": "https://...",
    "error": "PARSE_ERROR",
    "message": "thumbnail not found",
    "occurred_at": "2026-03-12T10:00:00Z"
  }
]
```

---

## 6. RSS / SNS 연동 설계

### 6.1 RSS 연동

**수집 대상**:
- 회사 블로그 (자체 RSS)
- 네이버 블로그 RSS
- 기타 외부 기술 블로그 RSS

**Edge Function 스케줄**: `supabase/functions/sync-rss/index.ts`  
**트리거**: Supabase Cron (매 30분)

**RSS 파싱 핵심 로직**:
```typescript
// supabase/functions/sync-rss/index.ts
import { parseStringPromise } from 'xml2js';

async function parseRSSFeed(url: string): Promise<RawItem[]> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'BaikalBot/1.0' }
  });
  const xml = await res.text();
  const parsed = await parseStringPromise(xml, { explicitArray: false });

  const channel = parsed.rss?.channel || parsed.feed;
  const items = channel?.item || channel?.entry || [];
  
  return (Array.isArray(items) ? items : [items]).map(item => ({
    external_id: item.guid?._ || item.guid || item.id || item.link,
    title: item.title?._ || item.title || '',
    summary: item.description || item.summary || item['content:encoded'] || '',
    source_url: item.link?._ || item.link || '',
    published_at: item.pubDate || item.published || item.updated,
    raw_data: item
  }));
}
```

**발행 상태 전환**:
- RSS 수집 즉시: `status = 'pending'`
- 관리자 승인 시: `status = 'published'`, `published_at = NOW()`
- 거부 시: `status = 'rejected'`

### 6.2 SNS 연동 전략

| 채널 | 수집 방식 | 자동화 수준 | 저장 전략 |
|------|-----------|-------------|-----------|
| YouTube | YouTube Data API v3 | 완전 자동 | 메타 + 임베드 코드 저장 |
| RSS | HTTP Polling | 완전 자동 | 요약 + 원문 링크 |
| X (Twitter) | API v2 (제한적) | 반자동 (수동 큐레이션 우선) | 원문 URL + 요약만 |
| Instagram | Graph API | 반자동 (임베드 우선) | 임베드 코드 + 썸네일 URL |
| 네이버 카페/블로그 | RSS 일부 | 부분 자동 | 제목 + 요약 + 원문 링크 |

**중요**: X와 Instagram은 API 정책 제약으로 **콘텐츠 전문 저장 금지**.  
반드시 **원문 URL + 요약 + 임베드 코드** 방식으로 저장.

**YouTube 수집 예시**:
```typescript
async function fetchYouTubeVideos(channelId: string, apiKey: string): Promise<RawItem[]> {
  const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet&order=date&maxResults=20&type=video`;
  const res = await fetch(url);
  const data = await res.json();

  return data.items.map((item: any) => ({
    external_id: item.id.videoId,
    title: item.snippet.title,
    summary: item.snippet.description,
    source_url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    thumbnail_url: item.snippet.thumbnails.high.url,
    published_at: item.snippet.publishedAt,
    embed_html: `<iframe src="https://www.youtube.com/embed/${item.id.videoId}" ...></iframe>`,
    raw_data: item
  }));
}
```

---

## 7. 관리자 CMS 설계

### 7.1 CMS 구조

인증: Supabase Auth (`role = 'admin'` 메타데이터 기반)

```
/admin/dashboard      → 통계 요약, 최근 수집 현황, 승인 대기 목록
/admin/contents       → 콘텐츠 목록/검색/필터 + 승인·거부·수정
/admin/projects       → 프로젝트 CRUD + 관련 콘텐츠 연결
/admin/media          → 미디어 파일 업로드/관리
/admin/tags           → 태그 CRUD + 사용 현황
/admin/topics         → 토픽 CRUD + 연결된 태그/콘텐츠 관리
/admin/sources        → 수집 소스 등록/수정/활성화 토글
/admin/sync-jobs      → 동기화 작업 이력 + 수동 실행
/admin/seo            → seo_pages 관리, 메타 오버라이드
/admin/settings       → 사이트 설정, 홈 섹션 큐레이션
```

### 7.2 핵심 운영 시나리오

**시나리오 1: RSS 수집 후 승인**
1. RSS 수집 → `contents` (status=pending)
2. `/admin/contents` → 필터: status=pending
3. 검수: 요약 수정, 태그 확정, 프로젝트 연결
4. "승인" 버튼 → status=published, published_at=NOW()

**시나리오 2: 신규 프로젝트 등록**
1. `/admin/projects` → "새 프로젝트"
2. 슬러그, 제목, 설명, 기술스택, 썸네일 입력
3. status=active → 퍼블릭 노출
4. 관련 콘텐츠 수동 연결

**시나리오 3: 대표 콘텐츠 홈 노출**
1. `/admin/settings` → 홈 섹션 큐레이션
2. featured_projects, featured_contents 선택
3. sort_order 드래그 정렬

### 7.3 권한 제어

```typescript
// 관리자만 접근
const isAdmin = user?.user_metadata?.role === 'admin';
if (!isAdmin) redirect('/');

// RLS: service_role 또는 admin 메타데이터로 전체 접근
```

---

## 8. Media Hub 설계

### 8.1 Storage 버킷 구조

```
supabase-storage/
├─ public-media/        # 공개 이미지, 영상 썸네일
│   ├─ thumbnails/
│   ├─ screenshots/
│   └─ logos/
├─ project-assets/      # 프로젝트별 미디어 자산
│   └─ {project_slug}/
│       ├─ demo/
│       ├─ screenshots/
│       └─ og/
├─ draft-assets/        # 비공개 초안 미디어
└─ og-images/           # OG 이미지 (자동 생성)
```

### 8.2 업로드 + 메타 저장 흐름

```
파일 업로드 (Admin CMS)
    ↓
Supabase Storage 저장 (적절한 버킷)
    ↓
media_assets 테이블 INSERT
    ↓
project_id 또는 content_id 연결
    ↓
alt_text, caption 입력 (접근성 + SEO)
```

### 8.3 썸네일 전략

- 이미지: Supabase Storage Transform API (`?width=800&quality=80`) 사용
- 영상 썸네일: YouTube API 제공 URL → Supabase Storage로 미러링
- OG 이미지: Edge Function에서 Canvas/SVG 기반 자동 생성 (프로젝트명, 로고 포함)

---

## 9. SEO 설계

### 9.1 URL 체계 및 메타 구조

각 페이지별 SEO 메타 생성 규칙:

| 페이지 | title | description |
|--------|-------|-------------|
| 홈 `/` | 바이칼시스템즈 - AI 개발 플랫폼 | ...회사 소개... |
| `/projects/:slug` | {project.title} - 바이칼시스템즈 | {project.meta_desc or subtitle} |
| `/lab/articles/:slug` | {content.title} - BAIKAL Lab | {content.summary[:160]} |
| `/topics/:slug` | {topic.title} 관련 AI 프로젝트 & 콘텐츠 | {topic.description} |
| `/archive/year/:year` | {year}년 콘텐츠 아카이브 - 바이칼시스템즈 | ... |

### 9.2 sitemap.xml 생성

```typescript
// supabase/functions/generate-sitemap/index.ts
async function generateSitemap(supabase: SupabaseClient): Promise<string> {
  const [projects, contents, topics] = await Promise.all([
    supabase.from('projects').select('slug,updated_at').eq('status','active'),
    supabase.from('contents').select('slug,updated_at,content_type').eq('status','published'),
    supabase.from('topics').select('slug,updated_at').eq('is_public',true),
  ]);

  const urls = [
    { loc: '/', changefreq: 'daily', priority: '1.0' },
    { loc: '/about', changefreq: 'monthly', priority: '0.8' },
    { loc: '/projects', changefreq: 'weekly', priority: '0.9' },
    ...(projects.data || []).map(p => ({
      loc: `/projects/${p.slug}`,
      lastmod: p.updated_at,
      changefreq: 'weekly',
      priority: '0.8'
    })),
    ...(contents.data || []).map(c => ({
      loc: `/lab/articles/${c.slug}`,
      lastmod: c.updated_at,
      changefreq: 'monthly',
      priority: '0.7'
    })),
    ...(topics.data || []).map(t => ({
      loc: `/topics/${t.slug}`,
      lastmod: t.updated_at,
      changefreq: 'weekly',
      priority: '0.7'
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>https://www.baikalsys.kr${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod.split('T')[0]}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return xml;
}
```

### 9.3 Structured Data (JSON-LD)

```typescript
// 프로젝트 페이지 Schema.org
const projectSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": project.title,
  "description": project.description,
  "url": `https://www.baikalsys.kr/projects/${project.slug}`,
  "applicationCategory": "AIApplication",
  "creator": {
    "@type": "Organization",
    "name": "바이칼시스템즈",
    "url": "https://www.baikalsys.kr"
  }
};

// 아티클 Schema.org
const articleSchema = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": content.title,
  "description": content.summary,
  "datePublished": content.published_at,
  "author": { "@type": "Organization", "name": "바이칼시스템즈" }
};
```

### 9.4 외부 콘텐츠 중복 SEO 방지

외부 채널 콘텐츠를 그대로 복붙하지 않고, 다음 방식만 허용:

| 방식 | 설명 |
|------|------|
| **요약+원문링크** | 요약 3~5줄 + canonical = 원문 URL |
| **큐레이션 해설** | 자체 해설 추가 + 원문 링크 |
| **임베드** | YouTube/Instagram: 임베드 코드 사용 |
| **canonical 지정** | `<link rel="canonical" href="원문URL">` |

---

## 10. 배포 설계

### 10.1 브랜치 전략

```
main          → Vercel Production (www.baikalsys.kr)
develop       → Vercel Preview (dev.baikalsys.kr)
feature/*     → Vercel Preview (PR별 임시 URL)
```

### 10.2 Supabase 환경 구조

```
baikal-prod   → Production DB (www.baikalsys.kr 연결)
baikal-dev    → Development DB (로컬 개발 + CI)
```

### 10.3 환경 변수

```env
# .env.local (로컬 개발)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Vercel 환경 변수 (Production/Preview 별도)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...    # Edge Functions용 (절대 프론트엔드 노출 금지)
YOUTUBE_API_KEY=...
CRON_SECRET=...                   # Cron 인증 토큰
```

### 10.4 배포 순서

```
1. GitHub main 브랜치에 push
2. GitHub Actions → 타입체크/린트/빌드 검사
3. Vercel 자동 배포 트리거
4. Supabase migrations 자동 적용 (supabase db push)
5. Edge Functions 배포 (supabase functions deploy)
6. 도메인 연결: Vercel → www.baikalsys.kr (CNAME)
```

### 10.5 Cron 스케줄 구조

```sql
-- Supabase Cron (pg_cron 활용)
SELECT cron.schedule(
  'sync-rss-feeds',
  '*/30 * * * *',    -- 매 30분
  $$ SELECT net.http_post(
    url := 'https://xxxx.supabase.co/functions/v1/sync-rss',
    headers := '{"Authorization": "Bearer " || current_setting("app.cron_secret")}'::jsonb
  ) $$
);

SELECT cron.schedule(
  'sync-youtube',
  '0 * * * *',       -- 매 1시간
  $$ SELECT net.http_post(...) $$
);
```

### 10.6 장애 대응 기본 원칙

1. **Edge Function 실패** → sync_jobs에 실패 기록, 다음 주기에 자동 재시도
2. **DB 연결 실패** → Supabase 상태 페이지 확인 → 롤백: Vercel rollback 버튼
3. **배포 실패** → GitHub Actions 실패 시 자동 배포 중단, 이전 배포 유지
4. **API Rate Limit** → error_count 증가, 자동 backoff, 임계값 초과 시 `is_active = false`

---

## 11. 단계별 개발 로드맵

### Phase 1 — 플랫폼 골격 + 인증 + DB + 기본 CMS

**목표**: 개발 가능한 기반 구조 완성

**구현 범위**:
- Vite + React + TypeScript + TailwindCSS 프로젝트 초기화
- Supabase 프로젝트 생성 + 전체 DB 마이그레이션 실행
- Supabase Auth 설정 (이메일/PW, admin role 설정)
- `/admin` 라우트 + 로그인 보호
- `projects` CRUD (Admin CMS)
- `contents` CRUD (Admin CMS)
- 기본 레이아웃 (Header, Footer, Navigation)

**완료 기준**:
- 관리자가 로그인하여 프로젝트와 콘텐츠를 수기 등록할 수 있다
- DB 마이그레이션이 완전히 적용되어 있다

**다음 단계 조건**: Admin CMS로 최소 1개 프로젝트, 3개 콘텐츠 등록 완료

---

### Phase 2 — 프로젝트/콘텐츠 퍼블릭 페이지

**목표**: 공개 사이트 완성

**구현 범위**:
- 홈 페이지 (Featured Projects, 최신 콘텐츠)
- `/projects` 목록 + `/projects/:slug` 상세
- `/lab/articles` 목록 + 상세
- `/about`, `/services`, `/contact`
- Tag 필터, 검색
- React Router v6 설정
- Helmet으로 기본 SEO 메타 적용

**완료 기준**:
- 등록된 프로젝트와 콘텐츠가 퍼블릭 페이지에서 정상 노출된다

**다음 단계 조건**: 퍼블릭 페이지 배포 완료 (Vercel)

---

### Phase 3 — RSS Aggregator + 승인 플로우

**목표**: 자동 수집 파이프라인 구축

**구현 범위**:
- `content_sources`, `rss_sources` 관리 UI
- Supabase Edge Function: `sync-rss`
- Supabase Cron 설정
- Admin CMS: 승인/거부/수정 워크플로우
- 수집 실패 로그 표시 (`sync_jobs`)
- 중복 제거 로직

**완료 기준**:
- RSS 피드 1개 이상 자동 수집 → pending 저장 → 관리자 승인 → 퍼블릭 노출

---

### Phase 4 — Media Hub + Topic/Tag 연결

**목표**: 미디어 자산 관리 및 토픽 시스템

**구현 범위**:
- Supabase Storage 버킷 설정
- 미디어 업로드 UI (Admin CMS)
- `/media` 퍼블릭 페이지
- `topics` CRUD + `/topics/:slug` 페이지
- 콘텐츠-프로젝트-태그 연결 UI

**완료 기준**:
- 미디어 파일 업로드 및 프로젝트 연결 가능
- 토픽 페이지에서 관련 콘텐츠가 자동 노출됨

---

### Phase 5 — SEO 자동화 + Sitemap + OG 이미지

**목표**: SEO 인프라 완성

**구현 범위**:
- 동적 `sitemap.xml` 생성 Edge Function
- `robots.txt`
- OG 이미지 자동 생성 (Canvas API 기반)
- Structured Data (JSON-LD) 자동 주입
- `seo_pages` 오버라이드 UI
- Archive 페이지 (`/archive/year/:year`)
- RSS 피드 출력 (`/api/rss.xml`)

**완료 기준**:
- Google Search Console에 sitemap 등록 성공
- 주요 페이지 OG 이미지 정상 표시

---

### Phase 6 — SNS 확장 + 운영 고도화

**목표**: 채널 확장 및 운영 편의성 강화

**구현 범위**:
- YouTube Data API 연동
- X/Instagram 반자동 수집 UI (수동 URL 입력 → 자동 메타 추출)
- 내부 Analytics (`analytics_events`)
- 홈 섹션 큐레이션 (featured 관리)
- 콘텐츠 시리즈/컬렉션
- 다크모드

**완료 기준**:
- YouTube 영상 자동 수집 및 퍼블릭 노출
- 운영 6개월 후에도 관리 부담 없이 운영 가능한 수준

---

## 12. 폴더 구조

```
baikal-platform/
│
├─ src/
│   ├─ app/                         # 앱 진입점, Router, Providers
│   │   ├─ App.tsx
│   │   ├─ Router.tsx
│   │   └─ providers/
│   │       ├─ QueryProvider.tsx    # React Query
│   │       ├─ AuthProvider.tsx     # Supabase Auth
│   │       └─ ThemeProvider.tsx    # 다크모드
│   │
│   ├─ pages/                       # 라우트 단위 페이지 컴포넌트
│   │   ├─ home/
│   │   ├─ about/
│   │   ├─ services/
│   │   ├─ projects/
│   │   │   ├─ ProjectListPage.tsx
│   │   │   ├─ ProjectDetailPage.tsx
│   │   │   └─ ProjectCategoryPage.tsx
│   │   ├─ lab/
│   │   │   ├─ ArticleListPage.tsx
│   │   │   ├─ ArticleDetailPage.tsx
│   │   │   ├─ NotesPage.tsx
│   │   │   └─ ExperimentsPage.tsx
│   │   ├─ content/
│   │   │   ├─ ContentHubPage.tsx
│   │   │   └─ ContentChannelPage.tsx
│   │   ├─ media/
│   │   ├─ topics/
│   │   ├─ archive/
│   │   ├─ contact/
│   │   └─ admin/
│   │       ├─ AdminDashboard.tsx
│   │       ├─ AdminContents.tsx
│   │       ├─ AdminProjects.tsx
│   │       ├─ AdminMedia.tsx
│   │       ├─ AdminTags.tsx
│   │       ├─ AdminTopics.tsx
│   │       ├─ AdminSources.tsx
│   │       ├─ AdminSyncJobs.tsx
│   │       ├─ AdminSEO.tsx
│   │       └─ AdminSettings.tsx
│   │
│   ├─ components/                  # 재사용 UI 컴포넌트
│   │   ├─ ui/                      # 기본 UI (Button, Input, Badge, Card...)
│   │   ├─ layout/
│   │   │   ├─ Header.tsx
│   │   │   ├─ Footer.tsx
│   │   │   ├─ AdminLayout.tsx
│   │   │   └─ PublicLayout.tsx
│   │   ├─ seo/
│   │   │   ├─ SEOHead.tsx          # Helmet wrapper
│   │   │   └─ StructuredData.tsx
│   │   ├─ project/
│   │   │   ├─ ProjectCard.tsx
│   │   │   └─ ProjectList.tsx
│   │   ├─ content/
│   │   │   ├─ ContentCard.tsx
│   │   │   ├─ ContentList.tsx
│   │   │   └─ ContentEmbed.tsx
│   │   └─ media/
│   │       ├─ MediaGrid.tsx
│   │       └─ MediaUploader.tsx
│   │
│   ├─ features/                    # 도메인별 비즈니스 로직
│   │   ├─ projects/
│   │   │   ├─ useProjects.ts
│   │   │   ├─ useProject.ts
│   │   │   └─ projectService.ts
│   │   ├─ contents/
│   │   │   ├─ useContents.ts
│   │   │   └─ contentService.ts
│   │   ├─ aggregator/
│   │   │   ├─ useAggregator.ts
│   │   │   └─ aggregatorService.ts
│   │   ├─ media/
│   │   ├─ auth/
│   │   │   ├─ useAuth.ts
│   │   │   └─ authService.ts
│   │   └─ seo/
│   │       └─ seoUtils.ts
│   │
│   ├─ lib/                         # 외부 서비스 초기화
│   │   ├─ supabase.ts              # Supabase client
│   │   ├─ queryClient.ts           # React Query 설정
│   │   └─ constants.ts
│   │
│   ├─ hooks/                       # 공통 훅
│   │   ├─ useDebounce.ts
│   │   ├─ useInfiniteScroll.ts
│   │   └─ useLocalStorage.ts
│   │
│   ├─ types/                       # 전체 TypeScript 타입 정의
│   │   ├─ database.types.ts        # Supabase 자동 생성 타입
│   │   ├─ models.ts                # 도메인 모델 타입
│   │   └─ api.ts                   # API 요청/응답 타입
│   │
│   ├─ utils/                       # 순수 유틸 함수
│   │   ├─ slug.ts                  # 슬러그 생성
│   │   ├─ hash.ts                  # SHA256 해시
│   │   ├─ date.ts                  # 날짜 포맷
│   │   └─ truncate.ts
│   │
│   ├─ layouts/                     # 페이지 레이아웃 조합
│   │   ├─ PublicLayout.tsx
│   │   └─ AdminLayout.tsx
│   │
│   └─ routes/                      # 라우트 정의 + 보호 라우트
│       ├─ index.tsx
│       └─ ProtectedRoute.tsx
│
├─ supabase/
│   ├─ migrations/                  # DB 마이그레이션 SQL 파일
│   │   ├─ 20260312000001_init_schema.sql
│   │   ├─ 20260312000002_rls_policies.sql
│   │   └─ 20260312000003_indexes.sql
│   │
│   ├─ functions/                   # Edge Functions
│   │   ├─ sync-rss/
│   │   │   └─ index.ts
│   │   ├─ sync-youtube/
│   │   │   └─ index.ts
│   │   ├─ generate-sitemap/
│   │   │   └─ index.ts
│   │   └─ generate-og-image/
│   │       └─ index.ts
│   │
│   └─ seed.sql                     # 초기 데이터
│
├─ public/
│   ├─ robots.txt
│   ├─ favicon.ico
│   └─ og-default.jpg
│
├─ .env.local.example
├─ .env.production.example
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ tailwind.config.ts
└─ vercel.json
```

---

## 13. 코드 예시

> 실제 코드는 `src/` 및 `supabase/` 디렉토리 내 파일을 참고하세요.  
> 이 문서에는 핵심 패턴을 요약합니다.

### 핵심 파일 위치

| 기능 | 파일 경로 |
|------|-----------|
| Supabase 초기화 | `src/lib/supabase.ts` |
| 타입 정의 | `src/types/models.ts` |
| 프로젝트 API | `src/features/projects/projectService.ts` |
| 콘텐츠 API | `src/features/contents/contentService.ts` |
| RSS 수집 함수 | `supabase/functions/sync-rss/index.ts` |
| 콘텐츠 허브 페이지 | `src/pages/content/ContentHubPage.tsx` |
| 프로젝트 상세 페이지 | `src/pages/projects/ProjectDetailPage.tsx` |
| Admin 콘텐츠 목록 | `src/pages/admin/AdminContents.tsx` |
| DB 마이그레이션 | `supabase/migrations/20260312000001_init_schema.sql` |

---

## 14. 향후 확장 방향

### 단기 확장 (6개월 내)

1. **AI 자동 요약**: OpenAI API로 수집된 RSS 글 자동 요약 생성
2. **AI 태그 추천**: 콘텐츠 내용 기반 태그 자동 추천
3. **뉴스레터 연동**: 이메일 구독자에게 주간 콘텐츠 큐레이션 발송
4. **검색 강화**: Supabase Full-Text Search → Algolia/Meilisearch 전환

### 중기 확장 (1년 내)

1. **개별 랜딩페이지 엔진**: 각 AI 프로젝트용 별도 도메인 랜딩페이지 생성
2. **멀티 언어**: 한/영 콘텐츠 지원
3. **Webhook 자동화**: Zapier/Make 연동으로 SNS → 자동 수집
4. **Analytics 강화**: 자체 분석 대시보드 (GA4 대체)

### 장기 확장 (2년+)

1. **White-label 콘텐츠 엔진**: 동일 플랫폼을 다른 AI 프로젝트용 사이트에 재사용
2. **AI 검색**: 벡터 임베딩 기반 시맨틱 검색
3. **공개 API**: 콘텐츠 API를 외부에 노출 (Developer Hub)
4. **커뮤니티 기능**: 댓글, 반응, 구독

---

*이 문서는 BAIKAL AI Content Platform의 전체 설계 기준 문서입니다.*  
*코드 구현은 이 문서의 구조와 명명 규칙을 따릅니다.*
