import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

// 세션 ID: sessionStorage에 저장 (탭 닫으면 소멸 — 개인정보 미보관)
function getSessionId(): string {
  const key = 'baikal_sid'
  let sid = sessionStorage.getItem(key)
  if (!sid) {
    sid = crypto.randomUUID()
    sessionStorage.setItem(key, sid)
  }
  return sid
}

// 봇 감지 (기본적인 UA 필터)
function isBot(): boolean {
  const ua = navigator.userAgent.toLowerCase()
  return /bot|crawl|spider|slurp|googlebot|bingbot|yandex|baidu|duckduck/i.test(ua)
}

export function usePageTracking() {
  const location = useLocation()

  useEffect(() => {
    // /admin 경로는 추적 제외
    if (location.pathname.startsWith('/admin')) return
    if (isBot()) return

    const sessionId = getSessionId()
    const referrer = document.referrer || null

    // 비동기 insert (실패해도 UX에 영향 없음)
    supabase
      .from('page_views')
      .insert({
        path: location.pathname,
        session_id: sessionId,
        referrer,
      })
      .then(({ error }) => { if (error) console.warn('[page_view]', error.message) })
  }, [location.pathname])
}
