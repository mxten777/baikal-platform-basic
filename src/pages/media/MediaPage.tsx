import SEOHead from '@/components/seo/SEOHead'

const MEDIA_TYPES = [
  { icon: '🎥', title: 'YouTube', desc: 'AI 개발 과정을 담은 영상 콘텐츠' },
  { icon: '🎤', title: '포드캐스트', desc: '(예정) AI 개발 사례 토크' },
  { icon: '📸', title: '이미지 자산', desc: '프로젝트 모험샷, UI 스크린샷' },
  { icon: '📊', title: '발표자료', desc: 'AI 개발 사례 프레젠테이션 슬라이드' },
]

export default function MediaPage() {
  return (
    <>
      <SEOHead title="미디어" description="바이칼시스템즈 미디어 허브" canonical="/media" />

      {/* Hero */}
      <section className="relative bg-[#080808] py-20 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-blue-500/60" />
            <span className="section-label">MEDIA HUB</span>
          </div>
          <h1 className="text-[clamp(2.5rem,6vw,6rem)] font-black tracking-[-0.02em] leading-[1.1] text-white">
            미디어 <span className="gradient-text">허브</span>
          </h1>
          <p className="mt-6 text-lg text-white/40">영상, 이미지, 발표자료 등 미디어 자산</p>
        </div>
      </section>

      <section className="bg-[#080808] pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-10">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {MEDIA_TYPES.map(m => (
              <div key={m.title} className="glass-card rounded-2xl p-6">
                <span className="text-3xl">{m.icon}</span>
                <h3 className="mt-4 font-bold text-white/80">{m.title}</h3>
                <p className="mt-1.5 text-sm text-white/30 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-24 text-center">
            <span className="text-5xl mb-4">🎬</span>
            <p className="text-white/30">미디어 콘텐츠를 준비 중입니다</p>
          </div>
        </div>
      </section>
    </>
  )
}
