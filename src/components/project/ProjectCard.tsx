import { Link } from 'react-router-dom'
import type { Project } from '@/types/models'
import { cn } from '@/utils/cn'

interface ProjectCardProps {
  project: Project
  className?: string
}

const CATEGORY_STYLES: Record<string, { bg: string; border: string; text: string; glow: string; icon: string }> = {
  'AI Platform':     { bg: 'from-blue-950/80 to-[#080808]',    border: 'border-blue-500/25',   text: 'text-blue-400',   glow: 'bg-blue-500/20',    icon: '🤖' },
  'AI Agent':        { bg: 'from-violet-950/80 to-[#080808]',  border: 'border-violet-500/25', text: 'text-violet-400', glow: 'bg-violet-500/20',  icon: '⚡' },
  'SaaS / MVP':      { bg: 'from-emerald-950/80 to-[#080808]', border: 'border-emerald-500/25',text: 'text-emerald-400',glow: 'bg-emerald-500/20', icon: '🚀' },
  'Platform / Infra':{ bg: 'from-amber-950/80 to-[#080808]',  border: 'border-amber-500/25',  text: 'text-amber-400',  glow: 'bg-amber-500/20',   icon: '⚙️' },
  'Website':         { bg: 'from-rose-950/80 to-[#080808]',   border: 'border-rose-500/25',   text: 'text-rose-400',   glow: 'bg-rose-500/20',    icon: '🌐' },
}

export default function ProjectCard({ project, className }: ProjectCardProps) {
  const style = CATEGORY_STYLES[project.category ?? ''] ?? CATEGORY_STYLES['AI Platform']

  return (
    <Link
      to={`/projects/${project.slug}`}
      className={cn('glass-card group block overflow-hidden rounded-2xl relative', className)}
    >
      {/* 상단 컬러 라인 */}
      <div className={cn('absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent to-transparent via-current opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10', style.text)} />

      {/* 카테고리 배너 */}
      <div className={cn('relative flex items-center justify-between overflow-hidden px-5 py-4 bg-gradient-to-br', style.bg)}>
        {/* 배경 글로우 */}
        <div className={cn('absolute -top-4 -right-4 w-24 h-24 rounded-full blur-2xl opacity-40', style.glow)} />
        {/* 카테고리 배지 */}
        <span className={cn('relative z-10 flex items-center gap-2 text-xs font-bold uppercase tracking-widest', style.text)}>
          <span className="text-base">{style.icon}</span>
          {project.category}
        </span>
        {/* sort_order 번호 */}
        <span className="relative z-10 font-mono text-xs text-white/15 tabular-nums">
          #{String(project.sort_order ?? 0).padStart(2, '0')}
        </span>
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
