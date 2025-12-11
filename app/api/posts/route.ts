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

    const { image_url, caption, tags } = body

    if (!image_url || typeof image_url !== 'string') {
      return NextResponse.json({ error: 'image_url (string) is required' }, { status: 400 })
    }
    if (caption && typeof caption !== 'string') {
      return NextResponse.json({ error: 'caption must be a string' }, { status: 400 })
    }
    if (tags && !Array.isArray(tags)) {
      return NextResponse.json({ error: 'tags must be an array of strings' }, { status: 400 })
    }

    const insert = {
      user_id: user.id,
      image_url,
      caption: caption ?? null,
      tags: tags && tags.length ? tags : null,
    }

    const { data, error } = await supabaseServer
      .from('posts')
      .insert(insert)
      .select('id,image_url,caption,tags,created_at')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ post: data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
