import test from 'node:test'
import assert from 'node:assert/strict'
import { isCompleteDistribution } from '../src/lib/distribution.ts'

function fixture() {
  const runId = 'test-run'
  const n = 36
  const p = 7 / 36
  const expected = n * p
  return {
    runId,
    analysis: {
      prediction_run_id: runId, game_numbers: 36, numbers_per_draw: 7, draw_count: n,
      first_draw_date: '2025-01-01', last_draw_date: '2025-09-01', data_cutoff_at: '2025-09-02T00:00:00Z',
    },
    statistics: Array.from({ length: 36 }, (_, i) => ({
      prediction_run_id: runId, number: i + 1, observed_count: 7, observed_frequency: p,
      expected_count: expected, expected_frequency: p, deviation_count: 0, standardized_deviation: 0,
      null_count_interval_lower: 3, null_count_interval_upper: 12, interval_level: 0.95, interval_method: 'test-method',
    })),
  }
}

function setCount(f, index, count) {
  const s = f.statistics[index]
  const n = f.analysis.draw_count
  const p = 7 / 36
  Object.assign(s, {
    observed_count: count, observed_frequency: count / n,
    deviation_count: count - n * p,
    standardized_deviation: (count - n * p) / Math.sqrt(n * p * (1 - p)),
  })
}
const valid = f => isCompleteDistribution(f.runId, f.analysis, f.statistics)

test('accepts a complete snapshot with variation between numbers', () => {
  const f = fixture()
  setCount(f, 0, 5)
  setCount(f, 1, 9)
  assert.equal(valid(f), true)
})

test('does not substitute another run’s snapshot', () => {
  const f = fixture()
  f.analysis.prediction_run_id = 'newer-run'
  assert.equal(valid(f), false)
  f.analysis.prediction_run_id = f.runId
  f.statistics[0].prediction_run_id = 'newer-run'
  assert.equal(valid(f), false)
})

test('rejects partial and duplicated number statistics', () => {
  const f = fixture()
  assert.equal(valid({ ...f, statistics: f.statistics.slice(1) }), false)
  f.statistics[35] = { ...f.statistics[0] }
  assert.equal(valid(f), false)
})

test('rejects internally coherent rows whose totals do not match the draw count', () => {
  const f = fixture()
  setCount(f, 0, 8)
  assert.equal(valid(f), false)
})

test('rejects invalid counts, non-finite values, and inconsistent derived fields', () => {
  for (const change of [
    { observed_count: -1 }, { observed_count: 37 }, { observed_frequency: NaN },
    { expected_count: 8 }, { expected_frequency: 0.5 },
    { standardized_deviation: Infinity }, { deviation_count: 1 },
  ]) {
    const f = fixture()
    Object.assign(f.statistics[0], change)
    assert.equal(valid(f), false, JSON.stringify(change))
  }
})

test('rejects impossible or mismatched intervals', () => {
  for (const change of [
    { null_count_interval_lower: 13 }, { null_count_interval_upper: 37 },
    { interval_level: 1 }, { interval_level: 0.9 }, { interval_method: '' },
  ]) {
    const f = fixture()
    Object.assign(f.statistics[0], change)
    assert.equal(valid(f), false)
  }
})

test('rejects unsupported game formats, no draws, and invalid date boundaries', () => {
  for (const change of [
    { game_numbers: 49 }, { draw_count: 0 }, { draw_count: 1.5 },
    { first_draw_date: 'invalid' }, { first_draw_date: '2026-01-01' },
    { data_cutoff_at: '2025-08-01' },
  ]) {
    const f = fixture()
    Object.assign(f.analysis, change)
    assert.equal(valid(f), false)
  }
})
