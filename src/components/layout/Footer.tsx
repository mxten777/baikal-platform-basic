import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative border-t border-white/[0.06] bg-[#080808]">
      {/* 상단 accent glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-1/3 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* 메인 영역 */}
        <div className="grid grid-cols-1 gap-12 py-16 md:grid-cols-12">

          {/* 브랜드 */}
          <div className="md:col-span-5">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-md bg-blue-500 flex items-center justify-center">
                <span className="text-sm font-black text-white">B</span>
              </div>
              <span className="text-sm font-bold tracking-widest text-white">BAIKAL SYSTEMS</span>
            </Link>
            <p className="text-sm leading-relaxed text-white/35 max-w-xs">
              AI 소프트웨어 개발 회사.<br />
              MVP부터 프로덕션까지,<br />
              AI의 가능성을 현실로 만듭니다.
            </p>
            {/* SNS */}
            <div className="mt-8 flex gap-4">
              {[
                { href: 'https://x.com/baikalsys', label: 'X' },
                { href: 'https://www.youtube.com/@baikalsys', label: 'YT' },
                { href: 'https://www.instagram.com/baikalsys', label: 'IG' },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[10px] font-bold tracking-wider text-white/30 transition-all duration-300 hover:border-blue-500/40 hover:text-blue-400"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* 링크 */}
          <div className="grid grid-cols-3 gap-8 md:col-span-7">
            <div>
              <p className="mb-4 text-[10px] font-semibold tracking-[0.2em] text-white/25 uppercase">Platform</p>
              <ul className="space-y-3">
                {[
                  { to: '/projects', label: 'AI 프로젝트' },
                  { to: '/lab/articles', label: 'BAIKAL Lab' },
                  { to: '/content', label: '콘텐츠 허브' },
                  { to: '/media', label: '미디어' },
                  { to: '/topics', label: '토픽' },
                ].map(l => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-sm text-white/35 transition-colors duration-200 hover:text-white/80"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-4 text-[10px] font-semibold tracking-[0.2em] text-white/25 uppercase">Company</p>
              <ul className="space-y-3">
                {[
                  { to: '/about', label: '회사 소개' },
                  { to: '/services', label: '서비스' },
                  { to: '/contact', label: '프로젝트 문의' },
                ].map(l => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-sm text-white/35 transition-colors duration-200 hover:text-white/80"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-4 text-[10px] font-semibold tracking-[0.2em] text-white/25 uppercase">Contact</p>
              <ul className="space-y-3">
                <li>
                  <a
                    href="mailto:hello@baikalsys.kr"
                    className="text-sm text-white/35 transition-colors duration-200 hover:text-white/80"
                  >
                    hello@baikalsys.kr
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.baikalsys.kr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/35 transition-colors duration-200 hover:text-white/80"
                  >
                    www.baikalsys.kr
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 하단 바 */}
        <div className="flex flex-col items-start justify-between gap-4 border-t border-white/[0.05] py-6 sm:flex-row sm:items-center">
          <p className="text-[11px] text-white/20">
            © {year} 바이칼시스템즈. All rights reserved.
          </p>
          <p className="text-[11px] text-white/15 tracking-widest uppercase">
            AI Software Development Company
          </p>
        </div>
      </div>
    </footer>
  )
}
