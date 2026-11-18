'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import LottoBall from '@/components/LottoBall'
import SimulatorDialog from '@/components/SimulatorDialog'
import ManualTicketDialog from '@/components/ManualTicketDialog'
import SaveHighscoreDialog from '@/components/SaveHighscoreDialog'
import HighscoreLeaderboard from '@/components/HighscoreLeaderboard'
import type { ScoreSubmission, SharedHighscore } from '@/lib/shared-highscore'
import { MANUAL_SCORE_KEY, manualScore, betterHighscore, readHighscore, type ManualHighscore } from '@/lib/manual-score'
import {
  createRandomInt, emptySimulation, jackpotChance,
  type Simulation, JACKPOT_ODDS, ROW_PRICE, ROWS_PER_TICKET, TICKET_PRICE, WEEKLY_ROWS, simulateBatch,
} from '@/lib/lotto-simulator'

const integer = new Intl.NumberFormat('da-DK', { maximumFractionDigits: 0 })
const money = new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', maximumFractionDigits: 2 })
const noNumbers: number[] = []

export default function LottoSimulator({ draw }: { draw: { id: string; numbers: number[]; draw_date: string } | null }) {
  const selected = draw?.numbers ?? noNumbers
  const [speed, setSpeed] = useState(1000)
  const [running, setRunning] = useState(false)
  const [simulation, setSimulation] = useState(emptySimulation)
  const [cashedOut, setCashedOut] = useState(false)
  const [manualAttempts, setManualAttempts] = useState(0)
  const [highscore, setHighscore] = useState<ManualHighscore | null>(null)
  const [scoreStorageAvailable, setScoreStorageAvailable] = useState(true)
  const [manualSubmissionId, setManualSubmissionId] = useState<string | null>(null)
  const [saveCandidate, setSaveCandidate] = useState<(ScoreSubmission & { points: number; matches: number }) | null>(null)
  const [savedSubmissions, setSavedSubmissions] = useState<Set<string>>(() => new Set())
  const [leaderboardVersion, setLeaderboardVersion] = useState(0)
  const [savedScoreId, setSavedScoreId] = useState<string | null>(null)
  const [playerName, setPlayerName] = useState('')
  const [manualOpen, setManualOpen] = useState(false)
  const [manualRound, setManualRound] = useState<Simulation | null>(null)
  const [rolling, setRolling] = useState(false)
  const [revealId, setRevealId] = useState(0)
  const random = useRef<ReturnType<typeof createRandomInt> | null>(null)
  const jackpot = simulation.counts[7] > 0
  const active = running && !simulation.milestone && !cashedOut
  const ready = selected.length === 7 && !simulation.milestone && !cashedOut
  const tickets = simulation.attempts / ROWS_PER_TICKET
  const cost = tickets * TICKET_PRICE
  const ticketBest = Math.max(0, ...simulation.latestTicket.map(row => row.matches))
  const chance = jackpotChance(simulation.attempts) * 100

  function getRandom() {
    random.current ??= createRandomInt()
    return random.current
  }

  useEffect(() => {
    try { setHighscore(readHighscore(window.localStorage.getItem(MANUAL_SCORE_KEY))) }
    catch { setScoreStorageAvailable(false) }
  }, [])

  useEffect(() => {
    if (!highscore || !scoreStorageAvailable) return
    try { window.localStorage.setItem(MANUAL_SCORE_KEY, JSON.stringify(highscore)) }
    catch { setScoreStorageAvailable(false) }
  }, [highscore, scoreStorageAvailable])

  const finishManualAnimation = useCallback(() => {
    setRolling(false)
    if (!manualRound) return
    const matches = Math.max(...manualRound.latestTicket.map(row => row.matches))
    if (matches === 0) return
    const candidate: ManualHighscore = { version: 1, matches, attempts: manualAttempts, points: manualScore(matches, manualAttempts) }
    setHighscore(previous => betterHighscore(candidate, previous) ? candidate : previous)
  }, [manualRound, manualAttempts])

  function openManualDialog() {
    if (active || !ready) return
    setManualRound(null)
    setManualOpen(true)
  }

  function tryTicket() {
    if (rolling || active || cashedOut || selected.length !== 7) return
    const result = simulateBatch({ ...simulation, milestone: null }, selected, ROWS_PER_TICKET, getRandom())
    setSimulation(result)
    setManualSubmissionId(crypto.randomUUID())
    setManualAttempts(attempts => attempts + 1)
    setManualRound(result)
    setRolling(true)
    setRevealId(id => id + 1)
  }

  function openSaveScore() {
    if (!draw || !manualRound || !manualSubmissionId || rolling || savedSubmissions.has(manualSubmissionId)) return
    const best = manualRound.latestTicket.reduce((current, row) => row.matches > current.matches ? row : current)
    if (best.matches < 1) return
    setSaveCandidate({ submission_id: manualSubmissionId, draw_id: draw.id, row_numbers: best.numbers, attempts: manualAttempts,
      matches: best.matches, points: manualScore(best.matches, manualAttempts) })
  }

  function scoreSaved(score: SharedHighscore) {
    if (saveCandidate) setSavedSubmissions(previous => new Set(previous).add(saveCandidate.submission_id))
    setPlayerName(score.player_name)
    setSavedScoreId(score.id)
    setLeaderboardVersion(value => value + 1)
  }

  function closeManualRound() {
    setRolling(false)
    setManualRound(null)
    setManualOpen(false)
    setSimulation(previous => ({ ...previous, milestone: null }))
  }

  function cashOut() {
    setRunning(false)
    setRolling(false)
    setManualRound(null)
    setManualOpen(false)
    setCashedOut(true)
  }

  function continuePlaying() {
    setSimulation(previous => ({ ...previous, milestone: null }))
  }

  function resetGame() {
    setRunning(false)
    setCashedOut(false)
    setSimulation(emptySimulation())
    setManualAttempts(0)
    setRevealId(0)
  }

  useEffect(() => {
    if (!active) return
    const randomInt = random.current ??= createRandomInt()
    const timer = window.setInterval(() => {
      setSimulation(previous => simulateBatch(previous, selected, Math.max(ROWS_PER_TICKET, speed / 20), randomInt))
    }, speed === 1 ? 1000 : 50)
    return () => window.clearInterval(timer)
  }, [active, selected, speed])

  return (
    <div className="simulator flex flex-col gap-6">
      {saveCandidate && <SaveHighscoreDialog submission={saveCandidate} initialName={playerName} onSaved={scoreSaved} onClose={() => setSaveCandidate(null)} />}
      {manualOpen && <ManualTicketDialog key={manualRound?.attempts ?? 'ready'} round={manualRound} winningNumbers={selected} manualAttempts={manualAttempts} onSaveScore={openSaveScore} scoreSaved={!!manualSubmissionId && savedSubmissions.has(manualSubmissionId)}
        onComplete={finishManualAnimation} onStart={tryTicket} onRetry={tryTicket} onClose={closeManualRound} onCashOut={cashOut} />}
      <SimulatorDialog prize={cashedOut || manualOpen ? null : simulation.milestone} tickets={tickets} cost={money.format(cost)} automatic={running}
        onContinue={continuePlaying}
        onCashOut={cashOut}
        onDismiss={() => { setRunning(false); continuePlaying() }} />
      <section className="sim-intro">
        <p className="sim-eyebrow">ET LILLE EKSPERIMENT MED STORE ODDS</p>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight mt-3">Jagten på <span className="shimmer-text">7 rigtige.</span></h1>
        <p className="sim-muted mt-4 max-w-2xl">Kan du ramme de seneste vindertal? Prøv en kupon med 10 tilfældige rækker ad gangen, eller lad kuglerne rulle automatisk. En kupon koster 100 fiktive kroner.</p>
        <div className="sim-odds mt-5"><span aria-hidden="true">🎱</span> 7 af 36 tal <span>·</span> Jackpotchance: <strong>1 ud af {integer.format(JACKPOT_ODDS)}</strong></div>
      </section>

      <div className="flex flex-col gap-5">
        <section className="card sim-winning-intro p-5 sm:p-6" aria-labelledby="winning-row">
          <div>
            <p className="sim-eyebrow">01 · DIT MÅL</p>
            <h2 id="winning-row" className="font-bold text-lg mt-2">De seneste vindertal</h2>
            {draw && <p className="sim-muted text-xs mt-2">Trækning {new Date(`${draw.draw_date.slice(0, 10)}T12:00:00Z`).toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Copenhagen' })}</p>}
          </div>
          <div>
            {draw ? <>
              <div className="sim-row" aria-label="Vindertallene du skal ramme">{[...selected].sort((a, b) => a - b).map(n => <LottoBall key={n} number={n} size="sm" />)}</div>
              <p className="sim-muted text-xs mt-3">Ram disse syv tal med 10 tilfældige rækker pr. kupon.</p>
            </> : <p className="sim-muted text-sm" role="status">De seneste vindertal er ikke tilgængelige lige nu. Prøv igen, når trækningen er indlæst.</p>}
          </div>
          <div className="sim-winning-price"><strong>100 kr.</strong><span>pr. kupon · 10 × 10 kr.</span><span>Fiktive penge · kun for sjov</span></div>
        </section>

        <section className="card p-5 sm:p-6 flex flex-col" aria-labelledby="start-heading">
          <h2 id="start-heading" className="font-bold text-lg">02 <span className="sim-muted ml-2">Lad kuglerne rulle</span></h2>
          <div className={`sim-draw mt-5 ${jackpot ? 'sim-jackpot' : ''}`}>
            <p className="sim-eyebrow">KUGLERNE RULLER</p>
            <div className={`sim-row justify-center my-5 ${rolling ? 'sim-tumbling' : ''}`} aria-hidden={rolling}>
              {rolling ? [3, 8, 14, 19, 23, 28, 35].map(n => <LottoBall key={n} number={n} size="sm" />) : simulation.latest.length ? simulation.latest.map(n => (
                <span key={n} className={selected.includes(n) ? 'sim-hit' : 'sim-miss'}><LottoBall number={n} size="sm" /></span>
              )) : Array.from({ length: 7 }, (_, i) => <span key={i} className="sim-empty">–</span>)}
            </div>
            <p className="text-sm" role="status">{rolling ? 'Kuglerne blandes… din kupon er på vej!' : jackpot ? `🎉 7 rigtige på kupon nr. ${integer.format(tickets)}!` : simulation.latest.length ? `${ticketBest} rigtige på seneste kupon · ${simulation.bestMatches} er din rekord` : draw ? 'Vindertallene er klar. Skal vi prøve lykken?' : 'Afventer vindertal.'}</p>
            <p className="sim-muted text-xs mt-2">Tal, der matcher vindertallene, lyser op. Se alle 10 rækker og deres træffere på kuponen nedenfor.</p>
          </div>
          <div className="sim-play-modes mt-5">
            <section className="sim-play-mode sim-play-computer" aria-labelledby="computer-mode">
              <span className="sim-mode-icon" aria-hidden="true">⚡</span>
              <h3 id="computer-mode">Lad computeren spille</h3>
              <p>Computeren køber kuponer, indtil du pauser eller rammer 6 eller 7 rigtige.</p>
              <label htmlFor="simulation-speed" className="text-xs font-semibold">Computerens tempo</label>
              <select id="simulation-speed" value={speed} disabled={rolling || cashedOut} onChange={event => setSpeed(Number(event.target.value))}>
                <option value={1}>Roligt · ca. 1 kupon / sekund</option>
                <option value={1000}>Hurtigt · ca. 100 kuponer / sekund</option>
                <option value={10000}>Lynhurtigt · ca. 1.000 kuponer / sekund</option>
              </select>
              <button type="button" className="sim-button sim-primary sim-computer-cta w-full" disabled={rolling || (!active && !ready)} onClick={() => setRunning(!active)}>{active ? 'Ⅱ Pause computeren' : '⚡ Lad computeren køre'}</button>
            </section>
            <section className="sim-play-mode sim-play-yourself" aria-labelledby="manual-mode">
              <span className="sim-mode-icon" aria-hidden="true">🎱</span>
              <h3 id="manual-mode">Prøv selv</h3>
              <p>Ét klik, én kupon. Se kuglerne rulle og afslør dine 10 rækker.</p>
              <div className="sim-highscore" aria-label="Din personlige highscore">
                <span>🏆 Personlig rekord</span><strong>{highscore ? `${integer.format(highscore.points)} point` : 'Ingen rekord endnu'}</strong>
                <small>{highscore ? `${highscore.matches} rigtige på ${integer.format(highscore.attempts)} manuelle forsøg · ` : ''}{scoreStorageAvailable ? 'Gemmes i denne browser' : 'Gemmes kun i denne session'}</small>
              </div>
              <details className="sim-score-rules"><summary>Sådan får du point</summary><p>Du får 10.000 point pr. rigtigt tal på kuponens bedste række plus en bonus: 9.999 divideret med kvadratroden af antal manuelle forsøg, rundet ned. Flere rigtige slår altid færre; færre forsøg giver større bonus. Computerens forsøg giver ingen point. “Nulstil” starter en ny jagt, men beholder din rekord.</p></details>
              <button type="button" className="sim-button sim-primary w-full" disabled={active || rolling || !ready} onClick={openManualDialog}>🎱 Prøv 10 rækker · 100 kr.</button>
            </section>
          </div>
          <button type="button" className="sim-reset mt-4" disabled={rolling || (!simulation.attempts && !active)} onClick={resetGame}>Nulstil forsøg og regning</button>
          <p className="sim-muted text-xs mt-auto pt-5">Samme spil og samme kvittering. Ved 6 eller 7 rigtige vælger du, om jagten skal fortsætte.</p>
        </section>
      </div>

      <HighscoreLeaderboard refreshKey={leaderboardVersion} highlightId={savedScoreId} />

      <section className="card p-5 sm:p-6 sim-ticket" aria-labelledby="ticket-heading" aria-busy={rolling}>
        <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
          <h2 id="ticket-heading" className="text-lg font-bold">Din seneste kupon</h2>
          <span className="sim-badge">{simulation.latestTicket.length ? `Bedste række: ${ticketBest} rigtige` : '10 rækker · 100 kr.'}</span>
        </div>
        {rolling ? <div className="sim-ticket-wait"><span className="sim-drum" aria-hidden="true">🎱</span><p>Vi blander kuglerne og gør 10 rækker klar…</p></div> : simulation.latestTicket.length ? <div key={revealId} className={`sim-ticket-grid ${revealId && !active ? 'sim-ticket-reveal' : ''}`}>
          {simulation.latestTicket.map((row, index) => <div key={index} className={`sim-ticket-row ${row.matches === ticketBest ? 'sim-ticket-best' : ''}`} style={{ animationDelay: `${index * 45}ms` }}>
            <span className="sim-ticket-index">{index + 1}</span>
            <div className="sim-row">{row.numbers.map(n => <span key={n} className={selected.includes(n) ? 'sim-hit' : 'sim-miss'}><LottoBall number={n} size="sm" /></span>)}</div>
            <strong>{row.matches}<span> rigtige</span></strong>
          </div>)}
        </div> : <p className="sim-muted text-sm">Tryk på “Prøv 10 rækker” for at se din første kupon. Vi fremhæver matchende tal og kuponens bedste række.</p>}
      </section>

      {cashedOut && <section className="sim-cashout card p-6" role="status">
        <p className="sim-eyebrow">GEVINSTEN ER TAGET HJEM · SPILLET ER AFSLUTTET</p>
        <h2 className="text-2xl font-black mt-3">🏆 Du sluttede med {simulation.milestone?.matches} rigtige</h2>
        <p className="sim-muted mt-3">{integer.format(tickets)} kuponer · {integer.format(simulation.attempts)} rækker · samlet indsats <strong className="sim-gold">{money.format(cost)}</strong>.</p>
        <p className="sim-muted text-xs mt-2">Dette er din fiktive slutkvittering. Der er ikke beregnet et præmiebeløb.</p>
        <button type="button" className="sim-button sim-primary mt-4" onClick={resetGame}>Start et nyt spil</button>
      </section>}

      <section className="sim-receipt p-5 sm:p-7" aria-labelledby="receipt-heading">
        <div className="flex items-center justify-between gap-3"><h2 id="receipt-heading" className="text-lg font-bold">Din fiktive kvittering</h2><span className="sim-badge">0 kr. i virkeligheden</span></div>
        <div className="grid sm:grid-cols-3 gap-6 mt-6">
          <div><p className="sim-muted text-sm">Kuponer / forsøg</p><p className="sim-stat">{integer.format(tickets)}</p><p className="sim-muted text-xs">{integer.format(simulation.attempts)} rækker i alt · 10 pr. kupon</p></div>
          <div><p className="sim-muted text-sm">Du ville have brugt</p><p className="sim-stat sim-gold">{money.format(cost)}</p><p className="sim-muted text-xs">{integer.format(tickets)} kuponer × {money.format(TICKET_PRICE)} · før eventuelle gevinster</p></div>
          <div><p className="sim-muted text-sm">Med 10 rækker om ugen</p><p className="sim-stat">{(simulation.attempts / WEEKLY_ROWS).toLocaleString('da-DK', { maximumFractionDigits: 2 })} år</p><p className="sim-muted text-xs">én kupon om ugen · 52 uger pr. år</p></div>
        </div>
        <div className="sim-comparison mt-6">☕ Samme beløb som cirka <strong>{integer.format(cost / 40)} kopper kaffe</strong> à 40 kr. {cost >= 10000 && <>Eller <strong>{integer.format(cost / 10000)} ferier</strong> à 10.000 kr.</>}</div>
      </section>

      <div className="grid md:grid-cols-2 gap-5">
        <section className="card p-5 sm:p-6" aria-labelledby="results-heading">
          <h2 id="results-heading" className="font-bold mb-5">Små træffere, store drømme</h2>
          <div className="flex flex-col gap-3">
            {simulation.counts.map((count, matches) => (
              <div key={matches} className="sim-result-row"><span>{matches} rigtige</span><div className="sim-track"><div style={{ width: `${simulation.attempts ? count / simulation.attempts * 100 : 0}%` }} /></div><strong>{integer.format(count)}</strong></div>
            ))}
          </div>
          {simulation.best.length > 0 && <div className="mt-5 pt-4 border-t border-[var(--border)]"><p className="sim-muted text-xs mb-3">Din bedste række · {simulation.bestMatches} rigtige</p><div className="sim-row">{simulation.best.map(n => <span key={n} className={selected.includes(n) ? 'sim-hit' : 'sim-miss'}><LottoBall number={n} size="sm" /></span>)}</div></div>}
        </section>
        <section className="card p-5 sm:p-6" aria-labelledby="odds-heading">
          <p className="sim-eyebrow">DET STORE PERSPEKTIV</p>
          <h2 id="odds-heading" className="text-xl font-bold mt-3">Held har ingen hukommelse.</h2>
          <p className="sim-muted text-sm mt-3">Efter {integer.format(simulation.attempts)} tilfældige rækker er den beregnede chance for at have ramt mindst én jackpot <strong className="text-white">{chance.toLocaleString('da-DK', { maximumFractionDigits: 5 })} %</strong>. Det er en sandsynlighed, ikke en måler der skal fyldes.</p>
          <p className="sim-muted text-sm mt-4">Næste række har stadig præcis samme chance: 1 ud af {integer.format(JACKPOT_ODDS)}. Alle rækker er lige sandsynlige — også 1, 2, 3, 4, 5, 6, 7.</p>
          <p className="sim-muted text-sm mt-4">Selv efter {integer.format(JACKPOT_ODDS)} rækker er chancen for mindst én jackpot kun cirka 63,2 %. Ved {money.format(ROW_PRICE)} pr. række ville de rækker koste {money.format(JACKPOT_ODDS * ROW_PRICE)}.</p>
          <p className="sim-muted text-xs mt-5">Simulatoren trækker 7 forskellige tal blandt 36 uden betydning af rækkefølge. Tillægstal, øvrige præmiegrupper og udbetalinger er ikke medregnet. Der købes ingen kuponer. Kun resultater, du selv gemmer med navn, bliver delt på highscorelisten. Din personlige rekord gemmes også i browseren.</p>
        </section>
      </div>
    </div>
  )
}
