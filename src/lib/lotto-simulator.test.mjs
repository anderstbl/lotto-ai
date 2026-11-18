import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  createRandomInt, drawNumbers, emptySimulation, jackpotChance,
  JACKPOT_ODDS, ROW_PRICE, ROWS_PER_TICKET, TICKET_PRICE, WEEKLY_ROWS, isValidRow, simulateBatch,
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

test('jackpot completes the paid ticket and stops before the next ticket', () => {
  const previous = emptySimulation()
  const next = simulateBatch(previous, [1, 2, 3, 4, 5, 6, 7], 500, () => 0)
  assert.equal(next.attempts, 10)
  assert.equal(next.counts[7], 10)
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
  assert.equal(full.counts.reduce((sum, value) => sum + value, 0), 130)
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
  const randomInt = () => { const call = calls++; return call < 70 && call % 7 === 0 ? 7 : 0 }
  const manual = simulateBatch(emptySimulation(), winning, 1, randomInt)
  assert.equal(manual.attempts, 10)
  assert.equal(manual.bestMatches, 6)
  const automatic = simulateBatch({ ...manual, milestone: null }, winning, 500, randomInt)
  assert.equal(automatic.attempts, 20)
  assert.equal(automatic.counts[7], 10)
  assert.equal(automatic.attempts * ROW_PRICE, 200)
  assert.deepEqual(automatic.latest, winning)
  assert.deepEqual(simulateBatch(automatic, winning, 500, randomInt), automatic)
})

test('one manual ticket contains ten scored rows and has a 100 kroner receipt', () => {
  const winning = [1, 2, 3, 4, 5, 35, 36]
  const first = simulateBatch(emptySimulation(), winning, ROWS_PER_TICKET, () => 0)
  assert.equal(first.latestTicket.length, 10)
  assert.ok(first.latestTicket.every(row => row.matches === 5 && isValidRow(row.numbers)))
  assert.equal(first.attempts, 10)
  assert.equal(first.attempts * ROW_PRICE, TICKET_PRICE)
  assert.equal(TICKET_PRICE, 100)
  const second = simulateBatch(first, winning, ROWS_PER_TICKET, () => 0)
  assert.equal(second.attempts, 20)
  assert.equal(second.latestTicket.length, 10)
  assert.equal(first.attempts, 10)
  assert.equal(second.counts[5], 20)
})

test('a year of ten rows a week is 52 tickets and 5,200 kroner', () => {
  const year = simulateBatch(emptySimulation(), [1, 2, 3, 4, 5, 35, 36], WEEKLY_ROWS, () => 0)
  assert.equal(year.attempts, 520)
  assert.equal(year.attempts / ROWS_PER_TICKET, 52)
  assert.equal(year.attempts / WEEKLY_ROWS, 1)
  assert.equal(year.attempts * ROW_PRICE, 5200)
})

test('six matches pauses after the winning ticket, without buying the remaining automatic batch', () => {
  const winning = [1, 2, 3, 4, 5, 6, 8]
  const first = simulateBatch(emptySimulation(), winning, 10_000, () => 0)
  assert.equal(first.attempts, 10)
  assert.equal(first.milestone.matches, 6)
  assert.equal(first.counts[6], 10)
  assert.equal(first.attempts * ROW_PRICE, 100)
  let randomCalls = 0
  const paused = simulateBatch(first, winning, 500, () => { randomCalls++; return 0 })
  assert.equal(paused, first)
  assert.equal(randomCalls, 0)
  const resumed = simulateBatch({ ...first, milestone: null }, winning, 500, () => 0)
  assert.equal(resumed.attempts, 20)
  assert.equal(resumed.milestone.matches, 6)
  assert.equal(resumed.attempts * ROW_PRICE, 200)
})

test('play can continue after seven matches without resetting the receipt', () => {
  const winning = [1, 2, 3, 4, 5, 6, 7]
  const jackpot = simulateBatch(emptySimulation(), winning, 500, () => 0)
  assert.equal(jackpot.milestone.matches, 7)
  const next = simulateBatch({ ...jackpot, milestone: null }, winning, 10, () => 0)
  assert.equal(next.attempts, 20)
  assert.equal(next.counts[7], 20)
  assert.equal(next.attempts * ROW_PRICE, 200)
})
