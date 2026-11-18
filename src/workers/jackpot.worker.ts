import { createRandomInt } from '../lib/lotto-simulator'
import { rowRank, searchBatch } from '../lib/jackpot-search'

self.onmessage = (event: MessageEvent<{ numbers: number[] }>) => {
  const target = rowRank(event.data.numbers)
  const randomInt = createRandomInt()
  const started = performance.now()
  let attempts = 0
  let lastUpdate = started
  // This worker has no artificial attempt cap. Terminating it stops the search.
  while (attempts < Number.MAX_SAFE_INTEGER) {
    const batch = searchBatch(target, Math.min(100_000, Number.MAX_SAFE_INTEGER - attempts), randomInt)
    attempts += batch.attempts
    const now = performance.now()
    if (batch.found || now - lastUpdate >= 100) {
      self.postMessage({ attempts, elapsedMs: now - started, found: batch.found })
      lastUpdate = now
    }
    if (batch.found) return
  }
  throw new Error('Forsøgstælleren har nået sin maksimale værdi')
}
