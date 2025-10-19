'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase/client';
import axios from 'axios';
import { parseError } from '@/lib/util/server_util';
import { StrUserRole, userRoleToStrUserRole } from '@/types/types';
import { Profile, UserRole } from '@/lib/generated/prisma/prisma';

interface AuthContextType {
  user: { data: User | null; loading: boolean };
  profile: { data: Profile | null; loading: boolean };
  session: { data: Session | null; loading: boolean };
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  getUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<{
    user: { data: User | null, loading: boolean },
    profile: { data: Profile | null; loading: boolean },
    session: { data: Session | null; loading: boolean },
  }>({
    user: { data: null, loading: true },
    profile: { data: null, loading: true },
    session: { data: null, loading: true },
  });

  const fetchProfile = useCallback(async (currSession: Session | null) => {
    if (!currSession?.user?.id) {
      return null;
    }

    try {
      const res = await axios.get(`/api/profile?id=${currSession.user.id}`, {
        validateStatus: () => true,
        withCredentials: true,
        headers: { Authorization: `Bearer ${currSession?.access_token}` },
      });

      if (res.data && res.data.profile) {
        return res.data.profile
      } else {
        return null;
      }
    } catch (error: unknown) {
      console.log('Error fetching profile:', error);
      return null;
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error: unknown) {
      // If it's not an AuthError, wrap it as a generic error
      const authError = error instanceof Error 
        ? { message: error.message, name: 'AuthError' } as AuthError
        : { message: 'Unknown authentication error', name: 'AuthError' } as AuthError;
      return { error: authError };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const getUser = async () => {
    try {
      const {data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.log('/components/auth-provider get_user error');
        parseError(error.message, error.code);
        return null;
      }

      return user;
    } catch (error: any) {
      console.error('/components/auth-provider get_user error');
      parseError(error.message, error.code);
      return null;
    }
  };

  const getUserAuth = async (): Promise<StrUserRole> => {
    if (!authState.profile.data) {
      return 'GUEST';
    }
    return userRoleToStrUserRole(authState.profile.data.role);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn('Auth loading timeout - forcing loading states to false');
      setAuthState(prev => ({
        user: { data: prev.user.data, loading: false },
        profile: { data: prev.profile.data, loading: false },
        session: { data: prev.session.data, loading: false }
      }));
    }, 10000);

    // Get initial session
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        setAuthState({
          user: { data: session?.user ?? null, loading: false },
          profile: { data: await fetchProfile(session), loading: false},
          session: { data: session, loading: false }
        });

        clearTimeout(timeout);
      })
      .catch(error => {
        console.log('Error getting initial session:', error);
        setAuthState({
          user: { data: null, loading: false },
          profile: { data: null, loading: false },
          session: { data: null, loading: false }
        });

        clearTimeout(timeout);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setAuthState({
        user: { data: session?.user ?? null, loading: false },
        profile: { data: (event === 'SIGNED_OUT') ? null : await fetchProfile(session), loading: false },
        session: { data: session, loading: false }
      });
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [fetchProfile]);

  // logging
  useEffect(() => {
    console.log('Auth state:', authState);
  }, [authState]);

  const value = useMemo(() => ({
    user: authState.user,
    profile: authState.profile,
    session: authState.session,
    signIn,
    signOut,
    getUser,
  }), [authState]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}