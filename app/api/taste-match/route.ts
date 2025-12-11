import { NextResponse } from "next/server";
import { supabaseServer, validateToken } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { target_id, score, details } = body ?? {};

    if (!target_id || typeof score !== "number") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { user, error } = await validateToken(req.headers.get("authorization") || "");
    if (!user || error) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user_id = user.id;

    const { data, error } = await supabaseServer
      .from("taste_matches")
      .insert({ user_id, target_id, score, details })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}
