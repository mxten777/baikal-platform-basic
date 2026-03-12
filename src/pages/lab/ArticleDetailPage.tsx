import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import SEOHead from '@/components/seo/SEOHead'
import { useContent } from '@/features/contents/useContents'
import { formatDate } from '@/utils/date'
import { SITE_URL } from '@/lib/constants'

export default function ArticleDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { data: content, isLoading, error } = useContent(slug)

  if (isLoading) {
    return <div className="mx-auto max-w-3xl px-6 py-24"><div className="skeleton h-8 w-1/2 rounded-xl" /></div>
  }
  if (error || !content) {
    return (
      <div className="py-40 text-center">
        <p className="text-white/30">콘텐츠를 찾을 수 없습니다.</p>
        <Link to="/lab/articles" className="mt-4 inline-block text-blue-400/60 hover:text-blue-400">← 아티클 목록</Link>
      </div>
    )
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: content.title,
    description: content.summary,
    datePublished: content.published_at,
    author: { '@type': 'Organization', name: '바이칼시스템즈', url: SITE_URL },
    publisher: { '@type': 'Organization', name: '바이칼시스템즈', logo: `${SITE_URL}/favicon.ico` },
    ...(content.canonical_url ? { mainEntityOfPage: content.canonical_url } : {}),
  }

  const BREADCRUMB: Partial<Record<string, { path: string; label: string }>> = {
    article:    { path: '/lab/articles',    label: '기술 아티클' },
    note:       { path: '/lab/notes',       label: '개발 노트'   },
    experiment: { path: '/lab/experiments', label: '실험 기록'   },
    research:   { path: '/lab/research',    label: '연구 기록'   },
  }
  const breadcrumb = BREADCRUMB[content.content_type] ?? BREADCRUMB['article']!

  return (
    <>
      <SEOHead
        title={content.meta_title ?? content.title}
        description={content.meta_desc ?? content.summary ?? undefined}
        ogImage={content.og_image_url ?? content.thumbnail_url ?? undefined}
        canonical={`${breadcrumb.path}/${content.slug}`}
        structuredData={articleSchema}
        type="article"
      />

      <div className="mx-auto max-w-3xl px-6 py-12 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-10 flex items-center gap-2 text-xs text-white/25">
          <Link to="/" className="hover:text-white/60 transition-colors">홈</Link>
          <span>/</span>
          <Link to={breadcrumb.path} className="hover:text-white/60 transition-colors">{breadcrumb.label}</Link>
          <span>/</span>
          <span className="text-white/50 truncate max-w-[200px]">{content.title}</span>
        </nav>

        <header className="mb-10">
          <h1 className="text-[clamp(1.8rem,3.5vw,3rem)] font-black tracking-[-0.02em] leading-[1.2] text-white">
            {content.title}
          </h1>
          {content.summary && (
            <p className="mt-4 text-lg text-white/40 leading-relaxed">{content.summary}</p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-white/[0.06] pt-6">
            {content.published_at && (
              <span className="text-xs text-white/25">{formatDate(content.published_at)}</span>
            )}
            {content.tags && content.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {content.tags.map((t) => (
                  <span key={t.slug ?? t.id} className="rounded-full border border-white/[0.07] bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-white/35">
                    {t.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        {content.thumbnail_url && (
          <div className="mb-10 overflow-hidden rounded-2xl">
            <img src={content.thumbnail_url} alt={content.title} className="w-full object-cover opacity-80" />
          </div>
        )}

        {content.body && (
          <div className="prose-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content.body}</ReactMarkdown>
          </div>
        )}

        {content.canonical_url && (
          <div className="mt-12 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-2">원문 보기</p>
            <a href={content.canonical_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400/70 hover:text-blue-400 break-all">
              {content.canonical_url}
            </a>
          </div>
        )}
      </div>
    </>
  )
}
