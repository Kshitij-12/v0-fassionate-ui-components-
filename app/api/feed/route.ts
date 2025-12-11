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

    const limit = Math.min(Number.parseInt(request.nextUrl.searchParams.get("limit") || "50"), 100)

    // Call RPC to get feed with likes
    const { data, error } = await supabaseServer.rpc("get_feed_public", {
      limit_arg: limit,
      current_user_id: userData.user.id,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[GET /api/feed]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
