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
        className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-500 ${
          scrolled
            ? 'bg-[#080808] border-b border-white/[0.06]'
            : 'bg-gradient-to-b from-black/60 to-transparent md:bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* 디버깅: isMobile 상태 표시 */}
          <div style={{
            position: 'absolute',
            top: '-25px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#000',
            color: '#0f0',
            fontSize: '12px',
            fontFamily: 'monospace',
            padding: '4px 8px',
            borderRadius: '4px',
            zIndex: 999999,
          }}>
            isMobile={isMobile ? 'true' : 'false'} | w={typeof window !== 'undefined' ? window.innerWidth : 0}
          </div>

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
            {/* 햄버거 버튼 - 항상 렌더링, CSS에서만 숨김 */}
            <div
              onClick={() => setMenuOpen(v => !v)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setMenuOpen(v => !v)}
              className="debug-hamburger-btn"
              style={{
                position: 'relative',
                width: '80px',
                height: '60px',
                borderRadius: '10px',
                background: '#ff0000',
                border: '5px solid #00ff00',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                display: 'flex !important',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                zIndex: 99999,
                opacity: 1,
                visibility: 'visible',
                pointerEvents: 'auto',
                transform: 'translateZ(0)',
                WebkitTransform: 'translateZ(0)',
                backfaceVisibility: 'visible',
                WebkitBackfaceVisibility: 'visible',
                perspective: '1000px',
                WebkitPerspective: '1000px',
              }}
              aria-label="메뉴"
            >
              <span style={{ 
                fontSize: '14px', 
                fontWeight: 'bold', 
                color: '#fff', 
                position: 'relative', 
                zIndex: 1,
                textAlign: 'center',
                lineHeight: 1.2,
              }}>
                {menuOpen ? '✕' : '☰'}<br/>BTN
              </span>
            </div>
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