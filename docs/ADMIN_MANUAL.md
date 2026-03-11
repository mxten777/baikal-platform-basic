# BAIKAL AI Content Platform
## 관리자 매뉴얼

> **대상**: 플랫폼 운영자 (바이칼시스템즈 내부)  
> **접근 경로**: https://www.baikalsys.kr/admin  
> **작성일**: 2026-03-12  
> **버전**: v1.0

---

## 1. 관리자 시스템 개요

### 1.1 접근 방법

1. 브라우저에서 `/login` 접속
2. 관리자 계정 이메일 + 비밀번호 입력
3. Supabase Auth 인증 통과 시 `/admin/dashboard` 자동 이동
4. 미인증 상태에서 `/admin/*` 접근 시 `/login`으로 자동 리다이렉트

> **보안**: 관리자 계정은 Supabase Dashboard에서 직접 생성. `user_metadata.role = "admin"` 설정 필수.

### 1.2 관리자 메뉴 구성

| 메뉴 | 경로 | 주요 기능 |
|------|------|-----------|
| 대시보드 | `/admin/dashboard` | 통계 요약, 최근 싱크 현황 |
| 콘텐츠 관리 | `/admin/contents` | 수집 콘텐츠 검수·게시·거부 |
| 프로젝트 관리 | `/admin/projects` | AI MVP 프로젝트 CRUD |
| 미디어 관리 | `/admin/media` | 이미지·영상 자산 관리 |
| SEO 관리 | `/admin/seo` | 페이지별 메타 데이터 |
| 소스 관리 | `/admin/sources` | RSS 등 수집 채널 관리 |
| 싱크 관리 | `/admin/sync-jobs` | 자동 수집 작업 현황 |
| MVP 등록 가이드 | `/admin/settings` | MVP 등록 체크리스트 |

---

## 2. 대시보드

### 2.1 통계 카드

| 카드 | 의미 |
|------|------|
| 전체 프로젝트 | DB에 등록된 `projects` 총 수 |
| 전체 콘텐츠 | `contents` 총 수 (status 무관) |
| 대기 중 콘텐츠 | `status = pending`인 콘텐츠 — 검수 필요 수 |
| 수집 소스 | 활성화된 `content_sources` 수 |

### 2.2 최근 싱크 작업

- 최근 5건의 싱크 작업 상태 표시
- 상태별 배지: `running`(파란색), `completed`(초록), `failed`(빨간), `partial`(노란)
- 각 작업의 수집/신규/실패 건수 확인

---

## 3. 콘텐츠 관리

### 3.1 상태 탭 이해

| 탭 | status 값 | 설명 |
|----|-----------|------|
| 대기 중 | `pending` | 자동 수집 또는 수기 등록 후 미검수 상태 |
| 승인됨 | `approved` | 검수 통과, 게시 전 단계 |
| 게시됨 | `published` | 공개 페이지에 노출 중 |
| 거부됨 | `rejected` | 검수 거부 처리 |
| 전체 | (전체) | 모든 상태 통합 보기 |

### 3.2 콘텐츠 검수 워크플로우

```
자동 수집 or 수기 작성
        ↓
   status = pending
        ↓
  관리자 검토
   ↙         ↘
게시 (publish)  거부 (reject)
   ↓
status = published
공개 페이지 노출
```

**게시 처리**:
- "게시" 버튼 클릭 → 확인 다이얼로그 → `status = published` 변경
- `published_at` 자동 업데이트

**거부 처리**:
- "거부" 버튼 클릭 → `status = rejected` 변경
- 거부된 콘텐츠는 공개 페이지에 노출되지 않음

### 3.3 새 콘텐츠 수기 등록

1. 상단 "+ 새 콘텐츠" 버튼 클릭
2. `/admin/contents/new` 페이지 (Phase 2 구현 예정)

> **임시 방법**: Supabase Dashboard의 Table Editor에서 직접 `contents` 테이블에 삽입

### 3.4 콘텐츠 필드 안내

