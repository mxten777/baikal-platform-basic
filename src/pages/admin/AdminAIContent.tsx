import { useState } from 'react'
import { Sparkles, Copy, Check, Loader2, History, Plus, FolderKanban, FileText, EyeOff } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import SEOHead from '@/components/seo/SEOHead'
import { useAIContent } from '@/features/ai-content/useAIContent'
import type { AIChannel } from '@/features/ai-content/useAIContent'
import { getAIContentHistory, approveOutput, publishOutput, hideOutput, restoreOutput } from '@/features/ai-content/aiContentService'
import type { AIHistoryRow } from '@/features/ai-content/aiContentService'
import { useAdminContents } from '@/features/contents/useContents'
import { useAdminProjects } from '@/features/projects/useProjects'
import type { AIContentSourceType, Content, Project } from '@/types/models'
import { formatDateShort } from '@/utils/date'

const CHANNEL_OPTIONS: { value: AIChannel; label: string; disabled?: boolean }[] = [
  { value: 'instagram',  label: 'Instagram' },
  { value: 'threads',    label: 'Threads' },
  { value: 'naver_blog', label: '블로그' },
  { value: 'reels',      label: 'Reels' },
]

const CONTENT_KIND_OPTIONS = [
  { value: 'article',    label: '아티클' },
  { value: 'project',    label: '프로젝트' },
  { value: 'case_study', label: '성공사례' },
  { value: 'column',     label: '칼럼' },
  { value: 'notice',     label: '공지' },
  { value: 'interview',  label: '인터뷰' },
  { value: 'product',    label: '제품소개' },
  { value: 'meeting',    label: '회의내용' },
  { value: 'tech_doc',   label: '기술문서' },
  { value: 'poem',       label: '시' },
]

const PURPOSE_OPTIONS = [
  { value: 'promotion',       label: '프로모션' },
  { value: 'brand_awareness', label: '브랜드 인지' },
  { value: 'education',       label: '정보 제공' },
  { value: 'announcement',    label: '공지' },
]

const TONE_OPTIONS = [
  { value: 'professional', label: '전문적' },
  { value: 'premium',      label: '프리미엄' },
  { value: 'friendly',     label: '친근한' },
]

const SOURCE_LABEL: Record<string, string> = {
  direct:  '직접 입력',
  blog:    'Blog',
  project: '프로젝트',
}

const CHANNEL_LABEL: Record<string, string> = {
  instagram:  'Instagram',
  threads:    'Threads',
  naver_blog: '블로그',
  reels:      'Reels',
}

const STATUS_LABEL: Record<string, string> = {
  draft:     '초안',
  approved:  '승인',
  published: '게시됨',
  hidden:    '숨김됨',
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-white/40 mb-1.5">{children}</label>
}

// 공개 가능한 채널 (채널 매핑이 정의된 것만)
const PUBLISHABLE_CHANNELS = new Set(['instagram', 'threads', 'naver_blog'])

