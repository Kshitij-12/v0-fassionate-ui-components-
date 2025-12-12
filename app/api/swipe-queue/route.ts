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

    // Get user's profile to check college and aesthetics
    const { data: profile } = await supabaseServer
      .from("profiles")
      .select("college, aesthetics")
      .eq("id", userData.user.id)
      .single()

    // Get posts the user hasn't swiped yet
    // Prioritize: same college -> same aesthetic -> recent posts
    const { data: swipedPostIds } = await supabaseServer
      .from("swipes")
      .select("post_id")
      .eq("user_id", userData.user.id)

    const swipedIds = swipedPostIds?.map((s) => s.post_id) || []

    let query = supabaseServer
      .from("posts")
      .select(
        `
        id,
        image_url,
        caption,
        tags,
        created_at,
        user_id,
        profiles!posts_user_id_fkey (
          id,
          username,
          avatar_url,
          college,
          aesthetics
        )
      `,
      )
      .neq("user_id", userData.user.id)
      .order("created_at", { ascending: false })
      .limit(30)

    if (swipedIds.length > 0) {
      query = query.not("id", "in", `(${swipedIds.join(",")})`)
    }

    const { data: posts, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    // Sort by priority: same college first, then same aesthetic
    const sortedPosts = posts?.sort((a, b) => {
      const aProfile = a.profiles as any
      const bProfile = b.profiles as any

      // Same college gets highest priority
      const aCollege = aProfile?.college === profile?.college ? 1 : 0
      const bCollege = bProfile?.college === profile?.college ? 1 : 0

      if (aCollege !== bCollege) return bCollege - aCollege

      // Same aesthetic gets second priority
      const aAesthetic = a.tags?.some((tag: string) => profile?.aesthetics?.includes(tag)) ? 1 : 0
      const bAesthetic = b.tags?.some((tag: string) => profile?.aesthetics?.includes(tag)) ? 1 : 0

      return bAesthetic - aAesthetic
    })

    return NextResponse.json({ posts: sortedPosts || [] })
  } catch (error) {
    console.error("[GET /api/swipe-queue]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