| 필드 | 필수 | 설명 |
|------|------|------|
| `slug` | ✅ | 영문 소문자·하이픈, URL에 사용 |
| `title` | ✅ | 콘텐츠 제목 |
| `summary` | 권장 | 목록 페이지 요약 텍스트, 미입력 시 빈칸 |
| `body` | 선택 | 마크다운 본문 (x_post 등은 NULL 허용) |
| `content_type` | ✅ | `article` / `note` / `research` / `x_post` 등 |
| `status` | ✅ | `pending` 으로 시작 |
| `is_featured` | 선택 | 메인 홈 Featured 섹션 노출 여부 |
| `published_at` | 선택 | 미래 날짜 설정 시 예약 게시 효과 |

---

## 4. 프로젝트 관리

### 4.1 프로젝트 등록

1. "새 프로젝트" 버튼 클릭 → 모달 열림
2. 필드 입력 후 "저장" → DB 즉시 반영

**주요 필드 입력 요령**:

| 필드 | 입력 방법 | 주의사항 |
|------|-----------|---------|
| `slug` | 영문 소문자 + 하이픈 | 중복 불가, 한번 설정 후 변경 금지 권장 |
| `title` 입력 시 | slug 자동 생성 | 수동 수정 가능 |
| `category` | 드롭다운 선택 | DB 저장값과 정확히 일치 필요 |
| `tech_stack` | 콤마 구분 입력 | 예: `Python, FastAPI, OpenAI` |
| `featured` | 체크박스 | 메인 홈 노출, 최대 6개 권장 |
| `description` | 마크다운 텍스트 | `## 개요` `## 주요 기능` `## 성과` 구조 권장 |

**카테고리 목록** (DB 값과 정확히 일치해야 필터 동작):

| 값 | 표시 레이블 |
|----|------------|
| `NLP` | NLP / 언어 |
| `AI Agent` | AI 에이전트 |
| `Platform / Infra` | 플랫폼 / 인프라 |
| `Research / Experiment` | 리서치 / 실험 |
| `Computer Vision` | 컴퓨터 비전 |

### 4.2 프로젝트 수정

- 목록에서 편집(✎) 아이콘 클릭 → 동일 모달에서 수정
- 저장 즉시 공개 페이지에 반영

### 4.3 프로젝트 삭제

- 삭제(🗑) 아이콘 클릭 → 확인 다이얼로그
- **주의**: 삭제 시 `content_project_map` 연결 레코드도 cascade 삭제됨
- 완전 삭제 대신 `status = archived` 처리 권장

### 4.4 Featured 설정 가이드

- 메인 홈 "FEATURED PROJECTS" 섹션에 `featured = TRUE` 프로젝트 노출
- 적정 수: **4~6개**
- 너무 많으면 임팩트 감소 → 대표 MVP만 선별

---

## 5. 소스 관리

### 5.1 소스 등록

수집할 외부 채널 정보를 등록합니다.

| 필드 | 설명 |
|------|------|
| `name` | 소스 식별명 (예: "바이칼 네이버 블로그") |
| `source_type` | `rss` / `x` / `instagram` / `youtube` / `naver` / `manual` |
| `url` | RSS 피드 URL 또는 채널 URL |
| `handle` | @username 또는 채널 ID |
| `sync_interval_minutes` | 수집 주기 (기본 60분) |
| `is_active` | 활성/비활성 토글 |

### 5.2 소스 타입별 URL 예시

| 타입 | URL 형식 예시 |
|------|--------------|
| RSS | `https://blog.example.com/feed` |
| 네이버 블로그 | `https://rss.blog.naver.com/{blogId}` |
| YouTube | `https://www.youtube.com/feeds/videos.xml?channel_id={id}` |
| X (Twitter) | Nitter RSS 또는 RSS Bridge 경유 |

### 5.3 소스 활성/비활성

- 오른쪽 토글로 즉시 전환
- 비활성화 시 해당 소스의 Cron 수집 건너뜀

