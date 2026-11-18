import type { Prediction } from '@/types'
import { numberStats, predictionLabel, strategyInfo } from '@/lib/presentation'
import LottoBall from './LottoBall'
import ProfileScore, { scoreLabel } from './ProfileScore'

export default function HeroCard({ prediction, isRanked = false }: { prediction: Prediction; isRanked?: boolean }) {
  const stats = numberStats(prediction.numbers)
  return (
    <article className="hero-panel reveal">
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <span className="best-pick-badge">{isRanked ? 'Bedste bud' : 'Fremhævet række'}</span>
          <span className="rank-badge rank-featured">{isRanked ? 'Rank' : 'Visning'} #{prediction.rank}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">{predictionLabel(prediction)}</h2>
        <p className="muted text-sm mt-2">{isRanked ? 'Højeste fordelingsscore blandt de 10 forslag.' : `${strategyInfo(prediction).label} · Første forslag i kørslens visningsrækkefølge.`}</p>
        <div className="number-row hero-numbers" aria-label="Rækkens tal">
          {[...prediction.numbers].sort((a, b) => a - b).map(n => <LottoBall key={n} number={n} size="lg" />)}
        </div>
        <div className="hero-stats mono">
          {isRanked && <span className="featured-score"><small>FORDELINGSSCORE</small><span className="score-value">{scoreLabel(prediction.distribution_score!)} <em>/ 100</em></span></span>}
          <span><small>SUM</small>{stats.sum}</span>
          <span><small>LIGE / ULIGE</small>{stats.even} / {stats.odd}</span>
        </div>
        {isRanked && <ProfileScore prediction={prediction} />}
      </div>
    </article>
  )
}
