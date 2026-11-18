import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: 'LottoAI — Ugens anbefaling, beregninger og statistik',
  description: '10 Lotto-rækker hver uge med statistiske metoder: beregninger på historiske trækninger, frekvensvægtning, fordeling på talintervaller og tilfældig udvælgelse.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="da"><body><a href="#main" className="skip-link">Gå til indhold</a><Nav /><main id="main" className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">{children}</main>
    <footer className="site-footer"><div><span className="eyebrow accent">Om forslagene & ansvarligt spil</span><p>Alle gyldige Lotto-rækker har samme vinderchance ved en fair trækning. Statistik beskriver historikken og ændrer ikke den sandsynlighed. Forslagene er til inspiration og underholdning. Spil ansvarligt og kun for et beløb, du har råd til at tabe.</p><span className="mono footer-signature">LOTTOAI / STATISTIK & TALRÆKKER</span></div></footer>
  </body></html>
}
