import type { Prediction, RunDistribution, RunRanking } from '@/types'

const VERSION = 'distribution_profile_v1'
const TOTAL = 8347680
const close = (a: number, b: number) => Number.isFinite(a) && Math.abs(a - b) < 1e-8
const numericOrder = (a: number[], b: number[]) => {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]
  return 0
}

// Validate supplied scores; do not invent rankings for unscored historical runs.
export function getRunRanking(runId: string, predictions: Prediction[], distribution: RunDistribution): RunRanking {
  const hasScores = predictions.some(p => p.distribution_score != null || p.profile_probability != null || p.score_details != null)
  if (distribution.status === 'missing') return { status: hasScores ? 'unavailable' : 'legacy' }
  if (distribution.status !== 'ready') return { status: 'unavailable' }
  const a = distribution.analysis
  if (!a.ranking_version) return { status: hasScores ? 'invalid' : 'legacy' }
  if (a.ranking_version !== VERSION) return { status: 'unavailable' }
  const params = a.ranking_parameters
  if (a.prediction_run_id !== runId || !a.ranking_definition || !params || predictions.length !== 10 ||
    params.total_combinations !== TOTAL || params.distribution_version !== VERSION ||
    params.score_formula !== '100 * profile_combination_count / max_profile_combination_count' ||
    JSON.stringify(params.bands) !== '[[1,12],[13,24],[25,36]]' ||
    JSON.stringify(params.profile_properties) !== '["even_count","band_1_12_count","band_13_24_count","band_25_36_count","sum"]' ||
    params.tie_breaker !== 'numeric lexicographic ascending comparison of sorted seven-number rows') return { status: 'invalid' }
  const maximum = params.max_profile_combination_count
  const hash = params.distribution_artifact_sha256
  if (typeof maximum !== 'number' || !Number.isSafeInteger(maximum) || maximum < 1 || maximum > TOTAL ||
    typeof hash !== 'string' || !/^[a-f0-9]{64}$/i.test(hash)) return { status: 'invalid' }

  const ordered = [...predictions].sort((a, b) => a.rank - b.rank)
  const rows = new Set<string>()
  const generationOrders = new Set<number>()
  for (let i = 0; i < ordered.length; i++) {
    const p = ordered[i]
    const d = p.score_details
    const numbers = [...p.numbers].sort((a, b) => a - b)
    if (p.prediction_run_id !== runId || p.rank !== i + 1 || numbers.length !== 7 ||
      new Set(numbers).size !== 7 || numbers.some(n => !Number.isInteger(n) || n < 1 || n > 36) ||
      rows.has(numbers.join(',')) || !d || !d.profile || d.ranking_version !== VERSION ||
      d.total_combinations !== TOTAL || d.max_profile_combination_count !== maximum ||
      d.distribution_artifact_hash !== hash || !Number.isSafeInteger(d.profile_combination_count) ||
      d.profile_combination_count < 1 || d.profile_combination_count > maximum ||
      !Number.isInteger(d.generation_order) || d.generation_order < 1 || d.generation_order > 10 ||
      generationOrders.has(d.generation_order) || typeof p.distribution_score !== 'number' ||
      p.distribution_score < 0 || p.distribution_score > 100 ||
      !close(p.distribution_score, 100 * d.profile_combination_count / maximum) ||
      typeof p.profile_probability !== 'number' || !close(p.profile_probability, d.profile_combination_count / TOTAL) ||
      d.profile.sum !== numbers.reduce((s, n) => s + n, 0) ||
      d.profile.even_count !== numbers.filter(n => n % 2 === 0).length ||
      d.profile.band_1_12_count !== numbers.filter(n => n <= 12).length ||
      d.profile.band_13_24_count !== numbers.filter(n => n >= 13 && n <= 24).length ||
      d.profile.band_25_36_count !== numbers.filter(n => n >= 25).length) return { status: 'invalid' }
    if (i > 0) {
      const previous = ordered[i - 1]
      const count = previous.score_details!.profile_combination_count
      if (count < d.profile_combination_count ||
        (count === d.profile_combination_count && numericOrder([...previous.numbers].sort((a, b) => a - b), numbers) > 0)) return { status: 'invalid' }
    }
    rows.add(numbers.join(','))
    generationOrders.add(d.generation_order)
  }
  return { status: 'ranked', predictions: ordered, analysis: a }
}
