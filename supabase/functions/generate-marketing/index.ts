// =============================================================================
// Supabase Edge Function: generate-marketing
// supabase/functions/generate-marketing/index.ts
//
// 역할: 로그인 사용자 JWT를 검증한 뒤 Railway BAIKAL AI Engine을 호출하여
//       마케팅 콘텐츠를 생성하고 결과를 반환한다.
// 트리거: 관리자 UI (Admin Marketing Page) 수동 호출
//
// 필요한 Supabase Secrets:
//   BAIKAL_AI_URL     — Railway 배포 URL (예: https://xxx.railway.app)
//   BAIKAL_AI_API_KEY — BAIKAL AI Engine X-API-Key 값
// =============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const BAIKAL_AI_URL = Deno.env.get('BAIKAL_AI_URL') ?? ''
const BAIKAL_AI_API_KEY = Deno.env.get('BAIKAL_AI_API_KEY') ?? ''

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, baggage, sentry-trace',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const ALLOWED_CHANNELS = ['instagram', 'threads', 'naver_blog', 'reels']

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return jsonResponse(
      { success: false, error: 'METHOD_NOT_ALLOWED', message: 'POST 요청만 허용됩니다.' },
      405,
    )
  }

  // ── 사용자 JWT 검증 ──────────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization') ?? ''
  if (!authHeader.startsWith('Bearer ')) {
    return jsonResponse(
      { success: false, error: 'UNAUTHORIZED', message: '로그인이 필요합니다.' },
      401,
    )
  }

  const token = authHeader.slice(7)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    console.error('generate-marketing: JWT 검증 실패', authError?.message ?? 'user null')
    return jsonResponse(
      { success: false, error: 'UNAUTHORIZED', message: '유효하지 않은 인증 토큰입니다.' },
      401,
    )
  }

  // ── 관리자 권한 확인 ─────────────────────────────────────────────────────
  // AuthProvider.tsx 와 동일한 기준: app_metadata.role 우선, 없으면 user_metadata.role
  const userRole = user.app_metadata?.['role'] ?? user.user_metadata?.['role']
  if (userRole !== 'admin') {
    console.warn(`generate-marketing: 관리자 권한 없음 user=${user.id} role=${userRole ?? 'none'}`)
    return jsonResponse(
      { success: false, error: 'FORBIDDEN', message: '관리자 권한이 필요합니다.' },
      403,
    )
  }

  // ── Secret 설정 확인 ─────────────────────────────────────────────────────
  if (!BAIKAL_AI_URL || !BAIKAL_AI_API_KEY) {
    console.error('generate-marketing: BAIKAL_AI_URL 또는 BAIKAL_AI_API_KEY 미설정')
    return jsonResponse(
      { success: false, error: 'NOT_CONFIGURED', message: 'AI 엔진이 설정되지 않았습니다.' },
      503,
    )
  }

  // ── Body 파싱 ────────────────────────────────────────────────────────────
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return jsonResponse(
      { success: false, error: 'INVALID_JSON', message: '요청 본문이 올바른 JSON이 아닙니다.' },
      400,
    )
  }

  // ── 필수 필드 검증 ───────────────────────────────────────────────────────
  const { source_content, channel } = body

  if (!source_content || typeof source_content !== 'string' || source_content.trim() === '') {
    return jsonResponse(
      { success: false, error: 'VALIDATION_ERROR', message: 'source_content는 필수입니다.' },
      422,
    )
  }
  if (!channel || typeof channel !== 'string') {
    return jsonResponse(
      { success: false, error: 'VALIDATION_ERROR', message: 'channel은 필수입니다.' },
      422,
    )
  }
  if (!ALLOWED_CHANNELS.includes(channel)) {
    return jsonResponse(
      {
        success: false,
        error: 'INVALID_CHANNEL',
        message: `지원하지 않는 채널입니다. 허용: ${ALLOWED_CHANNELS.join(', ')}`,
      },
      400,
    )
  }

  // ── Railway BAIKAL AI Engine 호출 ────────────────────────────────────────
  const aiUrl = `${BAIKAL_AI_URL.replace(/\/$/, '')}/marketing/generate`
  const payload = {
    source_content:         source_content.trim(),
    channel,
    purpose:                body.purpose               ?? 'promotion',
    tone:                   body.tone                  ?? 'professional',
    language:               body.language              ?? 'ko',
    brand:                  body.brand                 ?? 'BAIKAL',
    additional_instruction: body.additional_instruction ?? '',
  }

  // Reels: Railway Pydantic이 허용하는 channel로 교체하고 대본 형식을 additional_instruction에 주입
  if (channel === 'reels') {
    payload.channel = 'instagram'
    const reelsInstruction = [
      '다음 형식으로 Reels 영상 대본을 작성하세요. 마케팅 홍보 문구 대신 실제 영상 제작용 대본을 작성합니다.',
      '',
      'HOOK',
      '(첫 3초에 시청자의 시선을 끌는 강렬한 문구)',
      '',
      'CONCEPT',
      '(영상 전체 콘셉트 한 줄 요약)',
      '',
      'SCENES',
      '',
      'Scene 1',
      '화면: (화면 연출 방식)',
      '내레이션: (음성으로 읽을 텍스트)',
      '자막: (화면에 표시할 텍스트)',
      '',
      'Scene 2',
      '화면:',
      '내레이션:',
      '자막:',
      '',
      'Scene 3',
      '화면:',
      '내레이션:',
      '자막:',
      '',
      'CAPTION',
      '(Instagram 게시물 본문)',
      '',
      'HASHTAGS',
      '(관련 해시태그)',
      '',
      'DURATION',
      '(권장 영상 길이)',
    ].join('\n')
    payload.additional_instruction = reelsInstruction +
      (payload.additional_instruction ? '\n\n' + payload.additional_instruction : '')
  }

  console.log(`generate-marketing: 요청 시작 channel=${channel} user=${user.id}`)

  // 429 rate-limit 시 최대 2회 재시도 (1s → 3s 대기)
  const RETRY_DELAYS = [1000, 3000]
  let aiResponse!: Response
  let aiBody: unknown

  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    try {
      aiResponse = await fetch(aiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': BAIKAL_AI_API_KEY,
        },
        body: JSON.stringify(payload),
      })
    } catch (err) {
      console.error('generate-marketing: AI Engine 연결 실패', String(err))
      return jsonResponse(
        { success: false, error: 'AI_ENGINE_UNREACHABLE', message: 'AI 엔진에 연결할 수 없습니다.' },
        502,
      )
    }

    if (aiResponse.status !== 429 || attempt === RETRY_DELAYS.length) break

    const delay = RETRY_DELAYS[attempt]
    console.warn(`generate-marketing: 429 rate-limit, ${delay}ms 후 재시도 (attempt=${attempt + 1})`)
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  // ── AI Engine 응답 전달 ──────────────────────────────────────────────────
  try {
    aiBody = await aiResponse.json()
  } catch {
    console.error(`generate-marketing: AI Engine 응답 파싱 실패 status=${aiResponse.status}`)
    return jsonResponse(
      { success: false, error: 'AI_ENGINE_ERROR', message: 'AI 엔진 응답을 처리할 수 없습니다.' },
      502,
    )
  }

  if (!aiResponse.ok) {
    const errBody = aiBody as Record<string, unknown>
    const errCode = (errBody?.error as Record<string, string> | undefined)?.code ?? 'AI_ENGINE_ERROR'
    const errMsg  = aiResponse.status === 429
      ? 'LLM API 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.'
      : ((errBody?.error as Record<string, string> | undefined)?.message ?? 'AI 엔진 오류가 발생했습니다.')
    console.error(`generate-marketing: AI Engine 오류 status=${aiResponse.status} code=${errCode}`)
    return jsonResponse(
      { success: false, error: errCode, message: errMsg },
      aiResponse.status >= 500 ? 502 : aiResponse.status,
    )
  }

  console.log(`generate-marketing: 완료 channel=${channel}`)
  return jsonResponse(aiBody)
})
