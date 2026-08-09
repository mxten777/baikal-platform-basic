import { supabase } from '@/lib/supabase'
import { toSlug } from '@/utils/slug'
import type { AIContent, AIContentOutput, AIContentSourceType } from '@/types/models'

export interface CreateAIContentInput {
  title: string
  content_kind: string
  source_type: AIContentSourceType
  brand: string
  created_by: string
  body?: string
  source_content_id?: string
  source_project_id?: string
}

export async function createAIContent(input: CreateAIContentInput): Promise<AIContent> {
  const { data, error } = await supabase
    .from('ai_contents')
    .insert({ ...input, status: 'ready' })
    .select()
    .single()
  if (error) throw error
  return data as AIContent
}

export interface CreateAIContentOutputInput {
  ai_content_id: string
  channel: string
  purpose: string
  tone: string
  output_text: string
  created_by: string
}

export async function createAIContentOutput(input: CreateAIContentOutputInput): Promise<AIContentOutput> {
  const { data, error } = await supabase
    .from('ai_content_outputs')
    .insert({ ...input, status: 'draft' })
    .select()
    .single()
  if (error) throw error
  return data as AIContentOutput
}

// 채널 → content_type 매핑 (지원 채널만)
const CHANNEL_CONTENT_TYPE_MAP: Record<string, string> = {
  instagram: 'instagram',
  threads: 'threads',
  naver_blog: 'rss',
}

// 이력 조회용 전용 타입 — Supabase 조인 응답을 명확하게 처리
export interface AIHistoryRow {
  id: string
  channel: string
  purpose: string
  status: string
  output_text: string | null
  edited_text: string | null
  created_at: string
  ai_content: {
    id: string
    title: string
    source_type: string
    content_kind: string
  } | null
}

export async function getAIContentHistory(): Promise<AIHistoryRow[]> {
  const { data, error } = await supabase
    .from('ai_content_outputs')
    .select(`
      id, channel, purpose, status, output_text, edited_text, created_at,
      ai_content:ai_contents(id, title, source_type, content_kind)
    `)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return (data ?? []) as unknown as AIHistoryRow[]
}

export async function approveOutput(id: string): Promise<void> {
  const { error } = await supabase
    .from('ai_content_outputs')
    .update({ status: 'approved' })
    .eq('id', id)
    .eq('status', 'draft')
  if (error) throw error
}

export async function publishOutput(row: AIHistoryRow): Promise<void> {
  const contentType = CHANNEL_CONTENT_TYPE_MAP[row.channel]
  if (!contentType) throw new Error(`지원하지 않는 채널: ${row.channel}`)

  const title = row.ai_content?.title ?? '(제목 없음)'
  const body = row.edited_text ?? row.output_text ?? ''
  const slug = `${toSlug(title)}-${Date.now()}`

  const { error: insertError } = await supabase
    .from('contents')
    .insert({
      slug,
      title,
      body,
      content_type: contentType,
      status: 'published',
      published_at: new Date().toISOString(),
      lang: 'ko',
    })
  if (insertError) throw insertError

  // INSERT 성공 후에만 status 업데이트
  const { error: updateError } = await supabase
    .from('ai_content_outputs')
    .update({ status: 'published' })
    .eq('id', row.id)
    .eq('status', 'approved')
  if (updateError) throw updateError
}
