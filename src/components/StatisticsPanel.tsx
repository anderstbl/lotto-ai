import Link from 'next/link'
import type { Draw, PredictionRun } from '@/types'
import { computeNumberFrequency } from '@/lib/queries'

function dateLabel(value: string) {
  return new Date(value).toLocaleDateString('da-DK', { timeZone: 'Europe/Copenhagen' })
}

export default function StatisticsPanel({ run, draws }: { run: PredictionRun; draws: Draw[] }) {
  const sample = draws.filter(draw => draw.numbers.length === 7 && new Set(draw.numbers).size === 7 && draw.numbers.every(n => Number.isInteger(n) && n >= 1 && n <= 36))
  const frequency = computeNumberFrequency(sample)
  const maximum = Math.max(1, ...frequency.values())
  const dates = sample.map(draw => draw.draw_date).sort()
  const expected = sample.length * 7 / 36

  return (
    <details className="statistics-panel" id="statistics-panel">
      <summary>
        <div><span className="eyebrow">Data & metode</span><h2>Statistik og metode</h2><p>Frekvenser, sandsynlighed og beregningens datagrundlag.</p></div>
        <span className="statistics-toggle" aria-hidden="true">＋</span>
      </summary>
      <div className="statistics-content">
        <section className="theory-grid" aria-label="Den statistiske teori">
          <div><span className="eyebrow">01 / Kombinatorik</span><p className="statistics-formula">C(36, 7) = 8.347.680</p><p>Så mange forskellige rækker med 7 tal kan vælges blandt 36. Rækkefølgen af tallene er ligegyldig.</p></div>
          <div><span className="eyebrow">02 / Sandsynlighed</span><p className="statistics-formula">P(tal n) = 7 / 36</p><p>Hvert tal har samme chance for at indgå i en fair trækning. Tidligere hyppighed ændrer ikke den sandsynlighed.</p></div>
        </section>
        <section className="frequency-section" aria-labelledby="frequency-heading">
          <div className="statistics-heading"><h3 id="frequency-heading">Observationer fra arkivet</h3><span className="mono">{sample.length} trækninger</span></div>
          {sample.length > 0 ? <>
            <p className="statistics-caption">Antal gange hvert tal optræder i de {sample.length} seneste tilgængelige, gyldige 7/36-trækninger ({dateLabel(dates[0])}–{dateLabel(dates[dates.length - 1])}). Dette udsnit er til visningen her; kørslens datagrundlag står i kørselsnoterne nedenfor.</p>
            <div className="frequency-grid" role="list" aria-label="Observeret hyppighed for tal 1 til 36">
              {Array.from({ length: 36 }, (_, i) => {
                const number = i + 1
                const count = frequency.get(number) ?? 0
                return <div className="frequency-cell" role="listitem" key={number} aria-label={`Tal ${number}: ${count} af ${sample.length} trækninger`}>
                  <span className="mono frequency-number">{number}</span><div className="frequency-track" aria-hidden="true"><span style={{ width: `${count / maximum * 100}%` }} /></div><span className="mono frequency-count">{count}</span>
                </div>
              })}
            </div>
            <p className="statistics-caption formula-note">Forventet antal pr. tal: {sample.length} × 7 / 36 ≈ {expected.toLocaleString('da-DK', { maximumFractionDigits: 1 })}. Tilfældige udsving er forventelige; grafen dokumenterer ikke en fordel ved næste trækning.</p>
          </> : <p className="statistics-caption">Ingen gyldige historiske trækninger tilgængelige til frekvensvisningen lige nu.</p>}
        </section>
        <section className="run-notes" aria-labelledby="run-notes-heading">
          <div className="statistics-heading"><h3 id="run-notes-heading">Kørselsnoter</h3><Link href="/backtests">Se registrerede backtests ↗</Link></div>
          <dl><div><dt>Kørsel registreret</dt><dd><time dateTime={run.created_at}>{new Date(run.created_at).toLocaleString('da-DK', { timeZone: 'Europe/Copenhagen' })}</time></dd></div><div><dt>Generator / modelversion</dt><dd className="mono">{run.model_version ?? 'Ikke oplyst'}</dd></div></dl>
          <p className="run-notes-text">{run.notes ?? 'Der er ikke gemt yderligere metode- eller kørselsnoter for denne beregning.'}</p>
        </section>
      </div>
    </details>
  )
}
