import { getDraws, computeNumberFrequency } from '@/lib/queries'
import LottoBall from '@/components/LottoBall'

export const dynamic = 'force-dynamic'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('da-DK', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default async function DrawsPage() {
  const draws = await getDraws(52)
  const freq = computeNumberFrequency(draws)

  // Top 7 most frequent numbers
  const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1])
  const maxCount = sorted[0]?.[1] ?? 1
  const top7 = sorted.slice(0, 7).map(([n]) => n)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🎱</span>
          <h1 className="text-xl font-black tracking-tight">Trækningshistorik</h1>
        </div>
        <p style={{ color: 'var(--text-muted)' }} className="text-sm">
          {draws.length} seneste trækninger · Data fra Danske Spil
        </p>
      </div>

      {/* Frequency overview */}
      {sorted.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
            <span>📊</span> Talfrekvens (seneste {draws.length} trækninger)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {sorted.slice(0, 12).map(([n, count]) => (
              <div key={n} className="flex items-center gap-2">
                <LottoBall number={n} size="sm" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{count}x</span>
                  </div>
                  <div
                    className="h-1.5 rounded-full"
                    style={{ background: '#2a2a3a', overflow: 'hidden' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(count / maxCount) * 100}%`,
                        background: 'linear-gradient(90deg, var(--purple-light), var(--gold))',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4" style={{ borderTop: '1px solid #2a2a3a' }}>
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
              🔥 Varmeste tal lige nu:
            </p>
            <div className="flex flex-wrap gap-2">
              {top7.map((n) => (
                <LottoBall key={n} number={n} size="md" animate />
              ))}
            </div>
          </div>

          <p
            className="text-xs mt-3"
            style={{ color: '#555570' }}
          >
            Frekvensdata er sjovt at kigge på. Det ændrer dog ikke på, at hvert tal stadig har præcis samme sandsynlighed. Lotto er ligeglad med historik. 🤷
          </p>
        </div>
      )}

      {/* Draw list */}
      {draws.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📭</div>
          <p style={{ color: 'var(--text-muted)' }}>Ingen trækninger importeret endnu.</p>
        </div>
      ) : (
        <div>
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            <span>🗓️</span> Seneste trækninger
          </h2>
          <div className="flex flex-col gap-2">
            {draws.map((draw) => (
              <div key={draw.id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <span
                  className="text-xs shrink-0 font-mono"
                  style={{ color: 'var(--text-muted)', minWidth: '120px' }}
                >
                  {formatDate(draw.draw_date)}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[...draw.numbers].sort((a, b) => a - b).map((n) => (
                    <LottoBall key={n} number={n} size="sm" />
                  ))}
                  {draw.bonus_numbers.length > 0 && (
                    <>
                      <span className="text-xs self-center" style={{ color: 'var(--text-muted)' }}>+</span>
                      {draw.bonus_numbers.map((n) => (
                        <LottoBall key={`b-${n}`} number={n} size="sm" />
                      ))}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
