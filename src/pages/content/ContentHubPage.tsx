import { useState } from 'react'
import SEOHead from '@/components/seo/SEOHead'
import ContentCard from '@/components/content/ContentCard'
import { useContents } from '@/features/contents/useContents'
import type { ContentType } from '@/types/models'

const CHANNEL_TABS: { label: string; type?: ContentType | ContentType[] }[] = [
  { label: '전체' },
  { label: '아티클', type: 'article' },
  { label: 'YouTube', type: 'youtube' },
  { label: 'RSS', type: 'rss' },
  { label: 'X (Twitter)', type: 'x_post' },
  { label: 'Instagram', type: 'instagram' },
  { label: '연구/실험', type: ['experiment', 'research'] },
]

export default function ContentHubPage() {
  const [activeType, setActiveType] = useState<ContentType | ContentType[] | undefined>()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const { data, isLoading } = useContents({
    content_type: activeType,
    page,
    search: search || undefined,
  })

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  return (
    <>
      <SEOHead
        title="콘텐츠 허브"
        description="블로그, YouTube, SNS 등 모든 채널의 AI 콘텐츠를 한 곳에서"
        canonical="/content"
      />

      {/* Page Hero */}
      <section className="relative bg-[#080808] py-20 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-blue-500/60" />
                <span className="section-label">CONTENT HUB</span>
              </div>
              <h1 className="text-[clamp(2.5rem,6vw,6rem)] font-black tracking-[-0.02em] leading-[1.1] text-white">
                콘텐츠 <span className="gradient-text">허브</span>
              </h1>
              <p className="mt-4 text-base text-white/35 max-w-lg">
                블로그, YouTube, SNS — 모든 채널의 AI 개발 콘텐츠
              </p>
            </div>
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-sm">
              <input
                type="search"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="콘텐츠 검색..."
                className="flex-1 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm text-white placeholder-white/20 focus:border-blue-500/40 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white/50 hover:text-white transition-colors"
              >
                검색
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="relative bg-[#080808] pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Channel Tabs */}
          <div className="pt-10 pb-8 flex flex-wrap gap-2">
            {CHANNEL_TABS.map(tab => {
              const isActive = JSON.stringify(activeType) === JSON.stringify(tab.type)
              return (
                <button
                  key={tab.label}
                  onClick={() => { setActiveType(tab.type); setPage(1) }}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-black'
                      : 'border border-white/10 text-white/40 hover:border-white/20 hover:text-white/70'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Content Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="skeleton h-60 rounded-2xl" />
              ))}
            </div>
          ) : data && data.data.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {data.data.map(content => (
                  <ContentCard key={content.id} content={content} />
                ))}
              </div>

              {/* Pagination */}
              {data.total_pages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-3">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="rounded-full border border-white/10 px-5 py-2 text-sm text-white/40 disabled:opacity-30 hover:border-white/20 hover:text-white/70 transition-all"
                  >
                    ← 이전
                  </button>
                  <span className="px-4 text-sm text-white/25">
                    {page} / {data.total_pages}
                  </span>
                  <button
                    disabled={page === data.total_pages}
                    onClick={() => setPage(p => p + 1)}
                    className="rounded-full border border-white/10 px-5 py-2 text-sm text-white/40 disabled:opacity-30 hover:border-white/20 hover:text-white/70 transition-all"
                  >
                    다음 →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-32 text-center">
              <span className="text-4xl mb-4">📝</span>
              <p className="text-white/30">콘텐츠가 없습니다.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
