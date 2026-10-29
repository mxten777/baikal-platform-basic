# 문의 접수·관리 MVP

## 현재 상태

로컬 개발용 구현이며 운영 미적용 상태이다. 기존 이메일 안내는 유지한다.
개인정보 정책 미확정 상태에서는 프런트와 서버 모두 접수를 차단한다.
임시 동의문·보유기간 기본값은 없다. 운영 Secret, DB 마이그레이션, 메일 전송,
접수 활성화는 각각 별도 승인이 필요하다.

## 파일과 동작

- [공개 양식](../src/features/inquiries/InquiryForm.tsx): 기본 비활성, 승인 정책을 서버에서 읽은 뒤 동의와 CAPTCHA를 제공한다.
- [서비스](../src/features/inquiries/inquiryService.ts): 공개 HTTP 및 기존 인증 기반 관리자 조회.
- [마이그레이션](../supabase/migrations/20261029000001_contact_inquiries.sql):
  문의/상태 이력/비노출 요청 제한 테이블, RLS, 접수·선점·처리 RPC.
- [서버 핵심](../supabase/functions/_shared/inquiries.ts): 요청 크기/입력/동의/Turnstile 검증,
  HMAC 기반 원자적 제한, 중복 접수 방지, Resend 알림 어댑터.
- [접수 함수](../supabase/functions/submit-inquiry/index.ts):
  승인된 Origin의 GET(공개 동의문)/POST(접수)/OPTIONS만 허용한다.
- [worker](../supabase/functions/inquiry-maintenance/index.ts):
  서버 Secret 필수. notifications/cleanup 액션만 허용한다.
- [작업 등록안](../supabase/inquiry_cron_setup.sql): 신규 두 작업만 등록한다.
  실행하지 않았으며 기존 작업을 삭제하거나 덮어쓰지 않는다.

신규 테이블은 기존 `is_admin()`을 사용하지 않는다. 관리자 권한은
`auth.uid()`와 `app_metadata.role=admin`으로 검사한다. user_metadata만 admin이면
거절한다. 익명 직접 DB INSERT/SELECT와 일반 사용자 변경은 허용하지 않는다.
기존 private 스키마의 ACL은 유지하고 신규 요청 제한 테이블만 직접 접근을 차단한다.
목록에는 이름/이메일/본문을 반환하지 않는다. 상세 원문은 관리자에게만 제공하고
메일 주소는 기본 숨긴다. 상태 변경은 version 비교와 이력을 한 트랜잭션으로 처리한다.

접수번호는 고유한 `BQ-UUID`, 성공 응답은 번호/서버 시각만 포함한다.
접수 INSERT에 알림 queued 상태를 같이 기록한다. 메일 서비스가 실패해도
접수 레코드를 삭제하지 않는다. timeout 이후에는 **새 CAPTCHA + 동일 키/입력**으로
재시도한다. 원문은 브라우저 영구 저장소에 저장하지 않고 키만 sessionStorage에 둔다.
정책 버전이 바뀌면 재동의가 필요하며, 불확실한 기존 건을 자동 재등록하지 않는다.

## 승인 후 필요한 설정 (값을 소스에 넣지 말 것)

| 구분 | 설정 |
|---|---|
| 프런트 | `VITE_CONTACT_INTAKE_ENABLED` (기본 false) |
| 서버 접수 | `CONTACT_INTAKE_ENABLED=true`, `INQUIRY_POLICY_APPROVED=true` |
| 정책 | `INQUIRY_POLICY_JSON`: version, text, privacyText, retentionVersion, retentionDays |
| Origin | `INQUIRY_ALLOWED_ORIGIN`: 승인된 단일 HTTPS Origin |
| 신뢰 IP | `INQUIRY_IP_HEADER_VERIFIED=true`, `INQUIRY_TRUSTED_IP_HEADER` |
| CAPTCHA | `TURNSTILE_SECRET_KEY`, `TURNSTILE_SITE_KEY` |
| 가명 키 | 충분히 긴 `INQUIRY_HMAC_KEY` (최소 32자, 운영 보유기간 내 무계획 교체 금지) |
| 서버 작업 | `INQUIRY_JOB_SECRET` 최소 32자 |
| 메일 | `RESEND_API_KEY`, `INQUIRY_MAIL_FROM`, `INQUIRY_MAIL_TO`, `INQUIRY_NOTIFICATIONS_ENABLED=true` |
| 삭제 | 승인된 정책에 따라 `INQUIRY_CLEANUP_ENABLED=true` |

