// src/lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase() {
  // Si l'instance existe déjà, la retourner
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase env vars missing:', {
      url: supabaseUrl,
      key: supabaseAnonKey ? 'set (hidden)' : 'missing'
    })
    throw new Error('Missing Supabase environment variables')
  }

  // Créer l'instance une seule fois
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
}