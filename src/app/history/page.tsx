import Link from 'next/link'
import { getPredictionRuns } from '@/lib/queries'

export const dynamic = 'force-dynamic'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('da-DK', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function HistoryPage() {
  const runs = await getPredictionRuns(30)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">📅</span>
          <h1 className="text-xl font-black tracking-tight">Historik</h1>
        </div>
        <p style={{ color: 'var(--text-muted)' }} className="text-sm">
          Tidligere prediction runs — klik for at se rækker.
        </p>
      </div>

      {runs.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📭</div>
          <p style={{ color: 'var(--text-muted)' }}>Ingen historik endnu.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {runs.map((run, i) => (
            <Link
              key={run.id}
              href={`/history/${run.id}`}
              className="card p-4 flex items-center justify-between gap-3 group"
              style={{ textDecoration: 'none' }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: i === 0 ? 'var(--gold)' : '#2a2a3a',
                    color: i === 0 ? '#0d0d14' : 'var(--text-muted)',
                  }}
                >
                  {i === 0 ? '★' : i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold">
                    {formatDate(run.created_at)}
                    {i === 0 && (
                      <span
                        className="ml-2 text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: 'rgba(245,197,24,0.15)', color: 'var(--gold)' }}
                      >
                        Seneste
                      </span>
                    )}
                  </p>
                  {run.model_version && (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {run.model_version}
                    </p>
                  )}
                  {run.notes && (
                    <p className="text-xs mt-0.5 opacity-70" style={{ color: 'var(--text-muted)' }}>
                      {run.notes}
                    </p>
                  )}
                </div>
              </div>
              <span style={{ color: 'var(--text-muted)' }} className="text-sm group-hover:text-white transition-colors">
                →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
