'use client'

import { useEffect, useRef, useState } from 'react'
import LottoBall from '@/components/LottoBall'
import { ROWS_PER_TICKET, TICKET_PRICE, type Simulation } from '@/lib/lotto-simulator'

interface Props {
  round: Simulation
  winningNumbers: readonly number[]
  onComplete: () => void
  onRetry: () => void
  onClose: () => void
  onCashOut: () => void
}

const money = new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', maximumFractionDigits: 0 })

export default function ManualTicketDialog({ round, winningNumbers, onComplete, onRetry, onClose, onCashOut }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [revealed, setRevealed] = useState(0)
  const complete = revealed === ROWS_PER_TICKET
  const best = Math.max(...round.latestTicket.map(row => row.matches))
  const counts = Array.from({ length: 8 }, (_, matches) => round.latestTicket.filter(row => row.matches === matches).length)

  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    return () => element?.close()
  }, [])

  useEffect(() => {
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
  }, [onComplete])

  return <dialog ref={dialog} className="sim-modal sim-manual-dialog" aria-labelledby="manual-dialog-title" aria-describedby="manual-dialog-description"
    onCancel={event => { event.preventDefault(); onClose() }}>
    <div className="sim-manual-layout">
      <header className="sim-manual-header">
        <p className="sim-eyebrow">PRØV SELV · KUPON NR. {(round.attempts / ROWS_PER_TICKET).toLocaleString('da-DK')}</p>
        <h2 id="manual-dialog-title">{complete ? best >= 6 ? `🎉 ${best} rigtige!` : 'Din kupon er klar!' : '🎱 Vi trækker dine 10 rækker…'}</h2>
        <p id="manual-dialog-description" className="sim-muted text-sm mt-2">{complete ? `Bedste række: ${best} rigtige · denne kupon kostede 100 kr.` : `${revealed} af 10 rækker afsløret · se kuglerne falde på plads`}</p>
        <div className="sim-reveal-progress" aria-hidden="true"><span style={{ width: `${revealed * 10}%` }} /></div>
      </header>
      <div className="sim-manual-body">
        <p className="sim-eyebrow mb-3">DE SENESTE VINDERTAL</p>
        <div className="sim-row sim-manual-target mb-5" aria-label="De seneste vindertal">{[...winningNumbers].sort((a, b) => a - b).map(n => <LottoBall key={n} number={n} size="sm" />)}</div>
        <div className="sim-ticket sim-ticket-grid sim-manual-rows" aria-busy={!complete}>
          {round.latestTicket.map((row, index) => {
            const visible = index < revealed
            return <div key={index} className={`sim-ticket-row ${visible ? 'sim-manual-row-revealed' : ''} ${visible && row.matches === best ? 'sim-ticket-best' : ''} ${index === revealed ? 'sim-manual-row-drawing' : ''}`}>
              <span className="sim-ticket-index">{index + 1}</span>
              <div className="sim-row">{visible ? row.numbers.map(n => <span key={n} className={winningNumbers.includes(n) ? 'sim-hit' : 'sim-miss'}><LottoBall number={n} size="sm" /></span>) : Array.from({ length: 7 }, (_, ball) => <span key={ball} className="sim-empty" style={{ animationDelay: `${ball * 35}ms` }}>?</span>)}</div>
              <strong>{visible ? row.matches : '–'}<span> rigtige</span></strong>
            </div>
          })}
        </div>
        {complete && <div className="sim-manual-summary" role="status">
          <h3>Bedste række: <strong>{best} rigtige</strong></h3>
          <div className="sim-match-summary">{counts.map((count, matches) => count > 0 ? <span key={matches}>{count} {count === 1 ? 'række' : 'rækker'} med {matches} rigtige</span> : null)}</div>
          <p className="sim-muted text-xs mt-3">Samlet: {(round.attempts / ROWS_PER_TICKET).toLocaleString('da-DK')} {round.attempts === ROWS_PER_TICKET ? 'kupon' : 'kuponer'} · {money.format(round.attempts / ROWS_PER_TICKET * TICKET_PRICE)} i fiktiv indsats.</p>
        </div>}
      </div>
      <footer className="sim-manual-footer">
        <button type="button" className="sim-button sim-primary" disabled={!complete} onClick={onRetry}>↻ Prøv igen · 100 kr.</button>
        <button type="button" className="sim-button sim-secondary" onClick={onClose}>Luk</button>
        {complete && best >= 6 && <button type="button" className="sim-button sim-primary sim-manual-cashout" onClick={onCashOut}>🏆 Tag gevinsten hjem</button>}
      </footer>
    </div>
  </dialog>
}
