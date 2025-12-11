import { NextResponse } from 'next/server'
import { supabaseServer, getUserFromToken } from '@/lib/supabaseServer'

export async function POST(req: Request) {
  try {
    const auth = req.headers.get('authorization') ?? ''
    const token = auth.startsWith('Bearer ') ? auth.split(' ')[1] : auth || null

    const { data: user, error: userErr } = await getUserFromToken(token)
    if (userErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })

    const { target_id, score } = body
    if (!target_id || typeof target_id !== 'string') {
      return NextResponse.json({ error: 'target_id (string) is required' }, { status: 400 })
    }
    if (score !== undefined && typeof score !== 'number') {
      return NextResponse.json({ error: 'score must be a number' }, { status: 400 })
    }

    const insert = {
      user_id: user.id,
      target_id,
      score: score ?? 0,
    }

    const { data, error } = await supabaseServer
      .from('taste_matches')
      .insert(insert)
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ taste_match: data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
