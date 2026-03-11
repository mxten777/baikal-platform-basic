import { useState } from 'react'
import { CheckCircle2, Circle, FolderKanban, FileText, Rss, Share2 } from 'lucide-react'
import SEOHead from '@/components/seo/SEOHead'

type CheckItem = {
  id: string
  label: string
  desc: string
  link?: { text: string; href: string }
}

const CHECKLIST_STEPS: { step: number; title: string; icon: React.ReactNode; color: string; items: CheckItem[] }[] = [
  {
    step: 1,
    title: 'AdminProjects에 프로젝트 등록',
    icon: <FolderKanban size={18} />,
    color: 'text-blue-400',
    items: [
      { id: 'p1', label: 'slug 설정 (영문 소문자, 하이픈)', desc: '예: my-rag-search-mvp' },
      { id: 'p2', label: 'title / subtitle 입력', desc: '한 줄 소개 — 검색 결과에 노출되는 텍스트' },
      { id: 'p3', label: 'description 작성 (마크다운)', desc: '## 개요 / ## 주요 기능 / ## 성과 구조 권장' },
      { id: 'p4', label: 'category 선택', desc: 'NLP / AI Agent / Platform / Research / Computer Vision' },
      { id: 'p5', label: 'tech_stack 입력', desc: '콤마 구분: Python, FastAPI, OpenAI' },
      { id: 'p6', label: 'featured 여부 결정', desc: '메인 홈에 노출할 대표작이면 ON' },
    ],
  },
  {
    step: 2,
    title: 'AdminContents에 콘텐츠 3종 등록',
    icon: <FileText size={18} />,
    color: 'text-violet-400',
    items: [
      { id: 'c1', label: '[article] 기술 아키텍처 글 작성', desc: '"XXX를 만든 이유와 구조" — SEO 핵심 자산' },
      { id: 'c2', label: '[note] 개발일지 작성', desc: '"[개발일지 #N] 만들면서 배운 것" — 개인 브랜딩' },
      { id: 'c3', label: '[research] 실험 결과 작성 (해당 시)', desc: '수치·비교 데이터가 있으면 research 타입으로' },
      { id: 'c4', label: 'is_featured 설정 (article 권장)', desc: '메인 Featured 섹션에 노출' },
      { id: 'c5', label: 'status = published 확인', desc: 'draft 상태면 공개 페이지에 노출되지 않음' },
    ],
  },
  {
    step: 3,
    title: '외부 채널 배포',
    icon: <Share2 size={18} />,
    color: 'text-emerald-400',
    items: [
      { id: 's1', label: 'X(Twitter)에 요약 포스팅', desc: '핵심 인사이트 1가지 + 사이트 링크 첨부' },
      { id: 's2', label: 'LinkedIn에 article 본문 공유', desc: '기술 청중 대상 — 풀 본문 or 요약+링크' },
      { id: 's3', label: '기술 커뮤니티 공유 (선택)', desc: '개발자 커뮤니티, 슬랙 그룹 등' },
    ],
  },
  {
    step: 4,
    title: 'RSS 소스 등록으로 역유입 자동화',
    icon: <Rss size={18} />,
    color: 'text-amber-400',
    items: [
      { id: 'r1', label: 'AdminSources에 외부 채널 RSS 등록', desc: 'X, 블로그, YouTube 등 → 콘텐츠 자동 수집' },
      { id: 'r2', label: 'AdminSyncJobs에서 싱크 실행 확인', desc: '수집된 x_post가 AdminContents에 자동 반영' },
      { id: 'r3', label: '중복·불필요 항목 AdminContents에서 정리', desc: 'status = draft로 숨김 처리 가능' },
    ],
  },
]

export default function AdminSettings() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const toggle = (id: string) =>
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))

  const totalItems = CHECKLIST_STEPS.flatMap(s => s.items).length
  const doneCount = Object.values(checked).filter(Boolean).length
  const progress = Math.round((doneCount / totalItems) * 100)

  return (
    <>
      <SEOHead title="설정" noIndex />
      <div>
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight text-white">MVP 등록 가이드</h1>
          <p className="mt-1 text-sm text-white/35">MVP 완성 시 플랫폼에 등록하는 표준 체크리스트</p>
        </div>

        {/* 진행바 */}
        <div className="glass-card rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-white">전체 진행률</span>
            <span className="text-sm font-black text-white">{doneCount} / {totalItems}</span>
          </div>
          <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-white/30">0%</span>
            <span className={`text-xs font-bold ${progress === 100 ? 'text-emerald-400' : 'text-white/40'}`}>
              {progress === 100 ? '✓ 완료' : `${progress}%`}
            </span>
          </div>
        </div>

        {/* 단계별 체크리스트 */}
        <div className="space-y-4">
          {CHECKLIST_STEPS.map(step => {
            const stepDone = step.items.filter(i => checked[i.id]).length
            const stepTotal = step.items.length
            return (
              <div key={step.step} className="glass-card overflow-hidden rounded-2xl">
                {/* 단계 헤더 */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                  <div className="flex items-center gap-3">
                    <span className={`${step.color}`}>{step.icon}</span>
                    <div>
                      <span className="text-xs text-white/30 font-medium">STEP {step.step}</span>
                      <p className="text-sm font-bold text-white leading-tight">{step.title}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    stepDone === stepTotal
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-white/[0.05] text-white/40'
                  }`}>
                    {stepDone}/{stepTotal}
                  </span>
                </div>
                {/* 체크 아이템 */}
                <ul className="divide-y divide-white/[0.04]">
                  {step.items.map(item => (
                    <li
                      key={item.id}
                      className="flex items-start gap-3 px-5 py-3.5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                      onClick={() => toggle(item.id)}
                    >
                      <span className={`mt-0.5 flex-shrink-0 ${checked[item.id] ? 'text-emerald-400' : 'text-white/20'}`}>
                        {checked[item.id]
                          ? <CheckCircle2 size={17} />
                          : <Circle size={17} />
                        }
                      </span>
                      <div>
                        <p className={`text-sm font-medium leading-snug ${checked[item.id] ? 'line-through text-white/30' : 'text-white/80'}`}>
                          {item.label}
                        </p>
                        <p className="text-xs text-white/25 mt-0.5">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* 바닥 초기화 */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setChecked({})}
            className="text-xs text-white/25 hover:text-white/50 transition-colors"
          >
            체크 초기화
          </button>
        </div>
      </div>
    </>
  )
}
