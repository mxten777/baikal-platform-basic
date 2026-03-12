import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink } from 'react-router-dom'

const nav = [
  { to: '/projects', label: 'PROJECTS' },
  { to: '/lab/articles', label: 'LAB' },
  { to: '/content', label: 'CONTENTS' },
  { to: '/media', label: 'MEDIA' },
  { to: '/about', label: 'ABOUT' },
]

// Samsung Internet: position:fixed 요소가 스크롤 후 compositing layer GC로 사라지는 버그.
// React 컴포넌트가 re-render될 때만 브라우저가 해당 레이어를 "활성"으로 유지한다.
// 버튼을 별도 컴포넌트로 분리 → 내부 tick state를 300ms마다 업데이트 → 강제 re-render.
function HamburgerPortalButton({ menuOpen, onToggle }: { menuOpen: boolean; onToggle: () => void }) {
  const [tick, setTick] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => setTick(t => t + 1), 300)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  return createPortal(
    <button
      onClick={onToggle}
      className="hamburger-portal-btn"
      data-tick={tick}
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
        background: '#141414',
        border: '1px solid rgba(255,255,255,0.22)',
        zIndex: 9999,
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
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
    </button>,
    document.body
  )
}

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

        {/* Mobile Nav */}
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

      {/* 햄버거 버튼 ? Samsung Internet GC 버그 대응 별도 컴포넌트 */}
      <HamburgerPortalButton menuOpen={menuOpen} onToggle={() => setMenuOpen(v => !v)} />
    </>
  )
}
