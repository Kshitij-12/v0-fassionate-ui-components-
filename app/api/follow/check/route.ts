import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

export async function GET(request: NextRequest) {
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

    const userId = request.nextUrl.searchParams.get("user_id")

    if (!userId) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 })
    }

    const { data } = await supabaseServer
      .from("followers")
      .select()
      .eq("follower_id", userData.user.id)
      .eq("following_id", userId)
      .single()

    return NextResponse.json({ isFollowing: !!data })
  } catch (error) {
    console.error("[GET /api/follow/check]", error)
    return NextResponse.json({ isFollowing: false })
  }
}
