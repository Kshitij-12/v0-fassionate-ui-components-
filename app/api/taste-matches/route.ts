import { NextResponse } from "next/server";
import { supabaseServer, validateToken } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  try {
    const { user, error } = await validateToken(req.headers.get("authorization") || "");
    if (!user || error) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user_id = user.id;

    const { data, error } = await supabaseServer
      .from("taste_matches")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}