export default function AdminAIContent() {
  const [tab, setTab] = useState<'create' | 'history'>('create')
  const [copied, setCopied] = useState(false)
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [showHidden, setShowHidden] = useState(false)
  const [hideConfirmRow, setHideConfirmRow] = useState<AIHistoryRow | null>(null)

  const queryClient = useQueryClient()

  const { form, setField, reset, result, isLoading, error, generate } = useAIContent()

  const { data: contentsData, isLoading: contentsLoading } = useAdminContents('published')
  const contents: Content[] = contentsData ?? []

  const { data: projectsData, isLoading: projectsLoading } = useAdminProjects()
  const projects: Project[] = projectsData ?? []

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['ai-content-history', showHidden],
    queryFn: () => getAIContentHistory(showHidden),
    enabled: tab === 'history',
  })
  const history: AIHistoryRow[] = historyData ?? []

  async function handleApprove(id: string) {
    setActioningId(id)
    setActionError(null)
    try {
      await approveOutput(id)
      await queryClient.invalidateQueries({ queryKey: ['ai-content-history'] })
    } catch (e) {
      setActionError(e instanceof Error ? e.message : '승인에 실패했습니다.')
    } finally {
      setActioningId(null)
    }
  }

  async function handlePublish(row: AIHistoryRow) {
    setActioningId(row.id)
    setActionError(null)
    try {
      await publishOutput(row)
      await queryClient.invalidateQueries({ queryKey: ['ai-content-history'] })
    } catch (e) {
      setActionError(e instanceof Error ? e.message : '공개에 실패했습니다.')
    } finally {
      setActioningId(null)
    }
  }

  async function confirmHide(row: AIHistoryRow) {
    setActioningId(row.id)
    setActionError(null)
    try {
      await hideOutput(row)
      setHideConfirmRow(null)
      await queryClient.invalidateQueries({ queryKey: ['ai-content-history'] })
    } catch (e) {
      setActionError(e instanceof Error ? e.message : '숨김에 실패했습니다.')
    } finally {
      setActioningId(null)
    }
  }

  async function handleRestore(row: AIHistoryRow) {
    setActioningId(row.id)
    setActionError(null)
    try {
      await restoreOutput(row)
      await queryClient.invalidateQueries({ queryKey: ['ai-content-history'] })
    } catch (e) {
      setActionError(e instanceof Error ? e.message : '복원에 실패했습니다.')
    } finally {
      setActioningId(null)
    }
  }

  function handleSourceTypeChange(st: AIContentSourceType) {
    setField('sourceType', st)
    setField('selectedContent', null)
    setField('selectedProject', null)
    setField('title', '')
  }

  function handleSelectContent(c: Content) {
    setField('selectedContent', c)
    setField('title', c.title)
    setField('contentKind', 'article')
  }

  function handleSelectProject(p: Project) {
    setField('selectedProject', p)
    setField('title', p.title)
    setField('contentKind', 'project')
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sourceTypes: { value: AIContentSourceType; label: string; icon: React.ElementType }[] = [
    { value: 'direct',  label: '직접 입력', icon: FileText },
    { value: 'blog',    label: 'Blog',      icon: FileText },
    { value: 'project', label: '프로젝트',  icon: FolderKanban },
  ]

  return (
    <>
      <SEOHead title="AI 콘텐츠" noIndex />
      <div>
        {/* 헤더 */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">AI 콘텐츠</h1>
            <p className="mt-1 text-sm text-white/35">원본 콘텐츠를 채널별 마케팅 콘텐츠로 변환합니다</p>
          </div>
          {/* 탭 */}
          <div className="flex items-center gap-1 rounded-xl bg-white/[0.04] p-1 border border-white/[0.06]">
            <button
              onClick={() => setTab('create')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                tab === 'create'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              <Plus size={14} /> 새 콘텐츠
            </button>
            <button
              onClick={() => setTab('history')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                tab === 'history'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              <History size={14} /> 생성 이력
            </button>
          </div>
        </div>

        {/* ── 새 콘텐츠 탭 ── */}
        {tab === 'create' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* 입력 폼 */}
            <div className="glass-card rounded-2xl p-6 space-y-5">
              <p className="text-xs font-semibold tracking-widest text-white/20 uppercase">생성 설정</p>

              {/* 원본 선택 */}
              <div>
                <Label>원본</Label>
                <div className="flex gap-2">
                  {sourceTypes.map(st => (
                    <button
                      key={st.value}
                      onClick={() => handleSourceTypeChange(st.value)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
                        form.sourceType === st.value
                          ? 'bg-blue-600/15 text-blue-400 border-blue-500/30'
                          : 'text-white/40 border-white/[0.08] hover:text-white/70 hover:border-white/20'
                      }`}
                    >
                      <st.icon size={12} />
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 직접 입력 */}
              {form.sourceType === 'direct' && (
                <>
                  <div>
                    <Label>제목 <span className="text-white/20 font-normal">*필수</span></Label>
                    <input
                      className="admin-input w-full"
                      value={form.title}
                      onChange={e => setField('title', e.target.value)}
                      placeholder="콘텐츠 제목"
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <Label>콘텐츠 유형</Label>
                    <select
                      className="admin-input w-full"
                      value={form.contentKind}
                      onChange={e => setField('contentKind', e.target.value)}
                    >
                      {CONTENT_KIND_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>원본 내용 <span className="text-white/20 font-normal">*필수</span></Label>
                    <textarea
                      className="admin-input w-full h-36 resize-y"
                      value={form.body}
                      onChange={e => setField('body', e.target.value)}
                      placeholder="AI 콘텐츠로 변환할 원본 텍스트를 입력하세요"
                      maxLength={10000}
                    />
                    <p className="mt-1 text-right text-[11px] text-white/20">{form.body.length} / 10000</p>
                  </div>
                </>
              )}

              {/* Blog 선택 */}
              {form.sourceType === 'blog' && (
                <>
                  {contentsLoading ? (
                    <div className="flex items-center gap-2 text-white/30 text-sm py-4">
                      <Loader2 size={14} className="animate-spin" /> 블로그 목록 로딩 중...
                    </div>
                  ) : (
                    <div>
                      <Label>Blog 콘텐츠 선택 <span className="text-white/20 font-normal">*필수</span></Label>
                      <ul className="max-h-48 overflow-y-auto rounded-lg border border-white/[0.08] divide-y divide-white/[0.05]">
                        {contents.length === 0 && (
                          <li className="px-3 py-3 text-sm text-white/25">게시된 콘텐츠가 없습니다</li>
                        )}
                        {contents.map(c => (
                          <li key={c.id}>
                            <button
                              onClick={() => handleSelectContent(c)}
                              className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                                form.selectedContent?.id === c.id
                                  ? 'bg-blue-600/15 text-blue-300'
                                  : 'text-white/60 hover:bg-white/[0.04] hover:text-white/90'
                              }`}
                            >
                              <p className="font-medium truncate">{c.title}</p>
                              {c.summary && (
                                <p className="text-[11px] text-white/30 truncate mt-0.5">{c.summary}</p>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {form.selectedContent && (
                    <div>
                      <Label>제목</Label>
                      <input
                        className="admin-input w-full"
                        value={form.title}
                        onChange={e => setField('title', e.target.value)}
                        maxLength={200}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Project 선택 */}
              {form.sourceType === 'project' && (
                <>
                  {projectsLoading ? (
                    <div className="flex items-center gap-2 text-white/30 text-sm py-4">
                      <Loader2 size={14} className="animate-spin" /> 프로젝트 목록 로딩 중...
                    </div>
                  ) : (
                    <div>
                      <Label>프로젝트 선택 <span className="text-white/20 font-normal">*필수</span></Label>
                      <ul className="max-h-48 overflow-y-auto rounded-lg border border-white/[0.08] divide-y divide-white/[0.05]">
                        {projects.length === 0 && (
                          <li className="px-3 py-3 text-sm text-white/25">프로젝트가 없습니다</li>
                        )}
                        {projects.map(p => (
                          <li key={p.id}>
                            <button
                              onClick={() => handleSelectProject(p)}
                              className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                                form.selectedProject?.id === p.id
                                  ? 'bg-blue-600/15 text-blue-300'
                                  : 'text-white/60 hover:bg-white/[0.04] hover:text-white/90'
                              }`}
                            >
                              <p className="font-medium truncate">{p.title}</p>
                              {p.subtitle && (
                                <p className="text-[11px] text-white/30 truncate mt-0.5">{p.subtitle}</p>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {form.selectedProject && (
                    <div>
                      <Label>제목</Label>
                      <input
                        className="admin-input w-full"
                        value={form.title}
                        onChange={e => setField('title', e.target.value)}
                        maxLength={200}
                      />
                    </div>
                  )}
                </>
              )}

              {/* 채널 + 브랜드 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>채널</Label>
                  <select
                    className="admin-input w-full"
                    value={form.channel}
                    onChange={e => setField('channel', e.target.value as AIChannel)}
                  >
                    {CHANNEL_OPTIONS.map(o => (
                      <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>브랜드</Label>
                  <input
                    className="admin-input w-full"
                    value={form.brand}
                    onChange={e => setField('brand', e.target.value)}
                    placeholder="BAIKAL"
                    maxLength={100}
                  />
                </div>
              </div>

              {/* 목적 + 톤 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>목적</Label>
                  <select
                    className="admin-input w-full"
                    value={form.purpose}
                    onChange={e => setField('purpose', e.target.value)}
                  >
                    {PURPOSE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>톤</Label>
                  <select
                    className="admin-input w-full"
                    value={form.tone}
                    onChange={e => setField('tone', e.target.value)}
                  >
                    {TONE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 오류 */}
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* 버튼 영역 */}
              <div className="flex gap-3">
                <button
                  onClick={generate}
                  disabled={isLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <><Loader2 size={16} className="animate-spin" /> 생성 중...</>
                  ) : (
                    <><Sparkles size={16} /> AI 콘텐츠 생성</>
                  )}
                </button>
                {(result || error) && (
                  <button
                    onClick={reset}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-white/40 border border-white/[0.08] hover:text-white/70 hover:border-white/20 transition-all"
                  >
                    초기화
                  </button>
                )}
              </div>
            </div>

            {/* 생성 결과 */}
            <div className="glass-card rounded-2xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold tracking-widest text-white/20 uppercase">생성 결과</p>
                {result && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all border border-white/[0.08] hover:border-white/20 text-white/40 hover:text-white"
                  >
                    {copied ? <><Check size={13} className="text-green-400" /> 복사됨</> : <><Copy size={13} /> 복사</>}
                  </button>
                )}
              </div>

              {isLoading && (
                <div className="flex flex-1 items-center justify-center gap-3 text-white/30 py-16">
                  <Loader2 size={20} className="animate-spin" />
                  <span className="text-sm">AI가 콘텐츠를 생성하고 있습니다...</span>
                </div>
              )}
              {!isLoading && !result && (
                <div className="flex flex-1 items-center justify-center py-16">
                  <p className="text-sm text-white/20">생성된 콘텐츠가 여기에 표시됩니다</p>
                </div>
              )}
              {!isLoading && result && (
                <pre className="flex-1 whitespace-pre-wrap text-sm text-white/80 leading-relaxed font-sans overflow-auto">
                  {result}
                </pre>
              )}
            </div>
          </div>
        )}

        {/* ── 생성 이력 탭 ── */}
        {tab === 'history' && (
          <div className="glass-card rounded-2xl overflow-hidden">
            {/* 숨김 콘텐츠 보기 토글 */}
            <div className="flex items-center justify-end px-5 pt-4 pb-2">
              <button
                onClick={() => setShowHidden(v => !v)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
                  showHidden
                    ? 'bg-white/[0.08] text-white/70 border-white/20'
                    : 'text-white/30 border-white/[0.08] hover:text-white/50 hover:border-white/15'
                }`}
              >
                <EyeOff size={12} />
                숨김 콘텐츠 보기
              </button>
            </div>
            {historyLoading ? (
              <div className="flex items-center justify-center gap-3 py-16 text-white/30">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm">이력 로딩 중...</span>
              </div>
            ) : history.length === 0 ? (
              <div className="py-16 text-center text-sm text-white/20">생성 이력이 없습니다</div>
            ) : (
              <>
                {actionError && (
                  <div className="mx-5 mt-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5">
                    <p className="text-sm text-red-400">{actionError}</p>
                  </div>
                )}
              <table className="hidden md:table w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['제목', '원본 유형', '채널', '상태', '생성일', ''].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold tracking-widest text-white/20 uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {history.map(row => {
                    const isActioning = actioningId === row.id
                    const canPublish = row.status === 'approved' && PUBLISHABLE_CHANNELS.has(row.channel)
                    const isHidden = row.status === 'hidden'
                    return (
                    <tr key={row.id} className={`transition-colors ${isHidden ? 'opacity-50' : 'hover:bg-white/[0.02]'}`}>
                      <td className="px-5 py-3 text-white/70 max-w-[200px] truncate">
                        {row.ai_content?.title ?? '—'}
                      </td>
                      <td className="px-5 py-3 text-white/40">
                        {row.ai_content ? SOURCE_LABEL[row.ai_content.source_type] ?? row.ai_content.source_type : '—'}
                      </td>
                      <td className="px-5 py-3 text-white/40">
                        {CHANNEL_LABEL[row.channel] ?? row.channel}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          row.status === 'published'
                            ? 'bg-green-500/15 text-green-400'
                            : row.status === 'approved'
                            ? 'bg-blue-500/15 text-blue-400'
                            : row.status === 'hidden'
                            ? 'bg-white/[0.06] text-white/20'
                            : 'bg-white/[0.06] text-white/30'
                        }`}>
                          {STATUS_LABEL[row.status] ?? row.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-white/30 text-[12px]">
                        {formatDateShort(row.created_at)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {row.status === 'draft' && (
                            <button
                              onClick={() => handleApprove(row.id)}
                              disabled={isActioning}
                              className="rounded-lg px-3 py-1 text-[11px] font-medium border border-blue-500/30 text-blue-400 hover:bg-blue-600/15 disabled:opacity-40 transition-all"
                            >
                              {isActioning ? <Loader2 size={11} className="animate-spin" /> : '승인'}
                            </button>
                          )}
                          {row.status === 'approved' && (
                            <button
                              onClick={() => handlePublish(row)}
                              disabled={isActioning || !canPublish}
                              title={!canPublish ? '이 채널은 Content Hub 공개를 지원하지 않습니다' : undefined}
                              className="rounded-lg px-3 py-1 text-[11px] font-medium border border-green-500/30 text-green-400 hover:bg-green-600/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                              {isActioning ? <Loader2 size={11} className="animate-spin" /> : '공개'}
                            </button>
                          )}
                          {row.status === 'hidden' && (
                            <button
                              onClick={() => handleRestore(row)}
                              disabled={isActioning}
                              className="rounded-lg px-3 py-1 text-[11px] font-medium border border-white/20 text-white/40 hover:text-white/70 hover:border-white/30 disabled:opacity-40 transition-all"
                            >
                              {isActioning ? <Loader2 size={11} className="animate-spin" /> : '복원'}
                            </button>
                          )}
                          {row.status !== 'hidden' && (
                            <button
                              onClick={() => setHideConfirmRow(row)}
                              disabled={isActioning}
                              className="rounded-lg px-3 py-1 text-[11px] font-medium border border-white/[0.08] text-white/25 hover:text-white/50 hover:border-white/20 disabled:opacity-40 transition-all"
                            >
                              숨김
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* 모바일 카드 목록 — md 미만에서만 표시 */}
              <div className="md:hidden divide-y divide-white/[0.04]">
                {history.map(row => {
                  const isActioning = actioningId === row.id
                  const canPublish = row.status === 'approved' && PUBLISHABLE_CHANNELS.has(row.channel)
                  return (
                    <div key={row.id} className={`px-4 py-3.5 ${row.status === 'hidden' ? 'opacity-50' : ''}`}>
                      <p className="text-sm font-medium text-white/80 line-clamp-2 mb-1">
                        {row.ai_content?.title ?? '—'}
                      </p>
                      <p className="text-xs text-white/35">
                        {row.ai_content
                          ? SOURCE_LABEL[row.ai_content.source_type] ?? row.ai_content.source_type
                          : '—'}
                        {' · '}
                        {CHANNEL_LABEL[row.channel] ?? row.channel}
                      </p>
                      <p className="text-xs text-white/25 mb-3">{formatDateShort(row.created_at)}</p>
                      <div className="flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          row.status === 'published'
                            ? 'bg-green-500/15 text-green-400'
                            : row.status === 'approved'
                            ? 'bg-blue-500/15 text-blue-400'
                            : row.status === 'hidden'
                            ? 'bg-white/[0.06] text-white/20'
                            : 'bg-white/[0.06] text-white/30'
                        }`}>
                          {STATUS_LABEL[row.status] ?? row.status}
                        </span>
                        <div className="flex items-center gap-2">
                          {row.status === 'draft' && (
                            <button
                              onClick={() => handleApprove(row.id)}
                              disabled={isActioning}
                              className="rounded-lg px-4 py-1.5 text-xs font-medium border border-blue-500/30 text-blue-400 hover:bg-blue-600/15 disabled:opacity-40 transition-all"
                            >
                              {isActioning ? <Loader2 size={12} className="animate-spin" /> : '승인'}
                            </button>
                          )}
                          {row.status === 'approved' && (
                            <button
                              onClick={() => handlePublish(row)}
                              disabled={isActioning || !canPublish}
                              title={!canPublish ? '이 채널은 Content Hub 공개를 지원하지 않습니다' : undefined}
                              className="rounded-lg px-4 py-1.5 text-xs font-medium border border-green-500/30 text-green-400 hover:bg-green-600/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                              {isActioning ? <Loader2 size={12} className="animate-spin" /> : '공개'}
                            </button>
                          )}
                          {row.status === 'hidden' && (
                            <button
                              onClick={() => handleRestore(row)}
                              disabled={isActioning}
                              className="rounded-lg px-4 py-1.5 text-xs font-medium border border-white/20 text-white/40 hover:text-white/70 hover:border-white/30 disabled:opacity-40 transition-all"
                            >
                              {isActioning ? <Loader2 size={12} className="animate-spin" /> : '복원'}
                            </button>
                          )}
                          {row.status !== 'hidden' && (
                            <button
                              onClick={() => setHideConfirmRow(row)}
                              disabled={isActioning}
                              className="rounded-lg px-4 py-1.5 text-xs font-medium border border-white/[0.08] text-white/25 hover:text-white/50 hover:border-white/20 disabled:opacity-40 transition-all"
                            >
                              숨김
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 숨김 확인 다이얼로그 */}
      {hideConfirmRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#111827] border border-white/[0.08] p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-semibold text-white">이 콘텐츠를 숨기시겠습니까?</h3>
            <div className="space-y-2">
              <p className="text-sm text-white/50 leading-relaxed">
                숨김 처리하면 관리자 기본 목록과 Content Hub에서 표시되지 않습니다.
              </p>
              {hideConfirmRow.status === 'published' && !hideConfirmRow.published_content_id && (
                <p className="text-sm text-yellow-400/80 leading-relaxed">
                  ⚠ 이 레코드는 공개 연결 정보가 없어 Content Hub에서 계속 표시될 수 있습니다.
                </p>
              )}
              <p className="text-sm text-white/40 leading-relaxed">
                데이터는 삭제되지 않으며 다시 복원할 수 있습니다.
              </p>
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <button
                onClick={() => setHideConfirmRow(null)}
                className="rounded-lg px-4 py-2 text-sm text-white/50 border border-white/[0.08] hover:text-white/80 hover:border-white/20 transition-all"
              >
                취소
              </button>
              <button
                onClick={() => confirmHide(hideConfirmRow)}
                disabled={actioningId === hideConfirmRow.id}
                className="rounded-lg px-4 py-2 text-sm font-medium bg-white/[0.06] border border-white/20 text-white/60 hover:bg-white/[0.10] disabled:opacity-40 transition-all"
              >
                {actioningId === hideConfirmRow.id ? <Loader2 size={14} className="animate-spin" /> : '숨김'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
