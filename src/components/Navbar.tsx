import { useState } from 'react'
import { GitHubIcon, Logo, MenuIcon, MoonIcon, SunIcon } from './Logo'

const LINKS = [
  { label: 'Tools', href: '#text-lab' },
  { label: 'Fonts', href: '#fonts' },
  { label: 'Documentation', href: '#docs' },
]

export function Navbar({ theme, onToggleTheme }: { theme: 'dark' | 'light'; onToggleTheme: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{ borderColor: 'var(--border)', background: 'color-mix(in srgb, var(--bg) 82%, transparent)' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center gap-3">
        <a href="#top" className="flex items-center gap-2.5 mr-2">
          <Logo size={26} />
          <span className="font-extrabold tracking-tight text-[15px]">
            RTL<span className="text-acc">Forge</span>
          </span>
        </a>
        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="nav-link">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            className="nav-link flex items-center gap-1.5"
            aria-label="GitHub"
          >
            <GitHubIcon />
            <span className="hidden sm:inline text-xs mono">GitHub</span>
          </a>
          <button className="nav-link" onClick={onToggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <button className="nav-link md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            <MenuIcon />
          </button>
        </div>
      </div>
      {open && (
        <nav className="md:hidden border-t px-4 py-3 flex flex-col gap-1" style={{ borderColor: 'var(--border)' }}>
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="nav-link" onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
