import * as Sentry from '@sentry/react'

/**
 * Sentry 초기화
 *
 * - `VITE_SENTRY_DSN` 환경변수가 설정된 경우에만 활성화 (개발 환경 기본 비활성)
 * - 트랜잭션 샘플링 10%, 세션 리플레이는 에러 발생 시에만 캡처
 * - PII(개인정보) 자동 수집 비활성화
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined
  if (!dsn) {
    // 개발/미설정 환경: 활성화하지 않음
    return
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_RELEASE as string | undefined,

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],

    // 성능 모니터링 — 10% 샘플링
    tracesSampleRate: 0.1,

    // 세션 리플레이 — 정상 세션 0%, 에러 발생 세션 100%
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,

    // 추적 대상 URL — Supabase API 호출까지
    tracePropagationTargets: [
      /^https:\/\/[a-z0-9-]+\.supabase\.co\//,
      /^\//,
    ],

    sendDefaultPii: false,

    // 의미 없는 노이즈 필터링
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications.',
      'Non-Error promise rejection captured',
    ],

    beforeSend(event) {
      // 로컬 개발 노이즈 차단
      if (event.request?.url?.includes('localhost')) {
        return null
      }
      return event
    },
  })
}
