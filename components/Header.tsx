
import React from 'react';

interface HeaderProps {
  currentUser: string | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout }) => {
  return (
    <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
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
          {currentUser && (
            <div className="flex items-center space-x-4">
              <span className="text-slate-300 hidden sm:block">
                Welcome, <span className="font-bold text-slate-100">{currentUser}</span>
              </span>
              <button
                onClick={onLogout}
                className="px-3 py-2 text-sm rounded-md font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
