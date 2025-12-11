import { NextResponse } from 'next/server'
import { supabaseServer, getUserFromToken } from '@/lib/supabaseServer'

export async function GET(req: Request) {
  try {
    // optional auth: validate if token present
    const auth = req.headers.get('authorization') ?? ''
    const token = auth.startsWith('Bearer ') ? auth.split(' ')[1] : auth || null

    if (token) {
      const { data: user, error: userErr } = await getUserFromToken(token)
      if (userErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const LIMIT = 50

    // Try RPC first (recommended for stable nested / aggregate)
    const { data: rpcData, error: rpcErr } = await supabaseServer.rpc('get_feed_public', { limit_arg: LIMIT })

    if (!rpcErr && rpcData) {
      const feed = (rpcData as any[]).map((r: any) => ({
        id: r.post_id,
        image_url: r.image_url,
        caption: r.caption,
        tags: r.tags,
        created_at: r.created_at,
        author: {
          id: r.author_id,
          username: r.author_username,
          avatar_url: r.author_avatar_url,
        },
        like_count: Number(r.like_count ?? 0),
      }))
      return NextResponse.json({ feed })
    }

    // Fallback: aggregate on server-side
    const { data, error } = await supabaseServer
      .from('posts')
      .select(
        `id,image_url,caption,tags,created_at, author:profiles (id,username,avatar_url), _likes:likes (id)`
      )
      .order('created_at', { ascending: false })
      .limit(LIMIT)

    if (error) return NextResponse.json({ error: (rpcErr?.message ?? error.message) || 'Failed to load feed' }, { status: 500 })

    const transformed = (data || []).map((p: any) => ({
      id: p.id,
      image_url: p.image_url,
      caption: p.caption,
      tags: p.tags,
      created_at: p.created_at,
      author: p.author ? { id: p.author.id, username: p.author.username, avatar_url: p.author.avatar_url } : null,
      like_count: Array.isArray(p._likes) ? p._likes.length : 0,
    }))

    return NextResponse.json({ feed: transformed })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
