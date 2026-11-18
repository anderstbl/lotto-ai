'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import LottoBall from '@/components/LottoBall'
import {
  createRandomInt, drawNumbers, emptySimulation, jackpotChance,
  JACKPOT_ODDS, SESSION_LIMIT, simulateBatch,
} from '@/lib/lotto-simulator'

const integer = new Intl.NumberFormat('da-DK', { maximumFractionDigits: 0 })
const money = new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', maximumFractionDigits: 2 })
const initialNumbers = [3, 8, 14, 19, 23, 28, 35]

export default function LottoSimulator({ historicalChallenge }: { historicalChallenge?: ReactNode }) {
  const [selected, setSelected] = useState(initialNumbers)
  const [priceText, setPriceText] = useState('5')
  const [speed, setSpeed] = useState(1000)
  const [running, setRunning] = useState(false)
  const [simulation, setSimulation] = useState(emptySimulation)
  const random = useRef<ReturnType<typeof createRandomInt> | null>(null)
  const price = Number(priceText.replace(',', '.'))
  const validPrice = priceText.trim() !== '' && Number.isFinite(price) && price > 0 && price <= 1000 && Math.abs(price * 100 - Math.round(price * 100)) < 0.000001
  const locked = simulation.attempts > 0 || running
  const jackpot = simulation.counts[7] > 0
  const finished = jackpot || simulation.attempts >= SESSION_LIMIT
  const ready = selected.length === 7 && validPrice && !finished
  const cost = simulation.attempts * (validPrice ? price : 0)
  const chance = jackpotChance(simulation.attempts) * 100

  function getRandom() {
    random.current ??= createRandomInt()
    return random.current
  }

  useEffect(() => {
    if (!running) return
    const randomInt = random.current ??= createRandomInt()
    const timer = window.setInterval(() => {
      setSimulation(previous => simulateBatch(previous, selected, Math.max(1, speed / 20), randomInt))
    }, speed === 1 ? 1000 : 50)
    return () => window.clearInterval(timer)
  }, [running, selected, speed])

  // The timer is cleaned up when paused or unmounted. A terminal batch is a no-op,
  // so reaching jackpot/the session cap cannot add extra attempts.
  useEffect(() => {
    if (!running || !finished) return
    const timer = window.setTimeout(() => setRunning(false), 0)
    return () => window.clearTimeout(timer)
  }, [running, finished])

  function toggleNumber(n: number) {
    setSelected(current => current.includes(n)
      ? current.filter(value => value !== n)
      : current.length < 7 ? [...current, n].sort((a, b) => a - b) : current)
  }

  return (
    <div className="simulator flex flex-col gap-6">
      <section className="sim-intro">
        <p className="sim-eyebrow">ET LILLE EKSPERIMENT MED STORE ODDS</p>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight mt-3">Jagten på <span className="shimmer-text">7 rigtige.</span></h1>
        <p className="sim-muted mt-4 max-w-2xl">Hvor langt rækker dine lykketal? Prøv en række, skru op for tempoet, og se hvad jagten ville koste. Her er pengene heldigvis fiktive.</p>
        <div className="sim-odds mt-5"><span aria-hidden="true">🎱</span> 7 af 36 tal <span>·</span> Jackpotchance: <strong>1 ud af {integer.format(JACKPOT_ODDS)}</strong></div>
      </section>

      {historicalChallenge}

      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-5">
        <section className="card p-5 sm:p-6" aria-labelledby="your-row">
          <div className="flex justify-between items-center gap-3 mb-4">
            <h2 id="your-row" className="font-bold text-lg">01 <span className="sim-muted ml-2">Dine lykketal</span></h2>
            <span className="sim-badge">{selected.length} / 7 valgt</span>
          </div>
          <div className="sim-row" aria-label="Din valgte række">
            {selected.map(n => <LottoBall key={n} number={n} size="sm" />)}
            {Array.from({ length: 7 - selected.length }, (_, i) => <span key={`empty-${i}`} className="sim-empty">?</span>)}
          </div>
          <fieldset disabled={locked} className="mt-5">
            <legend className="sim-muted text-sm mb-3">Vælg 7 tal fra 1 til 36</legend>
            <div className="sim-number-grid">
              {Array.from({ length: 36 }, (_, i) => i + 1).map(n => (
                <button key={n} type="button" aria-pressed={selected.includes(n)}
                  disabled={!selected.includes(n) && selected.length === 7}
                  className={`sim-number ${selected.includes(n) ? 'is-selected' : ''}`} onClick={() => toggleNumber(n)}>{n}</button>
              ))}
            </div>
            <button type="button" className="sim-button sim-secondary w-full mt-4" onClick={() => setSelected(drawNumbers(getRandom()))}>↻ Vælg tilfældige tal</button>
          </fieldset>
          <div className="mt-5 sim-price">
            <label htmlFor="row-price" className="text-sm font-semibold">Pris pr. række (kr.)</label>
            <input id="row-price" type="text" inputMode="decimal" value={priceText} disabled={locked}
              aria-describedby="price-note" aria-invalid={!validPrice}
              onChange={event => setPriceText(event.target.value)} />
          </div>
          <p id="price-note" className="sim-muted text-xs mt-2">5 kr. er et regneeksempel, ikke en aktuel officiel pris. Tal og pris låses efter første forsøg; nulstil for at ændre dem.</p>
          {!validPrice && <p className="text-sm text-rose-300 mt-2" role="alert">Angiv en pris fra 0,01 til 1.000 kr. med højst to decimaler.</p>}
        </section>

        <section className="card p-5 sm:p-6 flex flex-col" aria-labelledby="start-heading">
          <h2 id="start-heading" className="font-bold text-lg">02 <span className="sim-muted ml-2">Lad kuglerne rulle</span></h2>
          <div className={`sim-draw mt-5 ${jackpot ? 'sim-jackpot' : ''}`}>
            <p className="sim-eyebrow">SENESTE TRÆKNING</p>
            <div className="sim-row justify-center my-5">
              {simulation.latest.length ? simulation.latest.map(n => (
                <span key={n} className={selected.includes(n) ? 'sim-hit' : 'sim-miss'}><LottoBall number={n} size="sm" /></span>
              )) : Array.from({ length: 7 }, (_, i) => <span key={i} className="sim-empty">–</span>)}
            </div>
            <p className="text-sm" role="status">{jackpot ? '🎉 7 rigtige! Du ramte den helt store.' : finished ? 'En million forsøg. Tid til at gøre regningen op.' : simulation.latest.length ? `${simulation.latest.filter(n => selected.includes(n)).length} rigtige i seneste trækning · ${simulation.bestMatches} er din rekord` : 'Dine tal er klar. Skal vi prøve lykken?'}</p>
            <p className="sim-muted text-xs mt-2">Matchende tal lyser op. Hvert forsøg er en ny, uafhængig trækning.</p>
          </div>
          <label htmlFor="simulation-speed" className="text-sm font-semibold mt-5 mb-2">Tempo</label>
          <select id="simulation-speed" value={speed} onChange={event => setSpeed(Number(event.target.value))}>
            <option value={1}>Roligt · ca. 1 forsøg / sekund</option>
            <option value={1000}>Hurtigt · ca. 1.000 forsøg / sekund</option>
            <option value={10000}>Lynhurtigt · ca. 10.000 forsøg / sekund</option>
          </select>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button type="button" className="sim-button sim-secondary" disabled={running || !ready}
              onClick={() => setSimulation(current => simulateBatch(current, selected, 1, getRandom()))}>Prøv 1 række</button>
            <button type="button" className="sim-button sim-primary" disabled={!running && !ready}
              onClick={() => setRunning(current => !current)}>{running ? 'Ⅱ Pause' : simulation.attempts ? '▶ Fortsæt' : '▶ Start jagten'}</button>
          </div>
          <button type="button" className="sim-reset mt-4" disabled={!locked} onClick={() => { setRunning(false); setSimulation(emptySimulation()) }}>Nulstil forsøg og regning</button>
          <p className="sim-muted text-xs mt-auto pt-5">Stopper automatisk ved 7 rigtige eller {integer.format(SESSION_LIMIT)} forsøg. Tempo afhænger af din enhed.</p>
        </section>
      </div>

      <section className="sim-receipt p-5 sm:p-7" aria-labelledby="receipt-heading">
        <div className="flex items-center justify-between gap-3"><h2 id="receipt-heading" className="text-lg font-bold">Din fiktive kvittering</h2><span className="sim-badge">0 kr. i virkeligheden</span></div>
        <div className="grid sm:grid-cols-3 gap-6 mt-6">
          <div><p className="sim-muted text-sm">Forsøg</p><p className="sim-stat">{integer.format(simulation.attempts)}</p><p className="sim-muted text-xs">én betalt række pr. trækning</p></div>
          <div><p className="sim-muted text-sm">Du ville have brugt</p><p className="sim-stat sim-gold">{money.format(cost)}</p><p className="sim-muted text-xs">{integer.format(simulation.attempts)} × {money.format(validPrice ? price : 0)} · før eventuelle gevinster</p></div>
          <div><p className="sim-muted text-sm">Med én række om ugen</p><p className="sim-stat">{integer.format(simulation.attempts / 52)} år</p><p className="sim-muted text-xs">beregnet med 52 uger pr. år</p></div>
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
          {simulation.best.length > 0 && <div className="mt-5 pt-4 border-t border-[var(--border)]"><p className="sim-muted text-xs mb-3">Din bedste trækning · {simulation.bestMatches} rigtige</p><div className="sim-row">{simulation.best.map(n => <span key={n} className={selected.includes(n) ? 'sim-hit' : 'sim-miss'}><LottoBall number={n} size="sm" /></span>)}</div></div>}
        </section>
        <section className="card p-5 sm:p-6" aria-labelledby="odds-heading">
          <p className="sim-eyebrow">DET STORE PERSPEKTIV</p>
          <h2 id="odds-heading" className="text-xl font-bold mt-3">Held har ingen hukommelse.</h2>
          <p className="sim-muted text-sm mt-3">Efter {integer.format(simulation.attempts)} uafhængige forsøg er den beregnede chance for at have ramt mindst én jackpot <strong className="text-white">{chance.toLocaleString('da-DK', { maximumFractionDigits: 5 })} %</strong>. Det er en sandsynlighed, ikke en måler der skal fyldes.</p>
          <p className="sim-muted text-sm mt-4">Næste række har stadig præcis samme chance: 1 ud af {integer.format(JACKPOT_ODDS)}. Dine lykketal er lige så sandsynlige som 1, 2, 3, 4, 5, 6, 7.</p>
          <p className="sim-muted text-sm mt-4">Selv efter {integer.format(JACKPOT_ODDS)} forsøg er chancen for mindst én jackpot kun cirka 63,2 %. Ved {validPrice ? money.format(price) : '5 kr.'} pr. række ville de forsøg koste {money.format(JACKPOT_ODDS * (validPrice ? price : 5))}.</p>
          <p className="sim-muted text-xs mt-5">Simulatoren trækker 7 forskellige tal blandt 36 uden betydning af rækkefølge. Tillægstal, øvrige præmiegrupper og udbetalinger er ikke medregnet. Der købes ingen kuponer, og resultater gemmes kun, mens siden er åben.</p>
        </section>
      </div>
    </div>
  )
}
