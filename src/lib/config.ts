import { UserRole } from '@/types/types';

// formatted env variables
export const config = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Cashout',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    url_route: (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000') + (process.env.NEXT_PUBLIC_DEFAULT_ROUTE || ''),
    route: process.env.NEXT_PUBLIC_DEFAULT_ROUTE || '',
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
  // auth: {
  //   url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  //   secret: process.env.NEXTAUTH_SECRET || '',
  // },
  google: {
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
  },
};

// Middleware
export const privateRoutes: Record<string, UserRole> = {
  '/developer': 'ADMIN',
  '/': 'USER'
};