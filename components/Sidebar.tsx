'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  {
    href: '/',
    label: 'Dashboard',
    isActive: (p: string) => p === '/',
    icon: (on: boolean) => (
      <svg className={`w-4 h-4 shrink-0 ${on ? 'text-violet-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/coupons',
    label: 'Issue Coupon',
    isActive: (p: string) => p === '/coupons' || p.startsWith('/issue') || p === '/success',
    icon: (on: boolean) => (
      <svg className={`w-4 h-4 shrink-0 ${on ? 'text-violet-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    ),
  },
  {
    href: '/admin',
    label: 'Records',
    isActive: (p: string) => p === '/admin',
    icon: (on: boolean) => (
      <svg className={`w-4 h-4 shrink-0 ${on ? 'text-violet-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    href: '/admin/import',
    label: 'Import Codes',
    isActive: (p: string) => p === '/admin/import',
    icon: (on: boolean) => (
      <svg className={`w-4 h-4 shrink-0 ${on ? 'text-violet-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-[220px] shrink-0">
        <div className="fixed top-0 left-0 w-[220px] h-screen flex flex-col bg-white border-r border-slate-200 z-20">
          {/* Brand */}
          <div className="h-14 flex items-center px-4 border-b border-slate-100 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center shrink-0 shadow-sm shadow-violet-200">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-slate-900 leading-tight">Gogoprint</p>
                <p className="text-[10px] text-slate-400 leading-tight">Coupon Management</p>
              </div>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2 pb-2">Menu</p>
            {NAV.map(({ href, label, isActive, icon }) => {
              const active = isActive(pathname);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors duration-100 ${
                    active
                      ? 'bg-violet-50 text-violet-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {icon(active)}
                  {label}
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-100 shrink-0">
            <p className="text-[10px] text-slate-400">Internal tool · v0.1</p>
          </div>
        </div>
      </aside>

      {/* ── Mobile top bar ──────────────────────────────────── */}
      <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="h-14 px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-900">Gogoprint</span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map(({ href, label, isActive }) => {
              const active = isActive(pathname);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`text-xs px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                    active ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
    </>
  );
}
