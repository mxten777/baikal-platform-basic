import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'
import SEOHead from '@/components/seo/SEOHead'
import { Link } from 'react-router-dom'
import { FolderKanban, FileText, Clock, Rss, ArrowUpRight } from 'lucide-react'

interface DashboardStats {
  total_projects: number
  active_projects: number
  total_contents: number
  pending_contents: number
  published_contents: number
  total_sources: number
  active_sources: number
  recent_jobs: RecentJob[]
}

interface RecentJob {
  id: string
  job_type: string
  status: string
  started_at: string
  items_new: number
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const [projects, contents, sources, jobs] = await Promise.all([
    supabase.from('projects').select('id, status'),
    supabase.from('contents').select('id, status'),
    supabase.from('content_sources').select('id, is_active'),
    supabase
      .from('sync_jobs')
      .select('id, job_type, status, started_at, items_new')
      .order('started_at', { ascending: false })
      .limit(5),
  ])

  const projectData = projects.data ?? []
  const contentData = contents.data ?? []
  const sourceData = sources.data ?? []

  return {
    total_projects: projectData.length,
    active_projects: projectData.filter(p => p.status === 'active').length,
    total_contents: contentData.length,
    pending_contents: contentData.filter(c => c.status === 'pending').length,
    published_contents: contentData.filter(c => c.status === 'published').length,
    total_sources: sourceData.length,
    active_sources: sourceData.filter(s => s.is_active).length,
    recent_jobs: (jobs.data ?? []) as RecentJob[],
  }
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: fetchDashboardStats,
  })

  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })

  return (
    <>
      <SEOHead title="대시보드" noIndex />

      <div>
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <p className="text-xs text-white/25 mb-1">{today}</p>
          <h1 className="text-2xl font-black tracking-tight text-white">대시보드</h1>
          <p className="mt-1 text-sm text-white/35">BAIKAL AI Content Platform 관리 현황</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-28 rounded-2xl" />
            ))}
          </div>
        ) : stats && (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
              <StatCard
                label="전체 프로젝트"
                value={stats.total_projects}
                sub={`운영 중 ${stats.active_projects}`}
                href="/admin/projects"
                icon={FolderKanban}
                color="blue"
              />
              <StatCard
                label="전체 콘텐츠"
                value={stats.total_contents}
                sub={`게시됨 ${stats.published_contents}`}
                href="/admin/contents"
                icon={FileText}
                color="purple"
              />
              <StatCard
                label="승인 대기"
                value={stats.pending_contents}
                sub="검수 필요"
                href="/admin/contents"
                icon={Clock}
                color={stats.pending_contents > 0 ? 'amber' : 'default'}
                highlight={stats.pending_contents > 0}
              />
              <StatCard
                label="수집 소스"
                value={stats.active_sources}
                sub={`전체 ${stats.total_sources}`}
                href="/admin/sources"
                icon={Rss}
                color="green"
              />
            </div>

            {/* 최근 동기화 */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold text-white">최근 동기화 작업</h2>
                <Link
                  to="/admin/sync-jobs"
                  className="flex items-center gap-1 text-xs text-blue-400/70 hover:text-blue-400 transition-colors"
                >
                  전체 보기
                  <ArrowUpRight size={12} />
                </Link>
              </div>

              {stats.recent_jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-sm text-white/25">동기화 기록이 없습니다</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {stats.recent_jobs.map(job => (
                    <div key={job.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                          job.status === 'completed' ? 'bg-green-400'
                          : job.status === 'failed' ? 'bg-red-400'
                          : 'bg-amber-400'
                        }`} />
                        <span className="text-sm text-white/70">{job.job_type}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                          job.status === 'completed' ? 'bg-green-500/10 text-green-400'
                          : job.status === 'failed' ? 'bg-red-500/10 text-red-400'
                          : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {job.status === 'completed' ? '완료' : job.status === 'failed' ? '실패' : '진행 중'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-white/30">
                        <span className="text-blue-400/60">+{job.items_new}개</span>
                        <span>{new Date(job.started_at).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}

function StatCard({
  label, value, sub, href, icon: Icon, color = 'default', highlight = false
}: {
  label: string
  value: number
  sub: string
  href: string
  icon: React.ElementType
  color?: 'blue' | 'purple' | 'green' | 'amber' | 'default'
  highlight?: boolean
}) {
  const colorMap = {
    blue:    { bg: 'bg-blue-500/10',   icon: 'text-blue-400',   border: 'border-blue-500/15' },
    purple:  { bg: 'bg-purple-500/10', icon: 'text-purple-400', border: 'border-purple-500/15' },
    green:   { bg: 'bg-green-500/10',  icon: 'text-green-400',  border: 'border-green-500/15' },
    amber:   { bg: 'bg-amber-500/10',  icon: 'text-amber-400',  border: 'border-amber-500/20' },
    default: { bg: 'bg-white/[0.03]',  icon: 'text-white/30',   border: 'border-white/[0.07]' },
  }
  const c = colorMap[color]

  return (
    <Link
      to={href}
      className={`group block rounded-2xl border p-5 transition-all hover:scale-[1.02] ${
        highlight ? 'border-amber-500/25 bg-amber-500/5' : `${c.border} glass-card`
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`rounded-xl p-2 ${c.bg}`}>
          <Icon size={16} className={c.icon} />
        </div>
        <ArrowUpRight size={14} className="text-white/20 transition-all group-hover:text-white/50" />
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-sm font-medium text-white/60 mt-0.5">{label}</p>
      <p className="text-xs text-white/25 mt-1">{sub}</p>
    </Link>
  )
}
