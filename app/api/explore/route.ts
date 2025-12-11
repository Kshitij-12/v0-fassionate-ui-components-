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

    const filter = request.nextUrl.searchParams.get("filter") || "trending"

    let query = supabaseServer
      .from("profiles")
      .select("id, username, avatar_url, college")
      .neq("id", userData.user.id)
      .limit(50)

    if (filter === "trending") {
      // In a real app, this would be based on engagement metrics
      query = query.order("created_at", { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[GET /api/explore]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
