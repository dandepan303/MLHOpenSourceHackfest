'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { privateRoutes } from '@/lib/config';
import { cn, isAuthorized } from '@/lib/util/client_util';
import Auth from './Auth';
import LoadingComponent from '../ui/Loading';

interface AuthProtecterProps {
  children: React.ReactNode;
  className?: string;
}

interface AuthProtectorContextType {
  requireAuth: () => void;
}

const AuthContext = createContext<AuthProtectorContextType | undefined>(undefined);

export function useProtectorAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default function AuthProtecter({ children, className }: AuthProtecterProps) {
  const [stage, setStage] = useState<'loading' | 'auth_required' | 'success'>('loading');

  const { profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname() ?? '';

  useEffect(() => {
    if (profile.loading || !pathname) return;

    async function exec() {
      const userRole = profile.data?.role ?? 'GUEST';

      const requiredRole = Object.entries(privateRoutes).find(
        ([route]) => pathname.startsWith(route)
      )?.[1] || 'GUEST';

      if (requiredRole && !isAuthorized(userRole, requiredRole)) {
        if (profile) {
          // NOTIFICATION: you do not have access to that, please sign in
          router.push('/');
          return;
        }
        setStage('auth_required');
      } else {
        setStage('success');
      }
    }
    exec();
  }, [profile, pathname, router]);

  const value = useMemo(() => ({
      requireAuth: () => { setStage('auth_required'); }
    }), []);

  return <AuthContext.Provider value={value}>
    {stage === 'loading' && <LoadingComponent />}
    {stage === 'auth_required' && <Auth />}
    {stage === 'success' && <div className={cn('w-full h-full', className)}>{children}</div>}
  </AuthContext.Provider>;
}
