// =============================================================================
// Safe Markdown rendering helpers
// rehype-sanitize 기반으로 사용자 입력 Markdown 의 XSS 잠재 위협을 차단한다.
// =============================================================================

import { defaultSchema } from 'rehype-sanitize'

// 기본 스키마에 코드 하이라이트/표/이미지/외부 링크에 필요한 속성을 추가
export const markdownSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), ['className']],
    span: [...(defaultSchema.attributes?.span ?? []), ['className']],
    a: [
      ...(defaultSchema.attributes?.a ?? []),
      ['target'],
      ['rel'],
    ],
    img: [
      ...(defaultSchema.attributes?.img ?? []),
      ['alt'],
      ['title'],
      ['loading'],
    ],
  },
}
