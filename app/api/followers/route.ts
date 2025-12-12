import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id")

    if (!user_id) {
      return NextResponse.json({ error: "user_id required" }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from("followers")
      .select(
        `
        follower_id,
        profiles!followers_follower_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        )
      `,
      )
      .eq("following_id", user_id)

    if (error) {
      throw new Error(error.message)
    }

    const followers = data?.map((f) => f.profiles) || []
    return NextResponse.json({ followers })
  } catch (error) {
    console.error("[GET /api/followers]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
