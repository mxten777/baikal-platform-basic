# BAIKAL AI Content Platform — 코드 점검 결과

> **일시**: 2026-03-12  
> **목적**: 기술 부채 제거 — 중복 코드, 미사용 코드, 버그 점검 및 정리  
> **결과**: TypeScript 오류 0건, 미사용 export 0건

---

## 1. 점검 범위

| 대상 | 범위 |
|------|------|
| `src/utils/` | 유틸 함수 전체 |
| `src/features/` | React Hook / Service 레이어 전체 |
| `src/lib/constants.ts` | 상수 및 카테고리 정의 |
| `src/App.tsx` | 라우트 정의 |
| `src/index.css` | CSS 유틸리티 클래스 |
| `tailwind.config.ts` | Tailwind 커스텀 설정 |
| `src/pages/` (admin, archive) | 스타일 클래스 참조 |

> `supabase/functions/` (Deno Edge Functions)는 별도 런타임으로 점검 범위에서 제외.

---

## 2. 발견 및 수정 내역 (1차: 2026-03-12)

> 아래 **2-1 ~ 2-9**는 초기 1차 점검 결과입니다.

### 2-1. [버그] 카테고리 필터 항상 빈 결과

**파일**: `src/lib/constants.ts`

**원인**: `PROJECT_CATEGORIES`의 `value` 필드가 URL 슬러그 형식(`nlp`, `agent`)으로 정의되어 있었으나,  
DB `category` 컬럼에 저장된 실제 값(`NLP`, `AI Agent`)과 불일치.  
공개 프로젝트 목록 페이지에서 카테고리 필터를 선택해도 항상 0건이 반환되었음.

**수정**: `value`를 DB에 저장된 실제 값으로 변경.

```diff
- { label: 'NLP / 언어', value: 'nlp' },
- { label: 'AI 에이전트', value: 'agent' },
- { label: '플랫폼 / 인프라', value: 'platform' },
- { label: '리서치 / 실험', value: 'research' },
- { label: '컴퓨터 비전', value: 'vision' },
+ { label: 'NLP / 언어', value: 'NLP' },
+ { label: 'AI 에이전트', value: 'AI Agent' },
+ { label: '플랫폼 / 인프라', value: 'Platform / Infra' },
+ { label: '리서치 / 실험', value: 'Research / Experiment' },
+ { label: '컴퓨터 비전', value: 'Computer Vision' },
```

> **원칙**: `PROJECT_CATEGORIES`의 `value`는 항상 DB `category` 컬럼 값과 동일해야 함.

---

### 2-2. [중복 코드] `toSlug` 함수 로컬 재정의

**파일**: `src/pages/admin/AdminProjects.tsx`

**원인**: `utils/slug.ts`에 이미 정의된 `toSlug` 함수가 AdminProjects 내부에 동일하게 로컬 재정의되어 있었음.

**수정**: 로컬 정의 제거, `@/utils/slug`에서 import.

```diff
- function toSlug(str: string): string {
-   return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
- }
+ import { toSlug } from '@/utils/slug';
```

---

### 2-3. [중복 상수] 어드민 전용 카테고리 목록 별도 관리

**파일**: `src/pages/admin/AdminProjects.tsx`

**원인**: 어드민 프로젝트 폼에서 사용하는 카테고리 목록이 `constants.ts`의 `PROJECT_CATEGORIES`와 별개로 정의되어 있어  
공개 페이지와 어드민이 서로 다른 카테고리 세트를 참조하는 상태였음.

**수정**: 로컬 `CATEGORY_OPTIONS` 제거, `PROJECT_CATEGORIES`를 직접 사용.

```diff
- const CATEGORY_OPTIONS = ['NLP', 'Vision', 'Agent', 'Infra', 'Research'];
+ import { PROJECT_CATEGORIES } from '@/lib/constants';
  // 폼 select에서
- CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)
+ PROJECT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)
```

---

### 2-4. [미사용 코드] 유틸 함수 미사용 export 제거

| 파일 | 제거된 함수/export | 이유 |
|------|--------------------|------|
| `src/utils/slug.ts` | `makeUniqueSlug` | 어떤 파일에서도 import되지 않음 |
| `src/utils/cn.ts` | `truncate` | 어떤 파일에서도 import되지 않음 |
| `src/utils/date.ts` | `formatRelative`, `formatYearMonth` | 어떤 파일에서도 import되지 않음; `formatDistanceToNow` import도 함께 제거 |

