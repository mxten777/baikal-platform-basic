// =============================================================================
// Supabase Edge Function: sync-instagram
// supabase/functions/sync-instagram/index.ts
//
// 역할: Instagram Graph API로 미디어 목록을 수집하고 contents 테이블에 저장
// 트리거: Supabase Cron (매 2시간) 또는 수동 호출
//
// 사전 준비:
//   1. content_sources에 source_type='instagram' 행 추가
//   2. social_accounts에 platform='instagram', access_token(장기토큰), account_id 추가
//   3. 장기 액세스 토큰은 60일마다 갱신 필요
//      → GET https://graph.instagram.com/refresh_access_token
//           ?grant_type=ig_refresh_token&access_token={token}
// =============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const CRON_SECRET = Deno.env.get('CRON_SECRET') ?? ''

const INSTAGRAM_GRAPH_URL = 'https://graph.instagram.com'
const MEDIA_FIELDS = 'id,caption,media_type,media_url,thumbnail_url,timestamp,permalink,children'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ===== 타입 =====
interface InstagramMedia {
  id: string
  caption?: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url?: string
  thumbnail_url?: string
  timestamp: string
  permalink: string
}

interface InstagramApiResponse {
  data: InstagramMedia[]
  paging?: {
    cursors?: { after?: string; before?: string }
    next?: string
  }
}

interface SocialAccount {
  id: string
  source_id: string
  account_id: string
  access_token: string
  token_expires_at?: string
}

// ===== 유틸: SHA-256 해시 =====
async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function makeContentHash(permalink: string): Promise<string> {
  return sha256(`instagram::${permalink}`)
}

