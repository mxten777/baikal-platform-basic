import { supabase } from '@/lib/supabase'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import SEOHead from '@/components/seo/SEOHead'
import type { ContentSource } from '@/types/models'

async function getSources(): Promise<ContentSource[]> {
  const { data, error } = await supabase
    .from('content_sources')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as ContentSource[]
}

export default function AdminSources() {
  const qc = useQueryClient()
  const { data: sources, isLoading } = useQuery({ queryKey: ['admin', 'sources'], queryFn: getSources })

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('content_sources').update({ is_active }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'sources'] }),
  })

  return (
    <>
      <SEOHead title="수집 소스 관리" noIndex />
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight text-white">수집 소스 관리</h1>
          <p className="mt-1 text-sm text-white/35">AI 콘텐츠 수집 소스를 관리합니다</p>
        </div>
        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
        ) : (
          <div className="glass-card overflow-hidden rounded-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">이름</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">유형</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">URL</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">마지막 동기화</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">활성</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {(sources ?? []).map(source => (
                  <tr key={source.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-white">{source.name}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[11px] text-white/40">{source.source_type}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-white/25 max-w-xs truncate">{source.url ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-white/25">
                      {source.last_synced_at ? new Date(source.last_synced_at).toLocaleString('ko-KR') : '없음'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive.mutate({ id: source.id, is_active: !source.is_active })}
                        className={`relative inline-flex h-5 w-9 cursor-pointer rounded-full transition-colors ${
                          source.is_active ? 'bg-blue-600' : 'bg-white/[0.08]'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                          source.is_active ? 'translate-x-4' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