---

### 2-5. [미사용 코드] React Hook 미사용 export 제거

**파일**: `src/features/contents/useContents.ts`

**제거**: `useUpsertContent` hook

**이유**: 콘텐츠 편집 UI가 아직 구현되지 않아 어디서도 사용되지 않음.  
Service 함수 `adminUpsertContent` (in `contentService.ts`)는 서비스 레이어이므로 유지.

> **복원 시점**: Admin 콘텐츠 편집 UI 구현 시 `useContents.ts`에 `useUpsertContent` 재추가.

---

### 2-6. [중복 라우트] `/content/all` 중복 경로 제거

**파일**: `src/App.tsx`

**원인**: `/content`와 `/content/all`이 동일한 컴포넌트(`ContentListPage`)를 렌더링하는 중복 라우트가 존재.

**수정**: `/content/all` 라우트 제거.

```diff
  <Route path="/content" element={<ContentListPage />} />
- <Route path="/content/all" element={<ContentListPage />} />
```

---

### 2-7. [CSS 미사용] `.noise-overlay` 클래스 제거

**파일**: `src/index.css`

**원인**: `.noise-overlay::after` CSS 블록이 정의되어 있었으나 어떤 컴포넌트에서도 적용되지 않음.

**수정**: 해당 블록 전체 제거.

---

### 2-8. [Tailwind 설정] 미사용 커스텀 설정 제거

**파일**: `tailwind.config.ts`

| 항목 | 제거 내용 |
|------|-----------|
| `colors.brand` | brand-50 ~ brand-950 전체 팔레트 (코드에서 미사용) |
| `colors.ink` | ink-50 ~ ink-950 전체 팔레트 (코드에서 미사용) |
| `fontSize` | `8xl`, `9xl`, `10xl` 커스텀 크기 |
| `letterSpacing` | `widest2`, `widest3` |
| `backgroundImage` | `grid-pattern`, `radial-fade`, `accent-glow` |
| `animation` | `pulse-slow`, `shimmer` |
| `keyframes` | `shimmer` |

**유지된 설정**: `fontFamily`, `backgroundImage: hero-glow`, `animation: fade-up/fade-in`, `keyframes: fadeUp/fadeIn`, `typography`

---

### 2-9. [스타일 오류] 삭제된 커스텀 컬러 참조 수정

`brand` 팔레트 제거 후 잔존하던 클래스명을 Tailwind 기본 컬러로 교체.

| 파일 | 변경 전 | 변경 후 |
|------|---------|---------|
| `src/routes/ProtectedRoute.tsx` | `border-brand-600` | `border-blue-600` |
| `src/pages/archive/ArchiveYearPage.tsx` | `text-gray-900 dark:text-gray-100` | `text-white` |
| `src/pages/archive/ArchiveYearPage.tsx` | `text-gray-500` | `text-white/40` |

---

---

## 3. 추가 수정 내역 (2차: 2026-03-12 — 모바일 반응형 / 정합성)

### 3-1. [버그] S22 모바일 햄버거 버튼 미표시

**파일**: `src/components/layout/Header.tsx`

**원인**: 버튼 라인이 `h-px`(1px)으로 선언되어 Samsung Galaxy S22(DPR 2) 환경에서 서브픽셀 렌더링으로 사라짐.  
이후 `md:hidden` + flex 컨테이너에서 Samsung Internet의 `innerWidth`(400) / `outerWidth`(365) 불일치로 버튼이 뷰포트 밖으로 overflow되는 2차 문제 발생.

**수정 과정**:
1. `h-px` → `h-[2px]` + `rounded-full` — DPR 렌더링 개선
2. SVG 아이콘으로 교체 — span stroke 렌더링 실패 차단
3. SVG → 유니코드 `☰` / `✕` + inline style 강제 색상 — SVG 간헐 실패 차단
4. 버튼을 `position: fixed; right: 12px; top: 10px`으로 이전 — flex 컨테이너 overflow 문제 완전 분리

**현황 (디버그 오버레이로 확인)**: S22 `innerWidth: 400px`, `DPR: 2`, `md(≥768): NO` — 정상 동작

---

### 3-2. [버그] `AuthProvider` — 인증 상태 변경 시 로딩 미해제

**파일**: `src/features/auth/AuthProvider.tsx`