Supabase URL/service-role key는 서버에서만 사용한다. CAPTCHA 공개 키는 GET 응답으로
전달하고 메일/작업/가명키는 절대 VITE 환경변수로 노출하지 않는다.
두 Edge Function은 플랫폼 JWT 검사를 끄지만 접수는 챌린지·제한·검증,
worker는 별도 서버 인증을 사용한다. 공개 apikey는 관리자 인증 수단이 아니다.

신뢰 IP 헤더는 `x-real-ip`/`cf-connecting-ip` 중 **플랫폼이 실제로 덮어쓰는 것으로
검증된 하나**만 승인한다. 현재 계약은 미확정이다. 이 확인 없이 단순 환경값만
켜서 공개하면 안 된다. 헤더가 없으면 접수 거절한다. IP 원문은 저장하지 않고
일별 HMAC/10분 창 키만 저장한다. 창 TTL은 1시간, 메일 예산 창은 2일이다.
이 가명정보의 기간도 개인정보 정책 승인 대상이다.

IP당 10분 5회/전체 분당 30회, worker 1분 주기/배치10/최대5회, 발송 예산 하루90회는
초기 구현 값이며 출시 전 운영 승인을 받아야 한다. 공유 NAT와 유입량에 따라 조정한다.
DB 카운터로 분산 인스턴스가 같은 제한을 공유한다.

## 알림과 장애 처리

메일은 고정 수신자에게 접수번호/시각/관리자 링크만 보낸다. 고객 PII·본문·Reply-To는
포함하지 않는다. `accepted`는 provider 수락이지 도착/열람 성공이 아니다.

선점은 SKIP LOCKED + 2분 lease/claim ID로 처리한다. 두 worker가 동시에 발송하지 않으며
lease 복구 시 같은 `inquiry/ID/generation` 키를 유지한다. Resend 중복방지 24시간보다
보수적인 23시간을 지나거나 시도 횟수가 소진되면 unknown으로 중단한다.
408/409/5xx/네트워크 오류는 중복방지 키를 유지해 재시도하며
429는 Retry-After, 명확한 설정/권한 오류는 failed다.
확정 실패만 관리자 재시도로 새 generation을 만든다.
unknown은 provider 대시보드에서 수락 여부를 확인한 뒤 운영 판단한다.

관리자는 목록을 매일 확인하고 실패/불확실 필터를 확인한다.
Supabase cron/함수 운영 로그로 worker 실행 자체의 장애를 확인한다.
알림 전달·반송 웹훅, 자동 고객 이메일, 실제 회신 발송은 MVP 범위 밖이다.

## 개인정보 결정 및 출시 차단 항목

- 보유기간/기산점/삭제 요청 확인/개인정보 담당자와 고지문 전문·버전.
- 가명 요청 제한 정보 TTL, 백업 잔존 및 복구 후 재삭제 절차.
- Resend/Turnstile/Supabase 위탁·국외 처리 검토, 실제 계약/도메인 소유권.
- 수신 담당자·응대 절차·발신 도메인 SPF/DKIM/DMARC·쿼터.
- 운영 scheduler/Vault와 신뢰 헤더 계약 확인.

만료 삭제는 상태와 무관하게 expires_at을 기준으로 수행하고 상태 변경으로 기간을
연장하지 않는다. 알림 활성화를 끄더라도 승인된 정리 작업까지 무조건 중지하지 않는다.
활성 lease가 끝난 문의만 삭제하며 상태 이력은 CASCADE로 제거한다.
기존 프로젝트는 참조만 하고 변경하지 않는다.

