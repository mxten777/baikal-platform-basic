import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export type MarketingChannel = 'instagram' | 'threads' | 'naver_blog'

export interface MarketingForm {
  brand: string
  channel: MarketingChannel
  purpose: string
  tone: string
  source_content: string
  additional_instruction: string
}

const INITIAL_FORM: MarketingForm = {
  brand: 'BAIKAL',
  channel: 'instagram',
  purpose: 'promotion',
  tone: 'professional',
  source_content: '',
  additional_instruction: '',
}

export function useMarketing() {
  const [form, setForm] = useState<MarketingForm>(INITIAL_FORM)
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function setField<K extends keyof MarketingForm>(key: K, value: MarketingForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function generate() {
    setError(null)
    setResult('')

    if (!form.source_content.trim()) {
      setError('원본 콘텐츠를 입력해 주세요.')
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setError('로그인 세션이 없습니다. 다시 로그인해 주세요.')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-marketing`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            source_content: form.source_content.trim(),
            channel: form.channel,
            purpose: form.purpose,
            tone: form.tone,
            language: 'ko',
            brand: form.brand,
            additional_instruction: form.additional_instruction,
          }),
        },
      )

      const body = await res.json()
      if (!res.ok || !body.success) {
        const msg = res.status === 429
          ? 'LLM API 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.'
          : (body.message ?? `HTTP ${res.status}`)
        throw new Error(msg)
      }
      setResult(body.content as string)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 콘텐츠 생성에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return { form, setField, result, isLoading, error, generate }
}
