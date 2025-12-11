import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || ""
    );

    const url = new URL(req.url);
    const userId = url.searchParams.get("user_id");

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing user_id query parameter" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get profile info
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError || !profileData) {
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get post count
    const { count: postCount, error: postCountError } = await supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    // Get follower count
    const { count: followerCount, error: followerCountError } = await supabase
      .from("followers")
      .select("follower_id", { count: "exact", head: true })
      .eq("following_id", userId);

    // Get following count
    const { count: followingCount, error: followingCountError } = await supabase
      .from("followers")
      .select("following_id", { count: "exact", head: true })
      .eq("follower_id", userId);

    // Get recent posts
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (postsError && postsError.code !== "PGRST116") {
      console.error("Error fetching posts:", postsError);
    }

    return new Response(
      JSON.stringify({
        ...profileData,
        post_count: postCount || 0,
        follower_count: followerCount || 0,
        following_count: followingCount || 0,
        posts: posts || [],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
