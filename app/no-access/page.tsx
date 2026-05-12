'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NoAccessPage() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm text-center">

        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-200">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-11a4 4 0 00-4 4v1H6a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2h-2v-1a4 4 0 00-4-4z" />
            </svg>
          </div>
        </div>

        <div className="card p-8">
          <h1 className="text-xl font-bold text-slate-900 mb-2">Admin Access Required</h1>
          <p className="text-sm text-slate-500 mb-6">
            This page is restricted to admin users.
            Please contact an admin if you need access.
          </p>

          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 btn-primary text-sm py-2.5 mb-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go to Dashboard
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full text-sm text-slate-500 hover:text-slate-800 font-medium py-2 px-4 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
          >
            Sign out
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Gogoprint · Internal tool · v0.1
        </p>
      </div>
    </div>
  );
}
