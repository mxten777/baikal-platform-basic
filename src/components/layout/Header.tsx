import { useState, useEffect, useRef } from 'react'
import { Link, NavLink } from 'react-router-dom'

const nav = [
  { to: '/projects', label: 'PROJECTS' },
  { to: '/lab/articles', label: 'LAB' },
  { to: '/content', label: 'CONTENTS' },
  { to: '/media', label: 'MEDIA' },
  { to: '/about', label: 'ABOUT' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(max-width: 767px)').matches
      : false
  )
  const headerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    setIsMobile(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Samsung Internet 강제 고정
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
        if (rect.top !== 10) {
          buttonRef.current.style.top = '10px'
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
        className="fixed top-0 left-0 right-0 z-[9999] border-b border-white/[0.06]"
        style={{
          background: '#080808',
        }}
      >
        {/* 햄버거 버튼 - 항상 렌더링, CSS로 데스크탑 숨김 */}
        <div
          ref={buttonRef}
          onClick={() => setMenuOpen(v => !v)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setMenuOpen(v => !v)}
          className="hamburger-menu-btn"
          style={{
            position: 'fixed',
            top: '10px',
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
            {nav.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative text-[11px] font-semibold tracking-[0.18em] transition-colors duration-200 hover-underline ${
                    isActive ? 'text-white' : 'text-white/40 hover:text-white/80'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
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
          <div style={{ overflow: 'hidden', maxHeight: menuOpen ? '400px' : '0', transition: 'max-height 0.3s ease' }}>
            <nav className="flex flex-col border-t border-white/[0.06] bg-[#080808] px-6 py-4 gap-1">
              {nav.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `py-3 text-[11px] font-semibold tracking-[0.18em] transition-colors ${
                      isActive ? 'text-white' : 'text-white/40'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <Link
                to="/contact"
                onClick={() => setMenuOpen(false)}
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