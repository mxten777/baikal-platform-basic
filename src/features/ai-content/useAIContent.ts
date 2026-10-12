import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { createAIContent, createAIContentOutput, saveAIContentEditedText } from './aiContentService'
import type { AIHistoryRow, CreateAIContentInput } from './aiContentService'
import type { AIContentSourceType, Content, Project } from '@/types/models'

export type AIChannel = 'instagram' | 'threads' | 'naver_blog' | 'reels'

export interface AIContentForm {
  sourceType: AIContentSourceType
  title: string
  body: string
  contentKind: string
  selectedContent: Content | null
  selectedProject: Project | null
  channel: AIChannel
  purpose: string
  tone: string
  brand: string
  additionalInstruction: string
}

const INITIAL_FORM: AIContentForm = {
  sourceType: 'direct',
  title: '',
  body: '',
  contentKind: 'article',
  selectedContent: null,
  selectedProject: null,
  channel: 'instagram',
  purpose: 'promotion',
  tone: 'professional',
  brand: 'BAIKAL',
  additionalInstruction: '',
}

export function useAIContent() {
  const [form, setForm] = useState<AIContentForm>(INITIAL_FORM)
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [outputId, setOutputId] = useState<string | null>(null)
  const [outputTitle, setOutputTitle] = useState('')
  const [editedText, setEditedTextValue] = useState('')
  const [savedText, setSavedText] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  function setEditedText(value: string) {
    setEditedTextValue(value)
    setSaveError(null)
    setSaveMessage(null)
  }

  function discardEdits() {
    setEditedText(savedText)
  }

  function loadOutput(row: AIHistoryRow) {
    const text = row.edited_text ?? row.output_text ?? ''
    setOutputId(row.id)
    setOutputTitle(row.ai_content?.title ?? '(제목 없음)')
    setResult(row.output_text ?? '')
    setEditedTextValue(text)
    setSavedText(text)
    setError(null)
    setSaveError(null)
    setSaveMessage(null)
  }

  async function saveEdits(): Promise<boolean> {
    setSaveError(null)
    setSaveMessage(null)
    if (!outputId) {
      setSaveError('저장된 생성 이력이 없습니다. 콘텐츠를 다시 생성해 주세요.')
      return false
    }
    if (!editedText.trim()) {
      setSaveError('수정 내용을 입력해 주세요.')
      return false
    }
    setIsSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('로그인 세션이 없습니다. 다시 로그인해 주세요.')
      await saveAIContentEditedText(outputId, editedText)
      setSavedText(editedText)
      setSaveMessage('수정본을 저장했습니다.')
      return true
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : '수정본 저장에 실패했습니다.')
      return false
    } finally {
      setIsSaving(false)
    }
  }

  function setField<K extends keyof AIContentForm>(key: K, value: AIContentForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function reset() {
    setForm(INITIAL_FORM)
    setResult('')
    setError(null)
    setOutputId(null)
    setOutputTitle('')
    setEditedTextValue('')
    setSavedText('')
    setSaveError(null)
    setSaveMessage(null)
  }

  async function generate() {
    setError(null)
    setResult('')
    setOutputId(null)
    setOutputTitle('')
    setEditedTextValue('')
    setSavedText('')
    setSaveError(null)
    setSaveMessage(null)

    if (!form.title.trim()) {
      setError('제목을 입력해 주세요.')
      return
    }

    let sourceText = ''
    if (form.sourceType === 'direct') {
      if (!form.body.trim()) {
        setError('원본 내용을 입력해 주세요.')
        return
      }
      sourceText = form.body.trim()
    } else if (form.sourceType === 'blog') {
      if (!form.selectedContent) {
        setError('Blog 콘텐츠를 선택해 주세요.')
        return
      }
      sourceText = [form.selectedContent.title, form.selectedContent.summary, form.selectedContent.body]
        .filter(Boolean).join('\n\n')
    } else {
      if (!form.selectedProject) {
        setError('프로젝트를 선택해 주세요.')
        return
      }
      sourceText = [
        form.selectedProject.title,
        form.selectedProject.subtitle,
        form.selectedProject.description,
        form.selectedProject.category ? `카테고리: ${form.selectedProject.category}` : undefined,
        form.selectedProject.tech_stack?.length
          ? `기술 스택: ${form.selectedProject.tech_stack.join(', ')}`
          : undefined,
      ].filter(Boolean).join('\n\n')
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
            source_content: sourceText,
            channel: form.channel,
            purpose: form.purpose,
            tone: form.tone,
            language: 'ko',
            brand: form.brand,
            additional_instruction: form.additionalInstruction,
            content_kind: form.contentKind,
            ...(form.contentKind === 'product' ? { product_name: form.title.trim() } : {}),
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

      const outputText = body.content as string
      setResult(outputText)
      setEditedTextValue(outputText)
      setSavedText(outputText)
      setOutputTitle(form.title.trim())

      // ai_contents 저장
      const contentInput: CreateAIContentInput = {
        title: form.title.trim(),
        content_kind: form.contentKind,
        source_type: form.sourceType,
        brand: form.brand,
        created_by: session.user.id,
      }
      if (form.sourceType === 'direct') contentInput.body = form.body.trim()
      if (form.sourceType === 'blog' && form.selectedContent) {
        contentInput.source_content_id = form.selectedContent.id
      }
      if (form.sourceType === 'project' && form.selectedProject) {
        contentInput.source_project_id = form.selectedProject.id
      }
      const contentRow = await createAIContent(contentInput)

      // ai_content_outputs 저장
      const outputRow = await createAIContentOutput({
        ai_content_id: contentRow.id,
        channel: form.channel,
        purpose: form.purpose,
        tone: form.tone,
        output_text: outputText,
        created_by: session.user.id,
      })
      setOutputId(outputRow.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 콘텐츠 생성에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    form, setField, reset, result, isLoading, error, generate,
    outputId, outputTitle, editedText, setEditedText, discardEdits, loadOutput, saveEdits,
    isSaving, saveError, saveMessage, hasUnsavedEdits: editedText !== savedText,
  }
}
