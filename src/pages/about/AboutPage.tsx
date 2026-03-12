import SEOHead from '@/components/seo/SEOHead'
import { Link } from 'react-router-dom'

const VALUES = [
  { num: '01', title: '만들며 배운다', desc: 'AI MVP를 직접 개발하면서 얻는 실전 노하우를 축적합니다.' },
  { num: '02', title: '기록하며 공유한다', desc: '기획부터 배포까지 모든 과정을 투명하게 문서화하고 커민유니티와 나누는 지식 플랫폼입니다.' },
  { num: '03', title: '축적하며 성장한다', desc: '콘텐츠와 데이터가 쌓일수록 강해지는 플랫폼을 지향합니다. AI SEO로 유기적 성장을 만듭니다.' },
]

const TEAM = [
  { role: 'CEO / AI Engineer', name: '바이칼시스템즈', desc: 'AI MVP 개발 및 플랫폼 아키텍쳐 전담' },
]

export default function AboutPage() {
  return (
    <>
      <SEOHead title="회사 소개" description="바이칼시스템즈 AI 소프트웨어 개발 회사" canonical="/about" />

      {/* Hero */}
      <section className="relative bg-[#080808] py-28 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="absolute right-0 top-0 w-[600px] h-[400px] bg-hero-glow pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-blue-500/60" />
            <span className="section-label">ABOUT BAIKAL</span>
          </div>
          <h1 className="text-[clamp(2.5rem,6vw,6.5rem)] font-black tracking-[-0.02em] leading-[1.1] text-white">
            AI를 만들고,<br />
            <span className="gradient-text">기록하고, 공유합니다.</span>
          </h1>
          <p className="mt-8 text-lg text-white/40 max-w-xl leading-relaxed">
            바이칼시스템즈는 AI 소프트웨어를 개발하는 회사입니다.
            단순한 용역사가 아니라, 개발의 모든 과정을
            투명하게 공유하는 지식 플랫폼을 지향합니다.
          </p>
          <div className="mt-10 flex gap-4">
            <Link to="/projects" className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-blue-50 transition-all">
              프로젝트 보기 <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white/50 hover:border-white/20 hover:text-white transition-all">
              문의하기
            </Link>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="relative bg-[#080808] py-24">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="h-px w-8 bg-blue-500/60" />
            <span className="section-label">OUR VALUES</span>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {VALUES.map(v => (
              <div key={v.num} className="glass-card rounded-2xl p-8">
                <span className="text-5xl font-black text-white/[0.06]">{v.num}</span>
                <h3 className="mt-4 text-lg font-bold text-white">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/35">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Info */}
      <section className="relative bg-[#080808] py-24">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-blue-500/60" />
                <span className="section-label">TEAM</span>
              </div>
              <h2 className="text-4xl font-black tracking-tight text-white">작지만 강한<br /><span className="text-white/30">전문가 팀</span></h2>
              <p className="mt-6 text-base text-white/35 leading-relaxed">
                소수 인원의 팀으로 빠르게 실험하고, 배우고, 만들고 공유합니다.
                AI를 직접 만들면서 얻는 실전 경험이 저희의 자산입니다.
              </p>
            </div>
            <div className="space-y-4">
              {TEAM.map(m => (
                <div key={m.role} className="glass-card rounded-2xl p-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-black text-lg">B</span>
                  </div>
                  <div>
                    <p className="font-bold text-white">{m.name}</p>
                    <p className="text-xs text-blue-400/60 font-semibold tracking-widest uppercase">{m.role}</p>
                    <p className="mt-1 text-xs text-white/30">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
