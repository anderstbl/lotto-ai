import { getLatestPredictionRun, getPredictionsForRun } from '@/lib/queries'
import HeroCard from '@/components/HeroCard'
import PredictionCard from '@/components/PredictionCard'
import Link from 'next/link'
import type { Prediction } from '@/types'

export const dynamic = 'force-dynamic'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('da-DK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function HomePage() {
  const run = await getLatestPredictionRun()

  const simulatorLink = (
    <Link href="/simulator" className="card block p-5 text-left hover:border-yellow-500 transition-colors">
      <p className="font-bold" style={{ color: 'var(--gold)' }}>🎲 Jagten på 7 rigtige →</p>
      <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Prøv dine lykketal i simulatoren, og se hvor stor den fiktive regning bliver.</p>
    </Link>
  )

  if (!run) {
    return (
      <div className="text-center py-24">
        <div className="text-5xl mb-4">🎱</div>
        <h1 className="text-2xl font-bold mb-2">Ingen rækker endnu</h1>
        <p style={{ color: 'var(--text-muted)' }} className="text-sm">
          Backend har ikke genereret nogle rækker endnu. Prøv igen snart.
        </p>
        <div className="max-w-xl mx-auto mt-6">{simulatorLink}</div>
      </div>
    )
  }

  const predictions: Prediction[] = await getPredictionsForRun(run.id)
  const hero = predictions[0] ?? null
  const rest = predictions.slice(1)

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🎯</span>
          <h1 className="text-xl font-black tracking-tight">Ugens Lotto Rækker</h1>
        </div>
        <p style={{ color: 'var(--text-muted)' }} className="text-sm">
          Genereret {formatDate(run.created_at)}
          {run.model_version && (
            <span className="ml-2 text-xs opacity-60">· {run.model_version}</span>
          )}
        </p>
        {run.notes && (
          <p
            className="mt-2 text-sm rounded-lg px-3 py-2 inline-block"
            style={{ background: '#1e1e2a', color: '#9090b0', border: '1px solid #2a2a3a' }}
          >
            {run.notes}
          </p>
        )}
      </div>

      {/* Hero card */}
      {hero ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>
            Primær anbefaling
          </p>
          <HeroCard prediction={hero} />
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)' }}>Ingen rækker fundet for dette run.</p>
      )}

      {/* Rest of predictions */}
      {rest.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            Alternative rækker ({rest.length})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rest.map((p, i) => (
              <PredictionCard key={p.id} prediction={p} index={i} />
            ))}
          </div>
        </div>
      )}

      {simulatorLink}

      {/* Footer note */}
      <div
        className="rounded-xl p-4 text-xs"
        style={{
          background: '#16161f',
          border: '1px solid #2a2a3a',
          color: 'var(--text-muted)',
        }}
      >
        <span className="font-semibold" style={{ color: '#888899' }}>Husk:</span>{' '}
        Lotto er et tilfældighedsspil. AI kan finde mønstre, men ikke fremtiden. Spil ansvarligt — og spil kun for sjov.
        Odds for jackpot: 1 : 8.347.680. Men hey, nogen vinder jo! 🤞
      </div>
    </div>
  )
}
