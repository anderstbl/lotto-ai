export const MANUAL_SCORE_KEY = 'lottoai.manual-highscore.v1'

export interface ManualHighscore {
  version: 1
  points: number
  matches: number
  attempts: number
}

// Separate 10,000-point tiers ensure that one extra match always wins.
// Within a tier, an inverse-square-root bonus rewards fewer manual tickets
// without making a late six/seven-match result worthless.
export function manualScore(matches: number, attempts: number): number {
  if (!Number.isInteger(matches) || matches < 0 || matches > 7 || !Number.isSafeInteger(attempts) || attempts < 1) return 0
  return matches === 0 ? 0 : matches * 10_000 + Math.floor(9_999 / Math.sqrt(attempts))
}

export function betterHighscore(candidate: ManualHighscore, previous: ManualHighscore | null): boolean {
  return previous === null || candidate.points > previous.points
    || (candidate.points === previous.points && candidate.attempts < previous.attempts)
}

export function readHighscore(value: string | null): ManualHighscore | null {
  if (!value) return null
  try {
    const record = JSON.parse(value) as ManualHighscore
    if (record.version !== 1 || !Number.isInteger(record.matches) || record.matches < 1 || record.matches > 7
      || !Number.isSafeInteger(record.attempts) || record.attempts < 1
      || record.points !== manualScore(record.matches, record.attempts)) return null
    return { version: 1, points: record.points, matches: record.matches, attempts: record.attempts }
  } catch { return null }
}
