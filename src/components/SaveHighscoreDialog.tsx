'use client'

import { useEffect, useRef, useState } from 'react'
import { normalizePlayerName, validPlayerName, type ScoreSubmission, type SharedHighscore } from '@/lib/shared-highscore'

interface Props {
  submission: ScoreSubmission & { points: number; matches: number }
  initialName: string
  onSaved: (score: SharedHighscore) => void
  onClose: () => void
}

export default function SaveHighscoreDialog({ submission, initialName, onSaved, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [name, setName] = useState(initialName)
  const [status, setStatus] = useState<'editing' | 'saving' | 'saved'>('editing')
  const [error, setError] = useState<string | null>(null)
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close() }, [])

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status !== 'editing') return
    const playerName = normalizePlayerName(name)
    if (!validPlayerName(playerName)) { setError('Brug 2–24 tegn: bogstaver, tal, mellemrum, punktum, _ eller -.'); return }
    setStatus('saving'); setError(null)
    try {
      const response = await fetch('/api/simulator/highscores', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submission_id: submission.submission_id, draw_id: submission.draw_id, row_numbers: submission.row_numbers, attempts: submission.attempts, player_name: playerName }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'Resultatet kunne ikke gemmes. Prøv igen.')
      onSaved(result.score); setName(result.score.player_name); setStatus('saved')
    } catch (failure) { setStatus('editing'); setError(failure instanceof Error ? failure.message : 'Kunne ikke gemme. Prøv igen.') }
  }

  return <dialog ref={dialog} className="sim-modal sim-save-score-dialog" aria-labelledby="save-score-heading" onCancel={event => { event.preventDefault(); if (status !== 'saving') onClose() }}>
    <div className="sim-modal-content">
      <p className="sim-eyebrow">FÆLLES HIGHSCORELISTE</p>
      <h2 id="save-score-heading">{status === 'saved' ? 'Dit resultat er gemt!' : 'Sæt dit navn på listen'}</h2>
      <p className="sim-muted mt-3">{submission.points.toLocaleString('da-DK')} point · {submission.matches} rigtige · {submission.attempts.toLocaleString('da-DK')} manuelle forsøg</p>
      {status === 'saved' ? <div role="status"><p className="mt-5">🏆 {name}, din kupon er nu på highscorelisten.</p><button type="button" className="sim-button sim-primary w-full mt-6" onClick={onClose}>Tilbage til kuponen</button></div> : <form onSubmit={save} className="sim-score-form mt-5">
        <label htmlFor="highscore-name">Dit navn på listen</label>
        <input id="highscore-name" name="player_name" value={name} onChange={event => { setName(event.target.value); setError(null) }} autoFocus autoComplete="nickname" minLength={2} maxLength={24} required disabled={status === 'saving'} aria-describedby="highscore-name-note" />
        <p id="highscore-name-note" className="sim-muted text-xs mt-2">Dit navn og resultat bliver synligt for alle på highscorelisten.</p>
        {error && <p className="text-rose-300 text-sm mt-3" role="alert">{error}</p>}
        <button type="submit" className="sim-button sim-primary w-full mt-5" disabled={status === 'saving'}>{status === 'saving' ? 'Gemmer i highscorelisten…' : 'Gem highscore'}</button>
        <button type="button" className="sim-button sim-secondary w-full mt-3" onClick={onClose} disabled={status === 'saving'}>Annuller</button>
      </form>}
    </div>
  </dialog>
}
