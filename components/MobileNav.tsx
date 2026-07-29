'use client';

import { useState, useEffect, useRef } from 'react';

interface NavLink {
  label: string;
  href: string;
}

export default function MobileNav({ links, menuLabel, closeLabel }: {
  links: NavLink[];
  menuLabel: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
        aria-label={menuLabel}
        aria-expanded={open}
        aria-controls="mobile-nav"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <div
            id="mobile-nav"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="drawer-open fixed top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-purple-900 to-purple-800 shadow-2xl flex flex-col lg:hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-purple-700">
              <span className="text-white font-bold text-xl">SafeHer</span>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
                aria-label={closeLabel}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4" aria-label="Mobile navigation">
              <ul className="space-y-1">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <a
                      href={href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-purple-100 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="p-5 border-t border-purple-700">
              <a
                href="tel:112"
                className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-colors text-sm"
              >
                📞 Emergency: 112
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
}
