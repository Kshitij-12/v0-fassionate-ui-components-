import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("posts")
      .select(
        `
        id,
        image_url,
        caption,
        tags,
        created_at,
        user_id,
        profiles:user_id(username, avatar_url),
        likes(count)
      `
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform response to include like_count
    const transformedData = (data || []).map((post: any) => ({
      ...post,
      like_count: post.likes?.[0]?.count ?? 0,
      likes: undefined,
    }));

    return NextResponse.json({ data: transformedData }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}
