import { Link } from 'react-router-dom'
import SEOHead from '@/components/seo/SEOHead'
import ProjectCard from '@/components/project/ProjectCard'
import ContentCard from '@/components/content/ContentCard'
import { useFeaturedProjects } from '@/features/projects/useProjects'
import { useFeaturedContents } from '@/features/contents/useContents'
import { SITE_URL } from '@/lib/constants'

// 통계 데이터
const STATS = [
  { value: '15+', label: 'AI 프로젝트' },
  { value: '3년+', label: '개발 경력' },
  { value: '100%', label: 'AI 특화' },
  { value: '∞', label: '가능성' },
]

export default function HomePage() {
  const { data: projects, isLoading: projectsLoading } = useFeaturedProjects(6)
  const { data: contents, isLoading: contentsLoading } = useFeaturedContents(6)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '바이칼시스템즈',
    url: SITE_URL,
    description: 'AI 소프트웨어 개발 회사',
    sameAs: [
      'https://x.com/baikalsys',
      'https://www.youtube.com/@baikalsys',
    ],
  }

  return (
    <>
      <SEOHead canonical="/" structuredData={structuredData} />

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen overflow-hidden bg-[#080808] flex flex-col justify-center -mt-16">
        {/* 배경 — 그리드 + 글로우 */}
        <div className="absolute inset-0 grid-bg opacity-100" />
        <div className="absolute inset-0 bg-hero-glow" />
        {/* 우측 하단 보조 글로우 */}
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

        <div className="relative mx-auto w-full max-w-7xl px-6 lg:px-8 pt-32 pb-24">
          {/* 라벨 */}
          <div className="animate-fade-up flex items-center gap-3 mb-10">
            <div className="h-px w-8 bg-blue-500/60" />
            <span className="section-label">BAIKAL AI CONTENT PLATFORM</span>
          </div>

          {/* 메인 헤드라인 */}
          <h1 className="animate-fade-up animate-delay-100">
            <span className="block text-[clamp(2.8rem,7vw,7rem)] font-black leading-[1.1] tracking-[-0.02em] text-white">
              AI를 만들고,
            </span>
            <span className="block text-[clamp(2.8rem,7vw,7rem)] font-black leading-[1.1] tracking-[-0.02em] gradient-text">
              기록하고,
            </span>
            <span className="block text-[clamp(2.8rem,7vw,7rem)] font-black leading-[1.1] tracking-[-0.02em] text-white/25">
              축적합니다.
            </span>
          </h1>

          {/* 서브 카피 + CTA */}
          <div className="animate-fade-up animate-delay-200 mt-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <p className="max-w-md text-base leading-relaxed text-white/40">
              바이칼시스템즈는 AI MVP 프로젝트를 지속 개발하고,<br />
              그 과정과 인사이트를 이 플랫폼에 쌓아갑니다.
            </p>
            <div className="flex items-center gap-4">
              <Link
                to="/projects"
                className="group flex items-center gap-3 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition-all duration-300 hover:bg-blue-50"
              >
                AI 프로젝트 보기
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
              <Link
                to="/lab/articles"
                className="flex items-center gap-3 rounded-full border border-white/10 px-7 py-3.5 text-sm font-semibold text-white/60 transition-all duration-300 hover:border-white/25 hover:text-white"
              >
                기술 아티클
              </Link>
            </div>
          </div>

          {/* 통계 */}
          <div className="animate-fade-up animate-delay-300 mt-20 grid grid-cols-2 gap-6 border-t border-white/[0.06] pt-10 sm:grid-cols-4">
            {STATS.map(s => (
              <div key={s.label}>
                <p className="text-4xl font-black text-white">{s.value}</p>
                <p className="mt-1.5 text-xs tracking-widest text-white/25 uppercase">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 스크롤 인디케이터 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in animate-delay-500">
          <span className="text-[10px] tracking-[0.2em] text-white/20 uppercase">Scroll</span>
          <div className="h-10 w-px bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </section>

      {/* ===== PHILOSOPHY ===== */}
      <section className="relative py-32 bg-[#080808] overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="h-px w-8 bg-blue-500/60" />
                <span className="section-label">OUR APPROACH</span>
              </div>
              <h2 className="text-5xl font-black leading-tight tracking-[-0.02em] text-white lg:text-6xl">
                만들고 공유하며<br />
                <span className="text-white/30">함께 성장합니다</span>
              </h2>
              <p className="mt-6 text-base leading-relaxed text-white/40 max-w-md">
                단순한 개발사가 아닙니다.
                AI 프로젝트의 기획, 개발, 실패, 성공 — 모든 과정을 투명하게 기록하고
                공유하는 지식 플랫폼입니다.
              </p>
              <Link
                to="/about"
                className="mt-8 inline-flex items-center gap-2 text-sm text-blue-400/70 hover:text-blue-400 transition-colors"
              >
                더 알아보기 <span>→</span>
              </Link>
            </div>
            {/* 특징 그리드 */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '⚡', title: 'AI MVP 개발', desc: '아이디어를 빠르게 작동하는 AI 제품으로' },
                { icon: '📚', title: '지식 축적', desc: '모든 개발 과정을 문서화하고 공유' },
                { icon: '🔄', title: '자동 수집', desc: 'SNS, YouTube, 블로그 콘텐츠 자동 아카이브' },
                { icon: '🚀', title: 'SEO 성장', desc: '콘텐츠가 쌓일수록 강해지는 플랫폼' },
              ].map(f => (
                <div key={f.title} className="glass-card rounded-2xl p-6">
                  <span className="text-2xl">{f.icon}</span>
                  <h3 className="mt-3 text-sm font-bold text-white">{f.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/35">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURED PROJECTS ===== */}
      <section className="relative py-32 bg-[#080808]">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* 섹션 헤더 */}
          <div className="flex items-end justify-between mb-16">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-blue-500/60" />
                <span className="section-label">FEATURED PROJECTS</span>
              </div>
              <h2 className="text-4xl font-black tracking-tight text-white lg:text-5xl">
                AI 프로젝트
              </h2>
            </div>
            <Link
              to="/projects"
              className="hidden sm:flex items-center gap-2 text-sm text-white/30 transition-colors hover:text-white/70"
            >
              전체 보기 <span>→</span>
            </Link>
          </div>

          {projectsLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-72 rounded-2xl" />
              ))}
            </div>
          ) : (projects ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-24 text-center">
              <span className="text-4xl mb-4">🚀</span>
              <p className="text-white/30 text-sm">프로젝트를 준비 중입니다</p>
              <Link to="/admin/projects" className="mt-4 text-xs text-blue-400/60 hover:text-blue-400">
                관리자에서 추가 →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* ===== LATEST CONTENTS ===== */}
      <section className="relative py-32 bg-[#080808]">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-end justify-between mb-16">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-blue-500/60" />
                <span className="section-label">LATEST CONTENTS</span>
              </div>
              <h2 className="text-4xl font-black tracking-tight text-white lg:text-5xl">
                최신 콘텐츠
              </h2>
            </div>
            <Link
              to="/content"
              className="hidden sm:flex items-center gap-2 text-sm text-white/30 transition-colors hover:text-white/70"
            >
              전체 보기 <span>→</span>
            </Link>
          </div>

          {contentsLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-60 rounded-2xl" />
              ))}
            </div>
          ) : (contents ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-24 text-center">
              <span className="text-4xl mb-4">📝</span>
              <p className="text-white/30 text-sm">콘텐츠를 준비 중입니다</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {contents?.map(content => (
                <ContentCard key={content.id} content={content} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative py-40 bg-[#080808] overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        {/* 중앙 글로우 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[800px] h-[400px] rounded-full bg-blue-500/8 blur-[120px]" />
        </div>
        <div className="absolute inset-0 grid-bg opacity-50" />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-8 bg-blue-500/60" />
            <span className="section-label">COLLABORATION</span>
            <div className="h-px w-8 bg-blue-500/60" />
          </div>
          <h2 className="text-5xl font-black leading-tight tracking-tight text-white lg:text-6xl">
            AI 프로젝트를<br />
            <span className="gradient-text">함께 만들어보세요</span>
          </h2>
          <p className="mt-6 text-base text-white/35 max-w-lg mx-auto">
            MVP부터 프로덕션까지 — 아이디어를 실제 작동하는 AI 제품으로 만드는
            전문 개발 파트너입니다.
          </p>
          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/contact"
              className="group flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-semibold text-black transition-all duration-300 hover:bg-blue-50"
            >
              프로젝트 문의하기
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
            <Link
              to="/services"
              className="flex items-center gap-3 rounded-full border border-white/10 px-8 py-4 text-sm font-semibold text-white/50 transition-all duration-300 hover:border-white/25 hover:text-white"
            >
              서비스 알아보기
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
