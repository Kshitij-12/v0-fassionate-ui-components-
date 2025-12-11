import { NextResponse } from 'next/server'
import { supabaseServer, getUserFromToken } from '@/lib/supabaseServer'

export async function GET(req: Request) {
  try {
    const auth = req.headers.get('authorization') ?? ''
    const token = auth.startsWith('Bearer ') ? auth.split(' ')[1] : auth || null

    const { data: user, error: userErr } = await getUserFromToken(token)
    if (userErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const LIMIT = 50

    const { data, error } = await supabaseServer
      .from('taste_matches')
      .select('id,user_id,target_id,score,created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(LIMIT)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ taste_matches: data })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
