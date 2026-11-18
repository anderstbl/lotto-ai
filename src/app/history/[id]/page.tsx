import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPredictionRunById, getPredictionsForRun, getDistributionForRun } from '@/lib/queries'
import PredictionResults from '@/components/PredictionResults'
import StatisticsPanel from '@/components/StatisticsPanel'

export const dynamic = 'force-dynamic'

export default async function RunDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const run = await getPredictionRunById(id)
  if (!run) notFound()
  const [predictions, distribution] = await Promise.all([getPredictionsForRun(run.id), getDistributionForRun(run.id)])
  return <div className="space-y-8"><div><Link href="/history" className="text-sm muted">← Tilbage til historik</Link><p className="eyebrow accent mt-7 mb-3">Tidligere beregning</p><h1 className="text-3xl font-semibold tracking-tight">Beregningens resultat</h1></div><PredictionResults predictions={predictions} run={run} distribution={distribution} /><StatisticsPanel run={run} distribution={distribution} /></div>
}
