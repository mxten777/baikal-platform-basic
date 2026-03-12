import { useState } from 'react'
import SEOHead from '@/components/seo/SEOHead'
import { useAdminContents, usePublishContent, useRejectContent, useUpsertContent, useDeleteContent } from '@/features/contents/useContents'
import { CONTENT_TYPES_KO } from '@/lib/constants'
import { formatDateShort } from '@/utils/date'
import { toSlug } from '@/utils/slug'
import type { Content, ContentStatus, ContentType } from '@/types/models'

const STATUS_TABS: { label: string; value: ContentStatus | '' }[] = [
  { label: '전체', value: '' },
  { label: '대기 중', value: 'pending' },
  { label: '게시됨', value: 'published' },
  { label: '거부됨', value: 'rejected' },
  { label: '아카이브', value: 'archived' },
]

const STATUS_BADGE: Record<string, string> = {
  pending:  'bg-amber-500/10 text-amber-400',
  approved: 'bg-blue-500/10 text-blue-400',
  published:'bg-green-500/10 text-green-400',
  rejected: 'bg-red-500/10 text-red-400',
  archived: 'bg-white/[0.05] text-white/30',
}

const CONTENT_TYPE_OPTIONS: ContentType[] = [
  'article', 'note', 'experiment', 'research',
  'rss', 'x_post', 'instagram', 'youtube', 'external_link', 'curated',
]

const STATUS_OPTIONS: ContentStatus[] = ['pending', 'published', 'rejected', 'archived']

// ── ContentFormModal ────────────────────────────────────────────────────────
interface FormState {
  id?: string
  title: string
  slug: string
  summary: string
  body: string
  content_type: ContentType
  status: ContentStatus
  published_at: string
  is_featured: boolean
  is_pinned: boolean
  thumbnail_url: string
  source_url: string
  meta_title: string
  meta_desc: string
  canonical_url: string
  lang: string
}

const EMPTY_FORM: FormState = {
  title: '', slug: '', summary: '', body: '',
  content_type: 'article', status: 'published',
  published_at: new Date().toISOString().slice(0, 16),
  is_featured: false, is_pinned: false,
  thumbnail_url: '', source_url: '',
  meta_title: '', meta_desc: '', canonical_url: '', lang: 'ko',
}

function toFormState(c: Content): FormState {
  return {
    id: c.id,
    title: c.title,
    slug: c.slug,
    summary: c.summary ?? '',
    body: c.body ?? '',
    content_type: c.content_type,
    status: c.status,
    published_at: c.published_at ? c.published_at.slice(0, 16) : new Date().toISOString().slice(0, 16),
    is_featured: c.is_featured,
    is_pinned: c.is_pinned,
    thumbnail_url: c.thumbnail_url ?? '',
    source_url: c.source_url ?? '',
    meta_title: c.meta_title ?? '',
    meta_desc: c.meta_desc ?? '',
    canonical_url: c.canonical_url ?? '',
    lang: c.lang ?? 'ko',
  }
}

interface ContentFormModalProps {
  initial?: Content | null
  onClose: () => void
}

