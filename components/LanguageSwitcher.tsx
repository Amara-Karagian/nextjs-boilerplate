'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { languages } from '../lib/languages';

export default function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find((l) => l.code === currentLocale) ?? { name: 'English', code: 'en' };

  const filtered = languages.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.code.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  // Trap focus in modal, close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey, true);
    return () => document.removeEventListener('keydown', handleKey, true);
  }, [isOpen]);

  const switchLanguage = (code: string) => {
    const segments = pathname.split('/').filter(Boolean);
    const isLocaleSegment = languages.some((l) => l.code === segments[0]);
    if (isLocaleSegment) segments.shift();
    const rest = segments.join('/');
    const newPath = code === 'en' ? `/${rest}` : `/${code}${rest ? `/${rest}` : ''}`;
    router.push(newPath || '/');
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white text-sm font-medium"
        aria-label={`Select language — current: ${currentLang.name}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <span className="max-w-[100px] truncate">{currentLang.name}</span>
        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          role="presentation"
        >
          <div
            ref={dialogRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Language selection"
          >
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">Select Language</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close language selection"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <input
                ref={inputRef}
                type="search"
                placeholder="Search languages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 text-sm"
                aria-label="Search languages"
                aria-controls="language-list"
              />
            </div>

            <div id="language-list" className="overflow-y-auto flex-1 p-3" role="listbox" aria-label="Available languages">
              {filtered.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                  {filtered.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => switchLanguage(lang.code)}
                      role="option"
                      aria-selected={lang.code === currentLocale}
                      className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        lang.code === currentLocale
                          ? 'bg-purple-100 text-purple-700 font-semibold'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 py-10 text-sm" role="status">
                  No languages found for &quot;{search}&quot;
                </p>
              )}
            </div>

            <div className="p-3 border-t border-gray-100 text-center text-xs text-gray-400">
              {languages.length} languages supported
            </div>
          </div>
        </div>
      )}
    </>
  );
}
