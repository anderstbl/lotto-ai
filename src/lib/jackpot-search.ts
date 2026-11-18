export function previousWeekRange(now = new Date()) {
  const localDate = now.toLocaleDateString('sv-SE', { timeZone: 'Europe/Copenhagen' })
  const monday = new Date(`${localDate}T00:00:00Z`)
  monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7)
  const start = new Date(monday)
  start.setUTCDate(start.getUTCDate() - 7)
  return { start: start.toISOString().slice(0, 10), end: monday.toISOString().slice(0, 10) }
}

function choose(n: number, k: number): number {
  let result = 1
  for (let i = 1; i <= k; i++) result = result * (n - i + 1) / i
  return Math.round(result)
}

// Colexicographic ranking gives every possible row its own integer in
// [0, 8_347_680). Sampling these integers is exactly sampling uniform rows,
// avoiding millions of unnecessary array allocations and sorts.
export function rowRank(numbers: readonly number[]): number {
  if (numbers.length !== 7 || new Set(numbers).size !== 7 || numbers.some(n => !Number.isInteger(n) || n < 1 || n > 36)) {
    throw new Error('Forventede syv forskellige tal mellem 1 og 36')
  }
  return [...numbers].sort((a, b) => a - b).reduce((sum, n, i) => sum + choose(n - 1, i + 1), 0)
}

export function searchBatch(targetRank: number, amount: number, randomInt: (bound: number) => number) {
  for (let attempts = 1; attempts <= amount; attempts++) {
    if (randomInt(8_347_680) === targetRank) return { attempts, found: true }
  }
  return { attempts: amount, found: false }
}

export interface SearchProgress {
  attempts: number
  elapsedMs: number
  found: boolean
}
