'use client';

import { useEffect } from 'react';

export default function QuickExit() {
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.location.replace('https://weather.com');
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  return (
    <button
      onClick={() => window.location.replace('https://weather.com')}
      className="fixed top-4 right-20 z-50 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2 transition-colors"
      aria-label="Quick Exit — leave this site immediately"
      title="Press Escape at any time to leave this site"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      Quick Exit
    </button>
  );
}
