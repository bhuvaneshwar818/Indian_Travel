import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',               // PKCE flow for OAuth security
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,       // Handles OAuth redirect
    storage: {
      // Custom storage — store session in memory/sessionStorage, token in HttpOnly cookie via backend
      getItem: (key) => sessionStorage.getItem(key),
      setItem: (key, value) => sessionStorage.setItem(key, value),
      removeItem: (key) => sessionStorage.removeItem(key),
    }
  }
});
