import SEOHead from '@/components/seo/SEOHead'
import { Link } from 'react-router-dom'
import { Download } from 'lucide-react'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const PDF_URL = `${SUPABASE_URL}/storage/v1/object/public/public-media/%ED%8F%AC%ED%8A%B8%ED%8F%B4%EB%A6%AC%EC%98%A4_%ED%95%B5%EC%8B%AC%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8_35%EC%A2%85_2%EC%9B%94%EC%B6%94%EA%B0%80%EB%B6%84.pdf`

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

      {/* 명함 & 포트폴리오 */}
      <section className="relative bg-[#080808] py-24">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="h-px w-8 bg-blue-500/60" />
            <span className="section-label">CONTACT CARD</span>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-start">
            {/* 명함 이미지 */}
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
                <img src="/images/baikal_card2.jpg" alt="바이칼시스템즈 명함 앞면" className="w-full object-cover" />
              </div>
              <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
                <img src="/images/baikal_card3.jpg" alt="바이칼시스템즈 명함 뒷면" className="w-full object-cover" />
              </div>
            </div>
            {/* 포트폴리오 다운로드 */}
            <div className="flex flex-col gap-6">
              <div className="glass-card rounded-2xl p-8">
                <h3 className="text-xl font-bold text-white mb-2">회사 포트폴리오</h3>
                <p className="text-sm text-white/35 leading-relaxed mb-6">
                  바이칼시스템즈의 핵심 프로젝트 35종을 담은 포트폴리오입니다.<br />
                  AI MVP 개발 사례와 기술 역량을 확인하실 수 있습니다.
                </p>
                <a
                  href={PDF_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-2.5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  <Download size={16} />
                  포트폴리오 PDF 다운로드
                </a>
              </div>
              <div className="glass-card rounded-2xl p-8">
                <h3 className="text-lg font-bold text-white mb-4">연락처</h3>
                <dl className="space-y-3 text-sm">
                  {[
                    { label: '이메일', value: 'jngdy@baikalsys.kr' },
                    { label: '전화', value: '010-2380-4691' },
                    { label: '웹사이트', value: 'www.baikalsys.kr' },
                    { label: '주소', value: '서울특별시 강남구 영산로 138' },
                  ].map(item => (
                    <div key={item.label} className="flex gap-4">
                      <dt className="w-16 flex-shrink-0 text-white/25 font-semibold">{item.label}</dt>
                      <dd className="text-white/60">{item.value}</dd>
                    </div>
                  ))}
                </dl>
                <Link to="/contact" className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/50 hover:border-white/20 hover:text-white transition-all">
                  프로젝트 문의하기 →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
