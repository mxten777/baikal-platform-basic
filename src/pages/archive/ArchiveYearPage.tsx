import { useParams } from 'react-router-dom'
import SEOHead from '@/components/seo/SEOHead'
export default function ArchiveYearPage() {
  const { year } = useParams<{ year: string }>()
  return (
    <>
      <SEOHead title={`${year}년 아카이브`} canonical={`/archive/year/${year}`} />
      <div className="mx-auto max-w-4xl px-6 py-24">
        <p className="text-xs tracking-widest text-white/25 uppercase mb-4">ARCHIVE</p>
        <h1 className="text-4xl font-black text-white mb-4">{year}년</h1>
        <p className="text-white/30">연도별 콘텐츠 아카이브 기능은 준비 중입니다.</p>
      </div>
    </>
  )
}
