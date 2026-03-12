import SEOHead from '@/components/seo/SEOHead'
import { Link } from 'react-router-dom'

const SERVICES = [
  {
    icon: '⚡',
    title: 'AI MVP 개발',
    desc: '아이디어를 2~4주 만에 작동하는 AI 제품으로. 빠른 검증과 시장 피드백에 집중합니다.',
    tags: ['LLM 응용', 'AI 에이전트', 'RAG 시스템'],
  },
  {
    icon: '🤖',
    title: 'AI 에이전트 구축',
    desc: '복잡한 업무 흐름을 자동화하는 AI 에이전트 설계 및 구현.',
    tags: ['LangChain', 'AutoGen', '워크플로우 자동화'],
  },
  {
    icon: '🔍',
    title: 'RAG 시스템',
    desc: '기업 내부 지식기반을 AI와 연결하는 검색 증강 생성 시스템.',
    tags: ['Vector DB', '시맨틱 검색', 'LLM 통합'],
  },
  {
    icon: '📊',
    title: 'AI 데이터 파이프라인',
    desc: '데이터 수집부터 AI 모델 학습에 이르는 엔드투엔드 파이프라인.',
    tags: ['Python', 'FastAPI', 'Supabase'],
  },
  {
    icon: '🌐',
    title: 'AI SaaS 플랫폼',
    desc: '스케일링 가능한 AI 서비스 플랫폼 소프트웨어 개발 및 아키텍처 설계.',
    tags: ['React', 'TypeScript', 'Supabase'],
  },
  {
    icon: '📝',
    title: '테크 콘텐츠 & SEO',
    desc: 'AI 제품의 테크 로드맵과 개발 로그를 콘텐츠로 전환. 기술 SEO 전략.',
    tags: ['기술 아티클', '개발 로그', 'SEO'],
  },
]

export default function ServicesPage() {
  return (
    <>
      <SEOHead title="서비스" description="바이칼시스템즈 AI 개발 서비스" canonical="/services" />

      {/* Hero */}
      <section className="relative bg-[#080808] py-24 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        
        {/* 프리미엄 배경 글로우 */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px] animate-float" />
          <div className="absolute bottom-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-purple-500/8 blur-[100px] animate-pulse-glow" style={{animationDelay: '1.5s'}} />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-blue-500/60" />
            <span className="section-label">SERVICES</span>
          </div>
          <h1 className="text-[clamp(2.5rem,6vw,6rem)] font-black tracking-[-0.02em] leading-[1.1] text-white">
            AI 서비스
          </h1>
          <p className="mt-6 text-lg text-white/40 max-w-lg">
            MVP부터 프로덕션까지, AI 소프트웨어 개발의 모든 단계를 커버합니다.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="bg-[#080808] pb-24">
        <div className="absolute top-0 left-0 right-0 hidden" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-10">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s, idx) => (
              <div key={s.title} className="glass-card rounded-2xl p-7 group relative overflow-hidden hover:border-blue-500/20 transition-all duration-500">
                {/* 호버 시 배경 글로우 */}
                <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                  idx % 3 === 0 ? 'bg-blue-500/15' : idx % 3 === 1 ? 'bg-purple-500/15' : 'bg-cyan-500/15'
                }`} />
                
                <div className="relative">
                  <span className="text-5xl block transition-transform group-hover:scale-110 duration-300">{s.icon}</span>
                  <h3 className={`mt-4 text-lg font-bold text-white transition-colors duration-300 ${
                    idx % 3 === 0 ? 'group-hover:text-blue-400' : idx % 3 === 1 ? 'group-hover:text-purple-400' : 'group-hover:text-cyan-400'
                  }`}>{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/35 group-hover:text-white/45 transition-colors">{s.desc}</p>
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {s.tags.map(t => (
                      <span key={t} className="rounded-full border border-white/[0.07] bg-white/[0.0 relative overflow-hidden group">
            {/* 배경 애니메이션 */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-[80px] animate-pulse-glow" />
              <div className="absolute bottom-0 right-0 w-[250px] h-[250px] rounded-full bg-purple-500/8 blur-[60px] animate-float" style={{animationDelay: '1s'}} />
            </div>
            
            <div className="relative">
              <h2 className="text-3xl font-black text-white">어떤 도움이 필요하세요?</h2>
              <p className="mt-3 text-white/35">구체적인 내용을 공유해주시면 무료로 상담드립니다.</p>
              <Link
                to="/contact"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-500/20"
              >
                무료 상담 신청 →
              </Link>
            </div*/}
          <div className="mt-16 rounded-2xl border border-blue-500/15 bg-blue-500/5 p-10 text-center">
            <h2 className="text-3xl font-black text-white">어떤 도움이 필요하세요?</h2>
            <p className="mt-3 text-white/35">구체적인 내용을 공유해주시면 무료로 상담드립니다.</p>
            <Link
              to="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black hover:bg-blue-50 transition-all"
            >
              무료 상담 신청 →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
