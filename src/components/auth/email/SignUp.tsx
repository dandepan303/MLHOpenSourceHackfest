'use client'
import { useState, FormEvent, useEffect } from 'react';

interface SignUpProps {
  onEmailSignUp: (email: string, name: string, password: string, confirmPassword: string) => any;
  status: 'page-loading' | 'google-loading' | 'email-loading' | 'null';
}

export default function SignUp({onEmailSignUp, status}: SignUpProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    onEmailSignUp(email, name, password, confirmPassword);
  };
  
  useEffect(() => {
    // Clear password on submit returned
    if (status === 'null') {
      setPassword('')
      setConfirmPassword('');
    }
  }, [status, setPassword, setConfirmPassword]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-4 py-2 w-full rounded-lg border border-gray-300 transition outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label htmlFor="signup-email" className="block mb-1 text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="signup-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 w-full rounded-lg border border-gray-300 transition outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label htmlFor="signup-password" className="block mb-1 text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          id="signup-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-2 w-full rounded-lg border border-gray-300 transition outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label htmlFor="confirm-password" className="block mb-1 text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirm-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
        Sign Up
      </button>
    </form>
  );
}