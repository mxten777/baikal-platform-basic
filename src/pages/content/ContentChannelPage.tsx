import { useParams } from 'react-router-dom'
import SEOHead from '@/components/seo/SEOHead'
import { useContents } from '@/features/contents/useContents'
import ContentCard from '@/components/content/ContentCard'
import type { ContentType } from '@/types/models'

const CHANNEL_MAP: Record<string, ContentType> = {
  blog: 'article',
  rss: 'rss',
  x: 'x_post',
  instagram: 'instagram',
  youtube: 'youtube',
}

export default function ContentChannelPage() {
  const { channel = 'all' } = useParams<{ channel: string }>()
  const contentType = CHANNEL_MAP[channel] as ContentType | undefined
  const { data, isLoading } = useContents(contentType ? { content_type: contentType } : {})
  return (
    <>
      <SEOHead title={`${channel.toUpperCase()} 콘텐츠`} />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8 capitalize">{channel} 콘텐츠</h1>
        {isLoading ? <div className="text-gray-400">로딩 중...</div> : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data?.data.map(c => <ContentCard key={c.id} content={c} />)}
          </div>
        )}
      </div>
    </>
  )
}
