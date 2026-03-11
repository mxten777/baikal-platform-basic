import { useParams } from 'react-router-dom'
import SEOHead from '@/components/seo/SEOHead'
export default function TopicDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  return (
    <>
      <SEOHead title={`${slug} 토픽`} canonical={`/topics/${slug}`} />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{slug}</h1>
        <p className="mt-4 text-gray-500">토픽 상세 및 관련 콘텐츠 — Phase 4에서 구현</p>
      </div>
    </>
  )
}
