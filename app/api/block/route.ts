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

    const { target_user_id, action } = await request.json()

    if (!target_user_id || !["block", "unblock"].includes(action)) {
      return NextResponse.json({ error: "Invalid target_user_id or action" }, { status: 400 })
    }

    if (action === "block") {
      const { error } = await supabaseServer.from("blocks").upsert(
        {
          blocker_id: userData.user.id,
          blocked_id: target_user_id,
        },
        {
          onConflict: "blocker_id,blocked_id",
        },
      )

      if (error) throw new Error(error.message)
      return NextResponse.json({ blocked: true }, { status: 201 })
    } else {
      const { error } = await supabaseServer
        .from("blocks")
        .delete()
        .eq("blocker_id", userData.user.id)
        .eq("blocked_id", target_user_id)

      if (error) throw new Error(error.message)
      return NextResponse.json({ unblocked: true })
    }
  } catch (error) {
    console.error("[POST /api/block]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
