import type { Prediction, PredictionRun } from '@/types'
import { strategyInfo } from '@/lib/presentation'
import HeroCard from './HeroCard'
import RunStatus from './RunStatus'
import PredictionCard from './PredictionCard'
import SelectionMethod from './SelectionMethod'

export default function PredictionResults({ predictions, run }: { predictions: Prediction[]; run: PredictionRun }) {
  const groups = new Map<string, Prediction[]>()
  for (const prediction of predictions) {
    const key = prediction.strategy_type ?? ''
    groups.set(key, [...(groups.get(key) ?? []), prediction])
  }
  return (
    <>
      <div className="space-y-3">
      {predictions[0] ? <HeroCard prediction={predictions[0]} /> : <div className="card empty-state"><h2>Afventer rækker</h2><p>Kørslen er registreret, men har endnu ingen gemte rækker.</p></div>}
        <RunStatus run={run} count={predictions.length} />
      </div>
      {predictions.length > 0 && <section id="rows" className="space-y-7">
        <div className="section-heading"><div><p className="eyebrow muted">Udforsk resultatet</p><h2>Alle rækker</h2></div><span className="mono muted">{predictions.length} i alt</span></div>
        <p className="muted text-sm -mt-3">Grupperet efter metode. Rank viser kørslens rækkefølge, ikke højere vinderchance.</p>
        {[...groups].map(([key, rows], index) => {
          const info = strategyInfo(rows[0])
          return <section key={key} className="strategy-group" aria-labelledby={`strategy-${index}`}>
            <div className="strategy-heading"><span className="strategy-index mono">{String(index + 1).padStart(2, '0')}</span><div><h3 id={`strategy-${index}`}>{info.label}</h3>{info.description && <p>{info.description}</p>}</div><span className="mono muted ml-auto shrink-0">{rows.length} stk.</span></div>
            <SelectionMethod details={rows[0].selection_details} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{rows.map((p, i) => <PredictionCard key={p.id} prediction={p} index={i} />)}</div>
          </section>
        })}
      </section>}
      {predictions.some(p => p.explanation || p.rationale) && <details className="method-details"><summary>Originale beregningsnoter <span aria-hidden="true">＋</span></summary><div className="space-y-4 pt-5">{[...groups].map(([key, rows]) => <div key={key}><h3 className="font-semibold text-sm mb-2">{strategyInfo(rows[0]).label}</h3>{[...new Set(rows.flatMap(p => [p.explanation, p.rationale]).filter(Boolean))].map(text => <p key={text} className="text-sm muted leading-relaxed mb-2">{text}</p>)}</div>)}</div></details>}
    </>
  )
}
