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

    const { target_user_id, action } = body
    if (!target_user_id || typeof target_user_id !== 'string') {
      return NextResponse.json({ error: 'target_user_id (string) is required' }, { status: 400 })
    }
    if (!["follow", "unfollow"].includes(action)) {
      return NextResponse.json({ error: 'action must be "follow" or "unfollow"' }, { status: 400 })
    }

    if (action === 'follow') {
      // idempotent follow: ignore duplicates using upsert on (follower_id, following_id)
      const { error } = await supabaseServer
        .from('followers')
        .upsert({ follower_id: user.id, following_id: target_user_id }, { onConflict: ['follower_id', 'following_id'] })

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      return NextResponse.json({ followed: true }, { status: 201 })
    } else {
      const { error } = await supabaseServer
        .from('followers')
        .delete()
        .match({ follower_id: user.id, following_id: target_user_id })

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      return NextResponse.json({ unfollowed: true })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
