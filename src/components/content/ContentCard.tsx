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

function getHostname(url: string): string {
  try { return new URL(url).hostname }
  catch { return '' }
}

const CHANNEL_DOT: Record<string, string> = {
  youtube: 'bg-red-500',
  x_post: 'bg-white/40',
  instagram: 'bg-pink-500',
  reels: 'bg-violet-500',
  rss: 'bg-orange-400',
  article: 'bg-blue-400',
  research: 'bg-purple-400',
  experiment: 'bg-teal-400',
  note: 'bg-green-400',
}

const PLACEHOLDER_ICON: Record<string, string> = {
  youtube:     '▶',
  x_post:      '𝕏',
  instagram:   '◈',
  reels:       '▶',
  rss:         '◉',
  article:     '✦',
  research:    '◈',
  experiment:  '⊕',
  note:        '◇',
}

const PLACEHOLDER_ACCENT: Record<string, string> = {
  youtube:    '#ef4444',
  x_post:     'rgba(255,255,255,0.25)',
  instagram:  '#ec4899',
  reels:      '#8b5cf6',
  rss:        '#fb923c',
  article:    '#60a5fa',
  research:   '#a78bfa',
  experiment: '#2dd4bf',
  note:       '#4ade80',
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

  const isReels = content.content_type === 'reels'
  const reelsInstagramUrl = isReels ? (content.source_raw?.instagram_url as string | undefined) || null : null
  const reelsYoutubeUrl = isReels ? (content.source_raw?.youtube_url as string | undefined) || null : null
  const isExternal = ['rss', 'x_post', 'instagram', 'youtube', 'external_link'].includes(content.content_type)
    && !!content.source_url
  const dot = CHANNEL_DOT[content.content_type] ?? 'bg-white/20'
  const placeholderIcon = PLACEHOLDER_ICON[content.content_type] ?? '◇'
  const placeholderAccent = PLACEHOLDER_ACCENT[content.content_type] ?? 'rgba(255,255,255,0.15)'
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
              {CONTENT_TYPES_KO[content.content_type] ?? content.content_type}
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

  if (isReels) {
    return (
      <div className={cn('glass-card group overflow-hidden rounded-2xl', className)}>
        <div className="overflow-hidden bg-black" style={{ aspectRatio: '9/16' }}>
          {content.source_url ? (
            <video
              src={content.source_url}
              controls
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <span className="text-4xl" style={{ color: '#8b5cf6', filter: 'drop-shadow(0 0 12px #8b5cf6)' }}>▶</span>
            </div>
          )}
        </div>
        <div className="px-4 pt-3 pb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500 flex-shrink-0" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Reels</span>
          </div>
          <h3 className="text-sm font-bold text-white/80 line-clamp-2 leading-snug group-hover:text-white transition-colors">
            {content.title}
          </h3>
          {content.published_at && (
            <p className="mt-1.5 text-xs text-white/25">{formatDateShort(content.published_at)}</p>
          )}
          {(reelsInstagramUrl || reelsYoutubeUrl) && (
            <div className="mt-3 flex gap-1.5 flex-wrap">
              {reelsInstagramUrl && (
                <a
                  href={reelsInstagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full bg-pink-500/10 px-2.5 py-1 text-[11px] font-semibold text-pink-400 hover:bg-pink-500/20 transition-colors"
                >
                  ◈ Instagram
                </a>
              )}
              {reelsYoutubeUrl && (
                <a
                  href={reelsYoutubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  ▶ YouTube Shorts
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('glass-card group overflow-hidden rounded-2xl', className)}>
      <div className="aspect-video overflow-hidden bg-white/[0.03]">
        {content.thumbnail_url ? (
          <img
            src={content.thumbnail_url}
            alt={content.title}
            className="h-full w-full object-cover opacity-80 transition-all duration-500 group-hover:opacity-95 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="relative h-full w-full flex flex-col items-center justify-center gap-3 bg-[#0a0a0a]">
            {/* 타입 컬러 글로우 */}
            <div
              className="absolute inset-0 opacity-10"
              style={{ background: `radial-gradient(ellipse at center, ${placeholderAccent} 0%, transparent 70%)` }}
            />
            {/* 아이콘 */}
            <span
              className="relative text-3xl select-none leading-none"
              style={{ color: placeholderAccent, filter: `drop-shadow(0 0 12px ${placeholderAccent})` }}
            >
              {placeholderIcon}
            </span>
            {/* 타입명 */}
            <span className="relative text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: placeholderAccent, opacity: 0.6 }}>
              {CONTENT_TYPES_KO[content.content_type] ?? content.content_type}
            </span>
          </div>
        )}
      </div>

      <div className="p-7">
        {/* Channel badge */}
        <div className="flex items-center gap-2">
          <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', dot)} />
          <span className="text-xs font-semibold uppercase tracking-widest text-white/30">
            {CONTENT_TYPES_KO[content.content_type] ?? content.content_type}
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
              {getHostname(content.source_url)}
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
