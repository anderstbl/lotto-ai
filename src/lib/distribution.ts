import type { PredictionNumberStatistic, PredictionRunAnalysis } from '@/types'

const close = (a: number, b: number) => Number.isFinite(a) && Math.abs(a - b) < 0.000001

// Reject partial or inconsistent snapshots rather than filling them with current draw data.
export function isCompleteDistribution(
  runId: string,
  analysis: PredictionRunAnalysis,
  statistics: PredictionNumberStatistic[],
): boolean {
  if (analysis.prediction_run_id !== runId || analysis.game_numbers !== 36 || analysis.numbers_per_draw !== 7) return false
  const n = analysis.draw_count
  if (!Number.isSafeInteger(n) || n <= 0 || statistics.length !== 36 || new Set(statistics.map(s => s.number)).size !== 36) return false
  const first = Date.parse(analysis.first_draw_date)
  const last = Date.parse(analysis.last_draw_date)
  const cutoff = Date.parse(analysis.data_cutoff_at)
  if (![first, last, cutoff].every(Number.isFinite) || first > last || last > cutoff) return false

  const p = 7 / 36
  const expected = n * p
  const sd = Math.sqrt(n * p * (1 - p))
  const reference = statistics[0]
  if (!statistics.every(s =>
    s.prediction_run_id === runId && Number.isInteger(s.number) && s.number >= 1 && s.number <= 36 &&
    Number.isInteger(s.observed_count) && s.observed_count >= 0 && s.observed_count <= n &&
    close(s.observed_frequency, s.observed_count / n) && close(s.expected_frequency, p) &&
    close(s.expected_count, expected) && close(s.deviation_count, s.observed_count - expected) &&
    close(s.standardized_deviation, (s.observed_count - expected) / sd) &&
    Number.isInteger(s.null_count_interval_lower) && Number.isInteger(s.null_count_interval_upper) &&
    s.null_count_interval_lower >= 0 && s.null_count_interval_lower <= s.null_count_interval_upper &&
    s.null_count_interval_upper <= n && s.interval_level > 0 && s.interval_level < 1 &&
    s.interval_level === reference.interval_level && s.interval_method === reference.interval_method &&
    typeof s.interval_method === 'string' && s.interval_method.length > 0 &&
    s.null_count_interval_lower === reference.null_count_interval_lower &&
    s.null_count_interval_upper === reference.null_count_interval_upper
  )) return false

  return statistics.reduce((sum, s) => sum + s.observed_count, 0) === n * 7
}
