import test from 'node:test'
import assert from 'node:assert/strict'
import { getRunRanking } from '../src/lib/ranking.ts'

const TOTAL = 8347680
const MAXIMUM = 25482
const HASH = 'a'.repeat(64)
const VERSION = 'distribution_profile_v1'
const profile = numbers => ({
  sum: numbers.reduce((a, n) => a + n, 0), even_count: numbers.filter(n => n % 2 === 0).length,
  band_1_12_count: numbers.filter(n => n <= 12).length,
  band_13_24_count: numbers.filter(n => n >= 13 && n <= 24).length,
  band_25_36_count: numbers.filter(n => n >= 25).length,
})
function setCount(p, count) {
  p.score_details.profile_combination_count = count
  p.distribution_score = 100 * count / MAXIMUM
  p.profile_probability = count / TOTAL
}
function fixture() {
  const runId = 'test-run'
  const rows = [
    [6,9,20,21,27,31,32], [7,18,24,25,30,33,34], [4,5,13,19,26,28,33],
    [9,17,20,23,30,32,34], [4,5,6,8,16,21,25], [4,8,14,16,17,29,30],
    [3,11,17,20,25,29,35], [6,11,23,27,32,34,36], [6,9,10,11,26,29,36], [13,18,21,22,24,30,33],
  ]
  const counts = [21909,9375,8580,7188,6421,4565,3997,2315,1835,1149]
  const predictions = rows.map((numbers, i) => {
    const p = { id: `prediction-${i}`, prediction_run_id: runId, rank: i + 1, numbers,
      score_details: { profile: profile(numbers), ranking_version: VERSION, generation_order: i + 1,
        total_combinations: TOTAL, max_profile_combination_count: MAXIMUM, distribution_artifact_hash: HASH },
    }
    setCount(p, counts[i])
    return p
  })
  const distribution = { status: 'ready', analysis: {
    prediction_run_id: runId, ranking_version: VERSION, ranking_definition: 'Profile frequency, not win probability',
    ranking_parameters: {
      total_combinations: TOTAL, distribution_version: VERSION,
      score_formula: '100 * profile_combination_count / max_profile_combination_count',
      bands: [[1,12],[13,24],[25,36]],
      profile_properties: ['even_count','band_1_12_count','band_13_24_count','band_25_36_count','sum'],
      tie_breaker: 'numeric lexicographic ascending comparison of sorted seven-number rows',
      max_profile_combination_count: MAXIMUM, distribution_artifact_sha256: HASH,
    },
  }, statistics: [] }
  return { runId, predictions, distribution }
}
const check = f => getRunRanking(f.runId, f.predictions, f.distribution)

test('accepts supplied rank order even when input array is shuffled', () => {
  const f = fixture()
  f.predictions.reverse()
  const r = check(f)
  assert.equal(r.status, 'ranked')
  assert.deepEqual(r.predictions.map(p => p.rank), [1,2,3,4,5,6,7,8,9,10])
  assert.equal(f.predictions[0].rank, 10, 'does not mutate the supplied predictions')
})

test('keeps unscored historical data as legacy rather than inventing scores', () => {
  const f = fixture()
  f.predictions.forEach(p => { p.distribution_score = null; p.profile_probability = null; p.score_details = null })
  f.distribution.analysis.ranking_version = null
  assert.equal(check(f).status, 'legacy')
  f.distribution = { status: 'missing' }
  assert.equal(check(f).status, 'legacy')
})

test('does not call scored data legacy when the analysis is missing or unavailable', () => {
  const f = fixture()
  for (const status of ['missing','invalid','unavailable']) {
    f.distribution = { status }
    assert.equal(check(f).status, 'unavailable')
  }
})

test('does not interpret future versions using the current formula', () => {
  const f = fixture()
  f.distribution.analysis.ranking_version = 'future-v2'
  assert.equal(check(f).status, 'unavailable')
})

test('rejects partial or inconsistent scores and mismatched artifacts', () => {
  for (const mutate of [
    f => f.predictions.pop(),
    f => f.predictions[0].distribution_score++,
    f => f.predictions[0].distribution_score = NaN,
    f => f.predictions[0].profile_probability = 0.86,
    f => f.predictions[0].score_details.profile.even_count++,
    f => f.predictions[0].score_details.profile.sum++,
    f => f.predictions[0].score_details.profile.band_1_12_count++,
    f => f.predictions[0].score_details.distribution_artifact_hash = 'b'.repeat(64),
    f => f.predictions[0].score_details = null,
    f => f.predictions[0].prediction_run_id = 'other-run',
    f => f.distribution.analysis.prediction_run_id = 'other-run',
    f => f.predictions[0].score_details.generation_order = f.predictions[1].score_details.generation_order,
    f => f.predictions[0].rank = 2,
    f => f.predictions[0].numbers[0] = 0,
    f => f.distribution.analysis.ranking_parameters.score_formula = '100 * win_probability',
    f => f.distribution.analysis.ranking_version = null,
  ]) {
    const f = fixture(); mutate(f)
    assert.equal(check(f).status, 'invalid', String(mutate))
  }
})

test('rejects ranks inconsistent with descending score', () => {
  const f = fixture()
  f.predictions[0].rank = 2; f.predictions[1].rank = 1
  assert.equal(check(f).status, 'invalid')
})

test('uses numeric, not textual, row order to validate a score tie', () => {
  const f = fixture()
  f.predictions[0].numbers = [2,6,10,13,24,27,36]
  f.predictions[1].numbers = [10,11,14,20,23,28,35]
  for (const p of f.predictions.slice(0,2)) { p.score_details.profile = profile(p.numbers); setCount(p,21909) }
  assert.equal(check(f).status, 'ranked')
  f.predictions[0].rank = 2; f.predictions[1].rank = 1
  assert.equal(check(f).status, 'invalid')
})

test('rejects duplicate suggestions even if profiles and score formulas agree', () => {
  const f = fixture()
  f.predictions[1].numbers = [...f.predictions[0].numbers]
  f.predictions[1].score_details.profile = profile(f.predictions[1].numbers)
  setCount(f.predictions[1],21909)
  assert.equal(check(f).status, 'invalid')
})
