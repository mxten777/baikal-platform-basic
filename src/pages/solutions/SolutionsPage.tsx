import { Link } from 'react-router-dom'
import SEOHead from '@/components/seo/SEOHead'
import { SITE_URL } from '@/lib/constants'

const PRODUCTS = [
  {
    icon: '🔒',
    name: 'Private AI',
    tagline: '폐쇄망에서도 작동하는 AI 플랫폼',
    desc: '인터넷 단절 환경(폐쇄망)에 설치하는 RAG 기반 문서검색·AI 답변 시스템. 공공기관·군·금융 특화.',
    tags: ['공공기관', '금융', '온프레미스', 'RAG'],
    href: '/contact?solution=private-ai',
    cta: '도입 문의',
    accentColor: 'blue',
    border: 'border-blue-500/20',
    glow: 'bg-blue-500/10',
    label: 'text-blue-400',
    available: false,
  },
  {
    icon: '⚡',
    name: 'AI Automation',
    tagline: '반복 업무를 AI 에이전트로 자동화',
    desc: 'RPA·회의록·보조금 신청·재무 자동화까지. BAIKAL AI Engine 기반 업무 자동화 플랫폼.',
    tags: ['중소기업', '제조', 'RPA', 'AI Agent'],
    href: '/contact?solution=ai-automation',
    cta: '도입 문의',
    accentColor: 'purple',
    border: 'border-purple-500/20',
    glow: 'bg-purple-500/10',
    label: 'text-purple-400',
    available: false,
  },
  {
    icon: '🛡️',
    name: 'SafeLyn',
    tagline: '안전점검을 디지털로 전환하는 스마트 안전관리',
    desc: '모바일 체크리스트, 실시간 위험 알림, 법정 서류 자동화로 현장 안전 관리 효율을 높입니다.',
    tags: ['시설관리', '공공기관', 'HSE', '산업안전'],
    href: '/solutions/safelyn',
    cta: '솔루션 보기',
    accentColor: 'emerald',
    border: 'border-emerald-500/20',
    glow: 'bg-emerald-500/10',
    label: 'text-emerald-400',
    available: true,
  },
  {
    icon: '🎭',
    name: 'THE LIT',
    tagline: '공간 운영 올인원 플랫폼',
    desc: '공연·전시·강좌·공간 예약을 통합 운영하는 복합문화공간 플랫폼.',
    tags: ['문화공간', '지자체', '예약·결제', '공연'],
    href: '/contact?solution=the-lit',
    cta: '도입 문의',
    accentColor: 'amber',
    border: 'border-amber-500/20',
    glow: 'bg-amber-500/10',
    label: 'text-amber-400',
    available: false,
  },
]

export default function SolutionsPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'BAIKAL Products',
    url: `${SITE_URL}/solutions`,
    itemListElement: PRODUCTS.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      description: p.desc,
    })),
  }

  return (
    <>
      <SEOHead
        title="제품 — Powered by BAIKAL"
        description="BAIKAL AI Platform이 제공하는 4개 제품 라인업. Private AI, AI Automation, SafeLyn, THE LIT."
        canonical="/solutions"
        structuredData={structuredData}
      />

      {/* ===== HERO ===== */}
      <section className="relative bg-[#080808] pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/10 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-blue-500/60" />
            <span className="section-label">POWERED BY BAIKAL</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white lg:text-7xl leading-tight">
            제품 라인업
          </h1>
          <p className="mt-5 text-sm sm:text-base text-white/40 max-w-xl">
            BAIKAL AI Engine과 Admin Framework를 기반으로 구축된 4개 제품.
            모든 제품은 고객이 AI를 직접 소유하고 운영할 수 있도록 설계되었습니다.
          </p>
        </div>
      </section>

      {/* ===== PRODUCTS GRID ===== */}
      <section className="relative py-20 sm:py-24 bg-[#080808]">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {PRODUCTS.map((p, idx) => (
              <div
                key={p.name}
                className={`glass-card rounded-2xl p-8 border ${p.border} relative overflow-hidden group`}
              >
                <div className={`absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${p.glow}`} />
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{p.icon}</span>
                      <div>
                        <span className={`text-[10px] font-mono text-white/20`}>{String(idx + 1).padStart(2, '0')}</span>
                        <h2 className={`text-xl font-black text-white group-hover:${p.label.replace('text-', 'text-')} transition-colors`}>
                          {p.name}
                        </h2>
                      </div>
                    </div>
                    {p.available ? (
                      <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-3 py-1 text-[10px] font-semibold text-emerald-400">
                        <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                        Live
                      </span>
                    ) : (
                      <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] text-white/25">
                        준비 중
                      </span>
                    )}
                  </div>

                  <p className={`text-sm font-semibold mb-2 ${p.label}`}>{p.tagline}</p>
                  <p className="text-sm leading-relaxed text-white/40 mb-6">{p.desc}</p>

                  <div className="flex flex-wrap gap-1.5 mb-8">
                    {p.tags.map(t => (
                      <span key={t} className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-0.5 text-[11px] text-white/30">
                        {t}
                      </span>
                    ))}
                  </div>

                  <Link
                    to={p.href}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-xs font-semibold text-white/60 transition-all duration-300 hover:border-white/30 hover:text-white group/btn"
                  >
                    {p.cta}
                    <span className="transition-transform duration-300 group-hover/btn:translate-x-1">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BAIKAL ENGINE BADGE ===== */}
      <section className="relative py-20 bg-[#080808]">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="mx-auto max-w-3xl px-5 sm:px-6 text-center">
          <p className="text-[11px] tracking-widest text-white/20 uppercase mb-4">All products are</p>
          <p className="text-2xl sm:text-3xl font-black text-white/60">
            Powered by <span className="text-white">BAIKAL AI Engine</span>
          </p>
          <p className="mt-4 text-sm text-white/30 max-w-lg mx-auto">
            BAIKAL AI Engine + Admin Framework 위에 구축되어,
            고객은 AI 엔진을 직접 소유하고 자체 운영할 수 있습니다.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              to="/contact"
              className="group flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-500/20"
            >
              도입 문의
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              to="/projects"
              className="flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white/50 transition-all hover:border-white/25 hover:text-white"
            >
              포트폴리오 보기
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
