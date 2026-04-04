import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: 'LottoAI — Intelligente Lotto Rækker',
  description: 'Ugentlige lotto anbefalinger baseret på AI og historiske data',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body>
        <Nav />
        <main className="max-w-5xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer
          style={{ borderTop: '1px solid #2a2a3a', color: 'var(--text-muted)' }}
          className="text-center py-6 text-xs mt-12"
        >
          LottoAI er til underholdning og inspiration — vi lover intet, garanterer intet, og vinder muligvis alligevel. 🎱
        </footer>
      </body>
    </html>
  )
}
