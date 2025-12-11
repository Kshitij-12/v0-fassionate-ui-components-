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

    const { following_id, action } = await request.json()

    if (!following_id || !action) {
      return NextResponse.json({ error: "Missing following_id or action" }, { status: 400 })
    }

    if (action === "follow") {
      const { error } = await supabaseServer.from("followers").insert([
        {
          follower_id: userData.user.id,
          following_id,
        },
      ])

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, action: "followed" }, { status: 201 })
    } else if (action === "unfollow") {
      const { error } = await supabaseServer
        .from("followers")
        .delete()
        .eq("follower_id", userData.user.id)
        .eq("following_id", following_id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, action: "unfollowed" }, { status: 200 })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[POST /api/follow]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
