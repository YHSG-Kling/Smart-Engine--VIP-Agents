
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

// If keys are missing, we can still run the app in "UI Mock Mode" 
// but auth/storage calls will fail gracefully or we can check this flag
export const isSupabaseConfigured = supabaseUrl && supabaseKey;

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder'
);
