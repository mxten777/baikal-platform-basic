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
      className={cn('glass-card group block overflow-hidden rounded-2xl', className)}
    >
      {/* Thumbnail */}
      <div className="aspect-video overflow-hidden bg-white/[0.03]">
        {project.thumbnail_url ? (
          <img
            src={project.thumbnail_url}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500/10 to-blue-900/20">
            <span className="text-3xl font-black tracking-tight text-blue-400/30">AI</span>
          </div>
        )}
      </div>

      <div className="p-7">
        {/* Category */}
        {project.category && (
          <span className="inline-block rounded-full border border-blue-500/20 bg-blue-500/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-400/70">
            {project.category}
          </span>
        )}

        <h3 className="mt-4 text-xl font-bold leading-snug text-white/85 line-clamp-2 transition-colors group-hover:text-white">
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
                className="rounded-md border border-white/[0.07] bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/35"
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
          <div className="h-px flex-1 bg-white/[0.06]" />
          <span className="ml-3 text-xs text-white/20 transition-all duration-300 group-hover:translate-x-1 group-hover:text-blue-400/60">
            →
          </span>
        </div>
      </div>
    </Link>
  )
}
