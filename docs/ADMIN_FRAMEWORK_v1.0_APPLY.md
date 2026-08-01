# BAIKAL Admin Framework v1.0 적용 기록

**적용일**: 2026-08-01  
**기준**: `C:\baikal777\baikal-spacehub-ai\docs\BAIKAL_ADMIN_FRAMEWORK_v1.0.md`

---

## 적용 목적

THE LIT 프로젝트에 확정된 BAIKAL Admin Framework v1.0 표준을  
BAIKAL 홈페이지 관리자 화면에 적용하여 UI/UX 일관성 확보 및 운영 편의성 향상

---

## 변경 메뉴 구조

**이전**
```
메뉴 (단일 섹션): 대시보드, 콘텐츠, 프로젝트, 수집소스, 동기화작업, 미디어, 태그, SEO, 설정
```

**이후**
```
[운영] 대시보드, 콘텐츠, 프로젝트, 미디어, 태그
[시스템] 외부 콘텐츠 (수집소스 + 동기화작업 탭 통합)
```

제거: SEO (placeholder), 설정 (체크리스트) — 파일은 유지, 라우트·메뉴에서 제거

---

## 변경 파일

| 파일 | 변경 내용 |
|------|-----------|
| `src/layouts/AdminLayout.tsx` | nav 섹션 분리, 로그아웃 `signOut({ scope: 'local' })` + `window.location.href` |
| `src/App.tsx` | seo/settings 라우트 제거, `/admin/external` 라우트 추가 |
| `src/pages/admin/AdminExternal.tsx` | 신규: 수집소스 + 동기화작업 탭 래퍼 |
| `src/pages/admin/AdminDashboard.tsx` | 4-block 구조 적용 (오늘의 현황 / 주요 현황 / 빠른 작업 / 최근 활동) |

---

## 유지한 기존 기능

- 모든 DB 쿼리 및 데이터 로직 무변경
- AdminSEO.tsx, AdminSettings.tsx 파일 보존
- AdminSources.tsx, AdminSyncJobs.tsx 직접 라우트 보존 (`/admin/sources`, `/admin/sync-jobs`)
- 기존 Auth (`app_metadata.role === 'admin'` 단일 역할) 유지
- Supabase Storage, Edge Functions 연동 무변경

---

## 보류 항목

| 항목 | 사유 |
|------|------|
| 역할 시스템 (super_admin / operator / viewer) | 현재 단일 운영자, 다중 운영자 필요 시 적용 |
| `profiles` 테이블 + `permissions.ts` | 역할 시스템과 함께 적용 |
| SEO 관리 실구현 | 별도 Phase |
| AdminSettings 재설계 | 별도 Phase |

---

## 검증 결과

- TypeScript 오류: 0
- Build: 성공 (`vite build`, 3301 modules)