---

## 6. 싱크 관리

### 6.1 싱크 작업 상태 이해

| 상태 | 의미 |
|------|------|
| `running` | 현재 수집 중 |
| `completed` | 정상 완료 |
| `partial` | 일부 성공, 일부 실패 |
| `failed` | 전체 실패 — 소스 설정 또는 네트워크 확인 필요 |

### 6.2 싱크 실패 대응

1. 싱크 목록에서 `failed` 상태 작업 확인
2. `소스` 컬럼에서 어떤 채널 수집 실패인지 파악
3. **소스 관리** 페이지에서 해당 소스 URL 유효성 확인
4. 소스 수정 후 다음 Cron 실행 대기 (또는 수동 Edge Function 호출)

### 6.3 수동 싱크 실행

Supabase Dashboard → Edge Functions → `sync-rss` → Invoke

---

## 7. SEO 관리

> Phase 2 구현 예정. 현재는 각 콘텐츠/프로젝트의 `meta_title`, `meta_desc` 필드 직접 수정으로 대응.

**임시 방법**: Supabase Dashboard에서 해당 레코드의 `meta_title`, `meta_desc` 직접 편집

---

## 8. MVP 등록 가이드 (체크리스트)

`/admin/settings` 에서 인터랙티브 체크리스트 확인.
상세 내용은 [MVP_REGISTRATION_GUIDE.md](MVP_REGISTRATION_GUIDE.md) 참조.

---

## 9. 데이터베이스 직접 접근

관리 UI가 없는 작업은 Supabase Dashboard에서 직접 처리.

**접속**: https://supabase.com/dashboard → 프로젝트 선택 → Table Editor

### 자주 쓰는 쿼리

```sql
-- 대기 중 콘텐츠 수 확인
SELECT COUNT(*) FROM contents WHERE status = 'pending';

-- 특정 콘텐츠 즉시 게시
UPDATE contents
SET status = 'published', published_at = NOW()
WHERE slug = 'your-content-slug';

-- 프로젝트 정렬 순서 변경
UPDATE projects SET sort_order = 1 WHERE slug = 'baikal-rag-search';
UPDATE projects SET sort_order = 2 WHERE slug = 'ai-agent-workflow';

-- 특정 태그가 붙은 콘텐츠 목록
SELECT c.title, c.status
FROM contents c
JOIN content_tag_map ctm ON ctm.content_id = c.id
JOIN tags t ON t.id = ctm.tag_id
WHERE t.slug = 'rag';
```

---

## 10. 주요 환경 변수

| 변수 | 용도 |
|------|------|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon 공개 키 |
| `VITE_SITE_URL` | 배포 도메인 (OG, 사이트맵용) |

> `.env.local` 파일에 설정. `.gitignore`에 포함되어 있어 Git에 업로드되지 않음.

---

## 11. 배포 운영

### Vercel (Frontend)

- `main` 브랜치 push → Vercel 자동 빌드·배포
- 환경 변수는 Vercel Dashboard에서 별도 설정

### Supabase (Backend)

- Migration 파일: `supabase/migrations/`
- 새 마이그레이션: `supabase migration new {이름}` → 파일 작성 → Supabase Dashboard에서 실행
- Edge Functions 배포: `supabase functions deploy {함수명}`

---

## 12. 긴급 대응

| 상황 | 대응 방법 |
|------|-----------|
| 관리자 로그인 불가 | Supabase Dashboard → Authentication → Users에서 계정 확인 및 비밀번호 재설정 |
| 콘텐츠가 공개 페이지에 안 보임 | `status = 'published'` 여부, `published_at` 값 확인 |
| 싱크가 계속 실패 | 소스 URL 유효성 확인, Edge Function 로그 확인 (Supabase Dashboard → Logs) |
| 프론트엔드 빌드 실패 | Vercel Dashboard → Deployments에서 빌드 로그 확인 |
| DB 용량 부족 | Supabase Dashboard → Settings → Billing에서 플랜 확인 |
