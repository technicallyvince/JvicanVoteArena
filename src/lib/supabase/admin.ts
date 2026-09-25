import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy admin client - never crash at build time if env vars are not yet populated in CI
let adminInstance: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient | null {
  if (adminInstance) return adminInstance

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return null
  }

  adminInstance = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return adminInstance
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdmin()
    if (!client) {
      throw new Error(
        'Supabase Admin client accessed without SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL configured.'
      )
    }
    return (client as any)[prop]
  },
})

