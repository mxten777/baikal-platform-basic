// =============================================================================
// Supabase Edge Function: sync-youtube
// supabase/functions/sync-youtube/index.ts
//
// 역할: YouTube Data API v3를 통해 채널 영상 목록을 수집하고 contents 테이블에 저장
// 트리거: Supabase Cron (매 1시간) 또는 수동 호출
// =============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')!
const CRON_SECRET = Deno.env.get('CRON_SECRET') ?? ''

const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search'
const YOUTUBE_VIDEO_URL = 'https://www.googleapis.com/youtube/v3/videos'

// ===== 타입 =====
interface YoutubeVideo {
  video_id: string
  title: string
  description: string
  published_at: string
  thumbnail_url: string
  channel_id: string
  channel_title: string
  duration?: string
  view_count?: number
  like_count?: number
  embed_html: string
}

interface SocialAccount {
  id: string
  source_id: string
  platform: string
  handle: string
  external_id?: string   // channel ID
  is_active: boolean
}

// ===== 유틸: SHA-256 해시 =====
async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function makeContentHash(sourceUrl: string, title: string): Promise<string> {
  const normalized = sourceUrl.toLowerCase().replace(/\?.*$/, '').replace(/\/$/, '')
  return sha256(`${normalized}::${title}`)
}

// ===== YouTube API: 채널 영상 목록 =====
async function fetchChannelVideos(
  channelId: string,
  maxResults = 10
): Promise<YoutubeVideo[]> {
  // 1. Search API로 최신 영상 ID 목록 조회
  const searchParams = new URLSearchParams({
    part: 'snippet',
    channelId,
    maxResults: String(maxResults),
    order: 'date',
    type: 'video',
    key: YOUTUBE_API_KEY,
  })

  const searchRes = await fetch(`${YOUTUBE_SEARCH_URL}?${searchParams}`)
  if (!searchRes.ok) {
    const body = await searchRes.text()
    throw new Error(`YouTube Search API 오류 (${searchRes.status}): ${body}`)
  }
  const searchData = await searchRes.json()

  if (!searchData.items?.length) return []

  const videoIds = searchData.items
    .map((item: Record<string, unknown>) => (item.id as { videoId: string }).videoId)
    .filter(Boolean)
    .join(',')

  // 2. Videos API로 상세 정보(duration, stats) 조회
  const videoParams = new URLSearchParams({
    part: 'snippet,contentDetails,statistics',
    id: videoIds,
    key: YOUTUBE_API_KEY,
  })

  const videoRes = await fetch(`${YOUTUBE_VIDEO_URL}?${videoParams}`)
  if (!videoRes.ok) {
    const body = await videoRes.text()
    throw new Error(`YouTube Videos API 오류 (${videoRes.status}): ${body}`)
  }
  const videoData = await videoRes.json()

  return (videoData.items ?? []).map((item: Record<string, unknown>) => {
    const snippet = item.snippet as Record<string, unknown>
    const contentDetails = item.contentDetails as Record<string, unknown>
    const statistics = item.statistics as Record<string, unknown>
    const videoId = item.id as string

    const thumbnails = snippet.thumbnails as Record<string, { url: string }>
    const thumbnailUrl =
      thumbnails?.maxres?.url
      ?? thumbnails?.high?.url
      ?? thumbnails?.medium?.url
      ?? thumbnails?.default?.url
      ?? ''

    return {
      video_id: videoId,
      title: String(snippet.title ?? ''),
      description: String(snippet.description ?? '').slice(0, 500),
      published_at: String(snippet.publishedAt ?? ''),
      thumbnail_url: thumbnailUrl,
      channel_id: String(snippet.channelId ?? ''),
      channel_title: String(snippet.channelTitle ?? ''),
      duration: String(contentDetails?.duration ?? ''),
      view_count: parseInt(String(statistics?.viewCount ?? '0'), 10),
      like_count: parseInt(String(statistics?.likeCount ?? '0'), 10),
      embed_html: `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy" title="${String(snippet.title ?? '')}"></iframe>`,
    } satisfies YoutubeVideo
  })
}

