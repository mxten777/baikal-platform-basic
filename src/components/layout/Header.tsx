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

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#080808]/90 backdrop-blur-xl border-b border-white/[0.06]'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">

        {/* Logo */}
        <Link to="/" className="group flex items-center">
          <img
            src="/images/baikal_logo_white.png"
            alt="BAIKAL SYSTEMS"
            className="h-7 w-auto object-contain"
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

        {/* CTA + mobile menu */}
        <div className="flex items-center gap-4">
          <Link
            to="/contact"
            className="hidden md:flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-[11px] font-semibold tracking-widest text-white/80 transition-all duration-300 hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-white"
          >
            문의하기
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="flex md:hidden flex-col gap-1.5 p-2"
            aria-label="메뉴"
          >
            <span className={`block h-px w-6 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block h-px w-6 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-px w-6 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-96' : 'max-h-0'}`}>
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
    </header>
  )
}
