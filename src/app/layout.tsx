import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: 'LottoAI — Ugens Lotto-anbefaling',
  description: 'Et laboratorium for Lotto. Udforsk statistisk genererede talrækker, historiske data og beregningsmetoder.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="da"><body><a href="#main" className="skip-link">Gå til indhold</a><Nav /><main id="main" className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">{children}</main>
    <footer className="site-footer"><div><span className="eyebrow accent">Om forslagene & ansvarligt spil</span><p>Alle gyldige Lotto-rækker har samme vinderchance ved en fair trækning. Statistik og AI ændrer ikke på det. Forslagene er til inspiration og underholdning. Spil ansvarligt og kun for et beløb, du har råd til at tabe.</p><span className="mono footer-signature">LOTTOAI / THE NUMBER LAB</span></div></footer>
  </body></html>
}
