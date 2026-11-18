import { Suspense } from 'react'
import { getPreviousWeekDraw } from '@/lib/queries'
import HistoricalJackpot from '@/components/HistoricalJackpot'
import type { Metadata } from 'next'
import LottoSimulator from '@/components/LottoSimulator'

export const metadata: Metadata = {
  title: 'Lotto-simulator — Jagten på 7 rigtige | LottoAI',
  description: 'Prøv dine lykketal i en gratis simulator. Se dine træffere, den fiktive regning og hvor svært det er at ramme 7 af 36 tal.',
}

async function HistoricalChallenge() {
  const draw = await getPreviousWeekDraw()
  return <HistoricalJackpot draw={draw ? { numbers: draw.numbers, draw_date: draw.draw_date } : null} />
}

export const dynamic = 'force-dynamic'

export default function SimulatorPage() {
  return <LottoSimulator historicalChallenge={
    <Suspense fallback={<p className="card p-5 sim-muted" role="status">Henter sidste uges vindertal…</p>}>
      <HistoricalChallenge />
    </Suspense>
  } />
}
