import { createBrowserClient, SupabaseClient } from '@supabase/ssr'

let supabaseInstance: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  // Return cached instance if available
  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Check if we're in browser and env vars are missing
  if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
    console.error(
      'Missing Supabase environment variables. Please configure:\n' +
      '- NEXT_PUBLIC_SUPABASE_URL\n' +
      '- NEXT_PUBLIC_SUPABASE_ANON_KEY\n\n' +
      'See .env.example for reference.'
    )
    // Return a minimal client that will fail gracefully
    // This allows the app to load and show appropriate error states
  }

  // Use placeholder values during SSR/build to prevent errors
  const url = supabaseUrl || 'https://placeholder.supabase.co'
  const key = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'

  supabaseInstance = createBrowserClient(url, key)
  return supabaseInstance
}

