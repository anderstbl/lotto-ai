export const NUMBER_COUNT = 36
export const ROW_SIZE = 7
export const JACKPOT_ODDS = 8_347_680
export const ROW_PRICE = 10
export const ROWS_PER_TICKET = 10
export const TICKET_PRICE = ROW_PRICE * ROWS_PER_TICKET
export const WEEKLY_ROWS = ROWS_PER_TICKET * 52

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

export interface TicketRow {
  numbers: number[]
  matches: number
}

export interface Simulation {
  attempts: number
  counts: number[]
  latest: number[]
  latestTicket: TicketRow[]
  best: number[]
  bestMatches: number
  milestone: TicketRow | null
}

export function emptySimulation(): Simulation {
  return { attempts: 0, counts: Array(8).fill(0), latest: [], latestTicket: [], best: [], bestMatches: 0, milestone: null }
}

export function simulateBatch(
  previous: Simulation,
  selected: readonly number[],
  amount: number,
  randomInt: (upperBound: number) => number,
): Simulation {
  if (previous.milestone) return previous
  const next = { ...previous, counts: [...previous.counts] }
  const chosen = new Set(selected)
  const end = previous.attempts + Math.ceil(amount / ROWS_PER_TICKET) * ROWS_PER_TICKET
  while (next.attempts < end && !next.milestone) {
    // Buy and evaluate a whole ten-row ticket, including when an early row wins.
    // Stop before the next ticket so spending always reflects complete tickets.
    next.latestTicket = []
    for (let i = 0; i < ROWS_PER_TICKET; i++) {
      const draw = drawNumbers(randomInt)
      const matches = draw.reduce((total, n) => total + Number(chosen.has(n)), 0)
      next.attempts++
      next.counts[matches]++
      next.latest = draw
      next.latestTicket.push({ numbers: draw, matches })
      if (!next.best.length || matches > next.bestMatches) {
        next.best = draw
        next.bestMatches = matches
      }
    }
    const winningRow = next.latestTicket.reduce((best, row) => row.matches > best.matches ? row : best)
    if (winningRow.matches >= 6) next.milestone = winningRow
  }
  return next
}

export function jackpotChance(attempts: number): number {
  return -Math.expm1(attempts * Math.log1p(-1 / JACKPOT_ODDS))
}