// ===== 메인 핸들러 =====
Deno.serve(async (req: Request) => {
  // Cron 인증
  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.replace('Bearer ', '')
  if (CRON_SECRET && token !== CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (!YOUTUBE_API_KEY) {
    return new Response('YOUTUBE_API_KEY 환경변수가 설정되지 않았습니다', { status: 500 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // 활성 YouTube 소셜 계정 조회
  const { data: accounts, error: accountsError } = await supabase
    .from('social_accounts')
    .select('id, source_id, platform, handle, external_id, is_active')
    .eq('platform', 'youtube')
    .eq('is_active', true)

  if (accountsError) {
    console.error('소셜 계정 조회 실패:', accountsError)
    return new Response(JSON.stringify({ error: accountsError.message }), { status: 500 })
  }

  const results: Record<string, unknown>[] = []

  for (const account of (accounts ?? []) as SocialAccount[]) {
    const channelId = account.external_id ?? account.handle
    if (!channelId) continue

    // 동기화 작업 시작 기록
    const { data: jobData } = await supabase
      .from('sync_jobs')
      .insert({
        source_id: account.source_id,
        job_type: 'youtube',
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
      const videos = await fetchChannelVideos(channelId, 10)

      for (const video of videos) {
        try {
          const sourceUrl = `https://www.youtube.com/watch?v=${video.video_id}`
          const contentHash = await makeContentHash(sourceUrl, video.title)

          // 외부 ID로 중복 확인 (더 빠름)
          const { data: existing } = await supabase
            .from('contents')
            .select('id')
            .eq('external_id', video.video_id)
            .eq('content_type', 'youtube')
            .maybeSingle()

          if (existing) {
            // 조회수 업데이트만 수행
            await supabase.from('contents').update({
              source_raw: {
                view_count: video.view_count,
                like_count: video.like_count,
                duration: video.duration,
              },
            }).eq('id', (existing as { id: string }).id)
            itemsSkipped++
            continue
          }

          // 슬러그 생성
          const slug = video.title
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, '')
            .slice(0, 80) + '-' + Date.now().toString(36)

          const { error: insertError } = await supabase
            .from('contents')
            .insert({
              slug,
              title: video.title,
              summary: video.description,
              content_type: 'youtube',
              source_id: account.source_id,
              source_url: sourceUrl,
              source_raw: {
                video_id: video.video_id,
                channel_id: video.channel_id,
                channel_title: video.channel_title,
                duration: video.duration,
                view_count: video.view_count,
                like_count: video.like_count,
              },
              embed_html: video.embed_html,
              thumbnail_url: video.thumbnail_url,
              external_id: video.video_id,
              content_hash: contentHash,
              status: 'pending',
              lang: 'ko',
              published_at: video.published_at
                ? new Date(video.published_at).toISOString()
                : null,
            })

          if (insertError) {
            if (insertError.code === '23505') {
              itemsSkipped++
            } else {
              itemsFailed++
              errorLog.push({
                video_id: video.video_id,
                error: 'INSERT_ERROR',
                message: insertError.message,
                occurred_at: new Date().toISOString(),
              })
            }
          } else {
            itemsNew++
          }
        } catch (videoErr) {
          itemsFailed++
          errorLog.push({
            video_id: video.video_id,
            error: 'ITEM_PROCESS_ERROR',
            message: String(videoErr),
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
        items_fetched: videos.length,
        items_new: itemsNew,
        items_skipped: itemsSkipped,
        items_failed: itemsFailed,
        error_log: errorLog,
      }).eq('id', jobId)

      results.push({
        channel: account.handle,
        channel_id: channelId,
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
        channel: account.handle,
        error: String(fetchErr),
      })
    }
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
