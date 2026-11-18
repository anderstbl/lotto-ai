'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Ugens Rækker', emoji: '🎯' },
  { href: '/simulator', label: 'Simulator', emoji: '🎲' },
  { href: '/history', label: 'Historik', emoji: '📅' },
  { href: '/draws', label: 'Trækninger', emoji: '🎱' },
  { href: '/backtests', label: 'Model', emoji: '🔬' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <header
      style={{ background: 'rgba(13,13,20,0.92)', borderBottom: '1px solid #2a2a3a' }}
      className="sticky top-0 z-50 backdrop-blur-md"
    >
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
          <Link href="/" className="flex items-center gap-2 font-black text-lg tracking-tight">
            <span className="float-anim inline-block">🍀</span>
            <span className="shimmer-text">LottoAI</span>
          </Link>

          <nav aria-label="Hovednavigation" className="flex items-center gap-1 overflow-x-auto max-w-full">
            {links.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  aria-current={active ? 'page' : undefined}
                  href={link.href}
                  style={{
                    color: active ? 'var(--gold)' : 'var(--text-muted)',
                    borderBottom: active ? '2px solid var(--gold)' : '2px solid transparent',
                    paddingBottom: '2px',
                  }}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded-md whitespace-nowrap text-sm font-medium transition-colors hover:text-white"
                >
                  <span className="hidden sm:inline">{link.emoji}</span>
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
