import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import SEOHead from '@/components/seo/SEOHead'
import ProjectCard from '@/components/project/ProjectCard'
import ContentCard from '@/components/content/ContentCard'
import FeaturedSolutionCard from '@/components/solution/FeaturedSolutionCard'
import { useFeaturedProjects } from '@/features/projects/useProjects'
import { useContents } from '@/features/contents/useContents'
import { SITE_URL } from '@/lib/constants'
import { FEATURED_SOLUTION } from '@/lib/solutions'

// Powered by BAIKAL — 제품 라인업
const PRODUCTS = [
  {
    title: 'Private AI',
    desc: '폐쇄망에서도 작동하는 AI 문서검색·답변 플랫폼. 인터넷 단절 환경에 최적화.',
    tags: ['공공기관', '군·금융', '온프레미스'],
    href: '/solutions',
  },
  {
    title: 'AI Automation',
    desc: '반복 업무를 AI 에이전트로 자동화. 회의록·보조금·RPA·재무 자동화 포함.',
    tags: ['중소기업', '제조', '서비스'],
    href: '/solutions',
  },
  {
    title: 'SafeLyn',
    desc: '시설 안전점검을 디지털로 전환. 모바일 체크리스트·보고서 자동화.',
    tags: ['시설관리', '공공기관', 'HSE'],
    href: '/solutions/safelyn',
  },
  {
    title: 'THE LIT',
    desc: '공연·전시·강좌·공간 예약을 통합 운영하는 복합문화공간 플랫폼.',
    tags: ['문화공간', '지자체', '예약·결제'],
    href: '/solutions',
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

export default function HomePage() {
  const { data: projects, isLoading: projectsLoading } = useFeaturedProjects(6)
  const { data: safetyResult, isLoading: safetyLoading } = useContents({
    content_type: ['article', 'research'],
    per_page: 6,
  })
  useScrollReveal()

  const safetyContents = safetyResult?.data ?? []

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '바이칼시스템즈',
    url: SITE_URL,
    description: 'BAIKAL AI Platform Company — AI 엔진과 운영 플랫폼을 함께 제공하여, 비즈니스가 AI를 직접 소유하도록 만드는 회사.',
    sameAs: [
      'https://x.com/baikal_ai',
      'https://www.youtube.com/@BAIKALAI',
      'https://www.instagram.com/baikal.ai/',
      'https://www.threads.net/@baikal.ai',
      'https://www.facebook.com/profile.php?id=61592854179097',
    ],
  }

  return (
    <>
      <SEOHead canonical="/" structuredData={structuredData} />

      {/* ===== HERO ===== */}
      <section className="relative bg-[#0a1628] flex flex-col justify-center -mt-[100px]" style={{overflow:'clip'}}>
        <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
        
        {/* hero-content */}
        <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8 pt-36 sm:pt-44 pb-20 sm:pb-28">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16 lg:items-end">
            <div className="lg:col-span-7">
              <p className="animate-fade-up text-xs font-semibold tracking-[0.2em] text-blue-400 uppercase">
                BAIKAL AI Platform Company
              </p>
              <h1 className="animate-fade-up animate-delay-100 mt-6 text-[clamp(2rem,4.6vw,4rem)] font-bold leading-[1.2] tracking-[-0.02em] text-white break-keep">
                AI 기술과 시스템 설계 전문성으로,<br />
                공공·기업의 업무 혁신을 실현합니다.
              </h1>
              <p className="animate-fade-up animate-delay-200 mt-7 max-w-xl text-base sm:text-lg leading-relaxed text-slate-300 break-keep">
                업무 분석부터 시스템 설계·개발·연동까지.<br />
                AI 기반 개발 방식과 검증된 기술을 결합해 현장에 필요한 업무시스템을 구축합니다.
              </p>
              <div className="animate-fade-up animate-delay-300 mt-10 flex flex-wrap items-center gap-3 sm:gap-4">
                <Link
                  to="/contact"
                  className="rounded-md bg-blue-500 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-400"
                >
                  구축 상담 문의
                </Link>
                <Link
                  to="/projects"
                  className="rounded-md border border-white/25 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/5"
                >
                  구축 사례 보기
                </Link>
              </div>
            </div>

            {/* 대표 구축 사례 목록 — 등록된 프로젝트 데이터 그대로 사용 */}
            <div className="animate-fade-up animate-delay-300 lg:col-span-5">
              <p className="border-b border-white/20 pb-3 text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                Selected Projects
              </p>
              {projectsLoading ? (
                <div className="mt-2 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton h-14 rounded-md" />
                  ))}
                </div>
              ) : (
                <ul>
                  {(projects ?? []).slice(0, 4).map(project => (
                    <li key={project.id} className="border-b border-white/10">
                      <Link
                        to={`/projects/${project.slug}`}
                        className="group flex items-center justify-between gap-4 py-4"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-base font-semibold text-white group-hover:text-blue-300 transition-colors">
                            {project.title}
                          </span>
                          {project.category && (
                            <span className="mt-1 block text-xs text-slate-400">{project.category}</span>
                          )}
                        </span>
                        <span className="text-slate-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-blue-300">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/projects" className="mt-5 inline-block text-sm text-slate-300 hover:text-white transition-colors">
                전체 프로젝트 보기 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHAT WE DO ===== */}
      <section className="relative py-16 sm:py-20 bg-[#08111f]">
        <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
        <div className="reveal mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <span className="text-xs font-semibold tracking-[0.2em] text-blue-400 uppercase">What We Do</span>
            <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug break-keep">
              AI 엔진과 운영 플랫폼을 함께 제공합니다
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed break-keep">
              고객이 AI를 직접 소유하고 운영할 수 있도록 구축합니다.
            </p>
          </div>
          <dl className="lg:col-span-7 border-t border-white/20">
            {[
              { label: 'BAIKAL AI Engine', desc: '핵심 AI 엔진' },
              { label: 'Admin Framework', desc: '운영 플랫폼' },
              { label: 'Custom MVP', desc: '맞춤 개발' },
            ].map(item => (
              <div key={item.label} className="flex items-baseline justify-between gap-6 border-b border-white/10 py-4">
                <dt className="text-base font-semibold text-white">{item.label}</dt>
                <dd className="text-sm text-slate-400">{item.desc}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ===== FEATURED SUCCESS STORY ===== */}
      <section className="relative py-20 sm:py-28 bg-[#0a1628]">
        <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="reveal mb-10 sm:mb-14">
            <span className="text-xs font-semibold tracking-[0.2em] text-blue-400 uppercase">Featured Project</span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-white break-keep">대표 구축 사례</h2>
          </div>

          <div className="reveal rounded-lg border border-white/15 bg-[#0d1d36] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">

              {/* 비주얼 패널 — 실제 시스템 화면 확보 전까지 타이포 패널 사용 */}
              <div className="relative min-h-[220px] lg:min-h-[380px] flex items-center justify-center bg-[#08111f] border-b lg:border-b-0 lg:border-r border-white/10">
                <div className="text-center px-8">
                  <p className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold tracking-[-0.02em] leading-none text-white">
                    THE LIT
                  </p>
                  <p className="mt-4 text-xs font-semibold tracking-[0.25em] uppercase text-slate-400">
                    Culture Platform
                  </p>
                </div>
              </div>

              {/* 콘텐츠 */}
              <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
                <p className="text-xs font-semibold tracking-[0.18em] uppercase text-blue-400">
                  Powered by BAIKAL AI Platform
                </p>

                <h3 className="mt-4 text-3xl sm:text-4xl font-bold tracking-[-0.01em] leading-tight text-white">
                  THE LIT
                </h3>
                <p className="mt-2 text-sm font-medium tracking-wider text-slate-400 uppercase">
                  K-POP · Drama · Commercial · Entertainment
                </p>

                <dl className="mt-8 divide-y divide-white/10 border-y border-white/10 text-sm">
                  <div className="flex gap-6 py-3">
                    <dt className="w-24 shrink-0 text-slate-400">구축 범위</dt>
                    <dd className="text-slate-100">Website · AI Marketing Engine · Admin Framework · SEO</dd>
                  </div>
                  <div className="flex gap-6 py-3">
                    <dt className="w-24 shrink-0 text-slate-400">상태</dt>
                    <dd className="text-slate-100">운영 중</dd>
                  </div>
                </dl>

                <p className="mt-7 text-sm leading-relaxed text-slate-300 max-w-md break-keep">
                  BAIKAL이 THE LIT을 AI 기반 디지털 플랫폼으로 구축한 과정을 소개합니다.
                </p>

                <div className="mt-8">
                  <Link
                    to="/projects/the-lit-digital-renewal"
                    className="inline-block rounded-md bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-400"
                  >
                    사례 자세히 보기 →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURED SOLUTION ===== */}
      <FeaturedSolutionCard solution={FEATURED_SOLUTION} />

      {/* ===== 주요 구축 사례 및 기술 콘텐츠 ===== */}
      <section className="relative py-20 sm:py-28 bg-[#08111f]">
        <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="reveal flex items-end justify-between mb-10 sm:mb-12">
            <div>
              <span className="text-xs font-semibold tracking-[0.2em] text-blue-400 uppercase">Projects & Insights</span>
              <h2 className="mt-4 text-2xl sm:text-4xl font-bold tracking-tight text-white break-keep">
                주요 구축 사례 및 기술 콘텐츠
              </h2>
              <p className="mt-3 text-sm text-slate-400 max-w-md break-keep">
                BAIKAL AI의 업무시스템 구축 사례와 AI 기술 활용 경험을 소개합니다.
              </p>
            </div>
            <Link
              to="/content"
              className="hidden sm:inline-block text-sm text-slate-300 transition-colors hover:text-white"
            >
              전체 보기 →
            </Link>
          </div>

          {safetyLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-56 sm:h-60 rounded-2xl" />
              ))}
            </div>
          ) : safetyContents.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/15 py-16 text-center">
              <p className="text-slate-300 text-sm">구축 사례 콘텐츠를 준비 중입니다.</p>
              <p className="mt-2 text-xs text-slate-500 max-w-xs">
                업무시스템 구축 사례와 AI 기술 활용 경험을 곧 공개합니다.
              </p>
              <Link
                to="/projects"
                className="mt-6 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                프로젝트 먼저 보기 →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {safetyContents.slice(0, 6).map((content, i) => (
                <div key={content.id} className={i >= 3 ? 'hidden sm:contents' : 'contents'}>
                  <ContentCard content={content} />
                </div>
              ))}
            </div>
          )}

          {safetyContents.length > 0 && (
            <div className="mt-8 sm:hidden">
              <Link
                to="/content"
                className="flex items-center justify-center gap-2 rounded-md border border-white/25 py-3 text-sm text-slate-200 hover:border-white/50 transition-colors"
              >
                전체 콘텐츠 보기 →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ===== POWERED BY BAIKAL PRODUCTS ===== */}
      <section className="relative py-20 sm:py-28 bg-[#0a1628]">
        <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="reveal flex items-end justify-between mb-10 sm:mb-12">
            <div>
              <span className="text-xs font-semibold tracking-[0.2em] text-blue-400 uppercase">Powered by BAIKAL</span>
              <h2 className="mt-4 text-2xl sm:text-4xl font-bold tracking-tight text-white">
                제품 라인업
              </h2>
            </div>
            <Link
              to="/solutions"
              className="hidden sm:inline-block text-sm text-slate-300 transition-colors hover:text-white"
            >
              전체 보기 →
            </Link>
          </div>

          <ul className="reveal border-t border-white/20">
            {PRODUCTS.map((s, idx) => (
              <li key={s.title} className="border-b border-white/10">
                <Link
                  to={s.href}
                  className="group grid grid-cols-1 gap-2 py-5 sm:grid-cols-12 sm:items-center sm:gap-6"
                >
                  <span className="hidden sm:block sm:col-span-1 font-mono text-xs text-blue-400 tabular-nums">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <h3 className="sm:col-span-3 text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                    {s.title}
                  </h3>
                  <p className="sm:col-span-5 text-sm leading-relaxed text-slate-400 break-keep">{s.desc}</p>
                  <p className="sm:col-span-3 text-xs text-slate-500 sm:text-right">{s.tags.join(' · ')}</p>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-8 sm:hidden">
            <Link
              to="/solutions"
              className="flex items-center justify-center gap-2 rounded-md border border-white/25 py-3 text-sm text-slate-200 hover:border-white/50 transition-colors"
            >
              전체 제품 보기 →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FEATURED PROJECTS ===== */}
      <section className="relative py-20 sm:py-28 bg-[#08111f]">
        <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="reveal flex items-end justify-between mb-10 sm:mb-12">
            <div>
              <span className="text-xs font-semibold tracking-[0.2em] text-blue-400 uppercase">Featured Projects</span>
              <h2 className="mt-4 text-2xl sm:text-4xl font-bold tracking-tight text-white">
                AI 프로젝트
              </h2>
            </div>
            <Link
              to="/projects"
              className="hidden sm:inline-block text-sm text-slate-300 transition-colors hover:text-white"
            >
              전체 보기 →
            </Link>
          </div>

          {projectsLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-64 sm:h-72 rounded-2xl" />
              ))}
            </div>
          ) : (projects ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/15 py-16 text-center">
              <p className="text-slate-300 text-sm">프로젝트를 준비 중입니다</p>
              <Link to="/admin/projects" className="mt-4 text-xs text-blue-400 hover:text-blue-300">
                관리자에서 추가 →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects?.slice(0, 3).map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}

          <div className="mt-8 sm:hidden">
            <Link
              to="/projects"
              className="flex items-center justify-center gap-2 rounded-md border border-white/25 py-3 text-sm text-slate-200 hover:border-white/50 transition-colors"
            >
              전체 프로젝트 보기 →
            </Link>
          </div>
        </div>
      </section>



      {/* ===== HOW IT WORKS ===== */}
      <section className="relative py-20 sm:py-28 bg-[#0a1628]">
        <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="reveal mb-10 sm:mb-12">
            <span className="text-xs font-semibold tracking-[0.2em] text-blue-400 uppercase">How It Works</span>
            <h2 className="mt-4 text-2xl sm:text-4xl font-bold tracking-tight text-white">
              3단계로 AI 전환 완료
            </h2>
          </div>
          <ol className="reveal grid grid-cols-1 sm:grid-cols-3 gap-x-10 gap-y-8">
            {[
              { step: '01', title: 'BAIKAL AI Engine 탑재', desc: 'LLM·RAG·에이전트 기반 AI 엔진을 비즈니스에 연결합니다.' },
              { step: '02', title: '맞춤 제품 도입', desc: 'Private AI·AI Automation·SafeLyn·THE LIT 중 최적 제품을 선택합니다.' },
              { step: '03', title: '고객 비즈니스 운영', desc: 'AI를 직접 소유한 고객이 자체적으로 운영·확장합니다.' },
            ].map(item => (
              <li key={item.step} className="border-t border-white/20 pt-5">
                <p className="font-mono text-xs text-blue-400">{item.step}</p>
                <h3 className="mt-3 text-base font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400 break-keep">{item.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative py-20 sm:py-28 bg-[#08111f]">
        <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
        <div className="reveal relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl sm:text-4xl font-bold leading-tight tracking-tight text-white break-keep">
              업무시스템 구축, 먼저 상담해 보세요
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-lg break-keep">
              BAIKAL AI Platform으로 AI 엔진과 운영 플랫폼을 함께 도입하세요.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/contact"
              className="rounded-md bg-blue-500 px-7 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-400"
            >
              도입 문의하기
            </Link>
            <Link
              to="/solutions"
              className="rounded-md border border-white/25 px-7 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/5"
            >
              제품 보기
            </Link>
            <Link
              to="/projects"
              className="rounded-md border border-white/25 px-7 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/5"
            >
              포트폴리오 보기
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
