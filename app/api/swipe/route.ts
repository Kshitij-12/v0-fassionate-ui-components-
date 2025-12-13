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

    const { post_id, value } = await request.json()

    if (!post_id || ![0, 1, 2].includes(value)) {
      return NextResponse.json({ error: "Invalid post_id or value" }, { status: 400 })
    }

    // Insert swipe (trigger will update taste vector)
    const { data, error } = await supabaseServer
      .from("swipes")
      .upsert(
        {
          user_id: userData.user.id,
          post_id,
          value,
        },
        {
          onConflict: "user_id,post_id",
        },
      )
      .select()

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ success: true, swipe: data }, { status: 201 })
  } catch (error) {
    console.error("[POST /api/swipe]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
