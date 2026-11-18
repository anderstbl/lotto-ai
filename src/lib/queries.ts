import { getSupabase } from './supabase'
import { previousWeekRange, rowRank } from './jackpot-search'
import type { Draw, PredictionRun, Prediction, Backtest } from '@/types'

function toNumberArray(value: unknown): number[] {
  if (Array.isArray(value)) return value.map(Number)
  if (typeof value === 'string') {
    try { return JSON.parse(value).map(Number) } catch { /* fall through */ }
    return value.split(',').map((s) => Number(s.trim())).filter((n) => !isNaN(n))
  }
  return []
}

export async function getLatestPredictionRun(): Promise<PredictionRun | null> {
  const { data, error } = await getSupabase()
    .from('prediction_runs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    console.error('getLatestPredictionRun:', error.message)
    return null
  }
  return data?.[0] ?? null
}

export async function getPredictionsForRun(runId: string): Promise<Prediction[]> {
  const { data, error } = await getSupabase()
    .from('predictions')
    .select('*')
    .eq('prediction_run_id', runId)
    .order('rank', { ascending: true })

  if (error) {
    console.error('getPredictionsForRun:', error.message)
    return []
  }
  return (data ?? []).map((p) => ({ ...p, numbers: toNumberArray(p.numbers) }))
}

export async function getPredictionRuns(limit = 20): Promise<PredictionRun[]> {
  const { data, error } = await getSupabase()
    .from('prediction_runs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('getPredictionRuns:', error.message)
    return []
  }
  return data ?? []
}

export async function getPredictionRunById(id: string): Promise<PredictionRun | null> {
  const { data, error } = await getSupabase()
    .from('prediction_runs')
    .select('*')
    .eq('id', id)
    .limit(1)

  if (error) {
    console.error('getPredictionRunById:', error.message)
    return null
  }
  return data?.[0] ?? null
}

export async function getDraws(limit = 52): Promise<Draw[]> {
  const { data, error } = await getSupabase()
    .from('draws')
    .select('*')
    .order('draw_date', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('getDraws:', error.message)
    return []
  }
  return (data ?? []).map((d) => ({
    ...d,
    numbers: toNumberArray(d.numbers),
    bonus_numbers: toNumberArray(d.bonus_numbers),
  }))
}

export async function getBacktests(limit = 50): Promise<Backtest[]> {
  const { data, error } = await getSupabase()
    .from('backtests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('getBacktests:', error.message)
    return []
  }
  return data ?? []
}

export function computeNumberFrequency(draws: Draw[]): Map<number, number> {
  const freq = new Map<number, number>()
  for (const draw of draws) {
    for (const n of draw.numbers) {
      freq.set(n, (freq.get(n) ?? 0) + 1)
    }
  }
  return freq
}

// Only use draws from the previous calendar week in Denmark. Never silently
// substitute an older draw when imports are delayed.
export async function getPreviousWeekDraw(): Promise<Draw | null> {
  try {
    const { start, end } = previousWeekRange()
    const { data, error } = await getSupabase()
      .from('draws')
      .select('*')
      .gte('draw_date', start)
      .lt('draw_date', end)
      .order('draw_date', { ascending: false })
      .limit(1)
    if (error) throw error
    if (!data?.[0]) return null
    const draw = { ...data[0], numbers: toNumberArray(data[0].numbers), bonus_numbers: toNumberArray(data[0].bonus_numbers) }
    rowRank(draw.numbers) // Reject malformed imports before offering a search.
    return draw
  } catch (error) {
    console.error('getPreviousWeekDraw:', error instanceof Error ? error.message : 'Kunne ikke hente trækningen')
    return null
  }
}
