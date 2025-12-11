import { NextResponse } from "next/server";
import { supabaseServer, validateToken } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image_url, caption, tags } = body ?? {};
    if (!image_url) return NextResponse.json({ error: "Missing image_url" }, { status: 400 });

    const { user, error } = await validateToken(req.headers.get("authorization") || "");
    if (!user || error) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user_id = user.id;

    const { data, error } = await supabaseServer
      .from("posts")
      .insert({
        user_id,
        image_url,
        caption: caption ?? null,
        tags: Array.isArray(tags) ? tags : null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}
