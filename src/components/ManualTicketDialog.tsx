'use client'

import { useEffect, useRef, useState } from 'react'
import LottoBall from '@/components/LottoBall'
import { manualScore } from '@/lib/manual-score'
import { ROWS_PER_TICKET, TICKET_PRICE, type Simulation } from '@/lib/lotto-simulator'

interface Props {
  round: Simulation | null
  winningNumbers: readonly number[]
  manualAttempts: number
  onComplete: () => void
  onStart: () => void
  onRetry: () => void
  onClose: () => void
  onCashOut: () => void
  onSaveScore: () => void
  scoreSaved: boolean
}

const money = new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', maximumFractionDigits: 0 })

export default function ManualTicketDialog({ round, winningNumbers, manualAttempts, onComplete, onStart, onRetry, onClose, onCashOut, onSaveScore, scoreSaved }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [revealed, setRevealed] = useState(0)
  const complete = revealed === ROWS_PER_TICKET
  const rows = round?.latestTicket ?? Array.from({ length: ROWS_PER_TICKET }, () => ({ numbers: [], matches: 0 }))
  const best = Math.max(...rows.map(row => row.matches))
  const counts = Array.from({ length: 8 }, (_, matches) => rows.filter(row => row.matches === matches).length)

  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    return () => element?.close()
  }, [])

  useEffect(() => {
    if (!round) return
    let count = 0
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 70 : 180
    const timer = window.setInterval(() => {
      count++
      setRevealed(count)
      if (count === ROWS_PER_TICKET) {
        window.clearInterval(timer)
        onComplete()
      }
    }, delay)
    return () => window.clearInterval(timer)
  }, [round, onComplete])

  return <dialog ref={dialog} className="sim-modal sim-manual-dialog" aria-labelledby="manual-dialog-title" aria-describedby="manual-dialog-description"
    onCancel={event => { event.preventDefault(); onClose() }}>
    <div className="sim-manual-layout">
      <header className="sim-manual-header">
        <p className="sim-eyebrow">PRØV SELV{round ? ` · KUPON NR. ${(round.attempts / ROWS_PER_TICKET).toLocaleString('da-DK')}` : ' · 10 RÆKKER'}</p>
        <h2 id="manual-dialog-title">{!round ? 'Klar til at prøve lykken?' : complete ? best >= 6 ? `🎉 ${best} rigtige!` : 'Din kupon er klar!' : '🎱 Vi trækker dine 10 rækker…'}</h2>
        <p id="manual-dialog-description" className="sim-muted text-sm mt-2">{!round ? 'Tryk Start for at trække 10 rækker til 100 fiktive kroner.' : complete ? 'Din kupon er færdig. Prøv igen eller luk.' : `${revealed} af 10 rækker afsløret…`}</p>
        <div className="sim-manual-summary sim-score-summary" role="status">
          <h3>Bedste række: <strong>{complete ? `${best} rigtige` : '–'}</strong></h3>
          <div className="sim-match-summary">{complete ? counts.map((count, matches) => count > 0 ? <span key={matches}>{count} × {matches} rigtige</span> : null) : <span>{round ? 'Kuglerne ruller… resultatet vises her.' : 'Tryk Start for at spille 10 rækker.'}</span>}</div>
          <p className="sim-manual-points"><span>Point: <strong>{complete ? manualScore(best, manualAttempts).toLocaleString('da-DK') : '–'}</strong></span><button type="button" className="sim-save-score-link" disabled={!complete || best < 1 || scoreSaved} onClick={onSaveScore}>{scoreSaved ? '✓ Gemt på listen' : '🏆 Gem highscore'}</button></p>
          <p className="sim-muted sim-manual-attempts">{manualAttempts.toLocaleString('da-DK')} {manualAttempts === 1 ? 'manuelt forsøg' : 'manuelle forsøg'}{round ? ` · samlet indsats ${money.format(round.attempts / ROWS_PER_TICKET * TICKET_PRICE)}` : ' · 100 kr. pr. kupon'}</p>
        </div>
        <div className="sim-reveal-progress" aria-hidden="true"><span style={{ width: `${revealed * 10}%` }} /></div>
      </header>
      <div className="sim-manual-body">
        <div className="sim-manual-winning"><p className="sim-eyebrow">Vindertal</p>
        <div className="sim-row sim-manual-target" aria-label="De seneste vindertal">{[...winningNumbers].sort((a, b) => a - b).map(n => <LottoBall key={n} number={n} size="sm" />)}</div></div>
        <div className="sim-ticket sim-ticket-grid sim-manual-rows" aria-busy={!complete}>
          {rows.map((row, index) => {
            const visible = index < revealed
            return <div key={index} className={`sim-ticket-row ${visible ? 'sim-manual-row-revealed' : ''} ${visible && row.matches === best ? 'sim-ticket-best' : ''} ${round && index === revealed ? 'sim-manual-row-drawing' : ''}`}>
              <span className="sim-ticket-index">{index + 1}</span>
              <div className="sim-row">{visible ? row.numbers.map(n => <span key={n} className={winningNumbers.includes(n) ? 'sim-hit' : 'sim-miss'}><LottoBall number={n} size="sm" /></span>) : Array.from({ length: 7 }, (_, ball) => <span key={ball} className="sim-empty" style={{ animationDelay: `${ball * 35}ms` }}>?</span>)}</div>
              <strong>{visible ? row.matches : '–'}<span> rigtige</span></strong>
            </div>
          })}
        </div>

      </div>
      <footer className="sim-manual-footer">
        {!round ? <button type="button" className="sim-button sim-primary" autoFocus onClick={onStart}>▶ Start · 100 kr.</button> : <button type="button" className="sim-button sim-primary" disabled={!complete} onClick={onRetry}>↻ Prøv igen · 100 kr.</button>}
        <button type="button" className="sim-button sim-secondary" onClick={onClose}>Luk</button>
        <button type="button" className="sim-button sim-primary sim-manual-cashout" style={{ visibility: complete && best >= 6 ? 'visible' : 'hidden' }} disabled={!complete || best < 6} onClick={onCashOut}>🏆 Tag gevinsten hjem</button>
      </footer>
    </div>
  </dialog>
}
