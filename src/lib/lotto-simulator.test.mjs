import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  createRandomInt, drawNumbers, emptySimulation, jackpotChance,
  JACKPOT_ODDS, ROW_PRICE, isValidRow, simulateBatch,
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

test('batch counts matches accurately and continues beyond a million attempts', () => {
  const selected = [1, 2, 3, 4, 5, 35, 36]
  const previous = { ...emptySimulation(), attempts: 999_998 }
  const next = simulateBatch(previous, selected, 100, () => 0)
  assert.equal(next.attempts, 1_000_098)
  assert.equal(next.counts[5], 100)
  assert.equal(next.bestMatches, 5)
  assert.deepEqual(next.latest, [1, 2, 3, 4, 5, 6, 7])
  const full = simulateBatch(emptySimulation(), selected, 123, () => 0)
  assert.equal(full.counts.reduce((sum, value) => sum + value, 0), 123)
})

test('winning rows are validated and every attempt costs 10 kroner', () => {
  assert.equal(ROW_PRICE, 10)
  assert.equal(isValidRow([1, 2, 3, 4, 5, 6, 36]), true)
  for (const invalid of [[1, 2], [1, 1, 2, 3, 4, 5, 6], [0, 2, 3, 4, 5, 6, 7], [1, 2, 3, 4, 5, 6, 37]]) {
    assert.equal(isValidRow(invalid), false)
  }
})

test('manual and automatic batches form one continuous game and stop at the winning row', () => {
  const winning = [1, 2, 3, 4, 5, 6, 7]
  let calls = 0
  const randomInt = () => calls++ === 0 ? 7 : 0
  const manual = simulateBatch(emptySimulation(), winning, 1, randomInt)
  assert.equal(manual.attempts, 1)
  assert.equal(manual.bestMatches, 6)
  const automatic = simulateBatch(manual, winning, 500, randomInt)
  assert.equal(automatic.attempts, 2)
  assert.equal(automatic.counts[7], 1)
  assert.equal(automatic.attempts * ROW_PRICE, 20)
  assert.deepEqual(automatic.latest, winning)
  assert.deepEqual(simulateBatch(automatic, winning, 500, randomInt), automatic)
})
