// =============================================================================
// Supabase Edge Function: generate-sitemap
// supabase/functions/generate-sitemap/index.ts
//
// 역할: 동적 sitemap.xml 생성
//       라우트: GET /api/sitemap.xml (Supabase rewrites via vercel.json)
// =============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://www.baikalsys.kr'

// ===== 타입 =====
interface SitemapEntry {
  loc: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

// ===== 헬퍼: XML 특수문자 이스케이프 =====
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// ===== 날짜 포맷: W3C Datetime =====
function toW3CDate(dateStr: string | null | undefined): string {
  if (!dateStr) return new Date().toISOString().split('T')[0]
  try {
    return new Date(dateStr).toISOString().split('T')[0]
  } catch {
    return new Date().toISOString().split('T')[0]
  }
}

// ===== 사이트맵 XML 생성 =====
function buildSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries.map(entry => {
    const lastmod = entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ''
    const changefreq = entry.changefreq ? `\n    <changefreq>${entry.changefreq}</changefreq>` : ''
    const priority = entry.priority != null ? `\n    <priority>${entry.priority.toFixed(1)}</priority>` : ''
    return `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>${lastmod}${changefreq}${priority}\n  </url>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`
}

// ===== 메인 핸들러 =====
Deno.serve(async (_req: Request) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  const entries: SitemapEntry[] = []

  // 1. 정적 페이지
  const staticPages: SitemapEntry[] = [
    { loc: `${SITE_URL}/`, changefreq: 'weekly', priority: 1.0, lastmod: new Date().toISOString().split('T')[0] },
    { loc: `${SITE_URL}/about`, changefreq: 'monthly', priority: 0.7 },
    { loc: `${SITE_URL}/services`, changefreq: 'monthly', priority: 0.7 },
    { loc: `${SITE_URL}/contact`, changefreq: 'monthly', priority: 0.5 },
    { loc: `${SITE_URL}/projects`, changefreq: 'weekly', priority: 0.9 },
    { loc: `${SITE_URL}/contents`, changefreq: 'daily', priority: 0.8 },
    { loc: `${SITE_URL}/lab`, changefreq: 'weekly', priority: 0.8 },
    { loc: `${SITE_URL}/media`, changefreq: 'weekly', priority: 0.7 },
    { loc: `${SITE_URL}/topics`, changefreq: 'weekly', priority: 0.7 },
    { loc: `${SITE_URL}/archive`, changefreq: 'monthly', priority: 0.5 },
  ]
  entries.push(...staticPages)

  // 2. 프로젝트 페이지
  const { data: projects } = await supabase
    .from('projects')
    .select('slug, updated_at')
    .eq('status', 'published')
    .order('updated_at', { ascending: false })
    .limit(500)

  for (const project of projects ?? []) {
    entries.push({
      loc: `${SITE_URL}/projects/${project.slug}`,
      lastmod: toW3CDate(project.updated_at),
      changefreq: 'monthly',
      priority: 0.8,
    })
  }

  // 3. 콘텐츠 허브 채널 페이지
  const channels = ['article', 'youtube', 'rss', 'x', 'instagram', 'research', 'experiment']
  for (const ch of channels) {
    entries.push({
      loc: `${SITE_URL}/contents/${ch}`,
      changefreq: 'daily',
      priority: 0.7,
    })
  }

  // 4. 아티클 상세 페이지 (article, research, experiment)
  const { data: articles } = await supabase
    .from('contents')
    .select('slug, published_at, updated_at')
    .eq('status', 'published')
    .in('content_type', ['article', 'research', 'experiment'])
    .order('published_at', { ascending: false })
    .limit(1000)

  for (const article of articles ?? []) {
    entries.push({
      loc: `${SITE_URL}/lab/${article.slug}`,
      lastmod: toW3CDate(article.updated_at ?? article.published_at),
      changefreq: 'monthly',
      priority: 0.7,
    })
  }

  // 5. 토픽 페이지
  const { data: topics } = await supabase
    .from('topics')
    .select('slug, updated_at')
    .order('updated_at', { ascending: false })
    .limit(200)

  for (const topic of topics ?? []) {
    entries.push({
      loc: `${SITE_URL}/topics/${topic.slug}`,
      lastmod: toW3CDate(topic.updated_at),
      changefreq: 'weekly',
      priority: 0.6,
    })
  }

  // 6. 프로젝트 카테고리 페이지
  const { data: categories } = await supabase
    .from('projects')
    .select('category')
    .eq('status', 'published')

  const uniqueCategories = [...new Set(
    (categories ?? [])
      .map(p => p.category as string | null)
      .filter((c): c is string => !!c)
  )]

  for (const cat of uniqueCategories) {
    entries.push({
      loc: `${SITE_URL}/projects/category/${cat}`,
      changefreq: 'weekly',
      priority: 0.6,
    })
  }

  // 7. seo_pages (커스텀 랜딩 페이지)
  const { data: seoPages } = await supabase
    .from('seo_pages')
    .select('slug, updated_at')
    .eq('is_published', true)
    .limit(200)

  for (const seoPage of seoPages ?? []) {
    entries.push({
      loc: `${SITE_URL}/p/${seoPage.slug}`,
      lastmod: toW3CDate(seoPage.updated_at),
      changefreq: 'monthly',
      priority: 0.6,
    })
  }

  const xml = buildSitemapXml(entries)

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
})
