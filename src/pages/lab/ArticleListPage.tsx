import SEOHead from '@/components/seo/SEOHead'
import { useContents } from '@/features/contents/useContents'
import ContentCard from '@/components/content/ContentCard'

export default function ArticleListPage() {
  const { data, isLoading } = useContents({ content_type: 'article' })
  return (
    <>
      <SEOHead title="기술 아티클" description="바이칼시스템즈 AI 기술 아티클" canonical="/lab/articles" />

      {/* Hero */}
      <section className="relative bg-[#080808] pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-blue-500/60" />
            <span className="section-label">BAIKAL LAB</span>
          </div>
          <h1 className="text-[clamp(2.5rem,6vw,6rem)] font-black tracking-[-0.02em] leading-[1.1] text-white">
            기술 <span className="gradient-text">아티클</span>
          </h1>
          <p className="mt-6 text-lg text-white/40 max-w-lg">
            AI 개발 과정에서 얻은 인사이트와 기술 노하우
          </p>
        </div>
      </section>

      <section className="bg-[#080808] pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-10">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-60 rounded-2xl" />
              ))}
            </div>
          ) : (data?.data.length ?? 0) > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data?.data.map(c => <ContentCard key={c.id} content={c} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-32 text-center">
              <span className="text-4xl mb-4">✍️</span>
              <p className="text-white/30">아티클을 준비 중입니다</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