function ContentFormModal({ initial, onClose }: ContentFormModalProps) {
  const [form, setForm] = useState<FormState>(initial ? toFormState(initial) : EMPTY_FORM)
  const upsert = useUpsertContent()

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleTitleChange(value: string) {
    setForm(prev => ({
      ...prev,
      title: value,
      slug: prev.id ? prev.slug : toSlug(value),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    await upsert.mutateAsync({
      id: form.id,
      title: form.title.trim(),
      slug: form.slug || toSlug(form.title),
      summary: form.summary || undefined,
      body: form.body || undefined,
      content_type: form.content_type,
      status: form.status,
      published_at: form.published_at ? new Date(form.published_at).toISOString() : undefined,
      is_featured: form.is_featured,
      is_pinned: form.is_pinned,
      thumbnail_url: form.thumbnail_url || undefined,
      source_url: form.source_url || undefined,
      meta_title: form.meta_title || undefined,
      meta_desc: form.meta_desc || undefined,
      canonical_url: form.canonical_url || undefined,
      lang: form.lang || 'ko',
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0d0d0d] border border-white/[0.08]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <h2 className="text-base font-bold text-white">
            {form.id ? '콘텐츠 편집' : '새 콘텐츠 작성'}
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 text-lg leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 제목 */}
          <div>
            <label className="block mb-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider">제목 *</label>
            <input
              className="admin-input w-full"
              placeholder="콘텐츠 제목"
              value={form.title}
              onChange={e => handleTitleChange(e.target.value)}
              required
            />
          </div>

          {/* 슬러그 */}
          <div>
            <label className="block mb-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider">슬러그</label>
            <input
              className="admin-input w-full font-mono text-xs"
              placeholder="url-slug"
              value={form.slug}
              onChange={e => set('slug', e.target.value)}
            />
          </div>

          {/* 유형 + 상태 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider">유형</label>
              <select
                className="admin-input w-full"
                value={form.content_type}
                onChange={e => set('content_type', e.target.value as ContentType)}
              >
                {CONTENT_TYPE_OPTIONS.map(t => (
                  <option key={t} value={t}>{CONTENT_TYPES_KO[t] ?? t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider">상태</label>
              <select
                className="admin-input w-full"
                value={form.status}
                onChange={e => set('status', e.target.value as ContentStatus)}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 발행일 + 언어 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider">발행일</label>
              <input
                type="datetime-local"
                className="admin-input w-full"
                value={form.published_at}
                onChange={e => set('published_at', e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider">언어</label>
              <select
                className="admin-input w-full"
                value={form.lang}
                onChange={e => set('lang', e.target.value)}
              >
                <option value="ko">한국어 (ko)</option>
                <option value="en">English (en)</option>
              </select>
            </div>
          </div>

          {/* 요약 */}
          <div>
            <label className="block mb-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider">요약</label>
            <textarea
              className="admin-input w-full h-16 resize-none"
              placeholder="짧은 설명 (검색·목록에 표시)"
              value={form.summary}
              onChange={e => set('summary', e.target.value)}
            />
          </div>

          {/* 본문(마크다운) */}
          <div>
            <label className="block mb-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider">본문 (마크다운)</label>
            <textarea
              className="admin-input w-full h-48 resize-y font-mono text-xs"
              placeholder="# 제목&#10;&#10;마크다운으로 본문을 작성합니다."
              value={form.body}
              onChange={e => set('body', e.target.value)}
            />
          </div>

          {/* 썸네일 + 소스 URL */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider">썸네일 URL</label>
              <input
                className="admin-input w-full"
                placeholder="https://..."
                value={form.thumbnail_url}
                onChange={e => set('thumbnail_url', e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider">소스 URL</label>
              <input
                className="admin-input w-full"
                placeholder="원본 링크"
                value={form.source_url}
                onChange={e => set('source_url', e.target.value)}
              />
            </div>
          </div>

          {/* Featured / Pinned */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded accent-blue-600"
                checked={form.is_featured}
                onChange={e => set('is_featured', e.target.checked)}
              />
              <span className="text-sm text-white/60">주요 콘텐츠 (Featured)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded accent-blue-600"
                checked={form.is_pinned}
                onChange={e => set('is_pinned', e.target.checked)}
              />
              <span className="text-sm text-white/60">상단 고정 (Pinned)</span>
            </label>
          </div>

          {/* SEO 섹션 */}
          <div className="border-t border-white/[0.06] pt-4 space-y-3">
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider">SEO (선택)</p>
            <input
              className="admin-input w-full"
              placeholder="Meta 제목"
              value={form.meta_title}
              onChange={e => set('meta_title', e.target.value)}
            />
            <textarea
              className="admin-input w-full h-14 resize-none"
              placeholder="Meta 설명"
              value={form.meta_desc}
              onChange={e => set('meta_desc', e.target.value)}
            />
            <input
              className="admin-input w-full"
              placeholder="Canonical URL"
              value={form.canonical_url}
              onChange={e => set('canonical_url', e.target.value)}
            />
          </div>

          {upsert.isError && (
            <p className="text-xs text-red-400">저장 중 오류가 발생했습니다. 다시 시도해주세요.</p>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm text-white/50 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={upsert.isPending}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {upsert.isPending ? '저장 중…' : (form.id ? '수정 저장' : '콘텐츠 등록')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── AdminContents ───────────────────────────────────────────────────────────
export default function AdminContents() {
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [modalTarget, setModalTarget] = useState<Content | null | undefined>(undefined)
  // undefined = closed, null = new form, Content = edit form

  const { data: contents, isLoading } = useAdminContents(statusFilter || undefined)
  const publishMutation = usePublishContent()
  const rejectMutation = useRejectContent()
  const deleteMutation = useDeleteContent()

  async function handlePublish(id: string) {
    if (!confirm('이 콘텐츠를 게시하시겠습니까?')) return
    await publishMutation.mutateAsync(id)
  }

  async function handleReject(id: string) {
    if (!confirm('이 콘텐츠를 거부하시겠습니까?')) return
    await rejectMutation.mutateAsync(id)
  }

  async function handleDelete(id: string) {
    if (!confirm('콘텐츠를 삭제합니다. 이 작업은 되돌릴 수 없습니다.')) return
    await deleteMutation.mutateAsync(id)
  }

  return (
    <>
      <SEOHead title="콘텐츠 관리" noIndex />

      {modalTarget !== undefined && (
        <ContentFormModal
          initial={modalTarget}
          onClose={() => setModalTarget(undefined)}
        />
      )}

      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">콘텐츠 관리</h1>
            <p className="mt-1 text-sm text-white/35">수집된 AI 콘텐츠를 검토하고 관리합니다</p>
          </div>
          <button
            onClick={() => setModalTarget(null)}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            + 새 콘텐츠
          </button>
        </div>

        {/* Status Tabs */}
        <div className="mb-6 flex gap-1.5">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === tab.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/[0.05] text-white/40 hover:bg-white/[0.08] hover:text-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-12 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="glass-card overflow-hidden rounded-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">제목</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">유형</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">소스</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">상태</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">날짜</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {(contents ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-14 text-center text-sm text-white/25">
                      콘텐츠가 없습니다.
                    </td>
                  </tr>
                ) : (
                  contents!.map((content: Content) => (
                    <tr key={content.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <p className="max-w-xs truncate text-sm font-medium text-white">{content.title}</p>
                        {content.source_url && (
                          <a
                            href={content.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-white/25 hover:text-white/50 truncate block max-w-xs mt-0.5"
                          >
                            {content.source_url}
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[11px] text-white/40">
                          {CONTENT_TYPES_KO[content.content_type] ?? content.content_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-white/35">
                        {content.source?.name ?? '수기'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_BADGE[content.status]}`}>
                          {content.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-white/25">
                        {content.created_at ? formatDateShort(content.created_at) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5 justify-end">
                          {content.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handlePublish(content.id)}
                                disabled={publishMutation.isPending}
                                className="rounded-lg px-3 py-1 text-xs bg-green-500/10 border border-green-500/15 text-green-400 hover:bg-green-500/20 disabled:opacity-50 transition-colors"
                              >
                                게시
                              </button>
                              <button
                                onClick={() => handleReject(content.id)}
                                disabled={rejectMutation.isPending}
                                className="rounded-lg px-3 py-1 text-xs bg-red-500/10 border border-red-500/15 text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
                              >
                                거부
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setModalTarget(content)}
                            className="rounded-lg px-3 py-1 text-xs bg-white/[0.04] border border-white/[0.06] text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
                          >
                            편집
                          </button>
                          <button
                            onClick={() => handleDelete(content.id)}
                            disabled={deleteMutation.isPending}
                            className="rounded-lg px-3 py-1 text-xs bg-red-500/[0.06] border border-red-500/10 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
