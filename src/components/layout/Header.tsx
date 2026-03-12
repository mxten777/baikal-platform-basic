import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'

const nav = [
  { to: '/projects', label: 'PROJECTS' },
  { to: '/lab/articles', label: 'LAB' },
  { to: '/content', label: 'CONTENTS' },
  { to: '/media', label: 'MEDIA' },
  { to: '/about', label: 'ABOUT' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(max-width: 767px)').matches
      : false
  )

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    setIsMobile(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <header
        className={`fixed top-0 left-0 right-0 z-[200] transition-all duration-500 ${
          scrolled
            ? 'bg-[#080808] border-b border-white/[0.06]'
            : 'bg-gradient-to-b from-black/60 to-transparent md:bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center" style={{ position: 'relative' }}>
            <img
              src="/images/baikal_logo_white.png"
              alt="BAIKAL SYSTEMS"
              className="h-9 w-auto object-contain"
            />
            {/* 디버그: 로고 표시 확인 */}
            <span style={{
              position: 'absolute',
              bottom: '-20px',
              left: '0',
              fontSize: '10px',
              color: '#0f0',
              fontFamily: 'monospace',
              background: '#000',
              padding: '2px 4px',
              borderRadius: '3px',
            }}>LOGO</span>
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
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="flex md:hidden items-center justify-center"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: '#ff0000',  // 빨간색으로 변경 (디버그)
                border: '3px solid #00ff00',  // 초록 테두리 (디버그)
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                position: 'relative',
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
              {/* 디버그 텍스트 */}
              <span style={{
                position: 'absolute',
                bottom: '-20px',
                right: '0',
                fontSize: '10px',
                color: '#0f0',
                fontFamily: 'monospace',
                background: '#000',
                padding: '2px 4px',
                borderRadius: '3px',
                whiteSpace: 'nowrap',
              }}>BTN</span>
            </button>
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