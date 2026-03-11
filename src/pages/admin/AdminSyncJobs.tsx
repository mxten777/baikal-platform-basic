import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'
import SEOHead from '@/components/seo/SEOHead'
import type { SyncJob } from '@/types/models'

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
  const { data: jobs, isLoading } = useQuery({ queryKey: ['admin', 'sync-jobs'], queryFn: getSyncJobs })

  return (
    <>
      <SEOHead title="동기화 작업" noIndex />
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight text-white">동기화 작업</h1>
          <p className="mt-1 text-sm text-white/35">콘텐츠 수집 이력을 확인합니다</p>
        </div>
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
