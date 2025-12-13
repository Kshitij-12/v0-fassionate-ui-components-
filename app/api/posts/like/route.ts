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

    const { post_id } = await request.json()

    if (!post_id) {
      return NextResponse.json({ error: "Missing post_id" }, { status: 400 })
    }

    // Check if already liked
    const { data: existingLike } = await supabaseServer
      .from("likes")
      .select()
      .eq("post_id", post_id)
      .eq("user_id", userData.user.id)
      .single()

    if (existingLike) {
      // Unlike
      await supabaseServer.from("likes").delete().eq("id", existingLike.id)
      return NextResponse.json({ action: "unliked" })
    } else {
      // Like
      await supabaseServer.from("likes").insert([{ post_id, user_id: userData.user.id }])

      return NextResponse.json({ action: "liked" }, { status: 201 })
    }
  } catch (error) {
    console.error("[POST /api/posts/like]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
