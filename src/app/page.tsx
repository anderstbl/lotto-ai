import AnalysisLink from '@/components/AnalysisLink'
import { getLatestPredictionRun, getPredictionsForRun, getDistributionForRun } from '@/lib/queries'
import PredictionResults from '@/components/PredictionResults'
import StatisticsPanel from '@/components/StatisticsPanel'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const run = await getLatestPredictionRun()
  const [predictions, distribution] = run
    ? await Promise.all([getPredictionsForRun(run.id), getDistributionForRun(run.id)])
    : [[], { status: 'missing' } as const]
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
          <span>Lotto<span className="accent">AI</span></span>
        </h1>
        <p className="intro-copy max-w-xl">
          <strong className="font-medium text-[var(--text)]">10 Lotto-rækker hver uge.</strong>{' '}
          Vi kombinerer statistiske beregninger på historiske trækninger med frekvensvægtning,
          fordeling på talintervaller og tilfældig udvælgelse.
        </p>
      </div>
      {run && <AnalysisLink />}
    </section>
    {run ? <>
      <PredictionResults predictions={predictions} run={run} />
      <StatisticsPanel run={run} distribution={distribution} />
    </> : <section className="card empty-state"><span className="eyebrow accent">Ingen kørsel tilgængelig</span><h2>Afventer beregninger</h2><p>Der er ingen beregninger at vise lige nu. Prøv igen senere.</p></section>}
  </div>
}
