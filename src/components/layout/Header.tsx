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
  const [dbg, setDbg] = useState({ iw: 0, ow: 0, dpr: 1, mq: false, btnRect: null as DOMRect | null })

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

  useEffect(() => {
    const update = () => {
      const mq = window.matchMedia('(max-width: 767px)')
      const btn = document.getElementById('__hamburger_btn__')
      setDbg({
        iw: window.innerWidth,
        ow: window.outerWidth,
        dpr: window.devicePixelRatio,
        mq: mq.matches,
        btnRect: btn ? btn.getBoundingClientRect() : null,
      })
    }
    update()
    const t = setInterval(update, 500)
    return () => clearInterval(t)
  }, [])

  return (
    <>
      {/* 🔴 DEBUG */}
      <div style={{
        position:'fixed', bottom:8, left:8, zIndex:9999,
        background:'rgba(0,0,0,0.9)', color:'#0f0', fontFamily:'monospace',
        fontSize:10, padding:'6px 10px', borderRadius:6, lineHeight:1.8,
        pointerEvents:'none', whiteSpace:'nowrap'
      }}>
        <div>isMobile: <b style={{color: isMobile?'#0f0':'#f00'}}>{String(isMobile)}</b></div>
        <div>mq(≤767): <b style={{color: dbg.mq?'#0f0':'#f00'}}>{String(dbg.mq)}</b></div>
        <div>innerW: <b>{dbg.iw}</b> | outerW: <b>{dbg.ow}</b></div>
        <div>DPR: <b>{dbg.dpr}</b></div>
        <div>btn rendered: <b style={{color: isMobile?'#0f0':'#f00'}}>{isMobile ? 'YES' : 'NO'}</b></div>
        {dbg.btnRect && <div>btn rect: <b>{Math.round(dbg.btnRect.left)},{Math.round(dbg.btnRect.top)} {Math.round(dbg.btnRect.width)}x{Math.round(dbg.btnRect.height)}</b></div>}
        {dbg.btnRect && <div>btn visible: <b style={{color:(dbg.btnRect.right<=dbg.iw&&dbg.btnRect.bottom<=window.innerHeight)?'#0f0':'#f00'}}>{dbg.btnRect.right<=dbg.iw&&dbg.btnRect.bottom<=window.innerHeight?'YES':'CLIPPED'}</b></div>}
      </div>
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

      {/* 햄버거 버튼 — header 바깥에 위치 (backdrop-filter 영향 차단) */}
      {isMobile && (
        <button
          id="__hamburger_btn__"
          onClick={() => setMenuOpen(v => !v)}
          style={{
            position: 'fixed',
            top: '10px',
            right: '12px',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '10px',
            background: 'rgba(20,20,20,0.92)',
            border: '1px solid rgba(255,255,255,0.18)',
            color: '#ffffff',
            fontSize: '20px',
            zIndex: 300,
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
          aria-label="메뉴"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      )}
    </>
  )
}
