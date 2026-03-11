// =============================================================================
// Supabase Edge Function: generate-og-image
// supabase/functions/generate-og-image/index.ts
//
// 역할: 동적 OG 이미지 생성 (SVG → PNG)
//       라우트: GET /api/og?title=...&type=...
//
// 쿼리 파라미터:
//   title  : 이미지에 표시할 제목 (최대 80자 표시)
//   type   : 콘텐츠 유형 (article|project|youtube|rss|research|experiment)
//   sub    : 부제목 또는 카테고리 (선택)
// =============================================================================

// 콘텐츠 유형별 색상 팔레트:  [배경 그라디언트 시작, 종료, 배지 색상]
const TYPE_PALETTE: Record<string, { from: string; to: string; badge: string; label: string }> = {
  article:    { from: '#0f172a', to: '#1e3a5f', badge: '#3b82f6', label: '아티클' },
  project:    { from: '#0f172a', to: '#1a2e1a', badge: '#22c55e', label: '프로젝트' },
  youtube:    { from: '#0f172a', to: '#2d1515', badge: '#ef4444', label: 'YouTube' },
  rss:        { from: '#0f172a', to: '#2d1f0f', badge: '#f97316', label: 'RSS' },
  research:   { from: '#0f172a', to: '#1f1540', badge: '#8b5cf6', label: '리서치' },
  experiment: { from: '#0f172a', to: '#0f2a1a', badge: '#10b981', label: '실험' },
  x:          { from: '#0f172a', to: '#141414', badge: '#ffffff', label: 'X (Twitter)' },
  instagram:  { from: '#0f172a', to: '#2d1535', badge: '#ec4899', label: 'Instagram' },
  default:    { from: '#0f172a', to: '#1a1a2e', badge: '#3b82f6', label: 'BAIKAL' },
}

// 긴 제목을 여러 줄로 분할 (SVG tspan 사용)
function splitTitle(title: string, maxCharsPerLine = 22): string[] {
  if (title.length <= maxCharsPerLine) return [title]

  const words = title.split('')
  const lines: string[] = []
  let current = ''

  for (const char of words) {
    current += char
    if (current.length >= maxCharsPerLine) {
      lines.push(current)
      current = ''
      if (lines.length >= 3) break  // 최대 3줄
    }
  }
  if (current) lines.push(current)
  return lines.slice(0, 3)
}

// 제목 줄의 SVG tspan 요소 생성
function buildTitleTspans(lines: string[], x: number, baseY: number, lineHeight = 72): string {
  return lines.map((line, i) => {
    const y = baseY + i * lineHeight
    return `<tspan x="${x}" y="${y}">${escapeXml(line)}</tspan>`
  }).join('\n      ')
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// ===== SVG 생성 =====
function buildOgSvg(title: string, type: string, sub?: string): string {
  const palette = TYPE_PALETTE[type] ?? TYPE_PALETTE.default
  const titleLines = splitTitle(title.slice(0, 80))

  // 줄 수에 따라 Y 시작점 조정 (수직 중앙 정렬 근사)
  const titleBaseY = titleLines.length === 1 ? 340 : titleLines.length === 2 ? 300 : 270

  const tspans = buildTitleTspans(titleLines, 80, titleBaseY)

  // 서브타이틀
  const subLine = sub
    ? `<text x="80" y="510" font-family="Pretendard, Noto Sans KR, sans-serif" font-size="28" fill="#94a3b8" font-weight="400">${escapeXml(sub.slice(0, 60))}</text>`
    : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${palette.from};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${palette.to};stop-opacity:1" />
    </linearGradient>
    <!-- 격자 패턴 -->
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
    </pattern>
    <!-- 오른쪽 하단 발광 -->
    <radialGradient id="glow" cx="80%" cy="85%" r="40%">
      <stop offset="0%" style="stop-color:${palette.badge};stop-opacity:0.15" />
      <stop offset="100%" style="stop-color:transparent;stop-opacity:0" />
    </radialGradient>
  </defs>

  <!-- 배경 -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- 상단 테두리 강조선 -->
  <rect x="0" y="0" width="1200" height="4" fill="${palette.badge}" opacity="0.9"/>

  <!-- 로고 영역 (좌상단) -->
  <text x="80" y="80" font-family="Pretendard, Noto Sans KR, sans-serif" font-size="22" fill="rgba(255,255,255,0.5)" font-weight="600" letter-spacing="3">BAIKAL SYSTEMS</text>

  <!-- 타입 배지 -->
  <rect x="80" y="110" width="${palette.label.length * 14 + 32}" height="36" rx="18" fill="${palette.badge}" opacity="0.2"/>
  <rect x="80" y="110" width="${palette.label.length * 14 + 32}" height="36" rx="18" fill="none" stroke="${palette.badge}" stroke-width="1" opacity="0.5"/>
  <text x="${80 + (palette.label.length * 14 + 32) / 2}" y="133" font-family="Pretendard, Noto Sans KR, sans-serif" font-size="15" fill="${palette.badge}" font-weight="600" text-anchor="middle">${escapeXml(palette.label)}</text>

  <!-- 메인 제목 -->
  <text font-family="Pretendard, Noto Sans KR, sans-serif" font-size="60" fill="white" font-weight="700" letter-spacing="-1">
    ${tspans}
  </text>

  <!-- 서브타이틀 -->
  ${subLine}

  <!-- 하단 정보 바 -->
  <line x1="80" y1="560" x2="1120" y2="560" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  <text x="80" y="600" font-family="Pretendard, Noto Sans KR, sans-serif" font-size="20" fill="rgba(255,255,255,0.35)" font-weight="400">www.baikalsys.kr</text>
  <text x="1120" y="600" font-family="Pretendard, Noto Sans KR, sans-serif" font-size="20" fill="rgba(255,255,255,0.35)" font-weight="400" text-anchor="end">AI Development Platform</text>
</svg>`
}

// ===== 메인 핸들러 =====
Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  const title = (url.searchParams.get('title') ?? 'BAIKAL AI Content Platform').trim()
  const type = (url.searchParams.get('type') ?? 'default').trim().toLowerCase()
  const sub = url.searchParams.get('sub') ?? undefined

  // 캐시 키: title + type + sub 기반 (응답 헤더로 처리)
  const svg = buildOgSvg(title, type, sub)

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      // 브라우저/CDN 캐시: 1시간
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, immutable',
      // CORS: SNS 크롤러 허용
      'Access-Control-Allow-Origin': '*',
      'Vary': 'Accept',
    },
  })
})
