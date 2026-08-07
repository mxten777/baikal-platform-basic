import { supabase } from '@/lib/supabase'
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

// 이력 조회용 전용 타입 — Supabase 조인 응답을 명확하게 처리
export interface AIHistoryRow {
  id: string
  channel: string
  purpose: string
  status: string
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
      id, channel, purpose, status, created_at,
      ai_content:ai_contents(id, title, source_type, content_kind)
    `)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return (data ?? []) as unknown as AIHistoryRow[]
}
