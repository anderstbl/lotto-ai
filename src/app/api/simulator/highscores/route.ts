import { getSupabase } from '@/lib/supabase'
import { normalizePlayerName, validScoreSubmission } from '@/lib/shared-highscore'

const fields = 'id,player_name,points,matches,attempts,created_at'
const headers = { 'Cache-Control': 'no-store' }

export async function GET() {
  try {
    const { data, error } = await getSupabase().from('simulator_highscores').select(fields)
      .order('points', { ascending: false }).order('attempts').order('created_at').order('id').limit(20)
    if (error) throw error
    return Response.json({ scores: data ?? [] }, { headers })
  } catch {
    return Response.json({ error: 'Highscorelisten kunne ikke hentes. Prøv igen.' }, { status: 503, headers })
  }
}

export async function POST(request: Request) {
  if (Number(request.headers.get('content-length')) > 4096) return Response.json({ error: 'Indsendelsen er for stor.' }, { status: 413 })
  let body: unknown
  try {
    const text = await request.text()
    if (text.length > 4096) return Response.json({ error: 'Indsendelsen er for stor.' }, { status: 413 })
    body = JSON.parse(text)
  } catch { return Response.json({ error: 'Ugyldig indsendelse.' }, { status: 400 }) }
  if (!validScoreSubmission(body)) return Response.json({ error: 'Angiv et navn på 2–24 tegn med bogstaver, tal, mellemrum, punktum, _ eller -.' }, { status: 400 })
  const entry = { submission_id: body.submission_id, player_name: normalizePlayerName(body.player_name), draw_id: body.draw_id,
    row_numbers: [...body.row_numbers].sort((a, b) => a - b), attempts: body.attempts }
  try {
    const db = getSupabase()
    const { data, error } = await db.from('simulator_highscores').insert(entry).select(fields).single()
    if (error?.code === '23505') {
      // A network retry must not create a second entry for the same ticket.
      const existing = await db.from('simulator_highscores').select(`${fields},draw_id,row_numbers`)
        .eq('submission_id', entry.submission_id).single()
      if (existing.data && existing.data.player_name === entry.player_name && existing.data.attempts === entry.attempts
        && existing.data.draw_id === entry.draw_id && JSON.stringify(existing.data.row_numbers) === JSON.stringify(entry.row_numbers)) {
        const { draw_id: ignoredDraw, row_numbers: ignoredRow, ...score } = existing.data
        void ignoredDraw; void ignoredRow
        return Response.json({ score }, { headers })
      }
      return Response.json({ error: 'Denne kupon er allerede gemt på listen.' }, { status: 409 })
    }
    if (error) {
      if (['23514', '23503', '22P02'].includes(error.code)) return Response.json({ error: 'Resultatet kunne ikke godkendes mod vindertallene.' }, { status: 400 })
      throw error
    }
    return Response.json({ score: data }, { status: 201, headers })
  } catch {
    return Response.json({ error: 'Resultatet kunne ikke gemmes lige nu. Prøv igen.' }, { status: 503 })
  }
}
