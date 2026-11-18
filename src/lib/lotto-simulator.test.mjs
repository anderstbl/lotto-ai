import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  createRandomInt, drawNumbers, emptySimulation, jackpotChance,
  JACKPOT_ODDS, SESSION_LIMIT, simulateBatch,
} from './lotto-simulator.ts'

test('odds match all combinations of seven numbers from 36', () => {
  let combinations = 1
  for (let i = 1; i <= 7; i++) combinations = combinations * (37 - i) / i
  assert.equal(combinations, JACKPOT_ODDS)
  assert.equal(jackpotChance(0), 0)
  assert.ok(Math.abs(jackpotChance(1) - 1 / JACKPOT_ODDS) < 1e-15)
  assert.ok(jackpotChance(JACKPOT_ODDS) > 0.632 && jackpotChance(JACKPOT_ODDS) < 0.633)
})

test('real random draws always contain seven distinct sorted balls from 1 to 36', () => {
  const randomInt = createRandomInt()
  for (let i = 0; i < 1000; i++) {
    const draw = drawNumbers(randomInt)
    assert.equal(new Set(draw).size, 7)
    assert.ok(draw.every(n => n >= 1 && n <= 36))
    assert.deepEqual(draw, [...draw].sort((a, b) => a - b))
  }
})

test('jackpot stops a batch immediately and leaves previous state unchanged', () => {
  const previous = emptySimulation()
  const next = simulateBatch(previous, [1, 2, 3, 4, 5, 6, 7], 500, () => 0)
  assert.equal(next.attempts, 1)
  assert.equal(next.counts[7], 1)
  assert.equal(next.bestMatches, 7)
  assert.equal(previous.attempts, 0)
  assert.equal(previous.counts[7], 0)
})

test('batch counts matches accurately and respects the session cap', () => {
  const selected = [1, 2, 3, 4, 5, 35, 36]
  const previous = { ...emptySimulation(), attempts: SESSION_LIMIT - 2 }
  const next = simulateBatch(previous, selected, 100, () => 0)
  assert.equal(next.attempts, SESSION_LIMIT)
  assert.equal(next.counts[5], 2)
  assert.equal(next.bestMatches, 5)
  assert.deepEqual(next.latest, [1, 2, 3, 4, 5, 6, 7])
  const full = simulateBatch(emptySimulation(), selected, 123, () => 0)
  assert.equal(full.counts.reduce((sum, value) => sum + value, 0), 123)
})
