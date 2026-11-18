export interface SharedHighscore {
  id: string
  player_name: string
  points: number
  matches: number
  attempts: number
  created_at: string
}

export interface ScoreSubmission {
  submission_id: string
  draw_id: string
  row_numbers: number[]
  attempts: number
}

export function normalizePlayerName(value: string): string {
  return value.trim().replace(/\s+/gu, ' ')
}

export function validPlayerName(value: string): boolean {
  const length = Array.from(value).length
  return length >= 2 && length <= 24 && /^[\p{L}\p{N} ._-]+$/u.test(value)
}

export function validScoreSubmission(value: unknown): value is ScoreSubmission & { player_name: string } {
  if (!value || typeof value !== 'object') return false
  const s = value as Record<string, unknown>
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return typeof s.player_name === 'string' && validPlayerName(normalizePlayerName(s.player_name))
    && typeof s.submission_id === 'string' && uuid.test(s.submission_id)
    && typeof s.draw_id === 'string' && uuid.test(s.draw_id)
    && typeof s.attempts === 'number' && Number.isInteger(s.attempts) && s.attempts >= 1 && s.attempts <= 1_000_000_000
    && Array.isArray(s.row_numbers) && s.row_numbers.length === 7 && new Set(s.row_numbers).size === 7
    && s.row_numbers.every(n => typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 36)
}
