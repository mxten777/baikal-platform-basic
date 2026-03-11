import SEOHead from '@/components/seo/SEOHead'
export default function AdminSEO() {
  return (
    <>
      <SEOHead title="SEO 관리" noIndex />
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight text-white">SEO 관리</h1>
          <p className="mt-1 text-sm text-white/35">SEO 메타 오버라이드 관리</p>
        </div>
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-sm text-white/30">Phase 5에서 구현 예정입니다</p>
        </div>
      </div>
    </>
  )
}
