import { test } from 'node:test'
import assert from 'node:assert/strict'
import { previousWeekRange, rowRank, searchBatch } from './jackpot-search.ts'
import { createRandomInt, JACKPOT_ODDS } from './lotto-simulator.ts'

test('previous week uses Danish calendar weeks, including year and timezone boundaries', () => {
  assert.deepEqual(previousWeekRange(new Date('2026-11-18T12:00:00Z')), { start: '2026-11-09', end: '2026-11-16' })
  assert.deepEqual(previousWeekRange(new Date('2026-11-15T23:30:00Z')), { start: '2026-11-09', end: '2026-11-16' })
  assert.deepEqual(previousWeekRange(new Date('2026-01-01T12:00:00Z')), { start: '2025-12-22', end: '2025-12-29' })
})

test('ranks span all possible rows, ignore order and reject invalid imports', () => {
  assert.equal(rowRank([1, 2, 3, 4, 5, 6, 7]), 0)
  assert.equal(rowRank([30, 31, 32, 33, 34, 35, 36]), JACKPOT_ODDS - 1)
  assert.equal(rowRank([7, 6, 5, 4, 3, 2, 1]), 0)
  for (const invalid of [[1, 2], [1, 1, 2, 3, 4, 5, 6], [0, 2, 3, 4, 5, 6, 7], [1, 2, 3, 4, 5, 6, 37]]) {
    assert.throws(() => rowRank(invalid))
  }
  // Exhaust a contiguous prefix of the combinatorial ranking (10 choose 7).
  const ranks = new Set()
  function visit(row, start) {
    if (row.length === 7) { ranks.add(rowRank(row)); return }
    for (let n = start; n <= 10; n++) visit([...row, n], n + 1)
  }
  visit([], 1)
  assert.equal(ranks.size, 120)
  assert.deepEqual([...ranks].sort((a, b) => a - b), Array.from({ length: 120 }, (_, i) => i))
})

test('counts first successful attempt precisely and can search beyond a million rows', () => {
  let calls = 0
  assert.deepEqual(searchBatch(42, 2_000_000, bound => {
    assert.equal(bound, JACKPOT_ODDS)
    return ++calls === 1_000_007 ? 42 : 0
  }), { attempts: 1_000_007, found: true })
  assert.equal(calls, 1_000_007)
  assert.deepEqual(searchBatch(0, 10, () => 0), { attempts: 1, found: true })
  assert.deepEqual(searchBatch(42, 100, () => 0), { attempts: 100, found: false })
})

test('random row ranks stay within the full combination space', () => {
  const random = createRandomInt()
  for (let i = 0; i < 10_000; i++) {
    const rank = random(JACKPOT_ODDS)
    assert.ok(Number.isInteger(rank) && rank >= 0 && rank < JACKPOT_ODDS)
  }
})
