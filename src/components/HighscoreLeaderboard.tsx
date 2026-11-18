'use client'

import { useEffect, useState } from 'react'
import type { SharedHighscore } from '@/lib/shared-highscore'

export default function HighscoreLeaderboard({ refreshKey, highlightId }: { refreshKey: number; highlightId: string | null }) {
  const [scores, setScores] = useState<SharedHighscore[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/simulator/highscores', { cache: 'no-store', signal: controller.signal })
      .then(async response => { if (!response.ok) throw new Error(); return response.json() })
      .then(data => { setScores(data.scores); setStatus('ready') })
      .catch(() => { if (!controller.signal.aborted) setStatus('error') })
    return () => controller.abort()
  }, [refreshKey, retry])

  return <section className="card p-5 sm:p-6" aria-labelledby="leaderboard-heading">
    <div className="flex justify-between items-center gap-3"><div><p className="sim-eyebrow">PRØV SELV · TOP 20</p><h2 id="leaderboard-heading" className="text-xl font-bold mt-2">🏆 Fælles highscoreliste</h2></div>
      <button type="button" className="sim-button sim-secondary" onClick={() => { setStatus('loading'); setRetry(value => value + 1) }}>↻ Opdater</button></div>
    <p className="sim-muted text-sm mt-3">Skriv dit navn efter et manuelt forsøg, og gem din kupon på listen. Flest point øverst; ved pointlighed vinder færrest forsøg.</p>
    {status === 'loading' ? <p className="sim-muted text-sm mt-5" role="status">Henter highscorelisten…</p> : status === 'error' ? <p className="text-rose-300 text-sm mt-5" role="alert">Highscorelisten kunne ikke hentes. Tryk Opdater for at prøve igen.</p> : scores.length === 0 ? <p className="sim-muted text-sm mt-5">Listen er tom. Spil en kupon, og bliv den første til at gemme et resultat!</p> : <div className="sim-leaderboard-wrap mt-5"><table className="sim-leaderboard"><caption className="sr-only">De 20 bedste indsendte manuelle resultater</caption><thead><tr><th scope="col">#</th><th scope="col">Navn</th><th scope="col">Point</th><th scope="col">Rigtige</th><th scope="col">Forsøg</th></tr></thead><tbody>{scores.map((score, index) => <tr key={score.id} className={score.id === highlightId ? 'is-your-score' : ''}>
      <td>{index + 1}</td><th scope="row">{score.player_name}{score.id === highlightId && <span className="sr-only"> — dit gemte resultat</span>}</th><td>{score.points.toLocaleString('da-DK')}</td><td>{score.matches}</td><td>{score.attempts.toLocaleString('da-DK')}</td>
    </tr>)}</tbody></table></div>}
  </section>
}
