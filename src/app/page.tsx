import Link from 'next/link'
import { getLatestPredictionRun, getPredictionsForRun } from '@/lib/queries'
import PredictionResults from '@/components/PredictionResults'
import RunStatus from '@/components/RunStatus'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const run = await getLatestPredictionRun()
  const predictions = run ? await getPredictionsForRun(run.id) : []
  return <div className="space-y-9">
    <section className="intro">
      <div>
        <h1 className="recommendation-title">
          <svg className="target-icon" aria-hidden="true" width="44" height="44" viewBox="0 0 48 48" fill="none">
            <circle cx="21" cy="27" r="18" fill="#ff667b" />
            <circle cx="21" cy="27" r="12" fill="#fff1e8" />
            <circle cx="21" cy="27" r="6" fill="#ff667b" />
            <path d="M21 27 37 11" stroke="#ffda68" strokeWidth="3" strokeLinecap="round" />
            <path d="m34 5 1 8 8 1-1-8-8-1Z" fill="#8edcff" />
          </svg>
          <span>Ugens Lotto-anbefaling</span>
        </h1>
        <p className="intro-copy">Bedste bud og alternative rækker fra seneste beregning.</p>
      </div>
      <Link href="/backtests" className="outline-link">Udforsk modellen <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 18 18 6M6 6h12v12" /></svg></Link>
    </section>
    {run ? <>
      <RunStatus run={run} count={predictions.length} />
      <PredictionResults predictions={predictions} />
      {run.notes && <details className="method-details"><summary>Datagrundlag & kørselsnoter <span aria-hidden="true">＋</span></summary><p className="muted text-sm leading-relaxed pt-4">{run.notes}</p></details>}
    </> : <section className="card empty-state"><span className="eyebrow accent">Ingen kørsel tilgængelig</span><h2>Laboratoriet afventer data</h2><p>Der er ingen beregninger at vise lige nu. Prøv igen senere.</p></section>}
  </div>
}
