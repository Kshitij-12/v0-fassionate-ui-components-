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

    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "50"), 100)
    const mode = searchParams.get("mode") || "niche"
    const cursor = searchParams.get("cursor") // For pagination

    // Get user's profile for filtering
    const { data: profile } = await supabaseServer
      .from("profiles")
      .select("college, aesthetics")
      .eq("id", userData.user.id)
      .single()

    // Get blocked users to filter out
    const { data: blockedUsers } = await supabaseServer
      .from("blocks")
      .select("blocked_id")
      .eq("blocker_id", userData.user.id)

    const blockedIds = blockedUsers?.map((b) => b.blocked_id) || []

    let query = supabaseServer
      .from("posts")
      .select(
        `
        id,
        user_id,
        caption,
        image_url,
        tags,
        created_at,
        profiles!posts_user_id_fkey (
          id,
          username,
          avatar_url,
          college,
          aesthetics
        )
      `,
      )
      .order("created_at", { ascending: false })
      .limit(limit)

    if (blockedIds.length > 0) {
      query = query.not("user_id", "in", `(${blockedIds.join(",")})`)
    }

    if (mode === "following") {
      // Only show posts from users you follow
      const { data: following } = await supabaseServer
        .from("followers")
        .select("following_id")
        .eq("follower_id", userData.user.id)

      const followingIds = following?.map((f) => f.following_id) || []
      if (followingIds.length > 0) {
        query = query.in("user_id", followingIds)
      } else {
        // No following, return empty
        return NextResponse.json([])
      }
    } else if (mode === "niche" && profile?.college) {
      // Show same college and same aesthetics
      // Note: This is a simplified filter - in production you'd use more sophisticated matching
    }
    // discover mode = all posts (default)

    if (cursor) {
      query = query.lt("created_at", cursor)
    }

    const { data: posts, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    const postsWithLikes = await Promise.all(
      (posts || []).map(async (post) => {
        const { count } = await supabaseServer
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", post.id)

        const { data: userLike } = await supabaseServer
          .from("likes")
          .select("id")
          .eq("post_id", post.id)
          .eq("user_id", userData.user.id)
          .single()

        return {
          ...post,
          like_count: count || 0,
          user_has_liked: !!userLike,
          author_username: (post.profiles as any)?.username || "Unknown",
          author_avatar_url: (post.profiles as any)?.avatar_url || null,
        }
      }),
    )

    return NextResponse.json(postsWithLikes)
  } catch (error) {
    console.error("[GET /api/feed]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
