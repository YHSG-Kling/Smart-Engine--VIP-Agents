import { createClient } from '@supabase/supabase-js';

// Access Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables exist
if (!supabaseUrl) {
  console.error('[Supabase] Missing VITE_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  console.error('[Supabase] Missing VITE_SUPABASE_ANON_KEY');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
