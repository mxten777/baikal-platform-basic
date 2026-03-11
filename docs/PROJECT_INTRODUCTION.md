# BAIKAL AI Content Platform
## 프로젝트 소개서

> **회사**: 바이칼시스템즈 (BAIKAL SYSTEMS)  
> **공식 사이트**: https://www.baikalsys.kr  
> **버전**: v1.0  
> **작성일**: 2026-03-12  
> **문서 성격**: 대외 소개용 / 파트너·투자자·팀원 공유용

---

## 1. 한 줄 정의

> **"AI 개발 과정을 콘텐츠 자산으로 전환하는 자기확장형 플랫폼"**

---

## 2. 배경 및 필요성

### 문제 인식

AI 개발사가 기술력을 보유하더라도 그것이 외부에 보이지 않으면 신뢰 자산이 되지 않는다.

| 기존 방식의 한계 |
|----------------|
| 블로그, 노션, X 등 외부 채널에 콘텐츠가 분산 → 통합 관리 불가 |
| SEO 자산이 외부 플랫폼에 귀속 → 이탈 시 소멸 |
| 프로젝트 완성 후 별도 홍보 노력 없이는 노출 0 |
| 회사 홈페이지는 정적 소개서 수준 → 방문 이유 없음 |

### 해결 방향

외부에 분산된 콘텐츠를 **홈페이지 안으로 회수**하고,
프로젝트마다 자동으로 SEO 자산이 쌓이는 **플랫폼 구조**를 구축한다.

---

## 3. 플랫폼 정의

BAIKAL AI Content Platform은 **4개 레이어**로 구성된 통합 시스템이다.

```
┌───────────────────────────────────────────────────┐
│  Layer 1: Brand Site                             │
│  회사 소개 · 서비스 · 핵심 CTA                    │
├───────────────────────────────────────────────────┤
│  Layer 2: Project Portfolio                      │
│  AI MVP 포트폴리오 축적 · 기술 신뢰 자산화         │
├───────────────────────────────────────────────────┤
│  Layer 3: Content Knowledge Base                 │
│  기술 아티클 · 개발 노트 · 실험 기록 · 연구 로그  │
├───────────────────────────────────────────────────┤
│  Layer 4: Aggregation Engine                     │
│  RSS · X · YouTube · Instagram → 자동 수집·연결  │
└───────────────────────────────────────────────────┘
```

---

## 4. 핵심 기능

### 4.1 AI 프로젝트 포트폴리오

- 카테고리별 분류: NLP / AI Agent / Platform·Infra / Research·Experiment / Computer Vision
- 프로젝트 상세 페이지: 기술 스택, 마크다운 설명, 관련 콘텐츠 자동 연결
- Featured 설정으로 메인 홈 노출

### 4.2 기술 콘텐츠 아카이브 (LAB)

- **Article**: 심층 기술 글 (SEO 핵심 자산)
- **Note**: 짧은 개발 일지
- **Research**: 실험 데이터, 벤치마크 결과
- **X Post**: X(Twitter) 포스팅 큐레이션

### 4.3 멀티채널 콘텐츠 수집 자동화

```
RSS 피드 → Fetch → 정규화 → 해시 중복 제거 → 어드민 검수 → 공개
X (Twitter) ──┘
YouTube ───────┘
Instagram ─────┘
```

- 중복 감지: SHA256 해시 기반 자동 중복 제거
- 관리자 검수 워크플로우: pending → approved/rejected → published
- 스케줄 자동화: Supabase Cron Edge Function

### 4.4 SEO 자산 누적 구조

- 모든 페이지 개별 meta title/description
- Open Graph 이미지 자동 생성
- 구조화 데이터 (Schema.org JSON-LD)
- XML 사이트맵 자동 생성
- 연도/월별 아카이브 페이지

### 4.5 관리자 CMS (Admin Dashboard)

- 콘텐츠 검수·게시·거부
- 프로젝트 CRUD
- 외부 소스 관리
- 싱크 작업 모니터링
- MVP 등록 가이드 체크리스트

---

## 5. 기술 스택

| 영역 | 기술 |
|------|------|
| **Frontend** | React 18 + TypeScript + Vite 5 |
| **스타일** | TailwindCSS (다크 모드 전용 프리미엄 디자인) |
| **데이터베이스** | Supabase (PostgreSQL 16 + pgvector) |
| **인증** | Supabase Auth (이메일/비밀번호) |
| **서버리스** | Supabase Edge Functions (Deno) |
| **스토리지** | Supabase Storage |
| **배포** | Vercel (Frontend) + Supabase Cloud (Backend) |
| **CI/CD** | GitHub Actions |
| **AI 연동** | OpenAI API (GPT-4o, text-embedding-3) |

---

## 6. 주요 페이지 구조

| URL | 기능 |
|-----|------|
| `/` | 메인 홈 — Featured 프로젝트 + 콘텐츠 |
| `/projects` | AI MVP 포트폴리오 |
| `/projects/:slug` | 프로젝트 상세 |
| `/lab/articles` | 기술 아티클 목록 |
| `/content` | 멀티채널 통합 콘텐츠 허브 |
| `/topics` | 기술 주제별 허브 |
| `/media` | 미디어 자산 (영상, 이미지) |
| `/archive` | 날짜별 아카이브 |
| `/admin/*` | 관리자 CMS (인증 필요) |

---

## 7. 데이터 모델 요약

```
projects ←→ content_project_map ←→ contents
                                       ↑
                              content_sources (RSS, X, YouTube...)
                                       ↑
                                   sync_jobs
```

- `projects`: AI MVP 프로젝트 마스터
- `contents`: 모든 콘텐츠 단일 통합 테이블 (10개 타입)
- `content_sources`: 수집 채널 정보
- `sync_jobs`: 수집 작업 이력
- `tags`, `topics`: 분류 체계
- `media_assets`: 미디어 자산

---

## 8. 차별화 포인트

| 일반 회사 홈페이지 | BAIKAL AI Content Platform |
|------------------|---------------------------|
| 정적 소개서 | 콘텐츠가 쌓일수록 강해지는 성장 구조 |
| 콘텐츠 분산 관리 | 멀티채널 자동 수집·통합 |
| SEO 투자 효과 낮음 | 프로젝트·콘텐츠 단위 SEO 누적 |
| 업데이트 낮은 빈도 | 싱크 자동화로 상시 신선 콘텐츠 |
| 단방향 정보 전달 | 프로젝트 → 콘텐츠 → 관련 리서치 연결망 |

---

## 9. 성장 시나리오

### Phase 1 (현재): 플랫폼 기반 완성
- 핵심 페이지 구현 완료
- 관리자 CMS 완성
- 샘플 콘텐츠 6 프로젝트 + 12 콘텐츠

### Phase 2: 콘텐츠 자산 축적
- 실제 AI MVP 프로젝트 등록 시작
- 외부 채널 RSS 싱크 자동화 운영
- 주 1~2회 기술 아티클 발행

### Phase 3: SEO 트래픽 성장
- 월 10,000 유기적 방문자 달성 목표
- 기술 키워드 상위 노출

### Phase 4: 플랫폼 확장
- 개별 MVP 랜딩페이지에 공통 콘텐츠 엔진 재사용
- API 기반 다중 사이트 지원

---

## 10. 팀 및 연락처

| | |
|-|-|
| **회사명** | 바이칼시스템즈 (BAIKAL SYSTEMS) |
| **공식 사이트** | https://www.baikalsys.kr |
| **사업 분야** | AI 솔루션 개발 / AI MVP 기획·구축 |
| **문의** | /contact 페이지 참조 |
