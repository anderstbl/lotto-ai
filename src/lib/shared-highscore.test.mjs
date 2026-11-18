import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizePlayerName, validPlayerName, validScoreSubmission } from './shared-highscore.ts'

test('normalizes names and accepts Danish names without HTML or controls', () => {
  assert.equal(normalizePlayerName('  Anders   L  '), 'Anders L')
  assert.equal(validPlayerName('Søren-Åge'), true)
  for (const name of ['A', 'A'.repeat(25), '<script>', 'Anders\nL', '🎰']) assert.equal(validPlayerName(name), false)
})

test('validates complete result payloads and rejects invented attempts and malformed rows', () => {
  const valid = { submission_id: '44444444-4444-4444-8444-444444444444', draw_id: '666d96ca-1ede-4c7b-a1df-d50d071fe138', row_numbers: [1,2,3,4,5,6,7], player_name: 'Anders', attempts: 1 }
  assert.equal(validScoreSubmission(valid), true)
  for (const patch of [{attempts:0},{attempts:1.5},{attempts:Infinity},{row_numbers:[1,1,2,3,4,5,6]},{row_numbers:[0,2,3,4,5,6,7]},{draw_id:'bad'},{player_name:' '},{player_name:4}]) assert.equal(validScoreSubmission({...valid,...patch}), false)
  assert.equal(validScoreSubmission(null), false)
})
