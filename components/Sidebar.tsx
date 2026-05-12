'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface MyProfile {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  avatar_url: string | null;
}

const NAV = [
  {
    href: '/',
    label: 'Dashboard',
    isActive: (p: string) => p === '/',
    adminOnly: false,
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
    adminOnly: false,
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
    adminOnly: false,
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
    adminOnly: true,
    icon: (on: boolean) => (
      <svg className={`w-4 h-4 shrink-0 ${on ? 'text-violet-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
  },
  {
    href: '/admin/users',
    label: 'Users',
    isActive: (p: string) => p === '/admin/users',
    adminOnly: true,
    icon: (on: boolean) => (
      <svg className={`w-4 h-4 shrink-0 ${on ? 'text-violet-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<MyProfile | null>(null);

  useEffect(() => {
    // Fetch profile via API (uses cookie-based session — same trust model as middleware)
    fetch('/api/me')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.user) setProfile(data.user);
      })
      .catch(() => {});

    // Detect sign-out so we clear state immediately
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (pathname === '/login' || pathname === '/pending' || pathname === '/no-access') return null;

  const isAdmin = profile?.role === 'admin';
  const displayName = profile?.name || profile?.email || '';
  const email = profile?.email || '';
  const avatarUrl = profile?.avatar_url ?? undefined;
  const initials = displayName
    ? displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  const visibleNav = NAV.filter((item) => !item.adminOnly || isAdmin);

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
            {visibleNav.map(({ href, label, isActive, icon }) => {
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

          {/* User + sign out */}
          <div className="px-3 py-3 border-t border-slate-100 shrink-0">
            {profile ? (
              <div className="flex items-center gap-2.5">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-7 h-7 rounded-full shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-violet-700">{initials}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-slate-800 truncate leading-tight">{displayName}</p>
                  <p className="text-[10px] text-slate-400 truncate leading-tight">{email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  title="Sign out"
                  className="shrink-0 text-slate-400 hover:text-slate-700 transition-colors p-1 rounded"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 px-1">Internal tool · v0.1</p>
            )}
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
          <div className="flex items-center gap-1">
            {visibleNav.map(({ href, label, isActive }) => {
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
            {profile && (
              <button
                onClick={handleSignOut}
                className="ml-1 text-xs text-slate-500 hover:text-slate-800 px-2 py-1.5 rounded-md hover:bg-slate-50 transition-colors"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
