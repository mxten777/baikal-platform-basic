import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import SEOHead from '@/components/seo/SEOHead'
import { Link } from 'react-router-dom'
import { FolderKanban, FileText, Clock, Rss, ArrowUpRight, TrendingUp, Eye, Users } from 'lucide-react'

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

interface AnalyticsStats {
  today_views: number
  today_visitors: number
  week_views: number
  week_visitors: number
  top_pages: { path: string; views: number }[]
}

async function fetchAnalytics(): Promise<AnalyticsStats> {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [todayData, weekData] = await Promise.all([
    supabase
      .from('page_views')
      .select('session_id')
      .gte('viewed_at', todayStart)
      .limit(5000),
    supabase
      .from('page_views')
      .select('path, session_id')
      .gte('viewed_at', weekStart)
      .limit(10000),
  ])

  const todayRows = todayData.data ?? []
  const weekRows = weekData.data ?? []

  // 페이지별 집계
  const pathCount: Record<string, number> = {}
  weekRows.forEach(r => { pathCount[r.path] = (pathCount[r.path] ?? 0) + 1 })
  const top_pages = Object.entries(pathCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([path, views]) => ({ path, views }))

  return {
    today_views:    todayRows.length,
    today_visitors: new Set(todayRows.map(r => r.session_id)).size,
    week_views:     weekRows.length,
    week_visitors:  new Set(weekRows.map(r => r.session_id)).size,
    top_pages,
  }
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

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: fetchAnalytics,
    retry: 1, // page_views 테이블 없을 경우 조용히 실패
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
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 mb-8">
              <StatCard
                label="전체 프로젝트"
                value={stats.total_projects}
                sub={`운영 중 ${stats.active_projects}`}
                href="/admin/projects"
                icon={FolderKanban}
                color="blue"
                index={0}
              />
              <StatCard
                label="전체 콘텐츠"
                value={stats.total_contents}
                sub={`게시됨 ${stats.published_contents}`}
                href="/admin/contents"
                icon={FileText}
                color="purple"
                index={1}
              />
              <StatCard
                label="승인 대기"
                value={stats.pending_contents}
                sub="검수 필요"
                href="/admin/contents"
                icon={Clock}
                color={stats.pending_contents > 0 ? 'amber' : 'default'}
                highlight={stats.pending_contents > 0}
                index={2}
              />
              <StatCard
                label="수집 소스"
                value={stats.active_sources}
                sub={`전체 ${stats.total_sources}`}
                href="/admin/sources"
                icon={Rss}
                color="green"
                index={3}
              />
            </div>

            {/* 최근 동기화 */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-4">
              {/* 방문 통계 */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={15} className="text-blue-400" />
                    <h2 className="text-sm font-bold text-white">방문자 통계</h2>
                  </div>
                  <span className="text-[10px] text-white/25 tracking-widest uppercase">실시간 · 7일</span>
                </div>

                {analyticsLoading ? (
                  <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="skeleton h-16 rounded-xl" />
                    ))}
                  </div>
                ) : analytics ? (
                  <>
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      {[
                        { icon: Eye,   label: '오늘 PV',    value: analytics.today_views,    color: 'text-blue-400' },
                        { icon: Users, label: '오늘 방문자', value: analytics.today_visitors, color: 'text-purple-400' },
                        { icon: Eye,   label: '7일 PV',     value: analytics.week_views,     color: 'text-green-400' },
                        { icon: Users, label: '7일 방문자',  value: analytics.week_visitors,  color: 'text-amber-400' },
                      ].map(item => (
                        <div key={item.label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3.5 group hover:border-white/10 transition-colors">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <item.icon size={12} className={item.color} />
                            <span className="text-[10px] text-white/30 tracking-wider">{item.label}</span>
                          </div>
                          <p className={`text-2xl font-black ${item.color}`}>{item.value.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>

                    {/* 인기 페이지 */}
                    {analytics.top_pages.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold tracking-widest text-white/20 uppercase mb-2">인기 페이지 (7일)</p>
                        <div className="space-y-1.5">
                          {analytics.top_pages.map((p, i) => (
                            <div key={p.path} className="flex items-center gap-2">
                              <span className="text-[10px] text-white/20 w-4 text-right">{i + 1}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                  <span className="text-xs text-white/50 truncate">{p.path}</span>
                                  <span className="text-xs text-white/35 flex-shrink-0">{p.views}</span>
                                </div>
                                <div className="h-px bg-white/[0.06] rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-500/40 rounded-full transition-all duration-700"
                                    style={{ width: `${Math.round((p.views / analytics.top_pages[0].views) * 100)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Eye size={24} className="text-white/10 mb-2" />
                    <p className="text-sm text-white/25">방문 데이터 없음</p>
                    <p className="text-xs text-white/15 mt-1">마이그레이션 실행 후 수집 시작</p>
                  </div>
                )}
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

                {stats?.recent_jobs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <p className="text-sm text-white/25">동기화 기록이 없습니다</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.04]">
                    {stats?.recent_jobs.map(job => (
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
            </div>
          </>
        )}
      </div>
    </>
  )
}

function StatCard({
  label, value, sub, href, icon: Icon, color = 'default', highlight = false, index = 0
}: {
  label: string
  value: number
  sub: string
  href: string
  icon: React.ElementType
  color?: 'blue' | 'purple' | 'green' | 'amber' | 'default'
  highlight?: boolean
  index?: number
}) {
  const colorMap = {
    blue:    { bg: 'bg-blue-500/10',   icon: 'text-blue-400',   border: 'border-blue-500/15',   glow: 'rgba(59,130,246,0.12)',  num: 'text-blue-400' },
    purple:  { bg: 'bg-purple-500/10', icon: 'text-purple-400', border: 'border-purple-500/15', glow: 'rgba(168,85,247,0.12)', num: 'text-purple-400' },
    green:   { bg: 'bg-green-500/10',  icon: 'text-green-400',  border: 'border-green-500/15',  glow: 'rgba(34,197,94,0.12)',  num: 'text-green-400' },
    amber:   { bg: 'bg-amber-500/10',  icon: 'text-amber-400',  border: 'border-amber-500/20',  glow: 'rgba(245,158,11,0.12)', num: 'text-amber-400' },
    default: { bg: 'bg-white/[0.03]',  icon: 'text-white/30',   border: 'border-white/[0.07]',  glow: 'rgba(255,255,255,0.06)', num: 'text-white' },
  }
  const c = colorMap[color]

  // 진입 애니메이션
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setVisible(true), index * 80); io.disconnect() }
    }, { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [index])

  return (
    <Link
      ref={ref}
      to={href}
      style={{ transitionDelay: `${index * 60}ms` }}
      className={`group relative block overflow-hidden rounded-2xl border p-5 transition-all duration-500
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        hover:-translate-y-1 hover:scale-[1.025]
        ${highlight ? 'border-amber-500/25 bg-amber-500/5' : `${c.border} glass-card`}
      `}
    >
      {/* 배경 글로우 shimmer */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(circle at 30% 30%, ${c.glow} 0%, transparent 70%)` }}
      />
      {/* 상단 라인 액센트 */}
      <div className={`absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-current to-transparent ${c.icon}`} />

      <div className="relative flex items-start justify-between mb-4">
        <div className={`rounded-xl p-2 ${c.bg} group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={16} className={c.icon} />
        </div>
        <ArrowUpRight size={14} className="text-white/20 transition-all duration-300 group-hover:text-white/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
      <p className={`text-2xl sm:text-3xl font-black ${c.num} transition-all duration-300 group-hover:scale-110 group-hover:origin-left`}>{value}</p>
      <p className="text-sm font-medium text-white/60 mt-0.5">{label}</p>
      <p className="text-xs text-white/25 mt-1">{sub}</p>
    </Link>
  )
}
