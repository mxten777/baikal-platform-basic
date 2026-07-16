import { useParams, Link } from 'react-router-dom'
import SEOHead from '@/components/seo/SEOHead'
import { getSolutionBySlug } from '@/lib/solutions'
import { SITE_URL } from '@/lib/constants'

export default function SolutionDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const solution = getSolutionBySlug(slug)

  if (!solution) {
    return (
      <div className="py-40 text-center">
        <p className="text-white/30">솔루션을 찾을 수 없습니다.</p>
        <Link to="/" className="mt-4 inline-block text-blue-400/60 hover:text-blue-400">
          ← 홈으로
        </Link>
      </div>
    )
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: solution.name,
    description: solution.description,
    url: `${SITE_URL}/solutions/${solution.slug}`,
    category: solution.category,
    offers: {
      '@type': 'Offer',
      seller: {
        '@type': 'Organization',
        name: '바이칼시스템즈',
        url: SITE_URL,
      },
    },
  }

  return (
    <>
      <SEOHead
        title={`${solution.name} - ${solution.category}`}
        description={solution.tagline}
        canonical={`/solutions/${solution.slug}`}
        structuredData={structuredData}
      />

      {/* ===== HERO ===== */}
      <section className="relative bg-[#080808] pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div
          className="absolute top-0 right-0 w-[700px] h-[500px] rounded-full blur-[150px] pointer-events-none opacity-12"
          style={{ background: solution.accent_hex }}
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-10 flex items-center gap-2 text-xs text-white/25">
            <Link to="/" className="hover:text-white/60 transition-colors">홈</Link>
            <span>/</span>
            <span className="text-white/50">솔루션</span>
            <span>/</span>
            <span className="text-white/50">{solution.name}</span>
          </nav>

          {/* 파트너 배지 */}
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 mb-6"
            style={{
              borderColor: `${solution.accent_hex}35`,
              background: `${solution.accent_hex}0a`,
            }}
          >
            <span className="text-sm">{solution.logo_emoji}</span>
            <span
              className="text-[10px] font-bold tracking-[0.2em] uppercase"
              style={{ color: solution.accent_hex }}
            >
              {solution.badge_label}
            </span>
          </div>

          {/* 타이틀 */}
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/25 mb-2">
            {solution.category}
          </p>
          <h1 className="text-[clamp(2.8rem,7vw,7rem)] font-black leading-[1.1] tracking-[-0.02em] text-white">
            {solution.name}
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-white/40 leading-relaxed max-w-2xl">
            {solution.tagline}
          </p>

          {/* CTA 버튼 */}
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to={solution.cta.demo}
              className="group flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-semibold text-black transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
              style={{ background: solution.accent_hex }}
            >
              데모 신청하기
              <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </Link>
            <Link
              to={solution.cta.inquiry}
              className="flex items-center gap-2 rounded-full border border-white/10 px-7 py-3.5 text-sm font-semibold text-white/60 transition-all duration-300 hover:border-white/25 hover:text-white"
            >
              도입 상담
            </Link>
            <Link
              to={solution.cta.brochure}
              className="flex items-center gap-2 rounded-full border border-white/10 px-7 py-3.5 text-sm font-semibold text-white/60 transition-all duration-300 hover:border-white/25 hover:text-white"
            >
              자료 요청
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 솔루션 개요 ===== */}
      <section className="bg-[#080808] pb-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 pt-4">

          {/* 설명 */}
          <div className="max-w-2xl mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8" style={{ background: solution.accent_hex }} />
              <span className="section-label">OVERVIEW</span>
            </div>
            <p className="text-base sm:text-lg text-white/40 leading-relaxed">{solution.description}</p>
          </div>

          {/* 핵심 기능 */}
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-10">
              <div className="h-px w-8" style={{ background: solution.accent_hex }} />
              <span className="section-label">KEY FEATURES</span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {solution.features.map((f, i) => (
                <div
                  key={f.title}
                  className="glass-card rounded-2xl p-6 group relative overflow-hidden hover:border-white/15 transition-all duration-500"
                >
                  <div
                    className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `${solution.accent_hex}20` }}
                  />
                  <div className="relative">
                    <span className="text-4xl block mb-4 transition-transform group-hover:scale-110 duration-300">
                      {f.icon}
                    </span>
                    <span
                      className="text-[10px] font-mono tracking-widest text-white/15 block mb-2"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-sm font-bold text-white mb-2">{f.title}</h3>
                    <p className="text-xs leading-relaxed text-white/35">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 도입 효과 */}
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-10">
              <div className="h-px w-8" style={{ background: solution.accent_hex }} />
              <span className="section-label">BENEFITS</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {solution.benefits.map(b => (
                <div key={b.label} className="glass-card rounded-2xl overflow-hidden">
                  <div className="h-[2px] w-full" style={{ background: b.accent }} />
                  <div className="p-5 sm:p-6">
                    <p className="text-3xl sm:text-4xl font-black" style={{ color: b.accent }}>
                      {b.value}
                    </p>
                    <p className="mt-2 text-[10px] sm:text-xs tracking-widest text-white/25 uppercase">
                      {b.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 태그 */}
          {solution.tags.length > 0 && (
            <div className="mb-20">
              <div className="flex flex-wrap gap-2">
                {solution.tags.map(tag => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1 text-xs text-white/35"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 파트너 고지 */}
          <div
            className="rounded-2xl border p-6 sm:p-8 mb-16"
            style={{
              borderColor: `${solution.accent_hex}20`,
              background: `${solution.accent_hex}05`,
            }}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5 shrink-0">ℹ️</span>
              <div>
                <h3 className="text-sm font-bold text-white/70 mb-1">파트너십 안내</h3>
                <p className="text-xs sm:text-sm text-white/35 leading-relaxed">
                  {solution.partner_note}
                </p>
              </div>
            </div>
          </div>

          {/* 향후 확장 예정 영역 안내 */}
          <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-6 mb-16">
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5 shrink-0">🔭</span>
              <div>
                <h3 className="text-sm font-bold text-white/40 mb-1">향후 확장 예정</h3>
                <p className="text-xs text-white/20 leading-relaxed">
                  AI 콘텐츠 자동화·SNS 연동·CRM·챗봇·분석 기능은 현재 구현 범위에 포함되지 않으며, 추후 확장될 예정입니다.
                </p>
              </div>
            </div>
          </div>

          {/* CTA 하단 */}
          <div
            className="rounded-2xl border p-10 sm:p-14 text-center relative overflow-hidden"
            style={{
              borderColor: `${solution.accent_hex}18`,
              background: `${solution.accent_hex}05`,
            }}
          >
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div
                className="w-[600px] h-[300px] rounded-full blur-[100px] opacity-10"
                style={{ background: solution.accent_hex }}
              />
            </div>
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
                {solution.name} 도입을 검토 중이신가요?
              </h2>
              <p className="text-sm text-white/35 max-w-lg mx-auto mb-8">
                바이칼시스템즈가 현장 상황에 맞는 도입 계획 수립부터 운영 지원까지 안내드립니다.
                먼저 상담 문의 또는 데모 신청을 해주세요.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to={solution.cta.demo}
                  className="group w-full sm:w-auto flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-black transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                  style={{ background: solution.accent_hex }}
                >
                  무료 데모 신청
                  <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                </Link>
                <Link
                  to={solution.cta.inquiry}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-white/10 px-8 py-3.5 text-sm font-semibold text-white/50 transition-all duration-300 hover:border-white/25 hover:text-white"
                >
                  도입 상담 문의
                </Link>
                <Link
                  to={solution.cta.brochure}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-white/10 px-8 py-3.5 text-sm font-semibold text-white/50 transition-all duration-300 hover:border-white/25 hover:text-white"
                >
                  소개 자료 요청
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
