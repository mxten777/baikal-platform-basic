import { useState } from 'react'
import { useAuth } from '@/features/auth/AuthProvider'
import { useNavigate, Link } from 'react-router-dom'
import SEOHead from '@/components/seo/SEOHead'

export default function LoginPage() {
  const { signIn, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (isAdmin) {
    navigate('/admin')
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/admin')
    } catch {
      setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인하세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEOHead title="관리자 로그인" noIndex />
      <div className="relative flex min-h-screen items-center justify-center bg-[#080808] px-4 overflow-hidden">
        {/* 배경 */}
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute inset-0 bg-hero-glow" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

        <div className="relative w-full max-w-md animate-fade-up">
          {/* 로고 */}
          <div className="mb-10 text-center">
            <div className="mb-5">
              <img
                src="/images/baikal_logo_white.png"
                alt="BAIKAL"
                className="mx-auto h-12 w-auto object-contain"
              />
            </div>
            <span className="inline-block text-xs font-semibold tracking-widest text-white/30 uppercase mb-3">Admin</span>
            <p className="text-sm text-white/35">관리자 전용 페이지입니다</p>
          </div>

          {/* 카드 */}
          <div className="glass-card rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="admin@baikalsys.kr"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-blue-500/50 focus:bg-white/[0.06]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-blue-500/50 focus:bg-white/[0.06]"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-500 disabled:opacity-40"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    로그인 중...
                  </span>
                ) : '로그인'}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-white/20">
            BAIKAL AI Content Platform
          </p>

          {/* 홈으로 버튼 */}
          <div className="mt-4 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
