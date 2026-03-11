import SEOHead from '@/components/seo/SEOHead'
export default function AdminMedia() {
  return (
    <>
      <SEOHead title="미디어 관리" noIndex />
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight text-white">미디어 관리</h1>
          <p className="mt-1 text-sm text-white/35">파일 업로드 및 미디어 자산 관리</p>
        </div>
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-sm text-white/30">Phase 4에서 구현 예정입니다</p>
        </div>
      </div>
    </>
  )
}
