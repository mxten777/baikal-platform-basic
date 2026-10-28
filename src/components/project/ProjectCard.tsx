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
      className={cn('group block overflow-hidden rounded-xl border border-white/10 bg-[#0d1b30] transition-colors hover:border-blue-400/40', className)}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-300/80">
          {project.category}
        </span>
        {project.featured && (
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
            Featured
          </span>
        )}
      </div>
      <div className="p-5 sm:p-7">
        <h3 className="text-lg sm:text-xl font-bold leading-snug text-white/85 line-clamp-2 transition-colors duration-300 group-hover:text-white">
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
