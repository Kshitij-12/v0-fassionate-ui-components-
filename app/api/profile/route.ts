import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const user_id = url.searchParams.get("user_id");
    if (!user_id) return NextResponse.json({ error: "Missing user_id" }, { status: 400 });

    const { data: profile, error: profileErr } = await supabaseServer
      .from("profiles")
      .select("id, username, display_name, bio, avatar_url, created_at")
      .eq("id", user_id)
      .maybeSingle();

    if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 500 });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    // Get counts
    const [postResult, followerResult, followingResult] = await Promise.all([
      supabaseServer.from("posts").select("*", { count: "exact", head: true }).eq("user_id", user_id),
      supabaseServer.from("followers").select("*", { count: "exact", head: true }).eq("following_id", user_id),
      supabaseServer.from("followers").select("*", { count: "exact", head: true }).eq("follower_id", user_id),
    ]);

    const post_count = postResult.count ?? 0;
    const follower_count = followerResult.count ?? 0;
    const following_count = followingResult.count ?? 0;

    return NextResponse.json(
      {
        ...profile,
        post_count,
        follower_count,
        following_count,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}
