import type { PredictionRun } from '@/types'

export default function RunStatus({ run, count }: { run: PredictionRun; count: number }) {
  const date = new Date(run.created_at).toLocaleString('da-DK', {
    timeZone: 'Europe/Copenhagen',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <details className="run-summary" aria-label="Beregningsstatus og detaljer">
      <summary>
        <span className={`run-state ${count > 0 ? 'is-ready' : ''}`}>
          <i aria-hidden="true" />
          {count > 0 ? `${count} rækker klar` : 'Afventer rækker'}
        </span>
        <span className="run-date">Beregnet <time dateTime={run.created_at}>{date}</time></span>
        <span className="run-summary-toggle">Detaljer <span aria-hidden="true">＋</span></span>
      </summary>
      <div className="run-summary-details">
        <dl>
          <div><dt>Generator / modelversion</dt><dd className="mono">{run.model_version ?? 'Ikke oplyst'}</dd></div>
          <div><dt>Kørsels-ID</dt><dd className="mono">{run.id}</dd></div>
        </dl>
        <p>Viser senest gemte resultat. Status følger ikke beregningen live.</p>
      </div>
    </details>
  )
}
