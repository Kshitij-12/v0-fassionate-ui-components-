import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/supabase/generated/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Missing environment variables NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY'
  )
}

export const supabaseServer = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
})

export async function getUserFromToken(token?: string | null) {
  if (!token) return { data: null, error: { message: 'No token provided' } }
  try {
    const { data, error } = await supabaseServer.auth.getUser(token)
    return { data: data?.user ?? null, error }
  } catch (err: any) {
    return { data: null, error: { message: err?.message ?? String(err) } }
  }
}