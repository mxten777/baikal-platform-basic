import { Link } from 'react-router-dom'
import type { FeaturedSolution } from '@/lib/solutions'

interface Props {
  solution: FeaturedSolution
}

export default function FeaturedSolutionCard({ solution }: Props) {
  return (
    <section className="relative py-20 sm:py-28 bg-[#0a1628]">
      <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="reveal mb-10 sm:mb-14">
          <span className="text-xs font-semibold tracking-[0.2em] text-blue-400 uppercase">Partner Solution</span>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">

          <div className="reveal-left">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-400 mb-3">
              {solution.category} · 파트너 솔루션
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-[-0.02em] leading-tight text-white">
              {solution.name}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-200 leading-relaxed max-w-lg break-keep">
              {solution.tagline}
            </p>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-lg break-keep">
              {solution.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={solution.cta.demo}
                className="rounded-md bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-400"
              >
                데모 신청
              </Link>
              <Link
                to={solution.cta.inquiry}
                className="rounded-md border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/5"
              >
                도입 상담
              </Link>
              <Link
                to={solution.cta.brochure}
                className="rounded-md border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/5"
              >
                자료 요청
              </Link>
            </div>

            <p className="mt-6 text-xs text-slate-500 leading-relaxed max-w-md break-keep">
              ※ {solution.partner_note}
            </p>

            <Link
              to={`/solutions/${solution.slug}`}
              className="mt-5 inline-block text-sm text-slate-200 hover:text-white transition-colors"
            >
              솔루션 상세 보기 →
            </Link>
          </div>

          {/* 주요 기능: 카드 대신 구분선 목록 */}
          <ul className="reveal border-t border-white/20">
            {solution.features.map((f, i) => (
              <li key={f.title} className="flex gap-5 border-b border-white/10 py-5">
                <span className="font-mono text-xs text-blue-400 tabular-nums pt-1">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-white">{f.title}</h3>
                  <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-400 break-keep">{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
