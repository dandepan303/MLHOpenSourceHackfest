import { StrUserRole } from '@/types/types';

// MIDDLEWARE
export const privateRoutes: Record<string, StrUserRole> = {
  '/developer': 'ADMIN',
  '/testing': 'ADMIN',
  '/': 'USER'
};

// FORMATTED .ENV VARIABLES
export const config = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Dependencies',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    url_route: (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000') + (process.env.NEXT_PUBLIC_DEFAULT_ROUTE || ''),
    route: process.env.NEXT_PUBLIC_DEFAULT_ROUTE || '',
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  // auth: {
  //   url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  //   secret: process.env.NEXTAUTH_SECRET || '',
  // },
  google: {
    project_id: process.env.GOOGLE_PROJECT_ID || '',
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
    gemini_api_key: process.env.GOOGLE_GEMINI_API_KEY || '',
    google_search_api_key: process.env.GOOGLE_SEARCH_ENGINE_API_KEY || '',
    search_engine_id: process.env.GOOGLE_SEARCH_ENGINE_ID || '',
  },
  brave: {
    search_api_key: process.env.BRAVE_SEARCH_API_KEY || '',
  }
};