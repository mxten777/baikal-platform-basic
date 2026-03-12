import { useState, useRef, useCallback, useEffect } from 'react'
import SEOHead from '@/components/seo/SEOHead'
import { supabase } from '@/lib/supabase'
import { Upload, Copy, Trash2, Check, Image as ImageIcon, FileText } from 'lucide-react'

const BUCKET = 'public-media'

function getMimeType(file: File): string {
  if (file.type) return file.type
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
    pdf: 'application/pdf',
  }
  return map[ext] ?? ''
}

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf',
]

interface UploadedFile {
  name: string
  url: string
  size: number
  type: string
  uploadedAt: string
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AdminMedia() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [loadingFiles, setLoadingFiles] = useState(true)
  const [dragOver, setDragOver] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function loadFiles() {
    setLoadingFiles(true)

    const [storageResult, dbResult] = await Promise.all([
      supabase.storage.from(BUCKET).list('', {
        limit: 200,
        sortBy: { column: 'created_at', order: 'desc' },
      }),
      supabase.from('media_files').select('storage_key, original_name'),
    ])

    if (storageResult.data) {
      const nameMap: Record<string, string> = {}
      for (const row of dbResult.data ?? []) {
        nameMap[row.storage_key] = row.original_name
      }

      const loaded: UploadedFile[] = storageResult.data
        .filter(f => f.name !== '.emptyFolderPlaceholder')
        .map(f => {
          const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(f.name)
          return {
            name: nameMap[f.name] ?? f.name,
            url: urlData.publicUrl,
            size: (f.metadata?.size as number) ?? 0,
            type: (f.metadata?.mimetype as string) ?? 'image/jpeg',
            uploadedAt: f.created_at ?? new Date().toISOString(),
          }
        })
      setFiles(loaded)
    }
    setLoadingFiles(false)
  }

  useEffect(() => { loadFiles() }, [])

  async function uploadFiles(fileList: FileList) {
    if (!fileList.length) return
    setUploading(true)
    setError(null)
    const uploaded: UploadedFile[] = []

    for (const file of Array.from(fileList)) {
      const mimeType = getMimeType(file)
      if (!ALLOWED_TYPES.includes(mimeType)) {
        setError(`지원하지 않는 파일 형식입니다: ${file.name}`)
        continue
      }
      const ext = (file.name.split('.').pop() ?? 'bin').replace(/[^a-zA-Z0-9]/g, '')
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          metadata: { original_name: file.name },
        })

      if (uploadError) {
        setError(`업로드 실패: ${file.name} — ${uploadError.message}`)
        continue
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName)

      // DB에 storage_key → 원본 파일명 영구 저장
      await supabase.from('media_files').upsert({ storage_key: fileName, original_name: file.name })

      uploaded.push({
        name: file.name,
        url: data.publicUrl,
        size: file.size,
        type: mimeType,
        uploadedAt: new Date().toISOString(),
      })
    }

    setFiles(prev => [...uploaded, ...prev])
    setUploading(false)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files)
  }, [])

  function handleCopy(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(url)
      setTimeout(() => setCopiedUrl(null), 2000)
    })
  }

  async function handleRemove(url: string) {
    const storageKey = url.split(`/${BUCKET}/`)[1]?.split('?')[0]
    if (storageKey) {
      await Promise.all([
        supabase.storage.from(BUCKET).remove([storageKey]),
        supabase.from('media_files').delete().eq('storage_key', storageKey),
      ])
    }
    setFiles(prev => prev.filter(f => f.url !== url))
  }

  return (
    <>
      <SEOHead title="미디어 관리" noIndex />
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight text-white">미디어 관리</h1>
          <p className="mt-1 text-sm text-white/35">이미지 파일을 업로드하고 URL을 복사해 콘텐츠에 사용하세요</p>
        </div>

        {/* 업로드 드롭존 */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer transition-colors p-12 mb-6 ${
            dragOver
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-white/[0.10] bg-white/[0.02] hover:border-white/[0.20] hover:bg-white/[0.04]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            multiple
            className="hidden"
            onChange={e => e.target.files && uploadFiles(e.target.files)}
          />
          {uploading ? (
            <p className="text-sm text-blue-400 animate-pulse">업로드 중…</p>
          ) : (
            <>
              <Upload size={28} className="text-white/20" />
              <p className="text-sm text-white/40">파일을 드래그하거나 클릭해서 업로드</p>
              <p className="text-xs text-white/20">이미지 (JPG, PNG, GIF, WebP, SVG) · PDF</p>
            </>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/15 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* 업로드된 파일 그리드 */}
        {loadingFiles ? (
          <div className="glass-card rounded-2xl p-10 text-center">
            <p className="text-sm text-white/30 animate-pulse">파일 목록 로딩 중…</p>
          </div>
        ) : files.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center">
            <ImageIcon size={32} className="mx-auto mb-3 text-white/15" />
            <p className="text-sm text-white/25">업로드된 파일이 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {files.map(f => (
              <div key={f.url} className="glass-card rounded-xl overflow-hidden group">
                {/* 미리보기 */}
                <div className="aspect-video bg-white/[0.04] overflow-hidden relative">
                  {f.type === 'application/pdf' ? (
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-full w-full flex-col items-center justify-center gap-2"
                    >
                      <FileText size={32} className="text-red-400/70" />
                      <span className="text-[10px] text-white/30">PDF</span>
                    </a>
                  ) : (
                    <img
                      src={f.url}
                      alt={f.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}
                  {/* 오버레이 버튼 */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleCopy(f.url)}
                      className="rounded-lg bg-white/10 hover:bg-white/20 p-2 transition-colors"
                      title="URL 복사"
                    >
                      {copiedUrl === f.url ? (
                        <Check size={14} className="text-green-400" />
                      ) : (
                        <Copy size={14} className="text-white" />
                      )}
                    </button>
                    <button
                      onClick={() => handleRemove(f.url)}
                      className="rounded-lg bg-white/10 hover:bg-red-500/30 p-2 transition-colors"
                      title="목록에서 제거"
                    >
                      <Trash2 size={14} className="text-white" />
                    </button>
                  </div>
                </div>
                {/* 파일 정보 */}
                <div className="px-3 py-2.5">
                  <p className="text-xs font-medium text-white/60 truncate">{f.name}</p>
                  <p className="text-[10px] text-white/25 mt-0.5">{formatBytes(f.size)}</p>
                </div>
                {/* URL 복사 바 */}
                <div
                  className="flex items-center gap-1.5 px-3 pb-2.5 cursor-pointer"
                  onClick={() => handleCopy(f.url)}
                >
                  <span className="flex-1 truncate text-[10px] text-white/20 font-mono">{f.url}</span>
                  {copiedUrl === f.url ? (
                    <Check size={10} className="flex-shrink-0 text-green-400" />
                  ) : (
                    <Copy size={10} className="flex-shrink-0 text-white/20" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

