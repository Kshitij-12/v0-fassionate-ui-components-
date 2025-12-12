import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/supabase/generated/types"

let serverClient: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseServer() {
  if (serverClient) {
    return serverClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("[v0] Missing Supabase credentials:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
    })
    throw new Error("Missing Supabase credentials in environment variables")
  }

  serverClient = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return serverClient
}

// Export for backward compatibility
export const supabaseServer = getSupabaseServer()
