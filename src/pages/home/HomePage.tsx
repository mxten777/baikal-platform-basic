import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import SEOHead from '@/components/seo/SEOHead'
import ProjectCard from '@/components/project/ProjectCard'
import ContentCard from '@/components/content/ContentCard'
import FeaturedSolutionCard from '@/components/solution/FeaturedSolutionCard'
import { useFeaturedProjects } from '@/features/projects/useProjects'
import { useContentsByTag } from '@/features/contents/useContents'
import { SITE_URL } from '@/lib/constants'
import { FEATURED_SOLUTION } from '@/lib/solutions'

// 기술 스택 마키
const TECH_TAGS = [
  'React', 'TypeScript', 'OpenAI GPT-4o', 'Python', 'FastAPI',
  'LangChain', 'pgvector', 'Supabase', 'PostgreSQL', 'Docker',
  'Tailwind CSS', 'Vercel', 'Vite', 'Ollama', 'RAG',
]

// 통계 데이터
const STATS = [
  { value: '40+', label: 'AI 프로젝트', color: 'text-blue-400', accent: '#3b82f6' },
  { value: '3년+', label: '개발 경력', color: 'text-purple-400', accent: '#a855f7' },
  { value: '100%', label: 'AI 특화', color: 'text-green-400', accent: '#22c55e' },
  { value: '∞', label: '가능성', color: 'text-amber-400', accent: '#f59e0b' },
]

// 홈 서비스 요약 (상세는 /services)
const HOME_SERVICES = [
  {
    icon: '🛡️',
    title: 'SafeLyn 파트너십',
    desc: '산업 안전 솔루션 도입 상담·맞춤 구축·운영 지원. SafeLyn 공식 파트너.',
    tags: ['안전 관리', 'HSE', '도입 상담'],
    href: '/solutions/safelyn',
    accentClass: 'group-hover:text-emerald-400',
    glowClass: 'bg-emerald-500/15',
  },
  {
    icon: '⚡',
    title: 'AI MVP 개발',
    desc: '아이디어를 2~4주 만에 작동하는 AI 제품으로. 빠른 검증과 시장 피드백에 집중.',
    tags: ['LLM', 'RAG', 'AI 에이전트'],
    href: '/services',
    accentClass: 'group-hover:text-blue-400',
    glowClass: 'bg-blue-500/15',
  },
  {
    icon: '🔍',
    title: 'RAG 시스템',
    desc: '기업 내부 지식기반을 AI와 연결하는 검색 증강 생성 시스템.',
    tags: ['Vector DB', '시맨틱 검색', 'LLM 통합'],
    href: '/services',
    accentClass: 'group-hover:text-purple-400',
    glowClass: 'bg-purple-500/15',
  },
  {
    icon: '🌐',
    title: 'AI SaaS 플랫폼',
    desc: '스케일링 가능한 AI 서비스 플랫폼 소프트웨어 개발 및 아키텍처 설계.',
    tags: ['React', 'TypeScript', 'Supabase'],
    href: '/services',
    accentClass: 'group-hover:text-cyan-400',
    glowClass: 'bg-cyan-500/15',
  },
]

// 스크롤 진입 애니메이션 훅
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-scale')
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target) } }),
      { threshold: 0.12 }
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}

