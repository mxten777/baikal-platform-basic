import { useParams } from 'react-router-dom'
import SEOHead from '@/components/seo/SEOHead'
export default function TopicDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  return (
    <>
      <SEOHead title={`${slug} 토픽`} canonical={`/topics/${slug}`} />
      <div className="mx-auto max-w-4xl px-6 py-24">
        <p className="text-xs tracking-widest text-white/25 uppercase mb-4">TOPIC</p>
        <h1 className="text-4xl font-black text-white mb-4">{slug}</h1>
        <p className="text-white/30">토픽별 콘텐츠 모아보기 기능은 준비 중입니다.</p>
      </div>
    </>
  )
}