폼·관리자 상세에는 Sentry replay 차단 속성을 적용하고 해당 경로의 오류 이벤트를
제외한다. 해당 경로 방문 후에는 같은 SPA 세션에서 모든 Sentry envelope 전송을
차단하고 replay를 중지하며 breadcrumb를 비운다. 이후 다른 페이지로 이동해도
전송을 재개하지 않는다(새 문서 로드 시 초기화). 따라서 해당 세션의 일반 페이지
관찰도 제한되는 의도적인 개인정보 보호 조치다.
운영 전 실제 리플레이·breadcrumb·네트워크 수집에서 원문이 빠지는지
스테이징 검증이 필요하다. 로그는 코드/무작위 request ID만 남긴다.

## 처리방침과 승인안

`/privacy`와 문의 양식은 동일한 서버 정책 응답의 version/text/privacyText를 사용한다.
프런트 비활성 또는 서버 정책 조회 실패 시 승인 문서를 대신 표시하지 않는다.
[승인안](./CONTACT_PRIVACY_PROPOSAL.md)의 365일·담당자·외부 처리·백업 정책은
아직 미승인이다. 승인 후 전문과 동의문을 같은 JSON으로 등록하고 정합성을 검증한다.
현재 전화번호는 별도 수집하지 않으며 추가하려면 고지·구현 모두 별도 승인이 필요하다.

## 로컬 검증

```powershell
npm run type-check
npm run build
npx eslint src\features\inquiries src\pages\admin\AdminInquiries.tsx src\pages\admin\AdminInquiryDetail.tsx src\pages\contact\ContactPage.tsx src\App.tsx src\layouts\AdminLayout.tsx src\lib\sentry.ts
node --test scripts\inquiries.test.mjs scripts\inquiry-privacy.test.mjs scripts\home-copy.test.mjs scripts\project-detail.test.mjs scripts\auth-provider.test.mjs
deno check supabase\functions\_shared\inquiries.ts supabase\functions\submit-inquiry\index.ts supabase\functions\inquiry-maintenance\index.ts
deno lint supabase\functions\_shared\inquiries.ts supabase\functions\submit-inquiry\index.ts supabase\functions\inquiry-maintenance\index.ts
```

문의 테스트는 PGlite의 메모리 PostgreSQL에 필요한 auth 역할을 구성하고 신규 SQL만
실행한다. Edge 핸들러를 실제 Request/Response와 결합하되 CAPTCHA/Resend HTTP는
mock한다. 운영 URL·DB·고객 데이터·메일은 사용하지 않는다.
PGlite는 단일 엔진 큐이므로 병렬 Promise 요청의 고유 제약/원자적 결과는 검증하지만
실제 PostgreSQL 다중 세션 lock 경쟁이나 Supabase 게이트웨이까지 증명하지 않는다.
운영 승인 전 Docker Supabase/스테이징에서 다중 연결, JWT/RLS, 실제 CAPTCHA의
hostname·만료, 인증된 샌드박스 수신 테스트를 별도 수행한다.

## 운영 반영과 복구 (이번 단계 실행 금지)

1. 정책·환경·마이그레이션·메일 발송·배포를 명시 승인받는다.
2. 스테이징 권한·양식·실패/재시도·정리·다중 연결 테스트.
3. 현재 데이터 44건/대표9건·기존 파일 해시·배포 SHA 백업.
4. 신규 migration 적용 후 익명/일반 사용자의 접근 거절 확인.
5. 정책/서버 설정·도메인·worker·Vault·스케줄 설정, 양식은 아직 닫음.
6. 별도 승인된 가상 데이터로 수신 검증 후 마지막으로 UI 활성화.
7. 장애 시 서버 접수/UI 플래그를 닫고 이메일 안내 유지.
   이미 받은 문의는 보존하며 테이블 drop이나 전체 DB 복원은 하지 않는다.
8. 기존 프로젝트/RLS/helper/cron/Storage/미커밋 파일은 무관 변경 금지.
