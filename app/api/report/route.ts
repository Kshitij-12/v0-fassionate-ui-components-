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

    const { reported_user_id, reported_post_id, reason } = await request.json()

    if (!reason || (!reported_user_id && !reported_post_id)) {
      return NextResponse.json({ error: "Invalid report data" }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from("reports")
      .insert({
        reporter_id: userData.user.id,
        reported_user_id,
        reported_post_id,
        reason,
      })
      .select()

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true, report: data }, { status: 201 })
  } catch (error) {
    console.error("[POST /api/report]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
