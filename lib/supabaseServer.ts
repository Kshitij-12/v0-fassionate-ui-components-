import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !serviceRole) {
  throw new Error(
    "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  );
}

export const supabaseServer = createClient(url, serviceRole, {
  auth: { persistSession: false },
});
export async function validateToken(authHeader?: string) {
  try {
    const token = authHeader?.replace(/^Bearer\s+/i, "").trim();
    if (!token) return { user: null, error: "No token provided" };

    const {
      data: { user },
      error,
    } = await supabaseServer.auth.getUser(token);

    return { user, error: error?.message };
  } catch (err) {
    return { user: null, error: String(err) };
  }
}