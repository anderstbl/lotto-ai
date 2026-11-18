import { test } from 'node:test'
import assert from 'node:assert/strict'
import { manualScore, betterHighscore, readHighscore } from './manual-score.ts'

test('published scoring examples and zero-match behavior', () => {
  assert.equal(manualScore(6, 1), 69_999)
  assert.equal(manualScore(6, 4), 64_999)
  assert.equal(manualScore(7, 1), 79_999)
  assert.equal(manualScore(0, 1), 0)
})

test('one more match always beats any faster result in a lower tier', () => {
  for (let matches = 1; matches <= 7; matches++) {
    assert.ok(manualScore(matches, 1_000_000) > manualScore(matches - 1, 1))
  }
})

test('fewer attempts improve the same result; attempts break rounded ties', () => {
  for (let matches = 1; matches <= 7; matches++) {
    assert.ok(manualScore(matches, 1) > manualScore(matches, 4))
    assert.ok(manualScore(matches, 4) > manualScore(matches, 100))
  }
  const old = { version: 1, points: manualScore(3, 1_000_001), matches: 3, attempts: 1_000_001 }
  const quicker = { ...old, points: manualScore(3, 1_000_000), attempts: 1_000_000 }
  assert.equal(betterHighscore(quicker, old), true)
  assert.equal(betterHighscore(old, quicker), false)
})

test('invalid inputs cannot manufacture a score', () => {
  for (const [matches, attempts] of [[8, 1], [-1, 1], [3.5, 1], [3, 0], [3, Infinity], [3, 1.5]]) {
    assert.equal(manualScore(matches, attempts), 0)
  }
})

test('only consistent versioned local records are restored', () => {
  const record = { version: 1, points: 69_999, matches: 6, attempts: 1 }
  assert.deepEqual(readHighscore(JSON.stringify(record)), record)
  for (const value of [null, '{', 'null', '{}', JSON.stringify({ ...record, points: 99999999 }), JSON.stringify({ ...record, version: 2 }), JSON.stringify({ ...record, attempts: 0 })]) {
    assert.equal(readHighscore(value), null)
  }
  assert.equal(betterHighscore(record, null), true)
  assert.equal(betterHighscore({ ...record, points: manualScore(5, 1), matches: 5 }, record), false)
})
