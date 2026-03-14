import { supabase } from '@/lib/supabase'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import SEOHead from '@/components/seo/SEOHead'
import type { SyncJob } from '@/types/models'

async function triggerSync(type: 'rss' | 'youtube'): Promise<{ ok: boolean; results: unknown[] }> {
  const { data, error } = await supabase.functions.invoke(`sync-${type}`, { body: {} })
  if (error) throw error
  return data
}

async function getSyncJobs(): Promise<SyncJob[]> {
  const { data, error } = await supabase
    .from('sync_jobs')
    .select('*, source:content_sources(name)')
    .order('started_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return (data ?? []) as SyncJob[]
}

const STATUS_BADGE: Record<string, string> = {
  completed: 'bg-green-500/10 text-green-400',
  failed:    'bg-red-500/10 text-red-400',
  running:   'bg-amber-500/10 text-amber-400',
  partial:   'bg-orange-500/10 text-orange-400',
}

export default function AdminSyncJobs() {
  const queryClient = useQueryClient()
  const { data: jobs, isLoading } = useQuery({ queryKey: ['admin', 'sync-jobs'], queryFn: getSyncJobs })
  const [syncing, setSyncing] = useState<'rss' | 'youtube' | null>(null)
  const [syncResult, setSyncResult] = useState<string | null>(null)

  async function handleSync(type: 'rss' | 'youtube') {
    setSyncing(type)
    setSyncResult(null)
    try {
      const result = await triggerSync(type)
      const summary = result.results
        .map((r: unknown) => {
          const item = r as { source?: string; new?: number; skipped?: number; failed?: number; error?: string }
          if (item.error) return `${item.source ?? type}: 오류 - ${item.error}`
          return `${item.source ?? type}: 신규 ${item.new ?? 0}건, 스킵 ${item.skipped ?? 0}건`
        })
        .join(' / ')
      setSyncResult(summary || '완료')
      queryClient.invalidateQueries({ queryKey: ['admin', 'sync-jobs'] })
    } catch (e) {
      setSyncResult(`오류: ${String(e)}`)
    } finally {
      setSyncing(null)
    }
  }

  return (
    <>
      <SEOHead title="동기화 작업" noIndex />
      <div>
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">동기화 작업</h1>
            <p className="mt-1 text-sm text-white/35">콘텐츠 수집 이력을 확인합니다</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSync('rss')}
              disabled={syncing !== null}
              className="rounded-xl bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400 hover:bg-blue-500/20 disabled:opacity-40 transition-colors"
            >
              {syncing === 'rss' ? '동기화 중...' : 'RSS 동기화'}
            </button>
            <button
              onClick={() => handleSync('youtube')}
              disabled={syncing !== null}
              className="rounded-xl bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/20 disabled:opacity-40 transition-colors"
            >
              {syncing === 'youtube' ? '동기화 중...' : 'YouTube 동기화'}
            </button>
          </div>
        </div>
        {syncResult && (
          <div className="mb-4 rounded-xl bg-white/[0.04] px-4 py-3 text-sm text-white/60">
            {syncResult}
          </div>
        )}
        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
        ) : (
          <div className="glass-card overflow-hidden rounded-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">소스</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">유형</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">상태</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">수집</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">신규</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">실패</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">시작</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {(jobs ?? []).map(job => (
                  <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-sm text-white">{job.source?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-white/40">{job.job_type}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_BADGE[job.status] ?? 'bg-white/[0.05] text-white/30'}`}>{job.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-white/40">{job.items_fetched}</td>
                    <td className="px-4 py-3 text-xs text-blue-400">{job.items_new > 0 ? `+${job.items_new}` : '0'}</td>
                    <td className="px-4 py-3 text-xs text-red-400/70">{job.items_failed > 0 ? job.items_failed : '—'}</td>
                    <td className="px-4 py-3 text-xs text-white/25">{new Date(job.started_at).toLocaleString('ko-KR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
