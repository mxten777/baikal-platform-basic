import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import SEOHead from '@/components/seo/SEOHead'
import { supabase } from '@/lib/supabase'
import { toSlug } from '@/utils/slug'
import type { Tag } from '@/types/models'

// ── Supabase helpers ────────────────────────────────────────────────────────
async function fetchTags(): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true })
  if (error) throw error
  return data ?? []
}

async function upsertTag(tag: Partial<Tag> & { name: string }): Promise<void> {
  const payload = { ...tag, slug: tag.slug || toSlug(tag.name) }
  const { error } = await supabase.from('tags').upsert(payload)
  if (error) throw error
}

async function deleteTag(id: string): Promise<void> {
  const { error } = await supabase.from('tags').delete().eq('id', id)
  if (error) throw error
}

// ── Tag Form Modal ──────────────────────────────────────────────────────────
const PRESET_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
  '#ef4444', '#6366f1', '#14b8a6', '#f97316',
]

interface TagFormModalProps {
  initial?: Tag | null
  onClose: () => void
}

function TagFormModal({ initial, onClose }: TagFormModalProps) {
  const qc = useQueryClient()
  const [name, setName] = useState(initial?.name ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [color, setColor] = useState(initial?.color ?? '#3b82f6')

  const upsert = useMutation({
    mutationFn: (tag: Partial<Tag> & { name: string }) => upsertTag(tag),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tags'] }); onClose() },
  })

  function handleNameChange(value: string) {
    setName(value)
    if (!initial) setSlug(toSlug(value))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await upsert.mutateAsync({
      id: initial?.id,
      name: name.trim(),
      slug: slug || toSlug(name),
      description: description.trim() || undefined,
      color,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#0d0d0d] border border-white/[0.08]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <h2 className="text-base font-bold text-white">{initial ? '태그 편집' : '새 태그'}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 text-lg leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block mb-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider">태그 이름 *</label>
            <input
              className="admin-input w-full"
              placeholder="예: RAG, 파인튜닝, LLM"
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider">슬러그</label>
            <input
              className="admin-input w-full font-mono text-xs"
              placeholder="url-slug"
              value={slug}
              onChange={e => setSlug(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider">설명 (선택)</label>
            <input
              className="admin-input w-full"
              placeholder="태그에 대한 간단한 설명"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 text-xs font-semibold text-white/50 uppercase tracking-wider">색상</label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full transition-all ${color === c ? 'ring-2 ring-white/60 ring-offset-2 ring-offset-[#0d0d0d] scale-110' : 'opacity-70 hover:opacity-100'}`}
                  style={{ background: c }}
                />
              ))}
              <input
                type="color"
                className="h-7 w-7 rounded-full cursor-pointer border-0 bg-transparent"
                value={color}
                onChange={e => setColor(e.target.value)}
                title="직접 선택"
              />
              <span className="text-xs font-mono text-white/30">{color}</span>
            </div>
          </div>

          {upsert.isError && (
            <p className="text-xs text-red-400">저장 중 오류가 발생했습니다. 다시 시도해주세요.</p>
          )}

          <div className="flex gap-2 justify-end pt-1">
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
              {upsert.isPending ? '저장 중…' : (initial ? '수정 저장' : '태그 추가')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── AdminTags ───────────────────────────────────────────────────────────────
export default function AdminTags() {
  const qc = useQueryClient()
  const [modalTarget, setModalTarget] = useState<Tag | null | undefined>(undefined)

  const { data: tags, isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  })

  async function handleDelete(id: string) {
    if (!confirm('태그를 삭제합니다. 이 태그가 연결된 콘텐츠에서도 제거됩니다.')) return
    await deleteMutation.mutateAsync(id)
  }

  return (
    <>
      <SEOHead title="태그 관리" noIndex />

      {modalTarget !== undefined && (
        <TagFormModal
          initial={modalTarget}
          onClose={() => setModalTarget(undefined)}
        />
      )}

      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">태그 관리</h1>
            <p className="mt-1 text-sm text-white/35">콘텐츠와 프로젝트에 사용되는 태그를 관리합니다</p>
          </div>
          <button
            onClick={() => setModalTarget(null)}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            + 새 태그
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-12 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="glass-card overflow-hidden rounded-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">태그</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">슬러그</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">설명</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {(tags ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-14 text-center text-sm text-white/25">
                      태그가 없습니다.
                    </td>
                  </tr>
                ) : (
                  tags!.map((tag: Tag) => (
                    <tr key={tag.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="h-3 w-3 rounded-full flex-shrink-0"
                            style={{ background: tag.color }}
                          />
                          <span className="text-sm font-medium text-white">{tag.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-white/35">{tag.slug}</td>
                      <td className="px-4 py-3 text-xs text-white/35 max-w-xs truncate">
                        {tag.description ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5 justify-end">
                          <button
                            onClick={() => setModalTarget(tag)}
                            className="rounded-lg px-3 py-1 text-xs bg-white/[0.04] border border-white/[0.06] text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
                          >
                            편집
                          </button>
                          <button
                            onClick={() => handleDelete(tag.id)}
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
