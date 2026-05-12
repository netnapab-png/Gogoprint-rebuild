'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

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
          <div className="w-14 h-14 rounded-2xl bg-red-500 flex items-center justify-center shadow-lg shadow-red-200">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
        </div>

        <div className="card p-8">
          <h1 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-sm text-slate-500 mb-6">
            Your account does not have permission to access this application.
            Only admin users can use this tool.
          </p>

          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm mb-6">
            Please contact an admin to request access.
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
