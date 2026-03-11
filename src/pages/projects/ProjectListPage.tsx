import { useState } from 'react'
import SEOHead from '@/components/seo/SEOHead'
import ProjectCard from '@/components/project/ProjectCard'
import { useProjects } from '@/features/projects/useProjects'
import { PROJECT_CATEGORIES } from '@/lib/constants'

export default function ProjectListPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()

  const { data: projects, isLoading } = useProjects({
    category: selectedCategory,
  })

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
          {/* Category Filter */}
          <div className="pt-10 pb-8 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(undefined)}
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
                onClick={() => setSelectedCategory(cat.value)}
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

          {/* Projects Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="skeleton h-72 rounded-2xl" />
              ))}
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-32 text-center">
              <span className="text-4xl mb-4">🚀</span>
              <p className="text-white/30">
                {selectedCategory ? `${selectedCategory} 카테고리의 프로젝트가 없습니다.` : '등록된 프로젝트가 없습니다.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
