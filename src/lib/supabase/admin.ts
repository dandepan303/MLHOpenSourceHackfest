import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

// Admin client for server-side operations
export const createAdminSupabaseClient = () => {
  return createClient(config.supabase.url, config.supabase.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
