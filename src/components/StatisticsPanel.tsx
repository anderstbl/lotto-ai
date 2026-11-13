import Link from 'next/link'
import type { PredictionRun, RunDistribution } from '@/types'

const number = (value: number, decimals = 1) => value.toLocaleString('da-DK', { maximumFractionDigits: decimals })
const signed = (value: number) => `${value > 0 ? '+' : ''}${number(value)}`
const date = (value: string) => new Date(value).toLocaleDateString('da-DK', { timeZone: 'Europe/Copenhagen' })

export default function StatisticsPanel({ run, distribution }: { run: PredictionRun; distribution: RunDistribution }) {
  const snapshot = distribution.status === 'ready' ? distribution : null
  const reference = snapshot?.statistics[0]
  const outside = snapshot?.statistics.filter(s => s.observed_count < s.null_count_interval_lower || s.observed_count > s.null_count_interval_upper).length ?? 0
  const maximum = snapshot ? Math.max(1, ...snapshot.statistics.map(s => Math.max(s.observed_count, s.null_count_interval_upper))) : 1

  return (
    <details className="statistics-panel" id="statistics-panel">
      <summary>
        <div>
          <span className="eyebrow">Data & metode</span>
          <h2>Fordelingsanalyse</h2>
          <p>{snapshot
            ? `${number(snapshot.analysis.draw_count, 0)} trækninger · ${date(snapshot.analysis.first_draw_date)}–${date(snapshot.analysis.last_draw_date)} · Gemt med beregningen`
            : 'Historiske frekvenser, forventet fordeling og datagrundlag.'}</p>
        </div>
        <span className="statistics-toggle" aria-hidden="true">＋</span>
      </summary>
      <div className="statistics-content">
        {snapshot && reference ? <>
          <div className="analysis-metrics">
            <div><span>Historiske trækninger</span><strong>{number(snapshot.analysis.draw_count, 0)}</strong></div>
            <div><span>Forventet antal pr. tal</span><strong>{number(reference.expected_count)}</strong></div>
            <div><span>{number(reference.interval_level * 100)} % referenceinterval pr. tal</span><strong>{reference.null_count_interval_lower}–{reference.null_count_interval_upper}</strong></div>
          </div>
          <p className="statistics-caption">Analysen er gemt sammen med denne kørsel og bygger på dens fulde datagrundlag. Forventet antal = {number(snapshot.analysis.draw_count, 0)} × {snapshot.analysis.numbers_per_draw} / {snapshot.analysis.game_numbers}. Referenceintervallet viser normale udsving i antallet af forekomster ved en fair trækning.</p>

          <section className="frequency-section" aria-labelledby="frequency-heading">
            <div className="statistics-heading"><h3 id="frequency-heading">Observeret og forventet fordeling</h3><span className="mono">{snapshot.statistics.length} tal</span></div>
            <p className="statistics-caption">Antal forekomster af hvert hovedtal. Markøren viser det forventede antal, og afvigelsen står til højre.</p>
            <div className="frequency-grid" role="list" aria-label="Observeret hyppighed og afvigelse for hvert tal">
              {snapshot.statistics.map(s => <div className="frequency-cell" role="listitem" key={s.number} aria-label={`Tal ${s.number}: ${s.observed_count} forekomster; forventet ${number(s.expected_count)}; afvigelse ${signed(s.deviation_count)}`}>
                <span className="mono frequency-number">{s.number}</span>
                <div className="frequency-track" aria-hidden="true"><span style={{ width: `${s.observed_count / maximum * 100}%` }} /><i className="expected-marker" style={{ left: `${s.expected_count / maximum * 100}%` }} /></div>
                <span className="mono frequency-count">{s.observed_count}</span>
                <span className="mono frequency-deviation">{signed(s.deviation_count)}</span>
              </div>)}
            </div>
            <p className="statistics-caption formula-note">{outside} af {snapshot.statistics.length} tal ligger uden for deres individuelle {number(reference.interval_level * 100)} % referenceinterval. Når mange tal undersøges, kan enkelte afvigelser opstå alene ved tilfældighed. Det er ikke en samlet signifikanstest eller en prognose for næste trækning.</p>
            <details className="method-details statistics-table-details">
              <summary>Se tal, afvigelser og referenceintervaller <span aria-hidden="true">＋</span></summary>
              <div className="analysis-table-scroll" role="region" aria-label="Detaljeret fordelingsanalyse" tabIndex={0}>
                <table className="analysis-table">
                  <caption>Gemte værdier for denne kørsel. Standardiseret afvigelse er forskellen fra forventningen målt i standardafvigelser.</caption>
                  <thead><tr><th scope="col">Tal</th><th scope="col">Observeret</th><th scope="col">Andel</th><th scope="col">Forventet</th><th scope="col">Afvigelse</th><th scope="col">Standardiseret</th><th scope="col">Referenceinterval</th></tr></thead>
                  <tbody>{snapshot.statistics.map(s => <tr key={s.number}>
                    <th scope="row">{s.number}</th><td>{s.observed_count}</td><td>{number(s.observed_frequency * 100)} %</td><td>{number(s.expected_count)}</td><td>{signed(s.deviation_count)}</td><td>{number(s.standardized_deviation, 2)}</td><td>{s.null_count_interval_lower}–{s.null_count_interval_upper} ({number(s.interval_level * 100)} %)</td>
                  </tr>)}</tbody>
                </table>
              </div>
            </details>
          </section>
        </> : <p className="analysis-empty" role="status">
          {distribution.status === 'missing'
            ? 'Der er ikke gemt en fordelingsanalyse for denne kørsel. Rækker og originale kørselsnoter er stadig tilgængelige.'
            : distribution.status === 'invalid'
              ? 'Den gemte fordelingsanalyse er ufuldstændig eller inkonsistent og kan ikke vises. Rækkerne vises fortsat.'
              : 'Fordelingsanalysen kunne ikke hentes lige nu. Prøv igen senere.'}
        </p>}

        <section className="theory-grid analysis-theory" aria-label="Den statistiske teori">
          <div><span className="eyebrow">Kombinatorik</span><p className="statistics-formula">C(36, 7) = 8.347.680</p><p>Så mange forskellige rækker med 7 tal kan vælges blandt 36. Rækkefølgen af tallene er ligegyldig.</p></div>
          <div><span className="eyebrow">Sandsynlighed</span><p className="statistics-formula">P(tal n) = 7 / 36</p><p>Hvert tal har samme chance for at indgå i en fair, uafhængig trækning. Tidligere hyppighed ændrer ikke sandsynligheden næste gang.</p></div>
        </section>
        <section className="run-notes" aria-labelledby="run-notes-heading">
          <div className="statistics-heading"><h3 id="run-notes-heading">Datagrundlag og kørselsnoter</h3><Link href="/backtests">Se backtests ↗</Link></div>
          <dl>
            <div><dt>Kørsel registreret</dt><dd><time dateTime={run.created_at}>{new Date(run.created_at).toLocaleString('da-DK', { timeZone: 'Europe/Copenhagen' })}</time></dd></div>
            <div><dt>Generator / modelversion</dt><dd className="mono">{run.model_version ?? 'Ikke oplyst'}</dd></div>
            {snapshot && <>
              <div><dt>Datakilde</dt><dd>{snapshot.analysis.source_description}</dd></div>
              <div><dt>Backtest</dt><dd>{snapshot.analysis.backtest_status === 'not_run' ? 'Ikke udført' : snapshot.analysis.backtest_status === 'available' ? 'Registrerede resultater — se backtests' : snapshot.analysis.backtest_status}</dd></div>
              <div><dt>Udelukkede trækninger</dt><dd>{number(snapshot.analysis.excluded_draw_count, 0)}</dd></div>
              <div><dt>Dataafgrænsning</dt><dd><time dateTime={snapshot.analysis.data_cutoff_at}>{new Date(snapshot.analysis.data_cutoff_at).toLocaleString('da-DK', { timeZone: 'Europe/Copenhagen' })}</time></dd></div>
            </>}
          </dl>
          {run.notes && <p className="run-notes-text">{run.notes}</p>}
          {snapshot && <details className="method-details analysis-provenance">
            <summary>Reproducerbarhed og analyseparametre <span aria-hidden="true">＋</span></summary>
            <dl>
              <div><dt>Analyseversion</dt><dd className="mono">{snapshot.analysis.analysis_version}</dd></div>
              <div><dt>Tilfældighedsseed</dt><dd className="mono">{String(snapshot.analysis.random_seed)}</dd></div>
              <div><dt>Intervalmetode</dt><dd className="mono">{reference?.interval_method}</dd></div>
              <div><dt>Datasættets hash</dt><dd className="mono">{snapshot.analysis.source_dataset_hash}</dd></div>
            </dl>
            <h4>Gemte generatorparametre</h4><pre>{JSON.stringify(snapshot.analysis.generation_parameters, null, 2)}</pre>
            <h4>Datavalidering fra beregningsjobbet</h4><pre>{JSON.stringify(snapshot.analysis.validation_summary, null, 2)}</pre>
          </details>}
        </section>
      </div>
    </details>
  )
}
