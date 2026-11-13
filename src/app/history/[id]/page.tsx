import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPredictionRunById, getPredictionsForRun } from '@/lib/queries'
import PredictionResults from '@/components/PredictionResults'
import RunStatus from '@/components/RunStatus'

export const dynamic = 'force-dynamic'

export default async function RunDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const run = await getPredictionRunById(id)
  if (!run) notFound()
  const predictions = await getPredictionsForRun(run.id)
  return <div className="space-y-8"><div><Link href="/history" className="text-sm muted">← Tilbage til historik</Link><p className="eyebrow accent mt-7 mb-3">Fra laboratoriets arkiv</p><h1 className="text-3xl font-semibold tracking-tight">Beregningens resultat</h1></div><RunStatus run={run} count={predictions.length} /><PredictionResults predictions={predictions} />{run.notes && <details className="method-details"><summary>Datagrundlag & kørselsnoter <span aria-hidden="true">＋</span></summary><p className="muted text-sm leading-relaxed pt-4">{run.notes}</p></details>}</div>
}
