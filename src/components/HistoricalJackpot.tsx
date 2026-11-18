'use client'

import { useEffect, useRef, useState } from 'react'
import LottoBall from '@/components/LottoBall'
import type { SearchProgress } from '@/lib/jackpot-search'

const integer = new Intl.NumberFormat('da-DK')

export default function HistoricalJackpot({ draw }: { draw: { numbers: number[]; draw_date: string } | null }) {
  const worker = useRef<Worker | null>(null)
  const [progress, setProgress] = useState<SearchProgress | null>(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => () => worker.current?.terminate(), [])

  function stop() {
    worker.current?.terminate()
    worker.current = null
    setRunning(false)
  }

  function start() {
    if (!draw) return
    stop()
    setProgress(null)
    setError(false)
    try {
      const next = new Worker(new URL('../workers/jackpot.worker.ts', import.meta.url), { type: 'module' })
      worker.current = next
      next.onmessage = (event: MessageEvent<SearchProgress>) => {
        if (worker.current !== next) return
        setProgress(event.data)
        if (event.data.found) stop()
      }
      next.onerror = () => {
        if (worker.current !== next) return
        setError(true)
        stop()
      }
      setRunning(true)
      next.postMessage({ numbers: draw.numbers })
    } catch {
      setError(true)
      stop()
    }
  }

  return (
    <section className="sim-receipt p-5 sm:p-6" aria-labelledby="historical-heading">
      <p className="sim-eyebrow">LYNJAGTEN · TILFÆLDIGE RÆKKER</p>
      <h2 id="historical-heading" className="text-xl font-black mt-2">Kan du ramme sidste uges vindertal?</h2>
      <p className="sim-muted text-sm mt-2">Vi prøver nye, tilfældige rækker i fuld fart, indtil alle 7 tal matcher. Hvor mange forsøg mon der skal til denne gang?</p>
      {draw ? <>
        <p className="sim-muted text-xs mt-4 mb-3">Vindertal fra {new Date(`${draw.draw_date.slice(0, 10)}T12:00:00Z`).toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Copenhagen' })}</p>
        <div className="sim-row">{[...draw.numbers].sort((a, b) => a - b).map(n => <LottoBall key={n} number={n} size="sm" />)}</div>
      </> : <p className="sim-muted text-sm mt-4">Sidste uges vindertal er ikke tilgængelige lige nu. Prøv igen, når trækningen er indlæst på siden.</p>}
      <div className="flex flex-wrap items-center gap-3 mt-5">
        <button type="button" className="sim-button sim-primary" disabled={!draw || running} onClick={start}>{progress ? '↻ Prøv en ny lynjagt' : '⚡ Kør indtil 7 rigtige'}</button>
        {running && <button type="button" className="sim-button sim-secondary" onClick={stop}>Stop jagten</button>}
      </div>
      <div role="status" className="mt-4">
        {error ? <p className="text-rose-300 text-sm">Lynjagten kunne ikke køre i browseren. Prøv at starte igen.</p> : progress ? <>
          <p className="font-bold">{progress.found ? '🎉 7 rigtige!' : running ? 'Søger efter 7 rigtige…' : 'Jagten er stoppet.'}</p>
          <p className="sim-stat sim-gold">{integer.format(progress.attempts)} forsøg{!running && !progress.found ? ' (mindst)' : ''}</p>
          <p className="sim-muted text-sm">{progress.found ? 'Det tog' : 'Kørt i'} {(progress.elapsedMs / 1000).toLocaleString('da-DK', { maximumFractionDigits: 2 })} sekunder{progress.found ? ' at ramme alle syv vindertal.' : '.'}</p>
        </> : running ? <p className="sim-muted text-sm">Lynjagten er i gang…</p> : null}
      </div>
      <p className="sim-muted text-xs mt-4">Gratis og med fiktive rækker. Ingen grænse på en million forsøg her — den stopper ved 7 rigtige, eller når du trykker stop. Hver række har samme chance, og samme række kan dukke op igen.</p>
    </section>
  )
}
