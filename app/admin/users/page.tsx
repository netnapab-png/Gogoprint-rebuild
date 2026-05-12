'use client';

import { useEffect, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'staff';
  status: 'pending' | 'active' | 'deleted';
  created_at: string;
}

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  active:  'bg-emerald-50 text-emerald-700 ring-emerald-200',
  deleted: 'bg-red-50 text-red-600 ring-red-200',
};

const ROLE_BADGE: Record<string, string> = {
  admin: 'bg-violet-50 text-violet-700 ring-violet-200',
  staff: 'bg-slate-100 text-slate-600 ring-slate-200',
};

export default function UsersPage() {
  const [users, setUsers]     = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState<string | null>(null);
  const [error, setError]     = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/users');
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
    } else {
      setError('Failed to load users.');
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function update(id: string, patch: { role?: string; status?: string }) {
    setSaving(id);
    const res = await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...patch }),
    });
    if (res.ok) {
      await load();
    } else {
      setError('Update failed.');
    }
    setSaving(null);
  }

  return (
    <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8 max-w-5xl mx-auto w-full">

      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">User Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">Approve and manage team member access.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-2 border-slate-200 border-t-violet-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Joined</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const initials = user.name
                  ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                  : user.email[0].toUpperCase();
                const isSaving = saving === user.id;

                return (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full shrink-0" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                            <span className="text-[11px] font-bold text-violet-700">{initials}</span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-800 leading-tight">{user.name ?? '—'}</p>
                          <p className="text-xs text-slate-400 leading-tight">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${STATUS_BADGE[user.status]}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${ROLE_BADGE[user.role]}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(user.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {isSaving ? (
                          <div className="w-4 h-4 border-2 border-slate-200 border-t-violet-600 rounded-full animate-spin" />
                        ) : (
                          <>
                            {user.status === 'pending' && (
                              <button
                                onClick={() => update(user.id, { status: 'active' })}
                                className="text-xs font-medium text-emerald-700 hover:text-emerald-900 px-2.5 py-1 rounded-md hover:bg-emerald-50 transition-colors"
                              >
                                Approve
                              </button>
                            )}
                            {user.status === 'active' && (
                              <button
                                onClick={() => update(user.id, { status: 'deleted' })}
                                className="text-xs font-medium text-red-600 hover:text-red-800 px-2.5 py-1 rounded-md hover:bg-red-50 transition-colors"
                              >
                                Revoke
                              </button>
                            )}
                            {user.status === 'deleted' && (
                              <button
                                onClick={() => update(user.id, { status: 'active' })}
                                className="text-xs font-medium text-violet-700 hover:text-violet-900 px-2.5 py-1 rounded-md hover:bg-violet-50 transition-colors"
                              >
                                Restore
                              </button>
                            )}
                            <select
                              value={user.role}
                              onChange={(e) => update(user.id, { role: e.target.value })}
                              className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                            >
                              <option value="staff">Staff</option>
                              <option value="admin">Admin</option>
                            </select>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400 text-sm">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
