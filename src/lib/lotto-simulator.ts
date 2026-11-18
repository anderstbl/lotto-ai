export const NUMBER_COUNT = 36
export const ROW_SIZE = 7
export const JACKPOT_ODDS = 8_347_680
export const ROW_PRICE = 10

export function isValidRow(numbers: readonly number[]): boolean {
  return numbers.length === ROW_SIZE && new Set(numbers).size === ROW_SIZE
    && numbers.every(n => Number.isInteger(n) && n >= 1 && n <= NUMBER_COUNT)
}

// Buffer random values to keep accelerated simulations inexpensive. Rejection
// sampling avoids modulo bias when choosing among the remaining balls.
export function createRandomInt() {
  const buffer = new Uint32Array(1024)
  let cursor = buffer.length
  return (upperBound: number): number => {
    const limit = Math.floor(2 ** 32 / upperBound) * upperBound
    let value: number
    do {
      if (cursor === buffer.length) {
        globalThis.crypto.getRandomValues(buffer)
        cursor = 0
      }
      value = buffer[cursor++]
    } while (value >= limit)
    return value % upperBound
  }
}

export function drawNumbers(randomInt: (upperBound: number) => number): number[] {
  const pool = Array.from({ length: NUMBER_COUNT }, (_, i) => i + 1)
  for (let i = 0; i < ROW_SIZE; i++) {
    const index = i + randomInt(NUMBER_COUNT - i)
    ;[pool[i], pool[index]] = [pool[index], pool[i]]
  }
  return pool.slice(0, ROW_SIZE).sort((a, b) => a - b)
}

export interface Simulation {
  attempts: number
  counts: number[]
  latest: number[]
  best: number[]
  bestMatches: number
}

export function emptySimulation(): Simulation {
  return { attempts: 0, counts: Array(8).fill(0), latest: [], best: [], bestMatches: 0 }
}

export function simulateBatch(
  previous: Simulation,
  selected: readonly number[],
  amount: number,
  randomInt: (upperBound: number) => number,
): Simulation {
  const next = { ...previous, counts: [...previous.counts] }
  const chosen = new Set(selected)
  const end = previous.attempts + amount
  while (next.attempts < end && next.counts[7] === 0) {
    const draw = drawNumbers(randomInt)
    const matches = draw.reduce((total, n) => total + Number(chosen.has(n)), 0)
    next.attempts++
    next.counts[matches]++
    next.latest = draw
    if (!next.best.length || matches > next.bestMatches) {
      next.best = draw
      next.bestMatches = matches
    }
  }
  return next
}

export function jackpotChance(attempts: number): number {
  return -Math.expm1(attempts * Math.log1p(-1 / JACKPOT_ODDS))
}
