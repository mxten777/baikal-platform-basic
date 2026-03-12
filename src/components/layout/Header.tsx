import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
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

  const hamburgerBtn = isMobile ? createPortal(
    <button
      onClick={() => setMenuOpen(v => !v)}
      style={{
        position: 'fixed',
        top: '10px',
        right: '16px',
        width: '44px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '10px',
        background: 'rgba(20,20,20,0.92)',
        border: '1px solid rgba(255,255,255,0.18)',
        color: '#ffffff',
        zIndex: 300,
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        // Samsung Internet compositing GC 버그 대응:
        // 미세 무한 애니메이션으로 레이어를 영구 활성 상태로 유지
        animation: 'samsung-layer-fix 1s linear infinite',
      }}
      aria-label="메뉴"
    >
      {menuOpen ? (
        <svg width="18" height="18" viewBox="0 0 18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <line x1="2" y1="2" x2="16" y2="16"/>
          <line x1="16" y1="2" x2="2" y2="16"/>
        </svg>
      ) : (
        <svg width="20" height="15" viewBox="0 0 20 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <line x1="0" y1="1" x2="20" y2="1"/>
          <line x1="0" y1="7.5" x2="20" y2="7.5"/>
          <line x1="0" y1="14" x2="20" y2="14"/>
        </svg>
      )}
    </button>,
    document.body
  ) : null

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[200] transition-all duration-500 ${
          scrolled
            ? 'bg-[#080808]/90 backdrop-blur-xl border-b border-white/[0.06]'
            : 'bg-gradient-to-b from-black/40 to-transparent md:bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link to="/" className="group flex items-center">
            <img
              src="/images/baikal_logo_white.png"
              alt="BAIKAL SYSTEMS"
              className="h-9 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav */}
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

          {/* Desktop CTA */}
          <div className="flex items-center gap-4">
            <Link
              to="/contact"
              className="hidden md:flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-[11px] font-semibold tracking-widest text-white/80 transition-all duration-300 hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-white"
            >
              문의하기
            </Link>
          </div>
        </div>

        {/* Mobile Nav — header 안에 있어야 슬라이드 자연스러움 */}
        {isMobile && (
          <div style={{ overflow: 'hidden', maxHeight: menuOpen ? '400px' : '0', transition: 'max-height 0.3s ease' }}>
            <nav className="flex flex-col border-t border-white/[0.06] bg-[#080808]/95 backdrop-blur-xl px-6 py-4 gap-1">
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

      {/* 햄버거 버튼 — createPortal로 document.body에 직접 마운트 */}
      {hamburgerBtn}
    </>
  )
}
