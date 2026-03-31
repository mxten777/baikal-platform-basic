// =============================================================================
// Supabase Edge Function: sync-rss
// supabase/functions/sync-rss/index.ts
//
// 역할: 등록된 RSS 소스를 순회하며 피드를 수집하고 contents 테이블에 저장
// 트리거: Supabase Cron (매 30분) 또는 수동 호출
// =============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { parseStringPromise } from 'https://esm.sh/xml2js@0.6.2'
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const CRON_SECRET = Deno.env.get('CRON_SECRET') ?? ''

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ===== 타입 =====
interface RssItem {
  external_id: string
  title: string
  summary: string
  source_url: string
  published_at?: string
  thumbnail_url?: string
  raw_data: Record<string, unknown>
}

interface RssSource {
  id: string
  source_id: string
  feed_url: string
  feed_type: string
  last_etag?: string
  last_modified?: string
}

interface ContentSource {
  id: string
  name: string
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

// ===== RSS 파싱 =====
async function fetchAndParseRSS(
  feedUrl: string,
  lastEtag?: string,
  lastModified?: string
): Promise<{ items: RssItem[]; etag?: string; lastModified?: string; notModified: boolean }> {
  const headers: Record<string, string> = {
    'User-Agent': 'BaikalBot/1.0 (https://www.baikalsys.kr)',
  }
  if (lastEtag) headers['If-None-Match'] = lastEtag
  if (lastModified) headers['If-Modified-Since'] = lastModified

  const res = await fetch(feedUrl, { headers })

  if (res.status === 304) {
    return { items: [], notModified: true }
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${feedUrl}`)
  }

  const xml = await res.text()
  const parsed = await parseStringPromise(xml, {
    explicitArray: false,
    ignoreAttrs: false,
  })

  // RSS 2.0 또는 Atom 처리
  const channel = parsed.rss?.channel ?? parsed.feed
  if (!channel) throw new Error('RSS/Atom 채널을 파싱할 수 없습니다')

  const rawItems = channel.item ?? channel.entry ?? []
  const itemArray = Array.isArray(rawItems) ? rawItems : [rawItems]

  const items: RssItem[] = itemArray.slice(0, 20).map((item: Record<string, unknown>) => {
    const sourceUrl = String(
      (item.link as { _: string } | undefined)?._
      ?? item.link
      ?? ''
    )
    const title = String(
      (item.title as { _: string } | undefined)?._
      ?? item.title
      ?? 'Untitled'
    )

    // content:encoded (네이버 블로그 등 풀 HTML 본문)
    const contentEncoded = String(
      (item['content:encoded'] as { _: string } | undefined)?._
      ?? (item['content:encoded'] as string | undefined)
      ?? ''
    )

    // 썸네일: content:encoded에서 첫 번째 <img src> 추출
    const thumbnailFromContent = (() => {
      const match = contentEncoded.match(/<img[^>]+src=["']([^"']+)["']/i)
      return match ? match[1] : null
    })()

    // 요약: description 우선, 없으면 content:encoded 텍스트화
    const rawSummary = String(
      item.description
      ?? item.summary
      ?? contentEncoded
      ?? ''
    )
    const summary = rawSummary
      .replace(/<[^>]+>/g, ' ')  // HTML 태그 → 공백
      .replace(/\s{2,}/g, ' ')   // 연속 공백 정리
      .trim()
      .slice(0, 500)

    const externalId = String(
      (item.guid as { _: string } | undefined)?._
      ?? item.guid
      ?? (item.id as string | undefined)
      ?? sourceUrl
    )

    // 썸네일: media:thumbnail → media:content → content:encoded 추출 순
    const mediaThumbnail = String(
      (item['media:thumbnail'] as { $?: { url?: string } } | undefined)?.$?.url
      ?? (item['media:content'] as { $?: { url?: string } } | undefined)?.$?.url
      ?? thumbnailFromContent
      ?? ''
    ) || undefined

    return {
      external_id: externalId,
      title,
      summary,
      source_url: sourceUrl,
      published_at: String(item.pubDate ?? item.published ?? item.updated ?? ''),
      thumbnail_url: mediaThumbnail,
      raw_data: item as Record<string, unknown>,
    }
  })

  return {
    items,
    etag: res.headers.get('etag') ?? undefined,
    lastModified: res.headers.get('last-modified') ?? undefined,
    notModified: false,
  }
}

// ===== 메인 핸들러 =====
Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  // Cron 인증
  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.replace('Bearer ', '')
  if (CRON_SECRET && token !== CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // 활성 RSS 소스 조회
  const { data: rssSources, error: sourcesError } = await supabase
    .from('rss_sources')
    .select(`
      id,
      source_id,
      feed_url,
      feed_type,
      last_etag,
      last_modified,
      source:content_sources!inner(id, name, is_active)
    `)
    .eq('source.is_active', true)

  if (sourcesError) {
    console.error('RSS 소스 조회 실패:', sourcesError)
    return new Response(JSON.stringify({ error: sourcesError.message }), { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } })
  }

  const results: Record<string, unknown>[] = []

  for (const rssSource of (rssSources ?? []) as (RssSource & { source: ContentSource })[]) {
    // 동기화 작업 시작 기록
    const { data: jobData } = await supabase
      .from('sync_jobs')
      .insert({
        source_id: rssSource.source_id,
        job_type: 'rss',
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
      const { items, etag, lastModified: lm, notModified } = await fetchAndParseRSS(
        rssSource.feed_url,
        rssSource.last_etag,
        rssSource.last_modified
      )

      if (notModified) {
        await supabase.from('sync_jobs').update({
          status: 'completed',
          finished_at: new Date().toISOString(),
          items_fetched: 0,
          items_skipped: 0,
        }).eq('id', jobId)
        continue
      }

      // 각 아이템 처리
      for (const item of items) {
        try {
          const contentHash = await makeContentHash(item.source_url, item.title)

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

          // 슬러그 생성 (간단 버전)
          const slug = item.title
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, '')
            .slice(0, 80) + '-' + Date.now().toString(36)

          // contents에 저장
          const { error: insertError } = await supabase
            .from('contents')
            .insert({
              slug,
              title: item.title,
              summary: item.summary,
              content_type: 'rss',
              source_id: rssSource.source_id,
              source_url: item.source_url,
              source_raw: item.raw_data,
              thumbnail_url: item.thumbnail_url,
              status: 'published',
              external_id: item.external_id,
              content_hash: contentHash,
              lang: 'ko',
              published_at: item.published_at
                ? new Date(item.published_at).toISOString()
                : null,
            })

          if (insertError) {
            // UNIQUE 충돌은 skip으로 처리
            if (insertError.code === '23505') {
              itemsSkipped++
            } else {
              itemsFailed++
              errorLog.push({
                item_id: item.external_id,
                url: item.source_url,
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
            item_id: item.external_id,
            error: 'ITEM_PROCESS_ERROR',
            message: String(itemErr),
            occurred_at: new Date().toISOString(),
          })
        }
      }

      // RSS 소스 etag/lastModified 업데이트
      await supabase.from('rss_sources').update({
        last_etag: etag ?? null,
        last_modified: lm ?? null,
      }).eq('id', rssSource.id)

      // 소스 마지막 동기화 시간 업데이트
      await supabase.from('content_sources').update({
        last_synced_at: new Date().toISOString(),
        error_count: 0,
      }).eq('id', rssSource.source_id)

      // 작업 완료 기록
      await supabase.from('sync_jobs').update({
        status: itemsFailed > 0 && itemsNew === 0 ? 'failed' : itemsFailed > 0 ? 'partial' : 'completed',
        finished_at: new Date().toISOString(),
        items_fetched: items.length,
        items_new: itemsNew,
        items_skipped: itemsSkipped,
        items_failed: itemsFailed,
        error_log: errorLog,
      }).eq('id', jobId)

      results.push({
        source: rssSource.source.name,
        new: itemsNew,
        skipped: itemsSkipped,
        failed: itemsFailed,
      })

    } catch (fetchErr) {
      // 소스 에러 카운트 증가
      await supabase.rpc('increment_error_count', { source_id: rssSource.source_id })

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
        source: rssSource.source.name,
        error: String(fetchErr),
      })
    }
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
})
