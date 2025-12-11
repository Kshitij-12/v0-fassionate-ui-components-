import { NextResponse } from "next/server";
import { supabaseServer, validateToken } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { target_id } = body ?? {};
    if (!target_id) return NextResponse.json({ error: "Missing target_id" }, { status: 400 });

    const { user, error } = await validateToken(req.headers.get("authorization") || "");
    if (!user || error) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const follower_id = user.id;
    if (follower_id === target_id) return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });

    // Check if already following
    const { data: existing } = await supabaseServer
      .from("followers")
      .select("*")
      .eq("follower_id", follower_id)
      .eq("following_id", target_id)
      .maybeSingle();

    if (existing) return NextResponse.json({ message: "Already following" }, { status: 200 });

    const { data, error } = await supabaseServer
      .from("followers")
      .insert({ follower_id, following_id: target_id })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}
