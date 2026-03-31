import SEOHead from '@/components/seo/SEOHead'

const CONTACT_ITEMS = [
  { icon: '📧', label: '업무 이메일', value: 'jngdy@baikalsys.kr', href: 'mailto:jngdy@baikalsys.kr' },
  { icon: '📩', label: '네이버 메일', value: 'jngdy@naver.com', href: 'mailto:jngdy@naver.com' },
  { icon: '🌐', label: '웹사이트', value: 'www.baikalsys.kr', href: 'https://www.baikalsys.kr' },
  { icon: '🐦', label: 'X (Twitter)', value: '@baikalsys', href: 'https://x.com/baikalsys' },
]

export default function ContactPage() {
  return (
    <>
      <SEOHead title="문의" description="바이칼시스템즈에 프로젝트 문의하기" canonical="/contact" />

      {/* Hero */}
      <section className="relative bg-[#080808] py-24 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute inset-0 bg-hero-glow" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-8 bg-blue-500/60" />
            <span className="section-label">CONTACT</span>
            <div className="h-px w-8 bg-blue-500/60" />
          </div>
          <h1 className="text-[clamp(2.5rem,6vw,6rem)] font-black tracking-[-0.02em] leading-[1.1] text-white">
            프로젝트를<br />
            <span className="gradient-text">함께 만들어요</span>
          </h1>
          <p className="mt-6 text-lg text-white/40 leading-relaxed">
            AI 아이디어가 있으시면 먼저 연락해주세요.<br />
            MVP 검토부터 프로덕션 론치까지 함께합니다.
          </p>
        </div>
      </section>

      {/* Contact Details */}
      <section className="bg-[#080808] pb-24">
        <div className="absolute top-0 left-0 right-0 hidden" />
        <div className="mx-auto max-w-3xl px-6 lg:px-8 pt-12">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {CONTACT_ITEMS.map(c => (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="glass-card group rounded-2xl p-6 text-center block"
              >
                <span className="text-3xl">{c.icon}</span>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-white/25">{c.label}</p>
                <p className="mt-1 text-sm text-white/60 group-hover:text-white transition-colors break-all">{c.value}</p>
              </a>
            ))}
          </div>

          {/* Message prompt */}
          <div className="mt-10 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8">
            <h2 className="text-xl font-bold text-white mb-2">어떤 프로젝트를 원하세요?</h2>
            <p className="text-sm text-white/30 leading-relaxed mb-6">이메일로 아래 내용을 포함해 연락주시면 빠르게 연락드립니다.</p>
            <ul className="space-y-2 text-sm text-white/30">
              <li className="flex items-start gap-2"><span className="text-blue-400/60 mt-0.5">·</span> 원하는 AI 서비스 개요 (예: 커스텀 RAG 시스템)</li>
              <li className="flex items-start gap-2"><span className="text-blue-400/60 mt-0.5">·</span> 대략적인 일정 및 예산</li>
              <li className="flex items-start gap-2"><span className="text-blue-400/60 mt-0.5">·</span> 관련 자료나 레퍼런스 링크 (선택)</li>
            </ul>
            <a
              href="mailto:jngdy@baikalsys.kr"
              className="mt-8 group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black hover:bg-blue-50 transition-all"
            >
              이메일 보내기
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
