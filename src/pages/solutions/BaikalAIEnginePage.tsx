import { Link } from 'react-router-dom'
import SEOHead from '@/components/seo/SEOHead'
import { SITE_URL } from '@/lib/constants'

const ACCENT = '#3b82f6'

const CAPABILITIES = [
  {
    icon: '✍️',
    title: 'AI Content Engine',
    items: ['Blog', 'Instagram', 'Threads', 'Marketing'],
  },
  {
    icon: '📄',
    title: 'Document Intelligence',
    items: ['PDF', 'Word', 'Excel', 'HWP', 'OCR', 'RAG'],
  },
  {
    icon: '🤖',
    title: 'AI Agent',
    items: ['Report', 'Email', 'Automation', 'Analysis'],
  },
  {
    icon: '🔌',
    title: 'API Platform',
    items: ['FastAPI', 'REST API', 'Docker', 'Multi Project'],
  },
  {
    icon: '🏢',
    title: 'Enterprise AI',
    items: ['Private AI', 'On-Premise', 'RBAC', 'Audit Log'],
  },
]

const POWERED_BY = [
  {
    icon: '🎭',
    name: 'THE LIT',
    href: 'https://thelit.kr',
    external: true,
    items: ['Website', 'AI Marketing', 'Admin Framework'],
    color: 'border-amber-500/20',
    accent: '#f59e0b',
  },
  {
    icon: '🛡️',
    name: 'SafeLyn',
    href: '/solutions/safelyn',
    external: false,
    items: ['Safety Platform', 'AI Marketing'],
    color: 'border-emerald-500/20',
    accent: '#10b981',
  },
  {
    icon: '⚙️',
    name: 'BAIKAL Platform',
    href: '/solutions',
    external: false,
    items: ['Admin Framework', 'AI Marketing Engine'],
    color: 'border-blue-500/20',
    accent: '#3b82f6',
  },
]

const USE_CASES = [
  'Manufacturing', 'Public', 'Education', 'Healthcare', 'Culture',
  'Smart Factory', 'Safety', 'Groupware', 'AI Assistant', 'RPA',
]

const ARCH_STEPS = [
  { label: 'AI Engine', sub: 'FastAPI · Docker · LLM', icon: '⚡' },
  { label: 'Products', sub: 'THE LIT · SafeLyn · Platform', icon: '📦' },
  { label: 'Customer Solutions', sub: '맞춤 구축 · 화이트라벨', icon: '🏗️' },
  { label: 'Operation', sub: 'Admin · Monitoring · Cron', icon: '🔧' },
]

