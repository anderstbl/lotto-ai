import type { PredictionRun } from '@/types'

export default function RunStatus({ run, count }: { run: PredictionRun; count: number }) {
  return <section className="run-panel" aria-label="Status for seneste beregning">
    <div className="run-heading"><span className="eyebrow muted">Beregningsstatus</span><span className={`status-pill ${count ? 'is-ready' : ''}`}><i aria-hidden="true" />{count ? 'Resultat tilgængeligt' : 'Afventer rækker'}</span></div>
    <ol className="run-flow">
      <li className="is-complete"><span className="step-number">01</span><div><strong>Kørsel registreret</strong><span><time dateTime={run.created_at}>{new Date(run.created_at).toLocaleString('da-DK', { timeZone: 'Europe/Copenhagen', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</time></span></div></li>
      <li className={count ? 'is-complete' : ''}><span className="step-number">02</span><div><strong>Rækker gemt</strong><span>{count} rækker i denne kørsel</span></div></li>
      <li className={count ? 'is-complete' : ''}><span className="step-number">03</span><div><strong>{count ? 'Klar til at udforske' : 'Venter på resultat'}</strong><span>{count ? 'Se tal og metoder nedenfor' : 'Ingen rækker tilgængelige endnu'}</span></div></li>
    </ol>
    <div className="run-meta mono"><span>MODEL / {run.model_version ?? 'Ikke oplyst'}</span><span>Senest gemte kørsel · ikke live-status</span></div>
  </section>
}
