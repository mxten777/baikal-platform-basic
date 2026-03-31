import { useState } from 'react'
import SEOHead from '@/components/seo/SEOHead'
import { useAdminProjects, useUpsertProject, useDeleteProject } from '@/features/projects/useProjects'
import type { Project, ProjectStatus } from '@/types/models'
import { Plus, X, Pencil, Trash2 } from 'lucide-react'
import { toSlug } from '@/utils/slug'
import { PROJECT_CATEGORIES } from '@/lib/constants'

const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: '초안',
  active: '공개',
  archived: '보관',
  coming_soon: '예정',
}

const STATUS_COLORS: Record<ProjectStatus, string> = {
  draft:       'bg-white/[0.06] text-white/40',
  active:      'bg-green-500/10 text-green-400',
  archived:    'bg-white/[0.04] text-white/25',
  coming_soon: 'bg-blue-500/10 text-blue-400',
}

// ===== 빈 폼 초기값 =====
const EMPTY_FORM: Partial<Project> & { slug: string; title: string } = {
  slug: '',
  title: '',
  subtitle: '',
  description: '',
  status: 'draft',
  category: '',
  tech_stack: [],
  demo_url: '',
  repo_url: '',
  thumbnail_url: '',
  featured: false,
  sort_order: 99,
  meta_title: '',
  meta_desc: '',
  metrics: {},
}