**원인**: `supabase.auth.onAuthStateChange` 콜백에서 `setIsLoading(false)` 호출 누락.  
`getSession()` 초기 로드는 정상이나, 토큰 갱신/로그아웃 이벤트 시 `isLoading`이 `true`로 남아 `ProtectedRoute`가 로딩 스피너에서 벗어나지 못하는 상황 가능.

**수정**:
```diff
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session)
    setUser(session?.user ?? null)
+   setIsLoading(false)
  })
```

---

### 3-3. [중복] `SEOHead` 기본 description 하드코딩 중복

**파일**: `src/components/seo/SEOHead.tsx`

**원인**: 기본 description 값이 `constants.ts`의 `SITE_DESCRIPTION`과 동일한 내용으로 하드코딩 중복.  
문구 수정 시 두 곳을 동시에 변경해야 하는 유지보수 부채.

**수정**: `SITE_DESCRIPTION` 상수 import 후 사용.
```diff
- import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE } from '@/lib/constants'
+ import { SITE_NAME, SITE_URL, SITE_DESCRIPTION, DEFAULT_OG_IMAGE } from '@/lib/constants'

- const desc = description ?? 'AI 소프트웨어 개발 회사 바이칼시스템즈의 AI 개발 콘텐츠 플랫폼'
+ const desc = description ?? SITE_DESCRIPTION
```

---

### 3-4. [정합성] Header z-index 불일치

**파일**: `src/components/layout/Header.tsx`

**원인**: `<header>` 요소 `z-[200]`, 모바일 버튼 `zIndex: 999`로 서로 불일치.  
z-index 스택 관리 혼란 유발.

**수정**: 버튼 `zIndex` → `200`으로 통일.

---

## 4. 미해결 항목 (수동 조치 필요)

| 항목 | 내용 |
|------|------|
| `public/og-default.svg` 파일 없음 | `constants.ts`의 `DEFAULT_OG_IMAGE`가 `/og-default.svg`를 참조하나 파일 미생성. 소셜 공유 시 OG 이미지 깨짐. SVG 파일 생성 또는 경로 수정 필요. |

---

## 5. 수정 없이 통과한 항목

| 항목 | 판단 |
|------|------|
| `src/utils/hash.ts` (`sha256`, `makeContentHash`) | `supabase/functions/` Edge Functions에서 사용 중 — 유지 |
| `src/features/contents/contentService.ts` (`getContentsByTag`) | 서비스 레이어 API — Hook에서 미사용이지만 레이어 설계상 유지 |
| `src/features/contents/contentService.ts` (`adminUpsertContent`) | Hook wrapper만 제거, 서비스 함수 자체는 유지 |

---

## 6. 점검 후 상태

```
npx tsc --noEmit  →  0 errors
```

| 항목 | 1차 점검 전 | 1차 점검 후 | 2차 점검 후 |
|------|------------|------------|------------|
| TS 오류 | 0 | 0 | 0 |
| 미사용 export | 6건 | 0건 | 0건 |
| 중복 함수/상수 | 3건 | 0건 | 0건 |
| 중복 라우트 | 1건 | 0건 | 0건 |
| 미사용 CSS 클래스 | 1건 | 0건 | 0건 |
| 미사용 Tailwind 설정 | 14개 항목 | 0건 | 0건 |
| 카테고리 필터 버그 | 1건 (치명적) | 수정 완료 | — |
| 모바일 버튼 미표시 | — | — | 수정 완료 |
| AuthProvider 로딩 버그 | — | — | 수정 완료 |
| SEOHead 중복 상수 | — | — | 수정 완료 |
| Header z-index 불일치 | — | — | 수정 완료 |
| og-default.svg 파일 누락 | — | — | **미해결** |

---

## 7. 유지보수 가이드라인

향후 코드 추가 시 아래 원칙을 준수합니다.

1. **카테고리 추가 시**: `src/lib/constants.ts`의 `PROJECT_CATEGORIES`만 수정. DB 컬럼값과 `value`를 동일하게 유지.
2. **컬러 사용**: `brand-*` 삭제됨. 새 코드는 Tailwind 기본 `blue-600/700`을 사용.
3. **어드민 인풋**: `.admin-input` CSS 클래스 사용 (index.css 정의).
4. **Tailwind 확장**: 실제 사용처가 확인된 설정만 `tailwind.config.ts`에 추가.
5. **유틸 함수**: 사용처 없는 export는 즉시 제거. 서비스 레이어 함수는 Hook wrapper 없이 존재 가능.
