import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import {
  LayoutDashboard, FileText, FolderKanban,
  Image, LogOut, Tag, Menu, X, Globe2, Sparkles
} from 'lucide-react'

type NavEntry =
  | { type: 'section'; label: string }
  | { type?: 'item'; to: string; label: string; icon: React.ElementType; end?: boolean }

const navEntries: NavEntry[] = [
  { type: 'section', label: '운영' },
  { to: '/admin',          label: '대시보드',   icon: LayoutDashboard, end: true },
  { to: '/admin/contents', label: '콘텐츠',     icon: FileText },
  { to: '/admin/projects', label: '프로젝트',   icon: FolderKanban },
  { to: '/admin/media',     label: '미디어',    icon: Image },
  { to: '/admin/tags',      label: '태그',      icon: Tag },
  { to: '/admin/ai-content', label: 'AI 콘텐츠', icon: Sparkles },
  { type: 'section', label: '시스템' },
  { to: '/admin/external', label: '외부 콘텐츠', icon: Globe2 },
]

function SidebarContent({ onClose }: { onClose?: () => void }) {
  async function handleLogout() {
    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch {
      // 로컬 세션 이미 삭제됨
    } finally {
      window.location.href = '/login'
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* 로고 */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <img src="/images/baikal_logo_white.png" alt="BAIKAL SYSTEMS" className="h-6 w-auto object-contain" />
          <span className="text-[10px] font-semibold tracking-widest text-white/30 uppercase">Admin</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        )}
      </div>
      {/* 네비게이션 */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navEntries.map((entry, i) => {
          if (entry.type === 'section') {
            return (
              <p key={`s-${i}`} className="px-3 pb-1.5 pt-4 first:pt-1 text-[10px] font-semibold tracking-widest text-white/20 uppercase">
                {entry.label}
              </p>
            )
          }
          return (
            <NavLink
              key={entry.to}
              to={entry.to}
              end={entry.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
                    : 'text-white/40 hover:bg-white/[0.04] hover:text-white/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <entry.icon size={16} className={isActive ? 'text-blue-400' : 'text-white/30'} />
                  {entry.label}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>
      {/* 하단 - 로그아웃 */}
      <div className="px-3 py-4 border-t border-white/[0.06]">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/30 transition-all hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={16} />
          로그아웃
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[#080808] text-white overflow-hidden">
      {/* 모바일 오버레이 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — 데스크탑: 고정, 모바일: 드로어 */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-64 flex-shrink-0 flex flex-col border-r border-white/[0.06] bg-[#0a0a0a]
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <SidebarContent onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto min-w-0">
        {/* 상단 헤더 바 */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-[#080808]/80 px-4 sm:px-8 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* 모바일 햄버거 */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
              aria-label="메뉴 열기"
            >
              <Menu size={20} />
            </button>
            <div className="text-xs text-white/20 tracking-widest uppercase hidden sm:block">BAIKAL AI Content Platform</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-white/30">운영 중</span>
          </div>
        </div>
        <div className="p-4 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
