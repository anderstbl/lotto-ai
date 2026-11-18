import { Suspense } from 'react'
import { getLatestWinningDraw } from '@/lib/queries'
import type { Metadata } from 'next'
import LottoSimulator from '@/components/LottoSimulator'

export const metadata: Metadata = {
  title: 'Lotto-simulator — Jagten på 7 rigtige | LottoAI',
  description: 'Prøv 10 rækker ad gangen mod de seneste vindertal. En kupon koster 100 fiktive kroner. Se dine træffere, den fiktive regning og hvor svært det er at ramme 7 af 36 tal.',
}

async function Game() {
  const draw = await getLatestWinningDraw()
  return <LottoSimulator draw={draw ? { numbers: draw.numbers, draw_date: draw.draw_date } : null} />
}

export const dynamic = 'force-dynamic'

export default function SimulatorPage() {
  return <Suspense fallback={<p className="card p-5 sim-muted" role="status">Henter de seneste vindertal…</p>}>
    <Game />
  </Suspense>
}
