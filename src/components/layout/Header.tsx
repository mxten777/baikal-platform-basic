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
  const [scrollY, setScrollY] = useState(0)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(max-width: 767px)').matches
      : false
  )

  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 40)
      setScrollY(window.scrollY)
    }
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
        style={{ position: 'fixed' }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" style={{ position: 'relative' }}>
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
          </div>

          {/* 햄버거 버튼 - 모바일에서만 렌더링 */}
          {isMobile && (
            <button
              key={Math.floor(scrollY / 50)}
              onClick={() => setMenuOpen(v => !v)}
              style={{
                position: 'fixed',
                top: '10px',
                right: '16px',
                width: '60px',
                height: '44px',
                borderRadius: '10px',
                background: '#ff0000',
                border: '3px solid #00ff00',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
              }}
              aria-label="메뉴"
            >
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>
                {menuOpen ? '✕' : '☰'}
              </span>
            </button>
          )}
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