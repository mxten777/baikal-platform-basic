# 문의 접수·관리 MVP

## 현재 상태

최신 공개 화면은 이메일 문의 방식으로 단순화했다. `/contact`는 기존 이메일 버튼만
제공하고 문의 폼을 마운트하지 않아 동의 체크박스·정책 조회·Turnstile 로드·접수 POST가
발생하지 않는다. `/privacy`는 정책 API를 호출하지 않는 개인정보 연락 창구 안내로 유지하며
미확정 정책 문구는 표시하지 않는다. 이메일 처리가 개인정보 무처리라는 뜻은 아니다.
기존 폼·DB·Edge Function·Turnstile 설정은 삭제하지 않고 보존한다.
접수·메일 알림은 기존 비활성 상태를 유지하고 STEP 8-J에서 승인된 cleanup·Cron은
변경하지 않는다. 아래 내용은 보존된 웹 접수 기능의 기술·운영 기록이다.
이 화면 변경은 로컬 준비이며 승인 없는 운영 배포·Secret 변경은 하지 않는다.

기존 DB와 비활성 MVP는 운영에 배포되어 있다. STEP 6-W 승인으로 IP 비의존 후속
migration을 단독 적용했으며 서버·프런트는 접수 비활성 상태로 반영한다.
기존 이메일 안내는 유지하며 실제 운영 활성화는 별도 승인 대상이다.
개인정보 정책 미확정 상태에서는 프런트와 서버 모두 접수를 차단한다.
임시 동의문·보유기간 기본값은 없다. 운영 Secret, DB 마이그레이션, 메일 전송,
접수 활성화는 각각 별도 승인이 필요하다.

STEP 7-C 정책 선게시 준비는 로컬 변경이며 운영 미배포다.
`/privacy`는 프런트 접수 false에서도 정책을 조회하되, 서버는 유효한 정책 JSON과
`INQUIRY_POLICY_APPROVED=true` 및 승인된 HTTPS Origin이 있어야 GET을 공개한다.
미승인은 503 `POLICY_NOT_PUBLISHED`이고, POST는 여전히 접수 false에서 503
`INTAKE_DISABLED`다. 정책 조회는 CAPTCHA·HMAC·DB/RPC·메일을 호출하지 않는다.
보호책임자 정동열/대표이사/공식 이메일 지정만 승인되었고 정책 전문 승인은 대기다.

## 파일과 동작

- [공개 양식](../src/features/inquiries/InquiryForm.tsx): 기본 비활성, 승인 정책을 서버에서 읽은 뒤 동의와 CAPTCHA를 제공한다.
- [서비스](../src/features/inquiries/inquiryService.ts): 공개 HTTP 및 기존 인증 기반 관리자 조회.
- [마이그레이션](../supabase/migrations/20261029000001_contact_inquiries.sql):
  문의/상태 이력/비노출 요청 제한 테이블, RLS, 접수·선점·처리 RPC.
- [IP 비의존 후속 migration](../supabase/migrations/20261029000002_ip_independent_inquiry_limits.sql):
  CAPTCHA 예산과 이메일/전체 접수 제한, 기존 IP RPC 제거. 기존 적용 migration은 수정하지 않는다.
- [서버 핵심](../supabase/functions/_shared/inquiries.ts): 요청 크기/입력/동의/Turnstile 검증,
  HMAC 기반 원자적 제한, 중복 접수 방지, Resend 알림 어댑터.
- [접수 함수](../supabase/functions/submit-inquiry/index.ts):
  승인된 Origin의 GET(공개 동의문)/POST(접수)/OPTIONS만 허용한다.
- [worker](../supabase/functions/inquiry-maintenance/index.ts):
  서버 Secret 필수. notifications/cleanup 액션만 허용한다.
- [작업 등록안](../supabase/inquiry_cron_setup.sql): 신규 두 작업만 등록한다.
  STEP 6-X에서 문의 두 작업을 등록했으며 기존 RSS 작업을 보존했다.
  cleanup 실호출 HTTP 200·삭제 0건 시험 후 cleanup=false로 복원했다.

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
| 정책 선게시 | 전문 승인 후에만 `INQUIRY_POLICY_APPROVED=true`. 서버·프런트 접수·알림·cleanup은 별도 승인 전 false 유지 |
| Origin | `INQUIRY_ALLOWED_ORIGIN`: 승인된 단일 HTTPS Origin |
| CAPTCHA | `TURNSTILE_SECRET_KEY`, `TURNSTILE_SITE_KEY` |
| 가명 키 | 충분히 긴 `INQUIRY_HMAC_KEY` (최소 32자, 운영 보유기간 내 무계획 교체 금지) |
| 서버 작업 | `INQUIRY_JOB_SECRET` 최소 32자 |
| 메일 | `RESEND_API_KEY`, `INQUIRY_MAIL_FROM`, `INQUIRY_MAIL_TO`, `INQUIRY_NOTIFICATIONS_ENABLED=true` |
| 삭제 | 승인된 정책에 따라 `INQUIRY_CLEANUP_ENABLED=true` |

