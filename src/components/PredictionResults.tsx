import type { Prediction, PredictionRun, RunDistribution } from '@/types'
import { strategyInfo } from '@/lib/presentation'
import { getRunRanking } from '@/lib/ranking'
import HeroCard from './HeroCard'
import RunStatus from './RunStatus'
import PredictionCard from './PredictionCard'
import SelectionMethod from './SelectionMethod'
import RankingExplanation from './RankingExplanation'

export default function PredictionResults({ predictions, run, distribution }: { predictions: Prediction[]; run: PredictionRun; distribution: RunDistribution }) {
  const ranking = getRunRanking(run.id, predictions, distribution)
  const isRanked = ranking.status === 'ranked'
  const ordered = isRanked ? ranking.predictions : [...predictions].sort((a, b) => a.rank - b.rank)
  const groups = new Map<string, Prediction[]>()
  for (const prediction of ordered) {
    const key = prediction.strategy_type ?? ''
    groups.set(key, [...(groups.get(key) ?? []), prediction])
  }

  return (
    <>
      <div className="space-y-3">
        {ordered[0] ? <HeroCard prediction={ordered[0]} isRanked={isRanked} /> : <div className="card empty-state"><h2>Afventer rækker</h2><p>Kørslen er registreret, men har endnu ingen gemte rækker.</p></div>}
        <RunStatus run={run} count={ordered.length} />
      </div>
      {ordered.length > 0 && <section id="rows" className="space-y-7">
        <div className="section-heading"><div><p className="eyebrow muted">Udforsk resultatet</p><h2>{isRanked ? 'Alle bud — rangeret' : 'Alle rækker'}</h2></div><span className="mono muted">{ordered.length} i alt</span></div>
        {isRanked ? <>
          <p className="muted text-sm -mt-3">Sorteret efter fordelingsscore på tværs af metoder. Scoren måler profilhyppighed, ikke vinderchance.</p>
          <RankingExplanation analysis={ranking.analysis} />
          <div className="ranked-grid grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ordered.map((p, i) => <PredictionCard key={p.id} prediction={p} index={i} isRanked />)}
          </div>
          <details className="method-details ranked-methods">
            <summary>Metoder bag forslagene <span aria-hidden="true">＋</span></summary>
            <div className="space-y-6 pt-5">{[...groups].map(([key, rows]) => {
              const info = strategyInfo(rows[0])
              return <section key={key}><h3 className="text-sm font-semibold">{info.label} <span className="muted font-normal">· {rows.length} rækker</span></h3><p className="text-xs muted leading-relaxed mt-2 mb-4">{info.description}</p><SelectionMethod details={rows[0].selection_details} /></section>
            })}</div>
          </details>
        </> : <>
          <p className="muted text-sm -mt-3">{ranking.status === 'legacy'
            ? 'Denne kørsel har ingen gemt scorerangering. Numrene viser kun visningsrækkefølge, og rækkerne er grupperet efter metode.'
            : 'Den gemte scorerangering kunne ikke verificeres. Forslagene vises i gemt rækkefølge uden fordelingsscore.'}</p>
          {[...groups].map(([key, rows], index) => {
            const info = strategyInfo(rows[0])
            return <section key={key} className="strategy-group" aria-labelledby={`strategy-${index}`}>
              <div className="strategy-heading"><span className="strategy-index mono">{String(index + 1).padStart(2, '0')}</span><div><h3 id={`strategy-${index}`}>{info.label}</h3>{info.description && <p>{info.description}</p>}</div><span className="mono muted ml-auto shrink-0">{rows.length} stk.</span></div>
              <SelectionMethod details={rows[0].selection_details} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{rows.map((p, i) => <PredictionCard key={p.id} prediction={p} index={i} />)}</div>
            </section>
          })}
        </>}
      </section>}
      {ordered.some(p => p.explanation || p.rationale) && <details className="method-details"><summary>Originale beregningsnoter <span aria-hidden="true">＋</span></summary><div className="space-y-4 pt-5">{[...groups].map(([key, rows]) => <div key={key}><h3 className="font-semibold text-sm mb-2">{strategyInfo(rows[0]).label}</h3>{[...new Set(rows.flatMap(p => [p.explanation, p.rationale]).filter(Boolean))].map(text => <p key={text} className="text-sm muted leading-relaxed mb-2">{text}</p>)}</div>)}</div></details>}
    </>
  )
}
