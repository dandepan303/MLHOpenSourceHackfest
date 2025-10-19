'use client'
import { useState } from 'react';
import SignUp from './SignUp';
import SignIn from './SignIn';

interface EmailHandlerProps {
  onEmailSignIn: (email: string, password: string) => any;
  onEmailSignUp: (email: string, name: string, password: string, confirmPassword: string) => any;
  status: 'page-loading' | 'google-loading' | 'email-loading' | 'null';
}

export default function EmailHandler({ onEmailSignIn, onEmailSignUp, status }: EmailHandlerProps) {
  const [formState, setFormState] = useState<'signup' | 'signin'>('signin');

  const toggleForm = () => {
    setFormState(formState === 'signin' ? 'signup' : 'signin');
  };

  return (
    <div className="w-full max-w-md">
      <h1 className="mb-6 text-2xl font-bold text-center text-gray-800">
        {formState === 'signin' ? 'Welcome Back' : 'Create Account'}
      </h1>
      
      {formState === 'signup' ? <SignUp status={status} onEmailSignUp={onEmailSignUp}/> : <SignIn status={status} onEmailSignIn={onEmailSignIn}/>}
      
      <div className="mt-4 text-center">
        <button
          onClick={toggleForm}
          className="font-medium text-indigo-600 transition-colors hover:text-indigo-800"
        >
          {formState === 'signin' 
            ? "Don't have an account? Sign up" 
            : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}