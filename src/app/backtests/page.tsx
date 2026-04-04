import { getBacktests } from '@/lib/queries'

export const dynamic = 'force-dynamic'

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('da-DK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span style={{ color: 'var(--text-muted)' }}>—</span>
  const pct = Math.min(100, Math.round(score * 100))
  const color =
    pct >= 70 ? '#4ade80' :
    pct >= 40 ? 'var(--gold)' :
    '#f87171'
  return (
    <span className="font-mono font-bold text-sm" style={{ color }}>
      {score.toFixed(3)}
    </span>
  )
}

function MatchBadge({ matches }: { matches: number | null }) {
  if (matches === null) return <span style={{ color: 'var(--text-muted)' }}>—</span>
  const color =
    matches >= 5 ? '#4ade80' :
    matches >= 3 ? 'var(--gold)' :
    'var(--text-muted)'
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded-full"
      style={{
        background: `${color}22`,
        color,
        border: `1px solid ${color}44`,
      }}
    >
      {matches} match
    </span>
  )
}

export default async function BacktestsPage() {
  const backtests = await getBacktests(50)

  // Group stats by strategy
  const strategyMap = new Map<string, { count: number; totalScore: number; totalMatches: number }>()
  for (const bt of backtests) {
    const key = bt.strategy_type ?? 'unknown'
    const existing = strategyMap.get(key) ?? { count: 0, totalScore: 0, totalMatches: 0 }
    strategyMap.set(key, {
      count: existing.count + 1,
      totalScore: existing.totalScore + (bt.score ?? 0),
      totalMatches: existing.totalMatches + (bt.matches ?? 0),
    })
  }
  const strategies = [...strategyMap.entries()].sort((a, b) => b[1].totalScore - a[1].totalScore)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🔬</span>
          <h1 className="text-xl font-black tracking-tight">Model Insights</h1>
        </div>
        <p style={{ color: 'var(--text-muted)' }} className="text-sm">
          Transparens og historisk modelperformance
        </p>
      </div>

      {/* Disclaimer */}
      <div
        className="rounded-xl p-4 text-xs"
        style={{ background: 'rgba(108,63,197,0.1)', border: '1px solid rgba(108,63,197,0.3)', color: '#b39ddb' }}
      >
        <span className="font-semibold">Om backtests:</span>{' '}
        Backtests viser, hvordan strategierne har klaret sig historisk. Det er ikke en garanti for fremtidig performance — men det er ærlig data. Vi gemmer det her, fordi transparens er vigtigt.
      </div>

      {/* Strategy summary */}
      {strategies.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
            <span>🏅</span> Strategi-overblik
          </h2>
          <div className="flex flex-col gap-2">
            {strategies.map(([strategy, stats], i) => (
              <div
                key={strategy}
                className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg"
                style={{ background: '#1a1a26' }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: i === 0 ? 'var(--gold)' : '#2a2a3a', color: i === 0 ? '#0d0d14' : 'var(--text-muted)' }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium">{strategy.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>{stats.count} runs</span>
                  <span>⌀ score: <span className="font-mono" style={{ color: 'var(--text)' }}>{(stats.totalScore / stats.count).toFixed(3)}</span></span>
                  <span>⌀ match: <span className="font-mono" style={{ color: 'var(--text)' }}>{(stats.totalMatches / stats.count).toFixed(1)}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw backtest table */}
      {backtests.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📭</div>
          <p style={{ color: 'var(--text-muted)' }}>Ingen backtests endnu.</p>
        </div>
      ) : (
        <div>
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            <span>📋</span> Alle backtests
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid #2a2a3a' }}>
                  {['Dato', 'Strategi', 'Model', 'Score', 'Match', 'Noter'].map((h) => (
                    <th
                      key={h}
                      className="text-left py-2 px-3 text-xs font-semibold"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {backtests.map((bt, i) => (
                  <tr
                    key={bt.id}
                    style={{
                      borderBottom: '1px solid #1e1e2a',
                      background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                    }}
                  >
                    <td className="py-2 px-3 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                      {formatDate(bt.evaluated_at ?? bt.created_at)}
                    </td>
                    <td className="py-2 px-3 text-xs">
                      {bt.strategy_type?.replace(/_/g, ' ') ?? '—'}
                    </td>
                    <td className="py-2 px-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {bt.model_version ?? '—'}
                    </td>
                    <td className="py-2 px-3">
                      <ScoreBadge score={bt.score} />
                    </td>
                    <td className="py-2 px-3">
                      <MatchBadge matches={bt.matches} />
                    </td>
                    <td className="py-2 px-3 text-xs max-w-xs truncate" style={{ color: 'var(--text-muted)' }}>
                      {bt.notes ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
