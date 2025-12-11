import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { data: userData, error: userError } = await supabaseServer.auth.getUser(token)

    if (userError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { caption, tags, image_url } = await request.json()

    if (!caption || !image_url) {
      return NextResponse.json({ error: "Missing caption or image_url" }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from("posts")
      .insert([
        {
          user_id: userData.user.id,
          caption,
          tags: tags || [],
          image_url,
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error("[POST /api/posts]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
