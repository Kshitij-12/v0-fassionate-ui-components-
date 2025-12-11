import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/supabase/generated/types"

export const supabaseClient = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)