export default function BaikalAIEnginePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'BAIKAL AI Engine',
    description: 'BAIKAL 제품과 고객 서비스를 구동하는 공통 AI 실행 엔진. FastAPI·Docker 기반 AI Platform.',
    url: `${SITE_URL}/solutions/baikal-ai-engine`,
    applicationCategory: 'BusinessApplication',
    offers: {
      '@type': 'Offer',
      seller: { '@type': 'Organization', name: '바이칼시스템즈', url: SITE_URL },
    },
  }

  return (
    <>
      <SEOHead
        title="BAIKAL AI Engine — AI Platform"
        description="모든 제품과 고객 서비스를 구동하는 BAIKAL의 핵심 AI 실행 엔진. FastAPI·Docker 기반 콘텐츠 생성, 문서 처리, 자동화 플랫폼."
        canonical="/solutions/baikal-ai-engine"
        structuredData={structuredData}
      />

      {/* ===== HERO ===== */}
      <section className="relative bg-[#080808] pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="absolute top-0 right-0 w-[700px] h-[500px] rounded-full blur-[150px] pointer-events-none opacity-10" style={{ background: ACCENT }} />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] rounded-full blur-[120px] pointer-events-none opacity-8" style={{ background: ACCENT }} />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-10 flex items-center gap-2 text-xs text-white/25">
            <Link to="/" className="hover:text-white/60 transition-colors">홈</Link>
            <span>/</span>
            <Link to="/solutions" className="hover:text-white/60 transition-colors">솔루션</Link>
            <span>/</span>
            <span className="text-white/50">BAIKAL AI Engine</span>
          </nav>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 mb-6" style={{ borderColor: `${ACCENT}35`, background: `${ACCENT}0a` }}>
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: ACCENT }}>
              AI PLATFORM ENGINE · LIVE
            </span>
          </div>

          <h1 className="text-[clamp(2.8rem,7vw,7rem)] font-black leading-[1.05] tracking-[-0.02em] text-white">
            BAIKAL AI Engine
          </h1>
          <p className="mt-4 text-2xl sm:text-3xl font-black text-white/30 leading-tight">
            One AI Engine.<br />
            Unlimited Business Solutions.
          </p>
          <p className="mt-6 text-base sm:text-lg text-white/40 leading-relaxed max-w-2xl">
            FastAPI·Docker 기반으로 콘텐츠 생성, 문서 처리, 자동화 기능을 제공하는 BAIKAL의 핵심 AI 인프라.
            모든 제품과 고객 서비스가 이 엔진 위에서 동작합니다.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/contact?solution=baikal-ai-engine"
              className="group flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-semibold text-black transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
              style={{ background: ACCENT }}
            >
              도입 문의
              <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </Link>
            <Link
              to="/solutions"
              className="flex items-center gap-2 rounded-full border border-white/10 px-7 py-3.5 text-sm font-semibold text-white/60 transition-all duration-300 hover:border-white/25 hover:text-white"
            >
              제품 전체 보기
            </Link>
          </div>
        </div>
      </section>

      {/* ===== OVERVIEW ===== */}
      <section className="bg-[#080808] pb-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 pt-4">
          <div className="max-w-2xl mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8" style={{ background: ACCENT }} />
              <span className="section-label">OVERVIEW</span>
            </div>
            <p className="text-base sm:text-lg text-white/40 leading-relaxed">
              BAIKAL AI Engine은 기업이 AI 서비스를 구축·운영하기 위한 공통 AI Platform이다.
              콘텐츠 자동화, 문서 처리, AI 에이전트, API 인프라를 단일 엔진으로 통합하여
              모든 프로젝트가 동일한 엔진을 공유한다.
            </p>
          </div>

          {/* ===== CORE CAPABILITIES ===== */}
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-10">
              <div className="h-px w-8" style={{ background: ACCENT }} />
              <span className="section-label">CORE CAPABILITIES</span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {CAPABILITIES.map((cap, i) => (
                <div
                  key={cap.title}
                  className="glass-card rounded-2xl p-6 group relative overflow-hidden hover:border-white/15 transition-all duration-500"
                >
                  <div
                    className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `${ACCENT}20` }}
                  />
                  <div className="relative">
                    <span className="text-3xl block mb-3 transition-transform group-hover:scale-110 duration-300">
                      {cap.icon}
                    </span>
                    <span className="text-[10px] font-mono tracking-widest text-white/15 block mb-2">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-sm font-bold text-white mb-3">{cap.title}</h3>
                    <ul className="space-y-1">
                      {cap.items.map(item => (
                        <li key={item} className="flex items-center gap-1.5 text-xs text-white/30">
                          <span className="h-px w-3 bg-white/15 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ===== POWERED BY ===== */}
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-10">
              <div className="h-px w-8" style={{ background: ACCENT }} />
              <span className="section-label">POWERED BY BAIKAL AI ENGINE</span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {POWERED_BY.map(p => (
                <div
                  key={p.name}
                  className={`glass-card rounded-2xl p-6 border ${p.color} group relative overflow-hidden hover:border-white/15 transition-all duration-500`}
                >
                  <div
                    className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `${p.accent}18` }}
                  />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{p.icon}</span>
                      <h3 className="text-sm font-bold text-white">{p.name}</h3>
                    </div>
                    <ul className="space-y-1.5 mb-5">
                      {p.items.map(item => (
                        <li key={item} className="flex items-center gap-2 text-xs text-white/30">
                          <span className="h-px w-3 shrink-0" style={{ background: `${p.accent}60` }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                    {p.external ? (
                      <a
                        href={p.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold transition-colors hover:text-white/60"
                        style={{ color: `${p.accent}99` }}
                      >
                        사이트 방문 →
                      </a>
                    ) : (
                      <Link
                        to={p.href}
                        className="text-xs font-semibold transition-colors hover:text-white/60"
                        style={{ color: `${p.accent}99` }}
                      >
                        자세히 보기 →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ===== USE CASES ===== */}
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-8" style={{ background: ACCENT }} />
              <span className="section-label">USE CASES</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {USE_CASES.map(uc => (
                <span
                  key={uc}
                  className="rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-1.5 text-xs text-white/35 transition-all hover:border-white/15 hover:text-white/60"
                >
                  {uc}
                </span>
              ))}
            </div>
          </div>

          {/* ===== ARCHITECTURE ===== */}
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-10">
              <div className="h-px w-8" style={{ background: ACCENT }} />
              <span className="section-label">ARCHITECTURE</span>
            </div>
            <div className="flex flex-col items-center gap-0 max-w-xs mx-auto sm:max-w-sm">
              {ARCH_STEPS.map((step, i) => (
                <div key={step.label} className="w-full flex flex-col items-center">
                  <div
                    className="w-full glass-card rounded-2xl p-5 text-center relative overflow-hidden group hover:border-white/15 transition-all duration-300"
                    style={{ borderColor: i === 0 ? `${ACCENT}30` : undefined }}
                  >
                    {i === 0 && (
                      <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ background: `${ACCENT}05` }} />
                    )}
                    <div className="relative">
                      <span className="text-xl block mb-1">{step.icon}</span>
                      <p className="text-sm font-bold text-white">{step.label}</p>
                      <p className="text-[11px] text-white/25 mt-0.5">{step.sub}</p>
                    </div>
                  </div>
                  {i < ARCH_STEPS.length - 1 && (
                    <div className="flex flex-col items-center py-2 gap-0.5">
                      <div className="w-px h-4 bg-white/[0.06]" />
                      <span className="text-white/15 text-xs">↓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ===== CTA ===== */}
          <div
            className="rounded-2xl border p-10 sm:p-14 text-center relative overflow-hidden"
            style={{ borderColor: `${ACCENT}18`, background: `${ACCENT}05` }}
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[600px] h-[300px] rounded-full blur-[100px] opacity-10" style={{ background: ACCENT }} />
            </div>
            <div className="relative">
              <p className="text-[11px] tracking-widest text-white/20 uppercase mb-3">BAIKAL AI ENGINE</p>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
                Start Your AI Platform
              </h2>
              <p className="text-sm text-white/35 max-w-lg mx-auto mb-8">
                BAIKAL AI Engine을 기반으로 귀사의 AI 서비스를 구축할 수 있습니다.
                도입 범위와 기술 스택을 함께 검토해 드립니다.
              </p>
              <Link
                to="/contact?solution=baikal-ai-engine"
                className="group inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-black transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                style={{ background: ACCENT }}
              >
                문의하기
                <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
