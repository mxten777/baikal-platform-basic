import { useState } from 'react'
import { Sparkles, Copy, Check, Loader2 } from 'lucide-react'
import SEOHead from '@/components/seo/SEOHead'
import { useMarketing } from '@/features/marketing/useMarketing'
import type { MarketingChannel } from '@/features/marketing/useMarketing'

const CHANNEL_OPTIONS: { value: MarketingChannel; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'threads',   label: 'Threads' },
  { value: 'naver_blog', label: '네이버 블로그' },
]

const PURPOSE_OPTIONS = [
  { value: 'promotion',      label: '프로모션' },
  { value: 'brand_awareness', label: '브랜드 인지' },
  { value: 'education',      label: '정보 제공' },
  { value: 'announcement',   label: '공지' },
]

const TONE_OPTIONS = [
  { value: 'professional', label: '전문적' },
  { value: 'premium',      label: '프리미엄' },
  { value: 'friendly',     label: '친근한' },
]

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-white/40 mb-1.5">{children}</label>
}

export default function AdminMarketing() {
  const { form, setField, result, isLoading, error, generate } = useMarketing()
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <SEOHead title="AI 마케팅" noIndex />
      <div>
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight text-white">AI 마케팅</h1>
          <p className="mt-1 text-sm text-white/35">원본 콘텐츠를 채널별 마케팅 콘텐츠로 변환합니다</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* 입력 폼 */}
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <p className="text-xs font-semibold tracking-widest text-white/20 uppercase">생성 설정</p>

            {/* 브랜드 + 채널 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>브랜드</Label>
                <input
                  className="admin-input w-full"
                  value={form.brand}
                  onChange={e => setField('brand', e.target.value)}
                  placeholder="BAIKAL"
                  maxLength={100}
                />
              </div>
              <div>
                <Label>채널</Label>
                <select
                  className="admin-input w-full"
                  value={form.channel}
                  onChange={e => setField('channel', e.target.value as MarketingChannel)}
                >
                  {CHANNEL_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 목적 + 톤 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>목적</Label>
                <select
                  className="admin-input w-full"
                  value={form.purpose}
                  onChange={e => setField('purpose', e.target.value)}
                >
                  {PURPOSE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>톤</Label>
                <select
                  className="admin-input w-full"
                  value={form.tone}
                  onChange={e => setField('tone', e.target.value)}
                >
                  {TONE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 원본 콘텐츠 */}
            <div>
              <Label>원본 콘텐츠 <span className="text-white/20 font-normal">*필수</span></Label>
              <textarea
                className="admin-input w-full h-36 resize-y"
                value={form.source_content}
                onChange={e => setField('source_content', e.target.value)}
                placeholder="마케팅 콘텐츠로 변환할 원본 텍스트를 입력하세요"
                maxLength={10000}
              />
              <p className="mt-1 text-right text-[11px] text-white/20">{form.source_content.length} / 10000</p>
            </div>

            {/* 추가 지시 */}
            <div>
              <Label>추가 지시 <span className="text-white/20 font-normal">선택</span></Label>
              <textarea
                className="admin-input w-full h-20 resize-none"
                value={form.additional_instruction}
                onChange={e => setField('additional_instruction', e.target.value)}
                placeholder="예: 과장하지 말고 전문성과 신뢰감을 강조"
                maxLength={1000}
              />
            </div>

            {/* 오류 */}
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* 생성 버튼 */}
            <button
              onClick={generate}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <><Loader2 size={16} className="animate-spin" /> 생성 중...</>
              ) : (
                <><Sparkles size={16} /> AI 콘텐츠 생성</>
              )}
            </button>
          </div>

          {/* 생성 결과 */}
          <div className="glass-card rounded-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold tracking-widest text-white/20 uppercase">생성 결과</p>
              {result && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all border border-white/[0.08] hover:border-white/20 text-white/40 hover:text-white"
                >
                  {copied ? <><Check size={13} className="text-green-400" /> 복사됨</> : <><Copy size={13} /> 복사</>}
                </button>
              )}
            </div>

            {isLoading && (
              <div className="flex flex-1 items-center justify-center gap-3 text-white/30 py-16">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm">AI가 콘텐츠를 생성하고 있습니다...</span>
              </div>
            )}

            {!isLoading && !result && (
              <div className="flex flex-1 items-center justify-center py-16">
                <p className="text-sm text-white/20">생성된 콘텐츠가 여기에 표시됩니다</p>
              </div>
            )}

            {!isLoading && result && (
              <pre className="flex-1 whitespace-pre-wrap text-sm text-white/80 leading-relaxed font-sans overflow-auto">
                {result}
              </pre>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
