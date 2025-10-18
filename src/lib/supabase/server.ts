import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { config } from '../config';

// Server-side Supabase client
export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(config.supabase.url, config.supabase.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server component calls method
          // Can be ignored if cookies are updated through middleware
        }
      },
    },
  });
};
