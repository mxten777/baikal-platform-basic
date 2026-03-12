import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthProvider'
import {
  LayoutDashboard, FileText, FolderKanban, Rss,
  RefreshCw, Image, Search, Settings, LogOut, Tag
} from 'lucide-react'

const navItems = [
  { to: '/admin',           label: '대시보드',    icon: LayoutDashboard, end: true },
  { to: '/admin/contents',  label: '콘텐츠',      icon: FileText },
  { to: '/admin/projects',  label: '프로젝트',    icon: FolderKanban },
  { to: '/admin/sources',   label: '수집 소스',   icon: Rss },
  { to: '/admin/sync-jobs', label: '동기화 작업', icon: RefreshCw },
  { to: '/admin/media',     label: '미디어',      icon: Image },
  { to: '/admin/tags',      label: '태그',         icon: Tag },
  { to: '/admin/seo',       label: 'SEO',         icon: Search },
  { to: '/admin/settings',  label: '설정',        icon: Settings },
]

export default function AdminLayout() {
  const { signOut } = useAuth()

  return (
    <div className="flex h-screen bg-[#080808] text-white">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-white/[0.06] bg-[#0a0a0a]">
        {/* 로고 */}
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-white/[0.06]">
          <img
            src="/images/baikal_logo_white.png"
            alt="BAIKAL SYSTEMS"
            className="h-6 w-auto object-contain"
          />
          <span className="text-[10px] font-semibold tracking-widest text-white/30 uppercase">Admin</span>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <p className="px-3 pb-2 pt-1 text-[10px] font-semibold tracking-widest text-white/20 uppercase">메뉴</p>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
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
                  <item.icon
                    size={16}
                    className={isActive ? 'text-blue-400' : 'text-white/30'}
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* 하단 - 로그아웃 */}
        <div className="px-3 py-4 border-t border-white/[0.06]">
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/30 transition-all hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={16} />
            로그아웃
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* 상단 헤더 바 */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-[#080808]/80 px-8 py-4 backdrop-blur-md">
          <div className="text-xs text-white/20 tracking-widest uppercase">BAIKAL AI Content Platform</div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs text-white/30">운영 중</span>
          </div>
        </div>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
