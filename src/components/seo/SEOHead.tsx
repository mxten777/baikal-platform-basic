import { Helmet } from 'react-helmet-async'
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE } from '@/lib/constants'

interface SEOHeadProps {
  title?: string
  description?: string
  ogImage?: string
  canonical?: string
  noIndex?: boolean
  structuredData?: Record<string, unknown>
  type?: 'website' | 'article'
}

export default function SEOHead({
  title,
  description,
  ogImage = DEFAULT_OG_IMAGE,
  canonical,
  noIndex = false,
  structuredData,
  type = 'website',
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - AI 개발 플랫폼`
  const desc = description ?? 'AI 소프트웨어 개발 회사 바이칼시스템즈의 AI 개발 콘텐츠 플랫폼'

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      {canonical && <link rel="canonical" href={`${SITE_URL}${canonical}`} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  )
}