// ===== 슬러그 생성 =====
function makeSlug(caption: string | undefined, mediaId: string): string {
  if (caption) {
    return caption
      .replace(/[#@]\S+/g, '')       // 해시태그·멘션 제거
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .slice(0, 60) + '-' + mediaId.slice(-6)
  }
  return `instagram-${mediaId}`
}

// ===== 토큰 만료 경고 확인 =====
function isTokenExpiringSoon(expiresAt?: string): boolean {
  if (!expiresAt) return false
  const expiryDate = new Date(expiresAt)
  const daysUntilExpiry = (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  return daysUntilExpiry < 7
}

// ===== Instagram API 호출 =====
async function fetchInstagramMedia(
  accessToken: string,
  limit = 25
): Promise<InstagramMedia[]> {
  const url = new URL(`${INSTAGRAM_GRAPH_URL}/me/media`)
  url.searchParams.set('fields', MEDIA_FIELDS)
  url.searchParams.set('access_token', accessToken)
  url.searchParams.set('limit', String(limit))

  const res = await fetch(url.toString())

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Instagram API 오류 HTTP ${res.status}: ${body}`)
  }

  const json = await res.json() as InstagramApiResponse
  return json.data ?? []
}

// ===== 캡션에서 요약 추출 =====
function extractSummary(caption?: string): string {
  if (!caption) return ''
  return caption
    .replace(/[#@]\S+/g, '')   // 해시태그·멘션 제거
    .replace(/\n{2,}/g, '\n')  // 다중 줄바꿈 정리
    .trim()
    .slice(0, 500)
}

// ===== 썸네일 URL 결정 =====
function resolveThumbnail(media: InstagramMedia): string | null {
  if (media.media_type === 'VIDEO') {
    return media.thumbnail_url ?? media.media_url ?? null
  }
  return media.media_url ?? null
}

// ===== 메인 핸들러 =====
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.replace('Bearer ', '')
  if (CRON_SECRET && token !== CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // 활성 Instagram 계정 조회
  const { data: accounts, error: accountsError } = await supabase
    .from('social_accounts')
    .select(`
      id,
      source_id,
      account_id,
      access_token,
      token_expires_at,
      source:content_sources!inner(id, name, is_active)
    `)
    .eq('platform', 'instagram')
    .eq('source.is_active', true)
    .not('access_token', 'is', null)

  if (accountsError) {
    console.error('Instagram 계정 조회 실패:', accountsError)
    return new Response(JSON.stringify({ error: accountsError.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  const results: Record<string, unknown>[] = []

  for (const account of (accounts ?? []) as (SocialAccount & { source: { name: string; is_active: boolean } })[]) {
    // 토큰 만료 임박 경고 (실제 갱신은 수동)
    if (isTokenExpiringSoon(account.token_expires_at)) {
      console.warn(`[${account.source.name}] Instagram 액세스 토큰이 7일 이내 만료됩니다. 갱신 필요.`)
    }

    // 동기화 작업 시작 기록
    const { data: jobData } = await supabase
      .from('sync_jobs')
      .insert({
        source_id: account.source_id,
        job_type: 'instagram',
        status: 'running',
        triggered_by: 'scheduled',
      })
      .select('id')
      .single()

    const jobId = jobData?.id
    let itemsNew = 0
    let itemsSkipped = 0
    let itemsFailed = 0
    const errorLog: unknown[] = []

    try {
      const mediaItems = await fetchInstagramMedia(account.access_token)

      for (const media of mediaItems) {
        try {
          // VIDEO는 thumbnail_url 없으면 스킵하지 않고 media_url 사용
          const contentHash = await makeContentHash(media.permalink)

          // 중복 확인
          const { data: existing } = await supabase
            .from('contents')
            .select('id')
            .eq('content_hash', contentHash)
            .maybeSingle()

          if (existing) {
            itemsSkipped++
            continue
          }

          const slug = makeSlug(media.caption, media.id)
          const summary = extractSummary(media.caption)
          const thumbnailUrl = resolveThumbnail(media)

          const { error: insertError } = await supabase
            .from('contents')
            .insert({
              slug,
              title: summary.split('\n')[0].slice(0, 120) || `Instagram ${media.media_type.toLowerCase()}`,
              summary,
              content_type: 'instagram',
              source_id: account.source_id,
              source_url: media.permalink,
              source_raw: media as unknown as Record<string, unknown>,
              thumbnail_url: thumbnailUrl,
              status: 'published',
              external_id: media.id,
              content_hash: contentHash,
              lang: 'ko',
              published_at: new Date(media.timestamp).toISOString(),
            })

          if (insertError) {
            if (insertError.code === '23505') {
              itemsSkipped++
            } else {
              itemsFailed++
              errorLog.push({
                item_id: media.id,
                error: 'INSERT_ERROR',
                message: insertError.message,
                occurred_at: new Date().toISOString(),
              })
            }
          } else {
            itemsNew++
          }
        } catch (itemErr) {
          itemsFailed++
          errorLog.push({
            item_id: media.id,
            error: 'ITEM_PROCESS_ERROR',
            message: String(itemErr),
            occurred_at: new Date().toISOString(),
          })
        }
      }

      // 소스 마지막 동기화 시간 업데이트
      await supabase.from('content_sources').update({
        last_synced_at: new Date().toISOString(),
        error_count: 0,
      }).eq('id', account.source_id)

      await supabase.from('sync_jobs').update({
        status: itemsFailed > 0 && itemsNew === 0 ? 'failed' : itemsFailed > 0 ? 'partial' : 'completed',
        finished_at: new Date().toISOString(),
        items_fetched: mediaItems.length,
        items_new: itemsNew,
        items_skipped: itemsSkipped,
        items_failed: itemsFailed,
        error_log: errorLog,
      }).eq('id', jobId)

      results.push({
        source: account.source.name,
        new: itemsNew,
        skipped: itemsSkipped,
        failed: itemsFailed,
      })

    } catch (fetchErr) {
      await supabase.rpc('increment_error_count', { source_id: account.source_id })

      await supabase.from('sync_jobs').update({
        status: 'failed',
        finished_at: new Date().toISOString(),
        error_log: [{
          error: 'FETCH_ERROR',
          message: String(fetchErr),
          occurred_at: new Date().toISOString(),
        }],
      }).eq('id', jobId)

      results.push({
        source: account.source.name,
        error: String(fetchErr),
      })
    }
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
})
