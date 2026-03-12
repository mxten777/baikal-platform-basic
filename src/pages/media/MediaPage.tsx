import { useEffect, useState } from 'react'
import SEOHead from '@/components/seo/SEOHead'
import { supabase } from '@/lib/supabase'

const BUCKET = 'public-media'
const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
const PDF_EXT = 'pdf'

interface MediaFile {
  name: string
  url: string
  isPdf?: boolean
}

const MEDIA_TYPES = [
  { icon: '🎥', title: 'YouTube', desc: 'AI 개발 과정을 담은 영상 콘텐츠' },
  { icon: '🎤', title: '포드캐스트', desc: '(예정) AI 개발 사례 토크' },
  { icon: '📸', title: '이미지 자산', desc: '프로젝트 모험샷, UI 스크린샷' },
  { icon: '📊', title: '발표자료', desc: 'AI 개발 사례 프레젠테이션 슬라이드' },
]

export default function MediaPage() {
  const [images, setImages] = useState<MediaFile[]>([])
  const [pdfs, setPdfs] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMedia() {
      const { data } = await supabase.storage.from(BUCKET).list('', {
        limit: 200,
        sortBy: { column: 'created_at', order: 'desc' },
      })
      if (data) {
        const imgs: MediaFile[] = []
        const pdfFiles: MediaFile[] = []
        for (const f of data) {
          const ext = f.name.split('.').pop()?.toLowerCase() ?? ''
          const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(f.name)
          const displayName = (f.metadata?.original_name as string) ?? f.name
          if (IMAGE_EXTS.includes(ext)) {
            imgs.push({ name: displayName, url: urlData.publicUrl })
          } else if (ext === PDF_EXT) {
            pdfFiles.push({ name: displayName, url: urlData.publicUrl, isPdf: true })
          }
        }
        setImages(imgs)
        setPdfs(pdfFiles)
      }
      setLoading(false)
    }
    loadMedia()
  }, [])

  return (
    <>
      <SEOHead title="미디어" description="바이칼시스템즈 미디어 허브" canonical="/media" />

      {/* Hero */}
      <section className="relative bg-[#080808] py-20 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-blue-500/60" />
            <span className="section-label">MEDIA HUB</span>
          </div>
          <h1 className="text-[clamp(2.5rem,6vw,6rem)] font-black tracking-[-0.02em] leading-[1.1] text-white">
            미디어 <span className="gradient-text">허브</span>
          </h1>
          <p className="mt-6 text-lg text-white/40">영상, 이미지, 발표자료 등 미디어 자산</p>
        </div>
      </section>

      <section className="bg-[#080808] pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-10">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {MEDIA_TYPES.map(m => (
              <div key={m.title} className="glass-card rounded-2xl p-6">
                <span className="text-3xl">{m.icon}</span>
                <h3 className="mt-4 font-bold text-white/80">{m.title}</h3>
                <p className="mt-1.5 text-sm text-white/30 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
          {/* 이미지 갤러리 */}
          <div className="mt-12">
            <h2 className="text-lg font-bold text-white/60 mb-6">이미지 자산</h2>
            {loading ? (
              <div className="flex justify-center py-24">
                <p className="text-white/30 animate-pulse">로딩 중…</p>
              </div>
            ) : images.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-24 text-center">
                <span className="text-5xl mb-4">🖼️</span>
                <p className="text-white/30">등록된 이미지가 없습니다</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {images.map(img => (
                  <a
                    key={img.name}
                    href={img.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block overflow-hidden rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.14] transition-colors"
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={img.url}
                        alt={img.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <p className="truncate px-3 py-2.5 text-xs text-white/60">{img.name}</p>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* PDF 자료 */}
          {!loading && pdfs.length > 0 && (
            <div className="mt-12">
              <h2 className="text-lg font-bold text-white/60 mb-6">PDF 자료</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {pdfs.map(pdf => (
                  <a
                    key={pdf.name}
                    href={pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:border-red-400/30 transition-colors aspect-video"
                  >
                    <span className="text-4xl">📄</span>
                    <p className="truncate w-full px-3 text-center text-xs text-white/60 group-hover:text-white/80 transition-colors">{pdf.name}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
