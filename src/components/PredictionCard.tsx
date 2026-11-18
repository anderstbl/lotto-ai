import type { Prediction } from '@/types'
import { numberStats, predictionLabel, strategyInfo } from '@/lib/presentation'
import LottoBall from './LottoBall'
import ProfileScore, { scoreLabel } from './ProfileScore'

export default function PredictionCard({ prediction, index, isRanked = false }: { prediction: Prediction; index: number; isRanked?: boolean }) {
  const stats = numberStats(prediction.numbers)
  return (
    <article className="card prediction-card reveal" style={{ animationDelay: `${Math.min(index, 6) * 45}ms` }}>
      <div className="prediction-heading">
        <h3>{predictionLabel(prediction)}</h3>
        <span className="rank-badge">{isRanked ? 'Rank' : 'Visning'} #{prediction.rank}</span>
      </div>
      {isRanked && <div className="card-score-line"><span>{strategyInfo(prediction).label}</span><span>Fordelingsscore <strong>{scoreLabel(prediction.distribution_score!)} <small>/ 100</small></strong></span></div>}
      <div className="number-row" aria-label="Rækkens tal">
        {[...prediction.numbers].sort((a, b) => a - b).map(n => <LottoBall key={n} number={n} />)}
      </div>
      <div className="row-stats mono"><span>Σ {stats.sum}</span><span>{stats.even} lige / {stats.odd} ulige</span></div>
      {isRanked && <ProfileScore prediction={prediction} />}
    </article>
  )
}
