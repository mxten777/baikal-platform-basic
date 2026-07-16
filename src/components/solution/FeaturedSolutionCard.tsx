import { Link } from 'react-router-dom'
import type { FeaturedSolution } from '@/lib/solutions'

interface Props {
  solution: FeaturedSolution
}

export default function FeaturedSolutionCard({ solution }: Props) {
  return (
    <section
      className="relative py-24 sm:py-32 bg-[#080808]"
      style={{ overflow: 'clip' }}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* 배경 글로우 */}
      <div
        className="absolute top-1/3 right-0 w-[600px] h-[500px] rounded-full blur-[130px] pointer-events-none opacity-15"
        style={{ background: solution.accent_hex }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <div className="reveal flex items-center gap-3 mb-12 sm:mb-16">
          <div className="h-px w-8" style={{ background: solution.accent_hex }} />
          <span className="section-label">{solution.badge_label}</span>
        </div>

        {/* 메인 레이아웃: 좌·우 2컬럼 */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">

          {/* ── LEFT: 텍스트 + CTA ── */}
          <div className="reveal-left">
            {/* 파트너 배지 */}
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 mb-5"
              style={{
                borderColor: `${solution.accent_hex}30`,
                background: `${solution.accent_hex}08`,
              }}
            >
              <span className="text-base">{solution.logo_emoji}</span>
              <span className="text-[10px] font-semibold tracking-[0.18em] uppercase"
                style={{ color: solution.accent_hex }}>
                파트너 솔루션
              </span>
            </div>

            {/* 이름 + 카테고리 */}
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/25 mb-2">
              {solution.category}
            </p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-[-0.02em] leading-tight text-white">
              {solution.name}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-white/40 leading-relaxed max-w-lg">
              {solution.tagline}
            </p>
            <p className="mt-4 text-sm text-white/30 leading-relaxed max-w-lg">
              {solution.description}
            </p>

            {/* CTA 버튼 */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={solution.cta.demo}
                className="group flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-black transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                style={{ background: solution.accent_hex }}
              >
                데모 신청
                <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
              </Link>
              <Link
                to={solution.cta.inquiry}
                className="flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white/60 transition-all duration-300 hover:border-white/25 hover:text-white"
              >
                도입 상담
              </Link>
              <Link
                to={solution.cta.brochure}
                className="flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white/60 transition-all duration-300 hover:border-white/25 hover:text-white"
              >
                자료 요청
              </Link>
            </div>

            {/* 파트너 고지 */}
            <p className="mt-6 text-[11px] text-white/20 leading-relaxed max-w-sm">
              ※ {solution.partner_note}
            </p>

            {/* 상세 페이지 링크 */}
            <Link
              to={`/solutions/${solution.slug}`}
              className="mt-5 inline-flex items-center gap-2 text-sm group"
              style={{ color: `${solution.accent_hex}cc` }}
            >
              솔루션 상세 보기
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>

          {/* ── RIGHT: 기능 카드 그리드 ── */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {solution.features.map((f, i) => (
              <div
                key={f.title}
                className={`reveal-scale glass-card rounded-2xl p-5 sm:p-6 group cursor-default ${
                  i === 0 ? 'animate-delay-100' :
                  i === 1 ? 'animate-delay-200' :
                  i === 2 ? 'animate-delay-300' : 'animate-delay-400'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xl sm:text-2xl group-hover:animate-float inline-block transition-transform duration-300">
                    {f.icon}
                  </span>
                  <span className="font-mono text-[10px] text-white/12 tabular-nums leading-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white">{f.title}</h3>
                <p className="mt-1.5 text-[11px] sm:text-xs leading-relaxed text-white/35">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 효과 지표 */}
        <div className="reveal mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {solution.benefits.map(b => (
            <div key={b.label} className="glass-card rounded-2xl overflow-hidden">
              <div className="h-[2px] w-full" style={{ background: b.accent }} />
              <div className="p-5 sm:p-6">
                <p className="text-2xl sm:text-3xl font-black" style={{ color: b.accent }}>{b.value}</p>
                <p className="mt-2 text-[10px] sm:text-xs tracking-widest text-white/25 uppercase">{b.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
