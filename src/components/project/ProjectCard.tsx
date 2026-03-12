import { Link } from 'react-router-dom'
import type { Project } from '@/types/models'
import { cn } from '@/utils/cn'

interface ProjectCardProps {
  project: Project
  className?: string
}

export default function ProjectCard({ project, className }: ProjectCardProps) {
  return (
    <Link
      to={`/projects/${project.slug}`}
      className={cn('glass-card group block overflow-hidden rounded-2xl relative', className)}
    >
      {/* 상단 컬러 라인 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

      {/* Thumbnail */}
      <div className="aspect-video overflow-hidden bg-white/[0.03] relative">
        {project.thumbnail_url ? (
          <img
            src={project.thumbnail_url}
            alt={project.title}
            className="h-full w-full object-cover transition-all duration-700 group-hover:scale-[1.06] opacity-80 group-hover:opacity-100"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500/10 to-blue-900/20 transition-all duration-500 group-hover:from-blue-500/15 group-hover:to-blue-900/30">
            <span className="text-3xl font-black tracking-tight text-blue-400/30 group-hover:text-blue-400/50 transition-colors duration-300">AI</span>
          </div>
        )}
        {/* 이미지 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="p-5 sm:p-7">
        {/* Category */}
        {project.category && (
          <span className="inline-block rounded-full border border-blue-500/20 bg-blue-500/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-400/70 group-hover:border-blue-500/35 group-hover:text-blue-400/90 transition-all duration-300">
            {project.category}
          </span>
        )}

        <h3 className="mt-4 text-lg sm:text-xl font-bold leading-snug text-white/85 line-clamp-2 transition-colors duration-300 group-hover:text-white">
          {project.title}
        </h3>

        {project.subtitle && (
          <p className="mt-2 text-sm leading-relaxed text-white/40 line-clamp-2">
            {project.subtitle}
          </p>
        )}

        {/* Tech stack */}
        {project.tech_stack.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.tech_stack.slice(0, 4).map(tech => (
              <span
                key={tech}
                className="rounded-md border border-white/[0.07] bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/35 group-hover:border-white/[0.12] group-hover:text-white/50 transition-all duration-300"
              >
                {tech}
              </span>
            ))}
            {project.tech_stack.length > 4 && (
              <span className="rounded-md border border-white/[0.07] bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/20">
                +{project.tech_stack.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Arrow indicator */}
        <div className="mt-5 flex items-center justify-between">
          <div className="h-px flex-1 bg-white/[0.06] group-hover:bg-blue-500/20 transition-colors duration-300" />
          <span className="ml-3 text-xs text-white/20 transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-blue-400/70">
            →
          </span>
        </div>
      </div>
    </Link>
  )
}
