'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { COUPON_TYPES, PROBLEM_SOURCES } from '@/lib/constants';
import type { Reorder } from '@/lib/types';

function formatDateTime(dt: string) {
  return new Date(dt).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function truncate(s: string, n = 80) {
  return s.length > n ? s.slice(0, n) + '…' : s;
}

export default function AdminPage() {
  const [reorders, setReorders]         = useState<Reorder[]>([]);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [search, setSearch]             = useState('');
  const [filterType, setFilterType]     = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [isExporting, setIsExporting]   = useState(false);
  const [isAdmin, setIsAdmin]           = useState(false);
  const [scope, setScope]               = useState<'all' | 'mine'>('all');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch the current user's role once
  useEffect(() => {
    fetch('/api/me')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.user?.role === 'admin') setIsAdmin(true); })
      .catch(() => {});
  }, []);

  const fetchReorders = useCallback(async (s: string, t: string, src: string, sc: string) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (s)   params.set('search', s);
      if (t)   params.set('type', t);
      if (src) params.set('source', src);
      params.set('scope', sc);
      params.set('limit', '200');
      const res = await fetch(`/api/reorders?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setReorders(data.reorders ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setError('Failed to load records. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReorders('', '', '', scope); }, [fetchReorders, scope]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchReorders(search, filterType, filterSource, scope), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search, filterType, filterSource, scope, fetchReorders]);

  function handleReset() {
    setSearch(''); setFilterType(''); setFilterSource('');
  }

  async function handleExport() {
    setIsExporting(true);
    try {
      const res = await fetch('/api/reorders/export');
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = `coupon-records-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }

  const hasFilters = search || filterType || filterSource;

  const COLS = ['Date / Time', 'Staff', 'Coupon Code', 'Type', 'Order #', 'New Order #', 'Reason', 'Source', 'Category'];

  return (
    <div className="flex-1 flex flex-col animate-fade-in">
      {/* ── Page top bar ─────────────────────────────────────── */}
      <div className="sticky top-0 lg:top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200 px-6 lg:px-8 h-14 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-sm font-semibold text-slate-900 truncate">Issued Records</h1>
          {!loading && (
            <span className="text-xs text-slate-400 shrink-0">
              — {total} {total === 1 ? 'record' : 'records'}{hasFilters ? ' found' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/admin/import" className="btn-secondary text-xs px-3 py-2 gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import
          </Link>
          <button
            onClick={handleExport}
            disabled={isExporting || reorders.length === 0}
            className="btn-secondary text-xs px-3 py-2 gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {isExporting ? 'Exporting…' : 'Export CSV'}
          </button>
          <Link href="/coupons" className="btn-primary text-xs px-3 py-2 gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Issue Coupon
          </Link>
        </div>
      </div>

      <div className="flex-1 px-6 lg:px-8 py-6">

        {/* ── Scope toggle (admins only) ────────────────────────── */}
        {isAdmin && (
          <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit mb-5">
            <button
              onClick={() => setScope('all')}
              className={`text-xs font-medium px-3.5 py-1.5 rounded-md transition-all ${
                scope === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => setScope('mine')}
              className={`text-xs font-medium px-3.5 py-1.5 rounded-md transition-all ${
                scope === 'mine'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              My Records
            </button>
          </div>
        )}

        {/* ── Filters ──────────────────────────────────────────── */}
        <div className="card p-3 mb-5 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order number or coupon code…"
              className="input pl-9 py-2 text-xs"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input py-2 text-xs min-w-[160px] flex-none"
          >
            <option value="">All coupon types</option>
            {COUPON_TYPES.map((ct) => (
              <option key={ct.type} value={ct.type}>{ct.type}</option>
            ))}
          </select>
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="input py-2 text-xs min-w-[160px] flex-none"
          >
            <option value="">All problem sources</option>
            {PROBLEM_SOURCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {hasFilters && (
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>

        {/* ── Table ────────────────────────────────────────────── */}
        {error ? (
          <div className="card p-6 text-sm text-red-600 text-center bg-red-50">{error}</div>
        ) : loading ? (
          <div className="card p-20 flex items-center justify-center">
            <div className="w-7 h-7 border-2 border-slate-200 border-t-violet-600 rounded-full animate-spin" />
          </div>
        ) : reorders.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm text-slate-500">{hasFilters ? 'No records match your filters.' : 'No coupon records yet.'}</p>
            {hasFilters ? (
              <button onClick={handleReset} className="mt-3 text-xs text-violet-600 hover:underline font-medium">
                Clear filters
              </button>
            ) : (
              <Link href="/coupons" className="mt-3 inline-flex btn-primary text-xs px-4 py-2">
                Issue your first coupon
              </Link>
            )}
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    {COLS.map((h) => (
                      <th key={h}
                        className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {reorders.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{formatDateTime(r.created_at)}</td>
                      <td className="px-4 py-3 text-slate-800 font-medium whitespace-nowrap">{r.requested_by}</td>
                      <td className="px-4 py-3">
                        <code className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded whitespace-nowrap">
                          {r.coupon_code}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap text-xs">{r.coupon_type}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{r.order_number}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                        {r.new_order_number ?? <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-[200px] text-xs">
                        <span title={r.reason}>{truncate(r.reason, 60)}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-block text-[11px] bg-violet-50 text-violet-700 rounded-md px-2 py-0.5 font-medium">
                          {r.problem_source}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">{r.problem_category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {total > reorders.length && (
              <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400 text-center bg-slate-50/60">
                Showing {reorders.length} of {total} records
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
