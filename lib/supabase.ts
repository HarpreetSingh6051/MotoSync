import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = (
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  ''
).trim()

const anonKey = (
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  ''
).trim()

/**
 * Universal Demo & Live data handling
 */
export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null

export const dataMode = isSupabaseConfigured ? 'live' : 'demo'

export const publicMediaUrl = (path?: string | null) => {
  if (!path) return null
  if (path.startsWith('http') || path.startsWith('data:')) return path
  const base = process.env.EXPO_PUBLIC_R2_PUBLIC_BASE_URL?.trim() || ''
  return base ? `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}` : path
}
