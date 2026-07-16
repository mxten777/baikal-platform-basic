// src/lib/solutions.ts
// 솔루션 데이터는 특정 제품에 종속되지 않도록 타입으로 추상화됩니다.
// 향후 다른 솔루션으로 교체하거나 추가할 때 SOLUTIONS 배열만 수정하면 됩니다.

export interface SolutionFeature {
  icon: string
  title: string
  desc: string
}

export interface SolutionBenefit {
  value: string
  label: string
  accent: string
}

export interface SolutionCTA {
  demo: string
  inquiry: string
  brochure: string
}

export interface FeaturedSolution {
  slug: string
  name: string
  tagline: string
  description: string
  /** 파트너 관계를 명시하는 고지 문구 */
  partner_note: string
  category: string
  badge_label: string
  logo_emoji: string
  /** CSS hex 색상 (accent glow 등에 사용) */
  accent_hex: string
  features: SolutionFeature[]
  benefits: SolutionBenefit[]
  cta: SolutionCTA
  tags: string[]
}

export const SOLUTIONS: FeaturedSolution[] = [
  {
    slug: 'safelyn',
    name: 'SafeLyn',
    tagline: '산업 현장 안전을 디지털로 전환하는 스마트 안전관리 솔루션',
    description:
      'SafeLyn은 현장 안전 점검·위험 요소 관리·법적 준수 기록을 완전히 디지털화하는 산업 안전 관리 솔루션입니다. ' +
      '모바일 기반 체크리스트, 실시간 위험 알림, 법정 서류 자동화로 안전 관리 효율을 획기적으로 높입니다.',
    partner_note:
      '바이칼시스템즈는 SafeLyn의 공식 마케팅·도입 상담 파트너입니다. ' +
      'SafeLyn은 바이칼의 자체 제품이 아니며, 개발·운영은 SafeLyn 본사에서 담당합니다. ' +
      '바이칼은 국내 도입 컨설팅·맞춤 구축 지원·운영 관리를 제공합니다.',
    category: '산업 안전 관리',
    badge_label: 'FEATURED PARTNER SOLUTION',
    logo_emoji: '🛡️',
    accent_hex: '#10b981',
    features: [
      {
        icon: '📋',
        title: '모바일 안전 점검',
        desc: '종이 점검표를 모바일 체크리스트로 전환. 현장에서 즉시 기록·서명·사진 첨부',
      },
      {
        icon: '⚠️',
        title: '위험 요소 추적',
        desc: '위험 발굴에서 조치 완료까지 전 과정을 추적하고 책임자에게 자동 알림',
      },
      {
        icon: '📊',
        title: '법정 서류 자동화',
        desc: '안전 보고서·교육 이력·사고 대장 자동 생성. 감사 대응 준비 시간 단축',
      },
      {
        icon: '🔔',
        title: '실시간 현장 가시성',
        desc: '위험 상황 즉시 담당자 알림, 현장 상태 대시보드로 전사 안전 현황 한눈에 파악',
      },
    ],
    benefits: [
      { value: '80%↑', label: '점검 시간 단축', accent: '#10b981' },
      { value: '실시간', label: '현장 가시성', accent: '#10b981' },
      { value: '100%', label: '법정 기록 준수', accent: '#10b981' },
      { value: '무제한', label: '현장 규모 확장', accent: '#10b981' },
    ],
    cta: {
      demo: '/contact?type=demo&solution=safelyn',
      inquiry: '/contact?type=inquiry&solution=safelyn',
      brochure: '/contact?type=brochure&solution=safelyn',
    },
    tags: ['산업안전', 'HSE', '스마트안전', '안전관리', 'SaaS', '모바일'],
  },
]

export function getSolutionBySlug(slug: string): FeaturedSolution | undefined {
  return SOLUTIONS.find(s => s.slug === slug)
}

/** 현재 대표 파트너 솔루션 (홈 Featured Section에 표시) */
export const FEATURED_SOLUTION: FeaturedSolution = SOLUTIONS[0]
