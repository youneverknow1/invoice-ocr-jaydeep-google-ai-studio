
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">
        <div className="flex items-center space-x-3 mb-6">
           <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-8 h-8 text-primary-400"
          >
            <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a.375.375 0 01-.375-.375V6.75A3.75 3.75 0 0010.5 3h-4.875z" />
            <path d="M12.971 3.247a.75.75 0 011.06 0l2.674 2.674a.75.75 0 010 1.06l-2.674 2.674a.75.75 0 01-1.06-1.06L14.64 7.5l-1.669-1.669a.75.75 0 010-1.06l.001-.001z" />
          </svg>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Invoice OCR Extractor
          </h1>
        </div>
        <p className="text-slate-400 mb-6">
          Please enter a username to begin. Your invoices will be saved locally in your browser.
        </p>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-300">
              Username
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="username"
                id="username"
                className="block w-full rounded-md bg-slate-900 border-slate-600 focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-slate-100 py-2 px-3"
                placeholder="e.g., john_doe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="mt-6">
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-primary-500"
            >
              Log In & Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
