import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/supabase/generated/types"

let supabaseClientInstance: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getSupabaseClient() {
  if (supabaseClientInstance) {
    return supabaseClientInstance
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    console.error("[v0] Missing Supabase environment variables")
    throw new Error("Missing Supabase configuration")
  }

  supabaseClientInstance = createBrowserClient<Database>(url, anonKey)
  return supabaseClientInstance
}

export const supabaseClient = getSupabaseClient()
