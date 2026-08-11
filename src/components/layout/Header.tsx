import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

type NavItem = {
  to: string
  label: string
  children?: { to: string; label: string; sub: string }[]
}

const nav: NavItem[] = [
  { to: '/solutions', label: 'PRODUCTS' },
  { to: '/projects',  label: 'PORTFOLIO' },
  {
    to: '/lab/articles',
    label: 'LAB',
    children: [
      { to: '/lab/articles',    label: '기술 아티클', sub: 'Articles'    },
      { to: '/lab/notes',       label: '개발 노트',   sub: 'Notes'       },
      { to: '/lab/experiments', label: '실험 기록',   sub: 'Experiments' },
      { to: '/lab/research',    label: '연구 기록',   sub: 'Research'    },
    ],
  },
  { to: '/content', label: 'CONTENTS' },
  { to: '/media',   label: 'MEDIA'    },
  { to: '/about',   label: 'ABOUT'    },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileLabOpen, setMobileLabOpen] = useState(false)
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(max-width: 767px)').matches
      : false
  )
  const headerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)

  // 스크롤 감지 → 글래스모피즘
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // 모바일 해상도 감지
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    setIsMobile(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Samsung Internet position:fixed 렌더링 버그 우회 - RAF로 위치 강제 보정
  useEffect(() => {
    const forceFixed = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect()
        if (rect.top !== 0) {
          headerRef.current.style.top = '0px'
        }
      }
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        if (rect.top !== 46) {
          buttonRef.current.style.top = '46px'
        }
      }
    }

    let rafId: number
    const scrollHandler = () => {
      rafId = requestAnimationFrame(forceFixed)
    }

    window.addEventListener('scroll', scrollHandler, { passive: true })
    window.addEventListener('touchmove', scrollHandler, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', scrollHandler)
      window.removeEventListener('touchmove', scrollHandler)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
          scrolled
            ? 'bg-[#080808]/85 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl shadow-black/50'
            : 'bg-[#080808] border-b border-white/[0.04]'
        }`}
      >
        {/* Announcement Bar — THE LIT Digital Renewal */}
        <Link
          to="/projects/the-lit-digital-renewal"
          className="block border-b border-white/[0.05] bg-[#080808]/80 py-2 text-center text-[11px] transition-colors hover:bg-white/[0.02] focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/50"
          aria-label="NEW PROJECT — THE LIT 복합문화공간 공식 웹사이트 리뉴얼 오픈, 프로젝트 보기"
        >
          <span className="hidden sm:inline">
            <span className="font-semibold tracking-[0.15em] text-amber-400/80">NEW PROJECT · THE LIT</span>
            <span className="mx-3 text-white/25">|</span>
            <span className="text-neutral-200/80">복합문화공간 THE LIT 공식 웹사이트 리뉴얼 오픈</span>
            <span className="ml-3 text-amber-400/80 hover:text-amber-300">프로젝트 보기 →</span>
          </span>
          <span className="sm:hidden">
            <span className="font-semibold tracking-[0.12em] text-amber-400/80">NEW PROJECT · THE LIT</span>
            <span className="mx-2 text-white/25">|</span>
            <span className="text-neutral-200/80">리뉴얼 오픈</span>
            <span className="ml-2 text-amber-400/80">→</span>
          </span>
        </Link>

        {/* 모바일 햄버거 메뉴 버튼 */}
        <div
          ref={buttonRef}
          onClick={() => setMenuOpen(v => !v)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setMenuOpen(v => !v)}
          className="hamburger-menu-btn"
          style={{
            position: 'fixed',
            top: '46px',
            right: '16px',
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: '#141414',
            border: '1px solid rgba(255,255,255,0.22)',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
          }}
          aria-label="메뉴"
        >
          {menuOpen ? (
            <svg width="18" height="18" viewBox="0 0 18 18" strokeWidth="2.5" strokeLinecap="round" fill="none"
              style={{ stroke: '#ffffff', display: 'block' }}>
              <line x1="2" y1="2" x2="16" y2="16" />
              <line x1="16" y1="2" x2="2" y2="16" />
            </svg>
          ) : (
            <svg width="20" height="15" viewBox="0 0 20 15" strokeWidth="2.5" strokeLinecap="round" fill="none"
              style={{ stroke: '#ffffff', display: 'block' }}>
              <line x1="0" y1="1" x2="20" y2="1" />
              <line x1="0" y1="7.5" x2="20" y2="7.5" />
              <line x1="0" y1="14" x2="20" y2="14" />
            </svg>
          )}
        </div>

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center">
            <img
              src="/images/baikal_logo_white.png"
              alt="BAIKAL SYSTEMS"
              className="h-9 w-auto object-contain"
            />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {nav.map(item =>
              item.children ? (
                /* LAB — hover dropdown */
                <div key={item.to} className="relative group">
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => {
                      const labActive = location.pathname.startsWith('/lab')
                      return `relative flex items-center gap-1 text-[11px] font-semibold tracking-[0.18em] transition-colors duration-200 hover-underline ${
                        isActive || labActive ? 'text-white' : 'text-white/40 hover:text-white/80'
                      }`
                    }}
                  >
                    {item.label}
                    <svg className="w-2.5 h-2.5 opacity-40 transition-transform duration-200 group-hover:rotate-180" viewBox="0 0 10 6" fill="none">
                      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </NavLink>

                  {/* Dropdown panel */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                    <div className="min-w-[180px] rounded-xl border border-white/[0.08] bg-[#0e0e0e]/95 backdrop-blur-xl shadow-2xl shadow-black/60 overflow-hidden py-1.5">
                      {item.children.map(child => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          className={({ isActive }) =>
                            `flex items-center justify-between gap-4 px-4 py-2.5 text-xs transition-colors duration-150 ${
                              isActive
                                ? 'bg-white/[0.06] text-white'
                                : 'text-white/50 hover:bg-white/[0.04] hover:text-white/80'
                            }`
                          }
                        >
                          <span className="font-medium">{child.label}</span>
                          <span className="text-[10px] tracking-widest text-white/20 font-mono uppercase">{child.sub}</span>
                        </NavLink>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => {
                    const solutionsActive = item.to === '/solutions' && location.pathname.startsWith('/solutions')
                    return `relative text-[11px] font-semibold tracking-[0.18em] transition-colors duration-200 hover-underline ${
                      isActive || solutionsActive ? 'text-white' : 'text-white/40 hover:text-white/80'
                    }`
                  }}
                >
                  {item.label}
                </NavLink>
              )
            )}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/contact"
              className="hidden md:flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-[11px] font-semibold tracking-widest text-white/80 transition-all duration-300 hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-white"
            >
              문의하기
            </Link>
          </div>
        </div>

        {isMobile && (
          <div style={{ overflow: 'hidden', maxHeight: menuOpen ? '500px' : '0', transition: 'max-height 0.3s ease' }}>
            <nav className="flex flex-col border-t border-white/[0.06] bg-[#080808] px-6 py-4 gap-1">
              {nav.map(item =>
                item.children ? (
                  <div key={item.to}>
                    <button
                      onClick={() => setMobileLabOpen(v => !v)}
                      className={`w-full flex items-center justify-between py-3 text-[11px] font-semibold tracking-[0.18em] transition-colors ${
                        location.pathname.startsWith('/lab') ? 'text-white' : 'text-white/40'
                      }`}
                    >
                      {item.label}
                      <svg
                        className={`w-2.5 h-2.5 opacity-40 transition-transform duration-200 ${mobileLabOpen ? 'rotate-180' : ''}`}
                        viewBox="0 0 10 6" fill="none"
                      >
                        <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <div style={{ overflow: 'hidden', maxHeight: mobileLabOpen ? '200px' : '0', transition: 'max-height 0.25s ease' }}>
                      <div className="flex flex-col gap-0.5 pl-3 pb-2 border-l border-white/[0.06] ml-1">
                        {item.children.map(child => (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            onClick={() => { setMenuOpen(false); setMobileLabOpen(false); window.scrollTo({ top: 0, behavior: 'instant' }) }}
                            className={({ isActive }) =>
                              `py-2 text-[11px] tracking-wider transition-colors ${
                                isActive ? 'text-white' : 'text-white/30 hover:text-white/60'
                              }`
                            }
                          >
                            {child.label}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => { setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'instant' }) }}
                    className={({ isActive }) =>
                      `py-3 text-[11px] font-semibold tracking-[0.18em] transition-colors ${
                        isActive ? 'text-white' : 'text-white/40'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                )
              )}
              <Link
                to="/contact"
                onClick={() => { setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'instant' }) }}
                className="mt-3 rounded-full border border-white/15 px-5 py-3 text-center text-[11px] font-semibold tracking-widest text-white/70"
              >
                문의하기
              </Link>
            </nav>
          </div>
        )}
      </header>
    )
}