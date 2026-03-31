import { useState, useMemo } from 'react'
import SEOHead from '@/components/seo/SEOHead'
import ProjectCard from '@/components/project/ProjectCard'
import { useProjects } from '@/features/projects/useProjects'
import { PROJECT_CATEGORIES } from '@/lib/constants'

const PER_PAGE = 12

export default function ProjectListPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // 전체 로드 후 클라이언트 필터링 (40개 수준이면 충분)
  const { data: allProjects, isLoading } = useProjects({})

  const filtered = useMemo(() => {
    let list = allProjects ?? []
    if (selectedCategory) {
      list = list.filter(p => p.category === selectedCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      list = list.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          (p.subtitle ?? '').toLowerCase().includes(q) ||
          p.tech_stack.some(t => t.toLowerCase().includes(q))
      )
    }
    return list
  }, [allProjects, selectedCategory, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const page = Math.min(currentPage, totalPages)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  function handleCategoryChange(cat: string | undefined) {
    setSelectedCategory(cat)
    setCurrentPage(1)
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'AI 프로젝트 포트폴리오',
    description: '바이칼시스템즈가 개발한 AI MVP 프로젝트 목록',
    url: 'https://www.baikalsys.kr/projects',
  }

  return (
    <>
      <SEOHead
        title="AI 프로젝트 포트폴리오"
        description="바이칼시스템즈가 개발한 AI MVP 프로젝트 포트폴리오"
        canonical="/projects"
        structuredData={structuredData}
      />

      {/* Page Hero */}
      <section className="relative bg-[#080808] pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-blue-500/60" />
            <span className="section-label">PORTFOLIO</span>
          </div>
          <h1 className="text-[clamp(2.5rem,6vw,6rem)] font-black tracking-[-0.02em] leading-[1.1] text-white">
            AI <span className="gradient-text">프로젝트</span>
          </h1>
          <p className="mt-6 text-lg text-white/40 max-w-lg">
            바이칼시스템즈가 개발하고 운영하는 AI MVP 프로젝트 포트폴리오
          </p>
        </div>
      </section>

      <section className="relative bg-[#080808] pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          {/* Search & Filter Bar */}
          <div className="pt-10 pb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange(undefined)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                  !selectedCategory
                    ? 'bg-white text-black'
                    : 'border border-white/10 text-white/40 hover:border-white/20 hover:text-white/70'
                }`}
              >
                전체
              </button>
              {PROJECT_CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                    selectedCategory === cat.value
                      ? 'bg-white text-black'
                      : 'border border-white/10 text-white/40 hover:border-white/20 hover:text-white/70'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative shrink-0">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="search"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="제목, 기술스택 검색..."
                className="w-full sm:w-56 rounded-full border border-white/10 bg-white/[0.04] pl-9 pr-4 py-1.5 text-sm text-white/70 placeholder-white/25 outline-none focus:border-blue-500/40 focus:bg-white/[0.06] transition-all"
              />
            </div>
          </div>

          {/* Result Count */}
          {!isLoading && (
            <p className="mb-6 text-xs text-white/25">
              {filtered.length}개 프로젝트
              {totalPages > 1 && ` · ${page} / ${totalPages} 페이지`}
            </p>
          )}

          {/* Projects Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: PER_PAGE }).map((_, i) => (
                <div key={i} className="skeleton h-72 rounded-2xl" />
              ))}
            </div>
          ) : paged.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paged.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-32 text-center">
              <span className="text-4xl mb-4">🔍</span>
              <p className="text-white/30">
                {searchQuery
                  ? `"${searchQuery}"에 해당하는 프로젝트가 없습니다.`
                  : selectedCategory
                    ? `${selectedCategory} 카테고리의 프로젝트가 없습니다.`
                    : '등록된 프로젝트가 없습니다.'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/40 transition-all hover:border-white/25 hover:text-white/70 disabled:opacity-20 disabled:cursor-not-allowed"
                aria-label="이전 페이지"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setCurrentPage(n)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                    n === page
                      ? 'bg-white text-black'
                      : 'border border-white/10 text-white/40 hover:border-white/25 hover:text-white/70'
                  }`}
                >
                  {n}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/40 transition-all hover:border-white/25 hover:text-white/70 disabled:opacity-20 disabled:cursor-not-allowed"
                aria-label="다음 페이지"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

        </div>
      </section>
    </>
  )
}
