/**
 * 한국어 + 영어 텍스트를 URL 슬러그로 변환
 * 예: "AI 에이전트 개발" → "ai-에이전트-개발"
 *     "My Project Title" → "my-project-title"
 */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u3131-\uD79D-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100)
}
