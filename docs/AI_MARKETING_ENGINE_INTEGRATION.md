# AI Marketing Engine Integration

## 1. 전체 호출 흐름

```
관리자 브라우저
  │  Authorization: Bearer <사용자 access_token>
  │  POST /functions/v1/generate-marketing
  ▼
Supabase Edge Function (generate-marketing)
  │  1. CORS / OPTIONS 처리
  │  2. supabase.auth.getUser(token) 로 사용자 JWT 검증 → 없으면 401
  │  3. app_metadata.role (또는 user_metadata.role) === 'admin' 확인 → 아니면 403
  │  4. 요청 Body 검증 (source_content, channel 필수)
  │  X-API-Key: BAIKAL_AI_API_KEY
  │  POST /marketing/generate
  ▼
BAIKAL AI Engine (Railway)
  │  FastAPI + OpenAI Provider
  │  마케팅 프롬프트 → LLM 호출
  ▼
Edge Function → 관리자 브라우저 (JSON 응답 전달)
```

---

## 2. BAIKAL AI Engine Endpoint

| 항목 | 값 |
|---|---|
| Method | `POST` |
| Path | `/marketing/generate` |
| 인증 | `X-API-Key: <BAIKAL_AI_API_KEY>` |

---

## 3. Request / Response 규격

### Request Body

```json
{
  "source_content": "원본 콘텐츠 (필수, 1~10000자)",
  "channel": "instagram",
  "purpose": "promotion",
  "tone": "professional",
  "language": "ko",
  "brand": "BAIKAL",
  "additional_instruction": ""
}
```

| 필드 | 필수 | 기본값 | 허용값 |
|---|---|---|---|
| `source_content` | ✅ | — | 문자열 |
| `channel` | ✅ | — | `instagram` \| `threads` \| `naver_blog` |
| `purpose` | ❌ | `promotion` | 문자열 |
| `tone` | ❌ | `professional` | 문자열 |
| `language` | ❌ | `ko` | 문자열 |
| `brand` | ❌ | `BAIKAL` | 문자열 |
| `additional_instruction` | ❌ | `""` | 문자열 |

### 성공 Response (200)

```json
{
  "success": true,
  "content": "생성된 마케팅 콘텐츠 본문",
  "channel": "instagram",
  "metadata": {
    "brand": "BAIKAL",
    "language": "ko"
  }
}
```

### 오류 Response

| 상황 | HTTP | `error` 코드 |
|---|---|---|
| 인증 실패 (X-API-Key) | 401 | `UNAUTHORIZED` |
| 필수 필드 누락 | 422 | `VALIDATION_ERROR` |
| 지원하지 않는 채널 | 422 | `VALIDATION_ERROR` (Pydantic) |
| LLM 미설정 | 503 | `LLM_NOT_CONFIGURED` |
| LLM 타임아웃 | 504 | `LLM_TIMEOUT` |
| LLM 제공자 오류 | 502 | `LLM_PROVIDER_ERROR` |

---

## 4. 인증 흐름

```
관리자 브라우저
  → supabase.auth.getSession() → session.access_token
  → fetch('/functions/v1/generate-marketing', {
      headers: { Authorization: `Bearer ${access_token}` }
    })
  → Edge Function: supabase.auth.getUser(token) → 유효하지 않으면 401
  → Edge Function: app_metadata.role ?? user_metadata.role === 'admin' → 아니면 403
  → BAIKAL AI Engine: X-API-Key 헤더만 사용 (사용자 정보 미전달)
```

**admin role 판단 기준** (`AuthProvider.tsx` 와 동일):
```ts
user.app_metadata?.role ?? user.user_metadata?.role === 'admin'
```

**오류 응답:**

| 상황 | HTTP | `error` 코드 |
|---|---|---|
| Authorization 헤더 없음 | 401 | `UNAUTHORIZED` |
| JWT 유효하지 않음 | 401 | `UNAUTHORIZED` |
| 로그인 사용자이나 admin 아님 | 403 | `FORBIDDEN` |
| Secret 미설정 | 503 | `NOT_CONFIGURED` |
| AI Engine 연결 실패 | 502 | `AI_ENGINE_UNREACHABLE` |

**주의:**
- `VITE_SUPABASE_ANON_KEY` 를 사용자 JWT 대신 사용하지 않는다.
- Railway URL 과 `BAIKAL_AI_API_KEY` 는 Edge Function 내부에서만 사용하며 브라우저에 노출되지 않는다.

---

## 5. Supabase Secrets

`BAIKAL_AI_URL` 과 `BAIKAL_AI_API_KEY` 는 Supabase 프로젝트(`slpmknspczdbaowkuftx`)에 **등록 완료**.

재등록 불필요. 배포 전 현재 Railway 서비스 값과 일치 여부만 Supabase Dashboard → Edge Functions → Secrets 에서 확인한다.

Secret 값은 이 문서에 기록하지 않는다.

자동 주입 변수 (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) 는 별도 설정 불필요.

---

## 6. 로컬 테스트

### BAIKAL AI Engine

```bash
# health 확인
curl http://localhost:8000/health

# marketing/generate 테스트
curl -X POST http://localhost:8000/marketing/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <API_KEY>" \
  -d '{
    "source_content": "바이칼시스템즈는 AI 소프트웨어 개발 전문 기업입니다.",
    "channel": "instagram"
  }'
```

### pytest

```bash
cd C:\baikal777\baikal-ai
.venv\Scripts\python -m pytest tests/ -v
```

### Edge Function (Supabase CLI)

