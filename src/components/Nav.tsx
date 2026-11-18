'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [{ href: '/', label: 'Rækker' }, { href: '/simulator', label: 'Simulator' }, { href: '/history', label: 'Historik' }, { href: '/draws', label: 'Trækninger' }, { href: '/backtests', label: 'Model' }]

export default function Nav() {
  const pathname = usePathname()
  return <header className="site-header"><div className="nav-inner">
    <Link href="/" className="brand" aria-label="LottoAI forside"><svg className="brand-symbol" aria-hidden="true" width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="18" cy="18" r="4" /><path d="M18 1v9m0 16v9M1 18h9m16 0h9M6 6l7 7m10 10 7 7M6 30l7-7m10-10 7-7" /></svg></Link>
    <nav aria-label="Hovednavigation">{links.map(link => { const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href); return <Link key={link.href} href={link.href} aria-current={active ? 'page' : undefined} className={active ? 'active' : ''}>{link.label}</Link> })}</nav>
  </div></header>
}
