import { Logo } from './Logo'

export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center gap-6">
        <div className="flex items-center gap-3">
          <Logo size={22} />
          <div>
            <div className="font-extrabold tracking-tight text-sm">
              RTL<span className="text-acc">Forge</span>
            </div>
            <div className="text-xs text-muted">Arabic tools for game developers.</div>
          </div>
        </div>

        <nav className="flex items-center gap-1 sm:ml-auto">
          <a className="nav-link" href="#text-lab">
            Tools
          </a>
          <a className="nav-link" href="#fonts">
            Fonts
          </a>
          <a className="nav-link" href="#docs">
            Documentation
          </a>
          <a className="nav-link" href="https://github.com/" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </nav>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-8">
        <p className="text-xs text-muted text-center sm:text-left">
          © 2026 RTL Forge · Community prototype · Not affiliated with Unity Technologies · Everything runs in your
          browser.
        </p>
      </div>
    </footer>
  )
}
