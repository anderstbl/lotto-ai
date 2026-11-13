import type { Prediction } from '@/types'
import { numberStats, strategyInfo } from '@/lib/presentation'
import LottoBall from './LottoBall'

export default function HeroCard({ prediction }: { prediction: Prediction }) {
  const stats = numberStats(prediction.numbers)
  return (
    <article className="hero-panel reveal">
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <span className="best-pick-badge">Bedste bud</span>
          <span className="rank-badge rank-featured">Rank #{prediction.rank}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">{prediction.label}</h2>
        <p className="muted text-sm mt-2">{strategyInfo(prediction).label} · Første forslag i kørslens rækkefølge.</p>
        <div className="number-row hero-numbers" aria-label="Rækkens tal">
          {[...prediction.numbers].sort((a, b) => a - b).map(n => <LottoBall key={n} number={n} size="lg" />)}
        </div>
        <div className="hero-stats mono">
          <span><small>SUM</small>{stats.sum}</span>
          <span><small>LIGE / ULIGE</small>{stats.even} / {stats.odd}</span>
        </div>
      </div>
    </article>
  )
}