```bash
cd C:\baikal_platform\baikal_platform_basic
supabase functions serve generate-marketing --env-file supabase/.env.local

# OPTIONS preflight
curl -X OPTIONS http://localhost:54321/functions/v1/generate-marketing

# Authorization 없음 → 401
curl -X POST http://localhost:54321/functions/v1/generate-marketing \
  -H "Content-Type: application/json" \
  -d '{"source_content":"테스트","channel":"instagram"}'

# 정상 요청 (로그인 후 access_token 필요)
curl -X POST http://localhost:54321/functions/v1/generate-marketing \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "source_content": "바이칼시스템즈 AI 소프트웨어 개발 전문 기업",
    "channel": "instagram",
    "brand": "BAIKAL"
  }'
```

---

## 7. 배포 방법

### BAIKAL AI Engine (Railway)

다음 파일이 변경되었으며 아직 commit/push 하지 않았다. Railway 재배포가 필요하다.

| 파일 | 변경 내용 |
|---|---|
| `app/models.py` | `MarketingRequest`, `MarketingMetadata` 모델 추가 |
| `app/services.py` | `generate_marketing_content()` 함수 추가 |
| `app/main.py` | `POST /marketing/generate` 엔드포인트 추가 |

Git branch: `master`. Railway 자동 배포 branch 설정과 일치 여부를 Railway Dashboard에서 확인한다.

배포 명령 (Railway CLI 미설치 — Dashboard 또는 GitHub 연동 확인 필요):
```bash
cd C:\baikal777\baikal-ai
git add app/models.py app/services.py app/main.py tests/test_marketing.py
git commit -m "feat: add POST /marketing/generate endpoint"
git push origin master
# → Railway 자동 재배포 (자동 배포 설정 시)
```

배포 완료 후 Railway 도메인 `/health` 로 정상 응답을 확인한다.

### Supabase Edge Function

`config.toml` 에 `generate-marketing` 함수가 별도 설정되지 않았으므로 `verify_jwt = true` (기본값) 적용.
`--no-verify-jwt` 옵션 사용하지 않는다.

```bash
supabase functions deploy generate-marketing `
  --project-ref slpmknspczdbaowkuftx
```

---

## 8. 관리자 UI에서 호출하는 방법

```typescript
// src/pages/admin/AdminMarketing.tsx 등에서 사용
import { supabase } from '@/lib/supabase'

async function generateMarketingContent(payload: {
  source_content: string
  channel: 'instagram' | 'threads' | 'naver_blog'
  brand?: string
  tone?: string
  language?: string
  purpose?: string
  additional_instruction?: string
}) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('로그인이 필요합니다.')

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-marketing`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(payload),
    },
  )

  const body = await res.json()
  if (!res.ok || !body.success) {
    throw new Error(body.message ?? 'AI 콘텐츠 생성 실패')
  }
  return body as { success: true; content: string; channel: string; metadata: { brand: string; language: string } }
}
```

---

## 9. 알려진 제한사항

| 항목 | 내용 |
|---|---|
| 지원 채널 | MVP: `instagram`, `threads`, `naver_blog` 만 지원 |
| LLM Provider | OpenAI 단일 Provider (`.env` `LLM_PROVIDER=openai`) |
| 타임아웃 | 기본 60초 (`LLM_TIMEOUT`). 긴 원본 콘텐츠는 타임아웃 가능 |
| 관리자 권한 | Edge Function 에서 `app_metadata.role === 'admin'` 검증 적용 완료 (비관리자 → 403) |
| 생성 이력 저장 | 현재 DB 저장 미구현. 관리자 UI 구현 시 함께 추가 권장 |
| 관리자 UI | `/admin/marketing` 페이지 미구현. Edge Function 배포 후 별도 구현 |
| Railway URL 변경 | 변경 시 Supabase Secret `BAIKAL_AI_URL` 재설정 후 Edge Function 재배포 필요 |

---

## 10. 배포 기록

### BAIKAL AI Engine (Railway)

| 항목 | 값 |
|---|---|
| 배포 날짜 | 2026-08-05 |
| commit hash | `73d87f9` |
| branch | `master` |
| 변경 파일 | `app/models.py`, `app/services.py`, `app/main.py`, `tests/test_marketing.py` |
| Railway 도메인 | `baikalai-production.up.railway.app` |
| `/health` 응답 | 200 OK (`status: ok, service: BAIKAL AI, version: 0.1.0`) |
| `/marketing/generate` 인증 없음 | 401 확인 ✅ |
| `/marketing/generate` 실호출 | Railway `API_KEY` 확인 후 검증 필요 — 아래 주의사항 참고 |

> ⚠️ **Railway API_KEY 확인 필요**: Railway Dashboard → baikal-ai → Variables의 `API_KEY` 값과
> Supabase Secret `BAIKAL_AI_API_KEY` 값이 일치하는지 반드시 확인한다.
> 로컬 `.env` `API_KEY`는 개발 전용이며 Railway 프로덕션 키와 다를 수 있다.

### Supabase Edge Function (generate-marketing)

| 항목 | 값 |
|---|---|
| 배포 날짜 | 2026-08-05 |
| 함수명 | `generate-marketing` |
| 상태 | ACTIVE |
| 버전 | 1 |
| `verify_jwt` | `true` (기본값, `--no-verify-jwt` 미사용) |
| JWT 없음 요청 | Supabase Gateway에서 401 차단 (`UNAUTHORIZED_NO_AUTH_HEADER`) ✅ |
| 유효하지 않은 JWT | Gateway에서 401 차단 (`UNAUTHORIZED_INVALID_JWT_FORMAT`) ✅ |
| admin 아닌 사용자 | Edge Function 내부에서 403 반환 ✅ (코드 검증 완료) |
| admin 실호출 E2E | admin access_token으로 수동 확인 필요 |
