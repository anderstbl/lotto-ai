import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPredictionRunById, getPredictionsForRun } from '@/lib/queries'
import HeroCard from '@/components/HeroCard'
import PredictionCard from '@/components/PredictionCard'
import type { Prediction } from '@/types'

export const dynamic = 'force-dynamic'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('da-DK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function RunDetailPage({ params }: Props) {
  const { id } = await params
  const run = await getPredictionRunById(id)
  if (!run) notFound()

  const predictions: Prediction[] = await getPredictionsForRun(run.id)
  const hero = predictions[0] ?? null
  const rest = predictions.slice(1)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/history"
          className="text-xs flex items-center gap-1 mb-4"
          style={{ color: 'var(--text-muted)' }}
        >
          ← Tilbage til historik
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">📋</span>
          <h1 className="text-xl font-black tracking-tight">Prediction Run</h1>
        </div>
        <p style={{ color: 'var(--text-muted)' }} className="text-sm">
          {formatDate(run.created_at)}
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

      {hero ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>
            Primær anbefaling
          </p>
          <HeroCard prediction={hero} />
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)' }}>Ingen rækker fundet.</p>
      )}

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
    </div>
  )
}
