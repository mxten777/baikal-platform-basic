import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import SEOHead from '@/components/seo/SEOHead'
import ContentCard from '@/components/content/ContentCard'
import { useProject } from '@/features/projects/useProjects'
import { formatDate } from '@/utils/date'
import { SITE_URL } from '@/lib/constants'

export default function ProjectDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { data: project, isLoading, error } = useProject(slug)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-24">
        <div className="space-y-4">
          <div className="skeleton h-4 w-32 rounded-full" />
          <div className="skeleton h-12 w-2/3 rounded-xl" />
          <div className="skeleton h-64 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="py-40 text-center">
        <p className="text-white/30">프로젝트를 찾을 수 없습니다.</p>
        <Link to="/projects" className="mt-4 inline-block text-blue-400/60 hover:text-blue-400">
          ← 프로젝트 목록
        </Link>
      </div>
    )
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: project.title,
    description: project.description ?? project.subtitle,
    url: `${SITE_URL}/projects/${project.slug}`,
    applicationCategory: 'AIApplication',
    datePublished: project.launched_at ?? project.created_at,
    creator: {
      '@type': 'Organization',
      name: '바이칼시스템즈',
      url: SITE_URL,
    },
  }

  // content_project_map join 결과에서 related contents 추출
  const relatedContents = project.content_project_map
    ?.map((m) => m.content)
    .filter(Boolean) ?? []

  return (
    <>
      <SEOHead
        title={project.meta_title ?? project.title}
        description={project.meta_desc ?? project.subtitle ?? undefined}
        ogImage={project.og_image_url ?? project.thumbnail_url ?? undefined}
        canonical={`/projects/${project.slug}`}
        structuredData={structuredData}
        type="article"
      />

      <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-10 flex items-center gap-2 text-xs text-white/25">
          <Link to="/" className="hover:text-white/60 transition-colors">홈</Link>
          <span>/</span>
          <Link to="/projects" className="hover:text-white/60 transition-colors">프로젝트</Link>
          <span>/</span>
          <span className="text-white/50">{project.title}</span>
        </nav>

        {/* Header */}
        <header className="mb-10">
          {project.category && (
            <span className="inline-block rounded-full border border-blue-500/20 bg-blue-500/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-blue-400/70">
              {project.category}
            </span>
          )}
          <h1 className="mt-4 text-[clamp(1.8rem,3.5vw,3rem)] font-black tracking-[-0.02em] leading-[1.2] text-white">
            {project.title}
          </h1>
          {project.subtitle && (
            <p className="mt-3 text-lg text-white/40">{project.subtitle}</p>
          )}

          {/* Links */}
          <div className="mt-6 flex flex-wrap gap-3">
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-blue-50"
              >
                데모 보기 <span className="transition-transform group-hover:translate-x-0.5">↗</span>
              </a>
            )}
            {project.repo_url && (
              <a
                href={project.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-white/50 transition-all hover:border-white/20 hover:text-white"
              >
                GitHub ↗
              </a>
            )}
          </div>
        </header>

        {/* Thumbnail */}
        {project.thumbnail_url && (
          <div className="mb-12 overflow-hidden rounded-2xl">
            <img
              src={project.thumbnail_url}
              alt={project.title}
              className="w-full object-cover opacity-80"
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            {project.description && (
              <div className="prose-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {project.description}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            {/* Tech Stack */}
            {project.tech_stack.length > 0 && (
              <div className="glass-card rounded-2xl p-5">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">기술 스택</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tech_stack.map(tech => (
                    <span
                      key={tech}
                      className="rounded-md border border-white/[0.07] bg-white/[0.04] px-2.5 py-1 text-xs text-white/50"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Meta */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">정보</h3>
              <dl className="space-y-3 text-sm">
                {project.launched_at && (
                  <div className="flex justify-between">
                    <dt className="text-white/25">출시일</dt>
                    <dd className="text-white/60">{formatDate(project.launched_at)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-white/25">상태</dt>
                  <dd>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      project.status === 'active'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-white/5 text-white/30 border border-white/10'
                    }`}>
                      {project.status === 'active' ? '운영 중' : project.status}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>

        {/* Related Contents */}
        {relatedContents.length > 0 && (
          <section className="mt-20 border-t border-white/[0.06] pt-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-8 bg-blue-500/60" />
              <span className="section-label">RELATED CONTENTS</span>
            </div>
            <div className="divide-y divide-white/[0.05] rounded-2xl border border-white/[0.07] overflow-hidden">
              {relatedContents.map((content) => (
                <ContentCard key={content.id} content={content} variant="compact" className="px-5" />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
