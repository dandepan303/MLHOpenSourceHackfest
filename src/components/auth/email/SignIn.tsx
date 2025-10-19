'use client'
import { useState, FormEvent, useEffect } from 'react';

interface SignInProps {
  onEmailSignIn: (email: string, password: string) => any;
  status: 'page-loading' | 'google-loading' | 'email-loading' | 'null';
}

export default function SignIn({ onEmailSignIn, status }: SignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    onEmailSignIn(email, password);
  };
  
  useEffect(() => {
    // Clear password on submit returned
    if (status === 'null') {
      setPassword('')
    }
  }, [status, setPassword]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="signin-email" className="block mb-1 text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="signin-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 w-full rounded-lg border border-gray-300 transition outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label htmlFor="signin-password" className="block mb-1 text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          id="signin-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-2 w-full rounded-lg border border-gray-300 transition outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>

      <button
        type="submit"
        className={`py-2 w-full font-medium rounded-lg transition-colors ${
          status === 'null'
            ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
            : 'bg-indigo-300 text-gray cursor-not-allowed'
        }`}
        disabled={status !== 'null'}
      >
        Sign In
      </button>
      
    </form>
  );
}