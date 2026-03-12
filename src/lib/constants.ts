export const SITE_NAME = import.meta.env.VITE_SITE_NAME ?? '바이칼시스템즈'
export const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://www.baikalsys.kr'
export const SITE_DESCRIPTION = 'AI 소프트웨어 개발 회사 바이칼시스템즈의 AI 개발 콘텐츠 플랫폼'

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.svg`

export const CONTENT_TYPES_KO: Record<string, string> = {
  article:      '기술 아티클',
  note:         '개발 노트',
  experiment:   '실험 기록',
  research:     '연구 기록',
  rss:          'RSS',
  x_post:       'X(Twitter)',
  instagram:    'Instagram',
  youtube:      'YouTube',
  external_link: '외부 링크',
  curated:      '큐레이션',
}

// value는 DB의 category 컬럼 값과 동일해야 합니다
export const PROJECT_CATEGORIES: { label: string; value: string }[] = [
  { label: 'NLP', value: 'NLP' },
  { label: 'Computer Vision', value: 'Computer Vision' },
  { label: 'AI Agent', value: 'AI Agent' },
  { label: 'Platform / Infra', value: 'Platform / Infra' },
  { label: 'Research / Experiment', value: 'Research / Experiment' },
]

export const PER_PAGE_DEFAULT = 12
