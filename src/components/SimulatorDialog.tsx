'use client'

import { useEffect, useRef, useState } from 'react'
import LottoBall from '@/components/LottoBall'
import type { TicketRow } from '@/lib/lotto-simulator'

interface Props {
  rolling: boolean
  prize: TicketRow | null
  tickets: number
  cost: string
  automatic: boolean
  onReveal: () => void
  onContinue: () => void
  onCashOut: () => void
  onDismiss: () => void
}

export default function SimulatorDialog({ rolling, prize, tickets, cost, automatic, onReveal, onContinue, onCashOut, onDismiss }: Props) {
  const [motion, setMotion] = useState<'auto' | 'on' | 'off'>('auto')
  const dialog = useRef<HTMLDialogElement>(null)
  const stage = rolling ? 'drawing' : prize ? 'prize' : null

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (stage && !element.open) element.showModal()
    if (!stage && element.open) element.close()
    if (stage) element.querySelector<HTMLButtonElement>('[data-primary-action]')?.focus()
  }, [stage])

  return <dialog ref={dialog} className={`sim-modal ${rolling ? 'sim-modal-drawing' : 'sim-modal-prize'}`}
    data-motion={motion} aria-labelledby="sim-dialog-title" aria-describedby="sim-dialog-description"
    onCancel={event => { event.preventDefault(); if (rolling) onReveal(); else onDismiss() }}>
    {rolling ? <div className="sim-modal-content">
      <p className="sim-eyebrow">DIT MANUELLE FORSØG</p>
      <h2 id="sim-dialog-title">Nu ruller kuglerne!</h2>
      <div className="sim-lotto-machine" aria-hidden="true">
        <div className="sim-machine-cage" />
        {[3, 8, 14, 19, 23, 28, 35].map((n, i) => <span key={n} className={`sim-machine-ball sim-machine-ball-${i}`}><LottoBall number={n} size="sm" /></span>)}
        <span className="sim-machine-label">10<span>RÆKKER</span></span>
      </div>
      <p id="sim-dialog-description">10 rækker · 100 fiktive kroner.<br />Popupen bliver stående, indtil du vælger at se din kupon.</p>
      <div className="sim-prize-actions mt-5">
        <button type="button" className="sim-button sim-primary" data-primary-action onClick={onReveal}>Vis min kupon →</button>
        <button type="button" className="sim-button sim-secondary" aria-pressed={motion === 'on'} onClick={() => setMotion(current => current === 'on' ? 'off' : 'on')}>{motion === 'on' ? 'Ⅱ Sæt animation på pause' : '↻ Afspil kugle-animation'}</button>
      </div>
    </div> : prize ? <div className="sim-modal-content" key={`${tickets}-${prize.matches}`}>
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
