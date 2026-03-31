import { supabase } from '@/lib/supabase'
import type { Content, ContentFilters, PaginatedResponse } from '@/types/models'
import { PER_PAGE_DEFAULT } from '@/lib/constants'

export async function getContents(
  filters: ContentFilters = {}
): Promise<PaginatedResponse<Content>> {
  const page = filters.page ?? 1
  const perPage = filters.per_page ?? PER_PAGE_DEFAULT
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let query = supabase
    .from('contents')
    .select(`
      id, slug, title, summary, content_type,
      thumbnail_url, published_at, is_featured, is_pinned,
      source_url, embed_html, view_count, lang,
      tags:content_tag_map(tag:tags(*)),
      source:content_sources(id, name, source_type)
    `, { count: 'exact' })
    .eq('status', 'published')
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false })
    .range(from, to)

  if (filters.content_type) {
    if (Array.isArray(filters.content_type)) {
      query = query.in('content_type', filters.content_type)
    } else {
      query = query.eq('content_type', filters.content_type)
    }
  }
  if (filters.lang) {
    query = query.eq('lang', filters.lang)
  }
  if (filters.search) {
    query = query.textSearch('title', filters.search, {
      type: 'websearch',
      config: 'simple',
    })
  }

  const { data, error, count } = await query
  if (error) throw error

  const total = count ?? 0
  return {
    data: (data ?? []) as unknown as Content[],
    count: total,
    page,
    per_page: perPage,
    total_pages: Math.ceil(total / perPage),
  }
}

export async function getContentBySlug(slug: string): Promise<Content | null> {
  const { data, error } = await supabase
    .from('contents')
    .select(`
      *,
      tags:content_tag_map(tag:tags(*)),
      projects:content_project_map(
        relation,
        project:projects(id, slug, title, thumbnail_url, category)
      ),
      author:authors(*),
      source:content_sources(id, name, source_type, url),
      series:collections(*)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  // 조회수 증가 (fire-and-forget)
  supabase
    .from('contents')
    .update({ view_count: (data.view_count ?? 0) + 1 })
    .eq('id', data.id)
    .then(({ error }) => { if (error) console.warn('[view_count]', error.message) })

  return data as Content
}

export async function getContentsByTag(
  tagSlug: string,
  page = 1
): Promise<PaginatedResponse<Content>> {
  const perPage = PER_PAGE_DEFAULT
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  const { data: tagData } = await supabase
    .from('tags')
    .select('id')
    .eq('slug', tagSlug)
    .single()

  if (!tagData) return { data: [], count: 0, page, per_page: perPage, total_pages: 0 }

  const { data, error, count } = await supabase
    .from('content_tag_map')
    .select(`
      content:contents(
        id, slug, title, summary, content_type,
        thumbnail_url, published_at, is_featured
      )
    `, { count: 'exact' })
    .eq('tag_id', tagData.id)
    .range(from, to)

  if (error) throw error

  const contents = (data ?? []).map((r: unknown) => (r as { content: Content }).content).filter((c): c is Content => !!c)
  return {
    data: contents,
    count: count ?? 0,
    page,
    per_page: perPage,
    total_pages: Math.ceil((count ?? 0) / perPage),
  }
}

export async function getFeaturedContents(limit = 6): Promise<Content[]> {
  const { data, error } = await supabase
    .from('contents')
    .select('id, slug, title, summary, content_type, thumbnail_url, published_at')
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as Content[]
}

// Admin: 전체 콘텐츠 (pending/rejected 포함)
export async function adminGetContents(statusFilter?: string): Promise<Content[]> {
  let query = supabase
    .from('contents')
    .select(`
      id, slug, title, summary, content_type, status,
      thumbnail_url, published_at, created_at,
      source:content_sources(name, source_type)
    `)
    .order('created_at', { ascending: false })

  if (statusFilter) {
    query = query.eq('status', statusFilter)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as unknown as Content[]
}

export async function adminPublishContent(id: string): Promise<void> {
  const { error } = await supabase
    .from('contents')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function adminRejectContent(id: string): Promise<void> {
  const { error } = await supabase
    .from('contents')
    .update({ status: 'rejected' })
    .eq('id', id)
  if (error) throw error
}

export async function adminDeleteContent(id: string): Promise<void> {
  const { error } = await supabase.from('contents').delete().eq('id', id)
  if (error) throw error
}

export async function adminUpsertContent(
  content: Partial<Content> & { slug: string; title: string; content_type: string }
): Promise<Content> {
  const { data, error } = await supabase
    .from('contents')
    .upsert(content, { onConflict: 'slug' })
    .select()
    .single()

  if (error) throw error
  return data as Content
}
