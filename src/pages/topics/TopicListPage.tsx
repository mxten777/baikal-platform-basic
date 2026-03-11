import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import SEOHead from '@/components/seo/SEOHead'
import type { Topic } from '@/types/models'

async function getTopics(): Promise<Topic[]> {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('is_public', true)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []) as Topic[]
}

export default function TopicListPage() {
  const { data: topics, isLoading } = useQuery({ queryKey: ['topics'], queryFn: getTopics })
  return (
    <>
      <SEOHead title="토픽" description="바이칼시스템즈 AI 기술 주제 허브" canonical="/topics" />

      {/* Hero */}
      <section className="relative bg-[#080808] py-20 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-blue-500/60" />
            <span className="section-label">KNOWLEDGE BASE</span>
          </div>
          <h1 className="text-[clamp(2.5rem,6vw,6rem)] font-black tracking-[-0.02em] leading-[1.1] text-white">
            기술 <span className="gradient-text">토픽</span>
          </h1>
          <p className="mt-6 text-lg text-white/40">AI 개발의 주요 주제와 기술 영역별 콘텐츠</p>
        </div>
      </section>

      <section className="bg-[#080808] pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-10">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(topics ?? []).map(topic => (
                <Link
                  key={topic.id}
                  to={`/topics/${topic.slug}`}
                  className="glass-card group rounded-2xl p-6 block"
                >
                  <h2 className="font-bold text-white/80 group-hover:text-white transition-colors">{topic.title}</h2>
                  {topic.description && (
                    <p className="mt-2 text-sm text-white/30 line-clamp-2 leading-relaxed">{topic.description}</p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="h-px flex-1 bg-white/[0.06]" />
                    <span className="ml-3 text-xs text-white/20 transition-all group-hover:translate-x-0.5 group-hover:text-blue-400/50">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