// ===== 프로젝트 폼 모달 =====
function ProjectFormModal({
  initial,
  onClose,
}: {
  initial: typeof EMPTY_FORM
  onClose: () => void
}) {
  const [form, setForm] = useState({ ...initial })
  const [techInput, setTechInput] = useState((initial.tech_stack ?? []).join(', '))
  const upsert = useUpsertProject()

  const isNew = !initial.id

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
    if (key === 'title' && isNew) {
      setForm(prev => ({ ...prev, slug: toSlug(value as string) }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const tech_stack = techInput.split(',').map(s => s.trim()).filter(Boolean)
    await upsert.mutateAsync({ ...form, tech_stack })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0d0d0d] border border-white/[0.08] shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-base font-bold text-white">
            {isNew ? '프로젝트 추가' : '프로젝트 수정'}
          </h2>
          <button onClick={onClose} className="flex items-center justify-center h-7 w-7 rounded-lg bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08] transition-colors">
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 제목 + 슬러그 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1.5">제목 *</label>
              <input
                required
                value={form.title}
                onChange={e => set('title', e.target.value)}
                className="admin-input w-full"
                placeholder="프로젝트 이름"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">슬러그 *</label>
              <input
                required
                value={form.slug}
                onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-{2,}/g, '-'))}
                pattern="[a-z0-9][a-z0-9-]*"
                title="소문자·숫자·하이픈만 사용 가능"
                className="admin-input w-full font-mono"
                placeholder="url-slug"
              />
            </div>
          </div>

          {/* 부제목 */}
          <div>
            <label className="block text-xs text-white/40 mb-1.5">부제목</label>
            <input
              value={form.subtitle ?? ''}
              onChange={e => set('subtitle', e.target.value)}
              className="admin-input w-full"
              placeholder="한 줄 설명"
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-xs text-white/40 mb-1.5">상세 설명 (Markdown)</label>
            <textarea
              rows={5}
              value={form.description ?? ''}
              onChange={e => set('description', e.target.value)}
              className="admin-input w-full font-mono"
              placeholder="마크다운 지원"
            />
          </div>

          {/* 상태 + 카테고리 + 정렬 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1.5">상태</label>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value as ProjectStatus)}
                className="admin-input w-full"
              >
                {Object.entries(STATUS_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">카테고리</label>
              <select
                value={form.category ?? ''}
                onChange={e => set('category', e.target.value)}
                className="admin-input w-full"
              >
                <option value="">선택</option>
                {PROJECT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">정렬 순서</label>
              <input
                type="number"
                value={form.sort_order ?? 99}
                onChange={e => set('sort_order', parseInt(e.target.value, 10))}
                className="admin-input w-full"
              />
            </div>
          </div>

          {/* 기술 스택 */}
          <div>
            <label className="block text-xs text-white/40 mb-1.5">기술 스택 (쉼표 구분)</label>
            <input
              value={techInput}
              onChange={e => setTechInput(e.target.value)}
              className="admin-input w-full"
              placeholder="React, TypeScript, Supabase, ..."
            />
          </div>

          {/* URL */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1.5">데모 URL</label>
              <input
                type="url"
                value={form.demo_url ?? ''}
                onChange={e => set('demo_url', e.target.value)}
                className="admin-input w-full"
                placeholder="https://"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">GitHub URL</label>
              <input
                type="url"
                value={form.repo_url ?? ''}
                onChange={e => set('repo_url', e.target.value)}
                className="admin-input w-full"
                placeholder="https://github.com/..."
              />
            </div>
          </div>

          {/* 썸네일 URL */}
          <div>
            <label className="block text-xs text-white/40 mb-1.5">썸네일 URL</label>
            <input
              type="url"
              value={form.thumbnail_url ?? ''}
              onChange={e => set('thumbnail_url', e.target.value)}
              className="admin-input w-full"
              placeholder="https://..."
            />
          </div>

          {/* SEO */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Meta 제목</label>
              <input
                value={form.meta_title ?? ''}
                onChange={e => set('meta_title', e.target.value)}
                className="admin-input w-full"
                placeholder="비우면 제목 사용"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Meta 설명</label>
              <input
                value={form.meta_desc ?? ''}
                onChange={e => set('meta_desc', e.target.value)}
                className="admin-input w-full"
                placeholder="검색 결과 설명 (160자 이내)"
                maxLength={160}
              />
            </div>
          </div>

          {/* 옵션 */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured ?? false}
                onChange={e => set('featured', e.target.checked)}
                className="rounded border-white/20 bg-white/[0.06] text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-white/60">홈에 Featured 표시</span>
            </label>
          </div>

          {/* 에러 메시지 */}
          {upsert.isError && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              저장 실패: {(upsert.error as Error)?.message}
            </p>
          )}

          {/* 버튼 */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={upsert.isPending}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {upsert.isPending ? '저장 중...' : isNew ? '추가' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ===== 메인 컴포넌트 =====
export default function AdminProjects() {
  const { data: projects, isLoading } = useAdminProjects()
  const deleteProject = useDeleteProject()
  const [editTarget, setEditTarget] = useState<(typeof EMPTY_FORM) | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  function handleDelete(id: string) {
    deleteProject.mutate(id, { onSuccess: () => setDeleteConfirm(null) })
  }

  return (
    <>
      <SEOHead title="프로젝트 관리" noIndex />

      {editTarget && (
        <ProjectFormModal initial={editTarget} onClose={() => setEditTarget(null)} />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-80 rounded-2xl bg-[#0d0d0d] border border-white/[0.08] p-6 text-center shadow-2xl">
            <div className="flex items-center justify-center h-11 w-11 rounded-full bg-red-500/10 border border-red-500/20 mx-auto mb-4">
              <Trash2 size={18} className="text-red-400" />
            </div>
            <p className="text-white mb-1.5 font-bold text-sm">정말 삭제하시겠습니까?</p>
            <p className="text-xs text-white/30 mb-6">이 작업은 되돌릴 수 없습니다.</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-white/40 hover:text-white/70 transition-colors"
              >취소</button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleteProject.isPending}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >삭제</button>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">프로젝트 관리</h1>
            <p className="mt-1 text-sm text-white/35">AI 프로젝트 목록을 관리합니다</p>
          </div>
          <button
            onClick={() => setEditTarget({ ...EMPTY_FORM })}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} /> 프로젝트 추가
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="glass-card overflow-hidden rounded-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">제목</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">카테고리</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">상태</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-white/30 uppercase tracking-wider">정렬</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-white/30 uppercase tracking-wider">Featured</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">등록일</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {(projects ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-14 text-center text-sm text-white/25">
                      등록된 프로젝트가 없습니다. 첫 번째 프로젝트를 추가해 보세요.
                    </td>
                  </tr>
                ) : (
                  (projects ?? []).map(project => (
                    <tr key={project.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-white">{project.title}</div>
                        <div className="text-[11px] text-white/25 font-mono mt-0.5">{project.slug}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-white/40">{project.category ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_COLORS[project.status]}`}>
                          {STATUS_LABELS[project.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-white/30 text-center">{project.sort_order}</td>
                      <td className="px-4 py-3 text-center">
                        {project.featured ? (
                          <span className="text-xs text-amber-400">★</span>
                        ) : (
                          <span className="text-xs text-white/10">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-white/25">
                        {new Date(project.created_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setEditTarget({ ...EMPTY_FORM, ...project })}
                            className="flex items-center gap-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 text-xs text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
                          >
                            <Pencil size={12} /> 수정
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(project.id)}
                            className="flex items-center gap-1.5 rounded-lg bg-red-500/5 border border-red-500/10 px-3 py-1.5 text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 size={12} /> 삭제
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