Supabase URL/service-role key는 서버에서만 사용한다. CAPTCHA 공개 키는 GET 응답으로
전달하고 메일/작업/가명키는 절대 VITE 환경변수로 노출하지 않는다.
두 Edge Function은 플랫폼 JWT 검사를 끄지만 접수는 챌린지·제한·검증,
worker는 별도 서버 인증을 사용한다. 공개 apikey는 관리자 인증 수단이 아니다.

접수 경로는 IP 헤더를 읽거나 전달·저장하지 않는다. 기존 `INQUIRY_IP_HEADER_VERIFIED`,
`INQUIRY_TRUSTED_IP_HEADER`는 더 이상 활성화 조건이 아니다. 플랫폼 자체 IP 로그는 별도다.

POST는 DB 원자적 고정 1분 창 예산 30회를 먼저 소비한다. 잘못된 입력·동의·CAPTCHA도
이 예산에 포함하므로 Turnstile Siteverify는 창당 최대 30회이다. GET/OPTIONS는 DB 접수나
Siteverify를 호출하지 않는다. 예산 DB 실패 시 외부 검증·접수를 차단한다.
한도 초과 응답은 429/Retry-After 60이며 공식 이메일을 안내한다.

실제 신규 접수는 같은 INSERT 트랜잭션에서 전체 분당 30건 및
이메일 HMAC당 10분 5건을 검사한다. 초과 시 문의·queued 알림·접수 카운터 증가를 모두
롤백한다. 기존 idempotency 키의 동일 payload 재시도는 기존 접수만 반환하며 신규
접수 한도를 소비하지 않는다. 단, 공개 재시도도 CAPTCHA 호출 예산과 새 토큰 검증은 필요하다.
접수 한도 응답은 429/Retry-After 600이다.
이메일 HMAC는 서버에서 `email/` 접두사와 전체 소문자 이메일로 계산하며 DB에 원문
카운터 키를 저장하지 않는다. 대소문자 변형에 의한 우회를 보수적으로 합산하나,
다른 주소/별칭 변경까지 같은 사람으로 판별하지는 않는다.

전체/이메일/CAPTCHA 카운터 TTL은 1시간, 메일 예산 창은 2일이며 매일 cleanup으로 정리한다.
worker 1분 주기/배치10/최대5회, 발송 예산 하루90회는 그대로다.
고정 창 경계에서는 짧은 시간에 연속 두 창의 한도를 쓸 수 있으며 일일 접수/총 DB 용량
상한은 아니다. 분산 공격의 전체 예산 소진 및 정상 사용자 거절 위험을 없애지는 못한다.
IP·이메일은 신원 인증 수단이 아니며 Origin 검사도 HTTP 클라이언트 인증을 대신하지 않는다.
DB 카운터가 분산 인스턴스의 예산을 공유하지만 게이트웨이 진입량·DB 예산 RPC 호출량까지
막지는 않으므로 제공자 쿼터/관측과 필요 시 별도 게이트웨이 방어를 검토한다.

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
- 운영 scheduler/Vault와 IP 비의존 제한값·정상 유입 거절 대응 승인.

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

## 운영 반영과 복구 (별도 승인 필요)

1. 정책·환경·마이그레이션·메일 발송·배포를 명시 승인받는다.
2. 스테이징 권한·양식·실패/재시도·정리·다중 연결 테스트.
3. 현재 데이터 44건/대표9건·기존 파일 해시·배포 SHA 백업.
4. 접수 false 상태에서 후속 migration 한 개만 별도 승인 적용하고 새 RPC 권한 확인.
   기존 IP RPC 및 12인자 접수 RPC는 제거되고 13인자 접수 RPC가 생성된다.
   서버를 새 RPC 호출 버전으로 배포할 때까지 활성화하지 않는다. 과거 migration 일괄 실행 금지.
5. 정책/서버 설정·도메인·worker·Vault·스케줄 설정, 양식은 아직 닫음.
6. 별도 승인된 가상 데이터로 수신 검증 후 마지막으로 UI 활성화.
7. 장애 시 서버 접수/UI 플래그를 닫고 이메일 안내 유지.
   이미 받은 문의는 보존하며 테이블 drop이나 전체 DB 복원은 하지 않는다.
8. 기존 프로젝트/RLS/helper/cron/Storage/미커밋 파일은 무관 변경 금지.

관리자 조회·상태 변경·365일 만료/일일 cleanup·이력 CASCADE는 변경하지 않는다.
관리자 UI에는 삭제 버튼이 없으며 권리행사 삭제는 별도 승인된 운영자 절차로 수행한다.
기존 IP 카운터가 있더라도 후속 migration에서 운영 데이터를 일괄 삭제하지 않고
기존 만료 cleanup에 맡긴다. STEP 6-W에서는 후속 migration만 적용하고
cleanup 활성화·Secret·Vault·cron은 변경하지 않는다.
