'use client'

import { useEffect, useRef } from 'react'
import LottoBall from '@/components/LottoBall'
import type { TicketRow } from '@/lib/lotto-simulator'

interface Props {
  prize: TicketRow | null
  tickets: number
  cost: string
  automatic: boolean
  onContinue: () => void
  onCashOut: () => void
  onDismiss: () => void
}

export default function SimulatorDialog({ prize, tickets, cost, automatic, onContinue, onCashOut, onDismiss }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const stage = prize ? 'prize' : null

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (stage && !element.open) element.showModal()
    if (!stage && element.open) element.close()
    if (stage) element.querySelector<HTMLButtonElement>('[data-primary-action]')?.focus()
  }, [stage])

  return <dialog ref={dialog} className="sim-modal sim-modal-prize"
    aria-labelledby="sim-dialog-title" aria-describedby="sim-dialog-description"
    onCancel={event => { event.preventDefault(); onDismiss() }}>
    {prize ? <div className="sim-modal-content" key={`${tickets}-${prize.matches}`}>
      <div className="sim-confetti" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ left: `${i * 5.8}%`, animationDelay: `${i % 5 * 80}ms`, background: ['#ffd65c', '#8edcff', '#ef83cf'][i % 3] }} />)}</div>
      <span className="sim-prize-icon" aria-hidden="true">{prize.matches === 7 ? '🏆' : '🎉'}</span>
      <p className="sim-eyebrow">{prize.matches === 7 ? 'DEN HELT STORE TRÆFFER' : 'SÅ TÆT PÅ JACKPOT'}</p>
      <h2 id="sim-dialog-title">{prize.matches} rigtige!</h2>
      <div className="sim-row justify-center my-5">{prize.numbers.map(n => <LottoBall key={n} number={n} size="sm" />)}</div>
      <p id="sim-dialog-description">Du ramte {prize.matches} rigtige på kupon nr. <strong>{tickets.toLocaleString('da-DK')}</strong>.<br />Jagten har indtil nu kostet <strong className="sim-gold">{cost}</strong>.</p>
      <p className="sim-muted text-sm mt-3">Spillet er sat på pause. Vil du prøve videre eller tage din træffer med hjem?</p>
      <div className="sim-prize-actions mt-6">
        <button type="button" className="sim-button sim-primary" data-primary-action onClick={onCashOut}>🏆 Tag gevinsten hjem</button>
        <button type="button" className="sim-button sim-secondary" onClick={onContinue}>{automatic ? '▶ Fortsæt med computeren' : 'Prøv selv videre →'}</button>
      </div>
      <p className="sim-muted text-xs mt-4">Det er et fiktivt spil. Præmiebeløbet afhænger af den rigtige trækning; her gemmer vi din træffer og indsats i slutkvitteringen.</p>
    </div> : null}
  </dialog>
}