// 숫자 카운터 컴포넌트
function AnimatedStat({ value, label, color, accent, delay = 0 }: { value: string; label: string; color: string; accent: string; delay?: number }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTimeout(() => setVisible(true), delay); io.disconnect() } }, { threshold: 0.5 })
    io.observe(el)
    return () => io.disconnect()
  }, [delay])

  return (
    <div ref={ref} className="stat-card group">
      {/* 컬러 상단 액센트 */}
      <div className="h-[2px] w-full" style={{ background: accent }} />
      <div className={`p-5 sm:p-6 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <p className={`text-3xl sm:text-4xl font-black ${color} transition-transform duration-300 group-hover:scale-105 inline-block`}>
          {value}
        </p>
        <p className="mt-2 text-[10px] sm:text-xs tracking-widest text-white/25 uppercase">{label}</p>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { data: projects, isLoading: projectsLoading } = useFeaturedProjects(6)
  const { data: safetyResult, isLoading: safetyLoading } = useContentsByTag('safety')
  useScrollReveal()

  const safetyContents = safetyResult?.data ?? []

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '바이칼시스템즈',
    url: SITE_URL,
    description: 'AI 소프트웨어 개발 및 산업 안전 솔루션 파트너',
    sameAs: [
      'https://x.com/baikalsys',
      'https://www.youtube.com/@baikalsys',
    ],
  }

  return (
    <>
      <SEOHead canonical="/" structuredData={structuredData} />

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen bg-[#080808] flex flex-col justify-center -mt-16" style={{overflow:'clip'}}>
        {/* 프리미엄 배경 레이어 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-purple-950/10 to-[#080808]" />
        <div className="absolute inset-0 grid-bg opacity-40" />
        
        {/* 움직이는 그라디언트 글로우 */}
        <div className="absolute inset-0 opacity-50">
          <div className="absolute top-0 -left-4 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[100px] animate-float pointer-events-none" />
          <div className="absolute bottom-1/4 right-0 w-[600px] h-[400px] rounded-full bg-purple-500/8 blur-[120px] animate-pulse-glow pointer-events-none" style={{animationDelay: '1s'}} />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/6 blur-[100px] animate-float pointer-events-none" style={{animationDelay: '2s'}} />
        </div>

        {/* 추가 장식 요소 */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#080808_100%)]" />

        <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-20 sm:pb-24">
          {/* 어나운스먼트 배지 */}
          <div className="animate-fade-up mb-7 sm:mb-9">
            <Link
              to="/solutions/safelyn"
              className="inline-flex items-center gap-2.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-1.5 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/40 hover:bg-emerald-500/12 group"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-badge-pulse flex-shrink-0" />
              <span className="text-[11px] font-semibold tracking-wider text-emerald-300/80">SafeLyn 파트너 도입 상담 진행 중</span>
              <span className="text-white/15 select-none">·</span>
              <span className="text-[11px] text-white/35 group-hover:text-white/55 transition-colors">솔루션 보기 →</span>
            </Link>
          </div>

          {/* 메인 헤드라인 */}
          <h1 className="animate-fade-up animate-delay-100">
            <span className="block text-[clamp(2.4rem,7vw,7rem)] font-black leading-[1.1] tracking-[-0.02em] text-white">
              AI를 만들고,
            </span>
            <span className="block text-[clamp(2.4rem,7vw,7rem)] font-black leading-[1.1] tracking-[-0.02em] gradient-text">
              기록하고,
            </span>
            <span className="block text-[clamp(2.4rem,7vw,7rem)] font-black leading-[1.1] tracking-[-0.02em] text-white/25">
              축적합니다.
            </span>
          </h1>

          {/* 서브 카피 + CTA */}
          <div className="animate-fade-up animate-delay-200 mt-10 sm:mt-12 flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-end lg:justify-between">
            <p className="max-w-md text-sm sm:text-base leading-relaxed text-white/40">
              바이칼시스템즈는 AI MVP 개발을 지속하며,<br className="hidden sm:block" />
              현재 산업 안전 관리 솔루션 <strong className="text-white/60">SafeLyn</strong>의
              공식 파트너로서 도입 상담을 지원합니다.
            </p>
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                to="/projects"
                className="group flex items-center gap-2 sm:gap-3 rounded-full bg-white px-5 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold text-black transition-all duration-300 hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-500/20"
              >
                AI 프로젝트 보기
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
              <Link
                to="/solutions/safelyn"
                className="flex items-center gap-2 sm:gap-3 rounded-full border border-white/10 px-5 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold text-white/60 transition-all duration-300 hover:border-white/25 hover:text-white"
              >
                SafeLyn 알아보기
              </Link>
            </div>
          </div>

          {/* 통계 — 프리미엄 stat-card */}
          <div className="animate-fade-up animate-delay-300 mt-14 sm:mt-18">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {STATS.map((s, i) => (
                <AnimatedStat key={s.label} value={s.value} label={s.label} color={s.color} accent={s.accent} delay={i * 120} />
              ))}
            </div>
          </div>
        </div>

        {/* 스크롤 인디케이터 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in animate-delay-500">
          <span className="text-[10px] tracking-[0.2em] text-white/20 uppercase">Scroll</span>
          <div className="h-10 w-px bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </section>

      {/* ===== TECH MARQUEE ===== */}
      <div className="relative bg-[#080808] overflow-hidden" aria-hidden="true">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#080808] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#080808] to-transparent z-10 pointer-events-none" />
        <div className="border-y border-white/[0.05] py-4 sm:py-5">
          <div className="flex animate-marquee w-max">
            {[...TECH_TAGS, ...TECH_TAGS].map((tag, i) => (
              <span key={i} className="inline-flex items-center gap-3 px-5 sm:px-8 whitespace-nowrap">
                <span className="h-1 w-1 rounded-full bg-blue-500/35 flex-shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.18em] uppercase text-white/18">
                  {tag}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ===== FEATURED SOLUTION ===== */}
      <FeaturedSolutionCard solution={FEATURED_SOLUTION} />

      {/* ===== 안전 콘텐츠 ===== */}
      <section className="relative py-24 sm:py-32 bg-[#080808]">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-emerald-500/4 blur-[100px] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="reveal flex items-end justify-between mb-12 sm:mb-16">
            <div>
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <div className="h-px w-8 bg-emerald-500/60" />
                <span className="section-label">SAFETY CONTENTS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white lg:text-5xl">
                안전 콘텐츠
              </h2>
              <p className="mt-3 text-sm text-white/30 max-w-sm">
                산업 안전 관리, HSE 트렌드, 현장 사례를 다룹니다.
              </p>
            </div>
            <Link
              to="/content"
              className="hidden sm:flex items-center gap-2 text-sm text-white/30 transition-colors hover:text-white/70 group"
            >
              전체 보기 <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Link>
          </div>

          {safetyLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-56 sm:h-60 rounded-2xl" />
              ))}
            </div>
          ) : safetyContents.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-20 sm:py-24 text-center">
              <span className="text-4xl mb-4">🛡️</span>
              <p className="text-white/30 text-sm">안전 콘텐츠를 준비 중입니다.</p>
              <p className="mt-2 text-xs text-white/20 max-w-xs">
                산업 안전 관리, SafeLyn 도입 사례, HSE 인사이트를 곧 공개합니다.
              </p>
              <Link
                to="/solutions/safelyn"
                className="mt-6 text-xs text-emerald-400/60 hover:text-emerald-400 transition-colors"
              >
                SafeLyn 솔루션 먼저 보기 →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {safetyContents.slice(0, 6).map(content => (
                <ContentCard key={content.id} content={content} />
              ))}
            </div>
          )}

          {safetyContents.length > 0 && (
            <div className="mt-8 sm:hidden">
              <Link
                to="/content"
                className="flex items-center justify-center gap-2 rounded-full border border-white/10 py-3 text-sm text-white/40 hover:border-white/20 hover:text-white/70 transition-all"
              >
                전체 안전 콘텐츠 보기 →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ===== 바이칼 SERVICES ===== */}
      <section className="relative py-24 sm:py-32 bg-[#080808]">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-blue-500/4 blur-[100px] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="reveal flex items-end justify-between mb-12 sm:mb-16">
            <div>
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <div className="h-px w-8 bg-blue-500/60" />
                <span className="section-label">SERVICES</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white lg:text-5xl">
                바이칼 서비스
              </h2>
            </div>
            <Link
              to="/services"
              className="hidden sm:flex items-center gap-2 text-sm text-white/30 transition-colors hover:text-white/70 group"
            >
              전체 보기 <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {HOME_SERVICES.map((s, idx) => (
              <Link
                key={s.title}
                to={s.href}
                className="glass-card rounded-2xl p-6 group relative overflow-hidden hover:border-white/15 transition-all duration-500 block"
              >
                <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${s.glowClass}`} />
                <div className="relative">
                  <span className="text-4xl block transition-transform group-hover:scale-110 duration-300 mb-4">{s.icon}</span>
                  <span className="font-mono text-[10px] text-white/15 tabular-nums block mb-2">{String(idx + 1).padStart(2, '0')}</span>
                  <h3 className={`text-sm font-bold text-white transition-colors duration-300 mb-2 ${s.accentClass}`}>{s.title}</h3>
                  <p className="text-xs leading-relaxed text-white/35 group-hover:text-white/45 transition-colors mb-4">{s.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {s.tags.map(t => (
                      <span key={t} className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-0.5 text-[11px] text-white/30 group-hover:border-white/[0.12] group-hover:text-white/40 transition-all">{t}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 sm:hidden">
            <Link
              to="/services"
              className="flex items-center justify-center gap-2 rounded-full border border-white/10 py-3 text-sm text-white/40 hover:border-white/20 hover:text-white/70 transition-all"
            >
              전체 서비스 보기 →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FEATURED PROJECTS ===== */}
      <section className="relative py-24 sm:py-32 bg-[#080808]">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="reveal flex items-end justify-between mb-12 sm:mb-16">
            <div>
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <div className="h-px w-8 bg-blue-500/60" />
                <span className="section-label">FEATURED PROJECTS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white lg:text-5xl">
                AI 프로젝트
              </h2>
            </div>
            <Link
              to="/projects"
              className="hidden sm:flex items-center gap-2 text-sm text-white/30 transition-colors hover:text-white/70 group"
            >
              전체 보기 <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Link>
          </div>

          {projectsLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-64 sm:h-72 rounded-2xl" />
              ))}
            </div>
          ) : (projects ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-20 sm:py-24 text-center">
              <span className="text-4xl mb-4">🚀</span>
              <p className="text-white/30 text-sm">프로젝트를 준비 중입니다</p>
              <Link to="/admin/projects" className="mt-4 text-xs text-blue-400/60 hover:text-blue-400">
                관리자에서 추가 →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects?.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}

          <div className="mt-8 sm:hidden">
            <Link
              to="/projects"
              className="flex items-center justify-center gap-2 rounded-full border border-white/10 py-3 text-sm text-white/40 hover:border-white/20 hover:text-white/70 transition-all"
            >
              전체 프로젝트 보기 →
            </Link>
          </div>
        </div>
      </section>



      {/* ===== CTA ===== */}
      <section className="relative py-28 sm:py-40 bg-[#080808]" style={{overflow:'clip'}}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        {/* 중앙 글로우 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[800px] h-[400px] rounded-full bg-blue-500/8 blur-[120px]" />
        </div>
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
          <span className="text-[clamp(5rem,18vw,16rem)] font-black text-white/[0.018] leading-none tracking-tight">
            PARTNER
          </span>
        </div>

        <div className="reveal relative mx-auto max-w-4xl px-5 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
            <div className="h-px w-8 bg-blue-500/60" />
            <span className="section-label">COLLABORATION</span>
            <div className="h-px w-8 bg-blue-500/60" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight text-white lg:text-6xl">
            AI 프로젝트 또는<br />
            <span className="gradient-text">SafeLyn 도입 상담</span>
          </h2>
          <p className="mt-5 sm:mt-6 text-sm sm:text-base text-white/35 max-w-lg mx-auto">
            AI MVP 개발 파트너가 필요하거나,<br className="hidden sm:block" />
            SafeLyn 산업 안전 솔루션 도입을 검토 중이라면 먼저 문의해 주세요.
          </p>
          <div className="mt-10 sm:mt-12 flex flex-col items-center gap-3 sm:gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/contact"
              className="group w-full sm:w-auto flex items-center justify-center gap-3 rounded-full bg-white px-7 sm:px-8 py-3.5 sm:py-4 text-sm font-semibold text-black transition-all duration-300 hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-500/20"
            >
              문의하기
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
            <Link
              to="/solutions/safelyn"
              className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-full border border-white/10 px-7 sm:px-8 py-3.5 sm:py-4 text-sm font-semibold text-white/50 transition-all duration-300 hover:border-white/25 hover:text-white"
            >
              SafeLyn 알아보기
            </Link>
            <Link
              to="/services"
              className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-full border border-white/10 px-7 sm:px-8 py-3.5 sm:py-4 text-sm font-semibold text-white/50 transition-all duration-300 hover:border-white/25 hover:text-white"
            >
              서비스 보기
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
