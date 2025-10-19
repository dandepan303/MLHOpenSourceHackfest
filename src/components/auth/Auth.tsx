'use client'

import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { parseError } from "@/lib/util/server_util";
import { AuthReq, DefaultAPIRes } from "@/types/api_types";
import { request } from "@/lib/util/api";
import CustomGoogleAuthButton from "./google/GoogleButton";
import EmailHandler from "./email/EmailHandler";
import { useNotification } from "../ui/Notification";

interface GoogleAuthResponse {
  credential: string;
  [key: string]: unknown;
}

export default function AuthComponent() {
  const { addNotification, addNotificationStatus } = useNotification();

  const [status, setStatus] = useState<'google-loading' | 'email-loading' | 'page-loading' | 'null'>('page-loading');

  const handleEmailSignIn = useCallback(async (email: string, password: string) => {
    setStatus('email-loading');

    try {
      // Data validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        addNotification({ message: 'Please enter a valid email address', type: 'warning' });
        return;
      }

      // Supabase auth
      const { data: auth_data, error: auth_error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      // Auth errors
      if (auth_error) {
        parseError(auth_error.message, auth_error.code);
        addNotification({ message: 'There was an issue signing in with Google', type: 'error'});
        console.log('There was an issue signing in');
      }
      if (!auth_data.user || !auth_data.user.id) {
        addNotification({ message: 'There was an issue signing in with Google', type: 'error'});
        console.log('There was an issue signing in');
      }

    } catch (e: any) {
      console.log('/components/auth/auth handleEmailSignIn error', await parseError(e.message, e.code));
      addNotification({ message: 'There was an issue signing in', type: 'error'});
    } finally {
      setStatus('null');
    }
  }, [setStatus, supabase, parseError]);

  const handleEmailSignUp = useCallback(async (email: string, name: string, password: string, confirmPassword: string) => {
    setStatus('email-loading');

    try {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        addNotification({ message: 'Please enter a valid email address', type: 'error'});
        return;
      }
      
      if (password !== confirmPassword) {
        addNotification({ message: 'Passwords do not match', type: 'error'});
        return;
      }

      // Ensure auth user exists
      let userId = null;
      const { data: signin_data, error: signin_error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      const signupRequired = !signin_data.user;
      if (signin_data.user?.id) userId = signin_data.user.id

      // If no auth user -> sign up
      if (signupRequired) {
        const { data: signup_data, error: signup_error } = await supabase.auth.signUp({ email: email, password: password });

        // Auth errors
        if (signup_error) {
          parseError(signup_error.message, signup_error.code);
          addNotification({ message: 'There was an issue signing up', type: 'error'});
          return;
        }
        if (!signup_data.user || !signup_data.user.id) {
          addNotification({ message: 'There was an issue signing up', type: 'error'});
          return;
        }

        userId = signup_data.user.id;
      }

      // Ensure db profile exists
      let body: AuthReq = {
        email: email,
        name: name || email.split('@')[1] || 'user',
      };
      if (userId) body.userId = userId;

      const res: DefaultAPIRes = await request<DefaultAPIRes>({
        type: 'POST',
        route: 'api/auth',
        body: body
      });

      addNotificationStatus(res);

      // If no user and sign up through api/auth successful -> sign in
      if (res.status === 'success' && signupRequired) {
        await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });
      }
    } catch (e: any) {
      console.log('/components/auth/auth handleEmailSignUp error', await parseError(e.message, e.code));
      addNotification({ message: 'There was an issue signing up', type: 'error'});
    } finally {
      setStatus('null');
    }
  }, []);


  const handleGoogleAuth = useCallback(async (response: GoogleAuthResponse) => {
    setStatus('google-loading');

    try {
      // Sign in using Google token
      const { data: auth_data, error: auth_error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
      });

      // Auth errors
      if (auth_error) {
        parseError(auth_error.message, auth_error.code);
        addNotification({ message: 'There was an issue with Google', type: 'error' });
        return;
      }
      if (!auth_data.user || !auth_data.user.id) {
        addNotification({ message: 'There was an issue with Google', type: 'error' });
        return;
      }

      const body: AuthReq = {
        userId: auth_data.user.id,
        email: auth_data.user.email || 'unknown email',
        name: auth_data.user.user_metadata.name || 'user'
      };

      const res: DefaultAPIRes = await request<DefaultAPIRes>({
        type: 'POST',
        route: 'api/auth',
        body: body
      });

      addNotificationStatus(res);
    } catch (e: any) {
      console.log('/components/auth/auth handleGoogleAuth error', await parseError(e.message, e.code));
      addNotification({ message: 'There was an issue with Google', type: 'error' });
    } finally {
      setTimeout(() => setStatus('null'), 10 * 1000);
    }
  }, [setStatus]);

  return (
    <div className="flex justify-center items-center p-4 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="p-8 w-full max-w-md bg-white rounded-lg shadow-xl">
        <EmailHandler status={status} onEmailSignIn={handleEmailSignIn} onEmailSignUp={handleEmailSignUp} />

        <div className="mt-6">
          <div className="relative">
            <div className="flex absolute inset-0 items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="flex relative justify-center text-sm">
              <span className="px-2 text-gray-500 bg-white">Or continue with</span>
            </div>
          </div>

          <div className="mt-4">
            <CustomGoogleAuthButton
              handleGoogleAuthCallback={handleGoogleAuth}
              setStatus={setStatus}
              buttonUse='continue_with'
              buttonText='Continue with Google'
            />
          </div>
        </div>
      </div>
    </div>
  )
}