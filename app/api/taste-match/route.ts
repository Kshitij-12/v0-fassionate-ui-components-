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

    const { matched_user_id, match_percentage } = await request.json()

    if (!matched_user_id || match_percentage === undefined) {
      return NextResponse.json({ error: "Missing matched_user_id or match_percentage" }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from("taste_matches")
      .insert([
        {
          user_id: userData.user.id,
          matched_user_id,
          match_percentage,
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error("[POST /api/taste-match]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
