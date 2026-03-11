import { useParams } from 'react-router-dom'
import SEOHead from '@/components/seo/SEOHead'
export default function ArchiveYearPage() {
  const { year } = useParams<{ year: string }>()
  return (
    <>
      <SEOHead title={`${year}년 아카이브`} canonical={`/archive/year/${year}`} />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-bold text-white">{year}년 아카이브</h1>
        <p className="mt-4 text-white/40">연도별 콘텐츠 아카이브 — Phase 5에서 구현</p>
      </div>
    </>
  )
}
