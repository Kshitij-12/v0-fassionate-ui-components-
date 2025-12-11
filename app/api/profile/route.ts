import { NextResponse } from 'next/server'
import { supabaseServer, getUserFromToken } from '@/lib/supabaseServer'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const user_id = url.searchParams.get('user_id')

    const auth = req.headers.get('authorization') ?? ''
    const token = auth.startsWith('Bearer ') ? auth.split(' ')[1] : auth || null

    if (token) {
      const { data: user, error: userErr } = await getUserFromToken(token)
      if (userErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!user_id) return NextResponse.json({ error: 'user_id query parameter is required' }, { status: 400 })

    const { data, error } = await supabaseServer
      .from('profiles')
      .select('id,username,display_name,bio,avatar_url,created_at')
      .eq('id', user_id)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    return NextResponse.json({ profile: data })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
}
