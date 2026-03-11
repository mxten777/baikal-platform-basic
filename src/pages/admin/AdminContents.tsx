import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEOHead from '@/components/seo/SEOHead'
import { useAdminContents, usePublishContent, useRejectContent } from '@/features/contents/useContents'
import { CONTENT_TYPES_KO } from '@/lib/constants'
import { formatDateShort } from '@/utils/date'
import type { Content, ContentStatus } from '@/types/models'

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

export default function AdminContents() {
  const [statusFilter, setStatusFilter] = useState<string>('pending')

  const { data: contents, isLoading } = useAdminContents(statusFilter || undefined)
  const publishMutation = usePublishContent()
  const rejectMutation = useRejectContent()

  async function handlePublish(id: string) {
    if (!confirm('이 콘텐츠를 게시하시겠습니까?')) return
    await publishMutation.mutateAsync(id)
  }

  async function handleReject(id: string) {
    if (!confirm('이 콘텐츠를 거부하시겠습니까?')) return
    await rejectMutation.mutateAsync(id)
  }

  return (
    <>
      <SEOHead title="콘텐츠 관리" noIndex />

      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">콘텐츠 관리</h1>
            <p className="mt-1 text-sm text-white/35">수집된 AI 콘텐츠를 검토하고 관리합니다</p>
          </div>
          <Link
            to="/admin/contents/new"
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            + 새 콘텐츠
          </Link>
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
                          <Link
                            to={`/admin/contents/${content.id}`}
                            className="rounded-lg px-3 py-1 text-xs bg-white/[0.04] border border-white/[0.06] text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
                          >
                            편집
                          </Link>
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
