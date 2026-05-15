'use client';

import { useEffect, useState } from 'react';

const ALL_COUNTRIES = ['MY', 'SG', 'TH'];
const COUNTRY_FLAG: Record<string, string> = { MY: '🇲🇾', SG: '🇸🇬', TH: '🇹🇭' };

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'user';
  status: 'pending' | 'active' | 'deleted';
  countries: string[];
  created_at: string;
  last_login_at: string | null;
}

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  active:  'bg-emerald-50 text-emerald-700 ring-emerald-200',
  deleted: 'bg-red-50 text-red-600 ring-red-200',
};

const ROLE_BADGE: Record<string, string> = {
  admin: 'bg-violet-50 text-violet-700 ring-violet-200',
  user:  'bg-slate-100 text-slate-600 ring-slate-200',
};

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDateTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// Inline country toggle — shown per-user row
function CountryToggle({ userId, countries, onSave }: {
  userId: string;
  countries: string[];
  onSave: (id: string, countries: string[]) => Promise<void>;
}) {
  const [local, setLocal]   = useState<string[]>(countries);
  const [dirty, setDirty]   = useState(false);
  const [saving, setSaving] = useState(false);

  function toggle(code: string) {
    setLocal((prev) => {
      const next = prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code];
      setDirty(true);
      return next;
    });
  }

  async function save() {
    setSaving(true);
    await onSave(userId, local);
    setDirty(false);
    setSaving(false);
  }

  return (
    <div className="flex items-center gap-1.5">
      {ALL_COUNTRIES.map((code) => {
        const active = local.includes(code);
        return (
          <button
            key={code}
            onClick={() => toggle(code)}
            title={active ? `Remove ${code}` : `Add ${code}`}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-all ${
              active
                ? 'bg-violet-100 text-violet-700 border-violet-300'
                : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300'
            }`}
          >
            <span>{COUNTRY_FLAG[code]}</span>
            {code}
          </button>
        );
      })}
      {dirty && (
        <button
          onClick={save}
          disabled={saving}
          className="ml-1 text-[11px] font-semibold text-white bg-violet-600 hover:bg-violet-700 px-2.5 py-0.5 rounded-md transition-colors disabled:opacity-60"
        >
          {saving ? '…' : 'Save'}
        </button>
      )}
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers]     = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState<string | null>(null);
  const [error, setError]     = useState('');

  async function load() {
    setLoading(true);
    setError('');
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

  async function update(id: string, patch: { role?: string; status?: string; countries?: string[] }) {
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

  async function updateCountries(id: string, countries: string[]) {
    const res = await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, countries }),
    });
    if (!res.ok) setError('Failed to save countries.');
    else await load();
  }

  const pending = users.filter(u => u.status === 'pending');
  const others  = users.filter(u => u.status !== 'pending');

  return (
    <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8 max-w-7xl mx-auto w-full">

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Approve, assign countries, and manage team member access.</p>
        </div>
        {pending.length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {pending.length} pending approval
          </span>
        )}
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
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Countries</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Last Login</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...pending, ...others].map((user) => {
                const initials = user.name
                  ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                  : user.email[0].toUpperCase();
                const isSaving = saving === user.id;

                return (
                  <tr key={user.id} className={`hover:bg-slate-50/70 transition-colors ${user.status === 'pending' ? 'bg-amber-50/30' : ''}`}>
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
                    <td className="px-4 py-3">
                      <CountryToggle
                        userId={user.id}
                        countries={user.countries ?? []}
                        onSave={updateCountries}
                      />
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{fmtDate(user.created_at)}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{fmtDateTime(user.last_login_at)}</td>
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
                              <option value="user">User</option>
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
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-sm">
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
