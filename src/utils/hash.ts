/**
 * SHA-256 해시 생성 (Web Crypto API — 브라우저/Edge Runtime 모두 지원)
 * Aggregator의 content_hash 생성에 사용
 */
export async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * 콘텐츠 중복 감지용 해시 생성
 * source_url + "::" + title 기반
 */
export async function makeContentHash(sourceUrl: string, title: string): Promise<string> {
  const normalized = sourceUrl.toLowerCase().replace(/\?.*$/, '').replace(/\/$/, '')
  return sha256(`${normalized}::${title}`)
}
