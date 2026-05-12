'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function PendingPage() {
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="card p-8">
          <h1 className="text-xl font-bold text-slate-900 mb-2">Access Pending</h1>
          <p className="text-sm text-slate-500 mb-6">
            Your account has been created but is awaiting approval from an admin.
            You&apos;ll be notified once access is granted.
          </p>

          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm mb-6">
            Contact your manager or IT to speed up approval.
          </div>

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
