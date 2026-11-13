import type { Prediction } from '@/types'
import { numberStats, predictionLabel } from '@/lib/presentation'
import LottoBall from './LottoBall'

export default function PredictionCard({ prediction, index }: { prediction: Prediction; index: number }) {
  const stats = numberStats(prediction.numbers)
  return (
    <article className="card prediction-card reveal" style={{ animationDelay: `${Math.min(index, 6) * 45}ms` }}>
      <div className="prediction-heading">
        <h3>{predictionLabel(prediction)}</h3>
        <span className="rank-badge">Rank #{prediction.rank}</span>
      </div>
      <div className="number-row" aria-label="Rækkens tal">
        {[...prediction.numbers].sort((a, b) => a - b).map(n => <LottoBall key={n} number={n} />)}
      </div>
      <div className="row-stats mono"><span>Σ {stats.sum}</span><span>{stats.even} lige / {stats.odd} ulige</span></div>
    </article>
  )
}
