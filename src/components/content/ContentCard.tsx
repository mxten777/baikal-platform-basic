import { Link } from 'react-router-dom'
import type { Content } from '@/types/models'
import { CONTENT_TYPES_KO } from '@/lib/constants'
import { formatDateShort } from '@/utils/date'
import { cn } from '@/utils/cn'

interface ContentCardProps {
  content: Content
  variant?: 'default' | 'compact'
  className?: string
}

const CHANNEL_DOT: Record<string, string> = {
  youtube: 'bg-red-500',
  x_post: 'bg-white/40',
  instagram: 'bg-pink-500',
  rss: 'bg-orange-400',
  article: 'bg-blue-400',
  research: 'bg-purple-400',
  experiment: 'bg-teal-400',
  note: 'bg-green-400',
}

const LAB_PATH: Partial<Record<string, string>> = {
  article: 'articles',
  note: 'notes',
  experiment: 'experiments',
  research: 'research',
}

export default function ContentCard({ content, variant = 'default', className }: ContentCardProps) {
  const labPath = LAB_PATH[content.content_type]
  const href = labPath
    ? `/lab/${labPath}/${content.slug}`
    : `/content/${content.slug}`

  const isExternal = ['rss', 'x_post', 'instagram', 'youtube', 'external_link'].includes(content.content_type)
  const dot = CHANNEL_DOT[content.content_type] ?? 'bg-white/20'
  const linkProps = isExternal
    ? { href: content.source_url ?? href, target: '_blank', rel: 'noopener noreferrer' }
    : { href }

  if (variant === 'compact') {
    return (
      <div className={cn('flex gap-3 py-3 border-b border-white/[0.06] last:border-0', className)}>
        {content.thumbnail_url && (
          <img
            src={content.thumbnail_url}
            alt={content.title}
            className="h-14 w-20 flex-shrink-0 rounded-lg object-cover opacity-70"
            loading="lazy"
          />
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', dot)} />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
              {CONTENT_TYPES_KO[content.content_type]}
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-white/70 line-clamp-2 leading-snug">
            <a {...linkProps}>{content.title}</a>
          </p>
          {content.published_at && (
            <p className="mt-0.5 text-xs text-white/20">{formatDateShort(content.published_at)}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('glass-card group overflow-hidden rounded-2xl', className)}>
      {/* Thumbnail */}
      <div className="aspect-video overflow-hidden bg-white/[0.03]">
        {content.thumbnail_url ? (
          <img
            src={content.thumbnail_url}
            alt={content.title}
            className="h-full w-full object-cover opacity-80 transition-all duration-500 group-hover:opacity-95 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#080808] to-[#0d1a2e]">
            {/* 움직이는 배경 글로우 */}
            <div className="absolute top-1/4 right-1/4 w-28 h-28 rounded-full bg-blue-500/12 blur-3xl animate-float" style={{animationDelay: '0.5s'}} />
            <div className="absolute bottom-1/3 left-1/3 w-24 h-24 rounded-full bg-purple-500/8 blur-2xl animate-pulse-glow" />
            {/* 그리드 패턴 */}
            <div className="absolute inset-0 grid-bg opacity-25" />
            {/* 채널 타입별 아이콘 표시 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={cn('h-2 w-2 rounded-full', dot, 'shadow-lg')} style={{boxShadow: `0 0 20px currentColor`}} />
            </div>
          </div>
        )}
      </div>

      <div className="p-7">
        {/* Channel badge */}
        <div className="flex items-center gap-2">
          <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', dot)} />
          <span className="text-xs font-semibold uppercase tracking-widest text-white/30">
            {CONTENT_TYPES_KO[content.content_type]}
          </span>
        </div>

        <h3 className="mt-4 text-xl font-bold leading-snug text-white/80 line-clamp-2 transition-colors group-hover:text-white">
          {isExternal ? (
            <a href={content.source_url ?? '#'} target="_blank" rel="noopener noreferrer">
              {content.title}
            </a>
          ) : (
            <Link to={href}>{content.title}</Link>
          )}
        </h3>

        {content.summary && (
          <p className="mt-3 text-sm leading-relaxed text-white/40 line-clamp-2">
            {content.summary}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between">
          {content.published_at && (
            <span className="text-xs text-white/25">{formatDateShort(content.published_at)}</span>
          )}
          {isExternal && content.source_url && (
            <span className="truncate max-w-[140px] text-[11px] text-white/15">
              {(() => { try { return new URL(content.source_url).hostname } catch { return '' } })()}
            </span>
          )}
          {!isExternal && (
            <span className="text-xs text-white/15 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-blue-400/50">
              →
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
