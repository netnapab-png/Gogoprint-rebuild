'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Reorder } from '@/lib/types';

function formatDateTime(dt: string) {
  return new Date(dt).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-0 py-2.5 first:pt-0 last:pb-0">
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider sm:w-36 shrink-0 sm:pt-0.5">
        {label}
      </span>
      <span className="text-sm text-slate-800 sm:pl-2">{value}</span>
    </div>
  );
}

export default function SuccessPage() {
  const router = useRouter();
  const [reorder, setReorder] = useState<Reorder | null>(null);
  const [copied, setCopied]   = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('lastReorder');
    if (!raw) { router.replace('/'); return; }
    try { setReorder(JSON.parse(raw)); } catch { router.replace('/'); }
  }, [router]);

  function handleCopy() {
    if (!reorder) return;
    navigator.clipboard.writeText(reorder.coupon_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleIssueAnother() {
    sessionStorage.removeItem('lastReorder');
    router.push('/coupons');
  }

  if (!reorder) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-slate-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col animate-fade-in">
      {/* ── Top bar ──────────────────────────────────────────── */}
      <div className="sticky top-0 lg:top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200 px-6 lg:px-8 h-14 flex items-center shrink-0">
        <h1 className="text-sm font-semibold text-slate-900">Coupon Issued</h1>
      </div>

      <main className="flex-1 px-6 lg:px-8 py-8 max-w-2xl mx-auto w-full">

        {/* ── Success banner ───────────────────────────────────── */}
        <div className="mb-6 flex items-start gap-4 bg-emerald-50 border border-emerald-200 rounded-xl p-5">
          <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-4.5 h-4.5 text-emerald-600 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-900">Coupon issued successfully</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              The code has been assigned and marked used. Share it with the customer now.
            </p>
          </div>
        </div>

        {/* ── Code spotlight ───────────────────────────────────── */}
        <div className="card p-5 mb-5">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Assigned coupon code</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3.5 min-w-0">
              <code className="text-xl font-mono font-bold text-slate-900 tracking-widest break-all">
                {reorder.coupon_code}
              </code>
            </div>
            <button
              onClick={handleCopy}
              className={`shrink-0 px-4 py-3.5 rounded-lg text-sm font-semibold transition-all border ${
                copied
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {copied ? (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── Summary ──────────────────────────────────────────── */}
        <div className="card p-5 mb-7 divide-y divide-slate-100">
          <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider pb-3">Request summary</h2>
          <div className="pt-2 space-y-0">
            <Row label="Issued at"      value={formatDateTime(reorder.created_at)} />
            <Row label="Record ID"      value={`#${reorder.id}`} />
            <Row label="Coupon type"    value={reorder.coupon_type} />
            <Row label="Order number"   value={reorder.order_number} />
            <Row label="Source"         value={reorder.problem_source} />
            <Row label="Category"       value={reorder.problem_category} />
            <Row label="Reason"         value={reorder.reason} />
            {reorder.notes && <Row label="Notes" value={reorder.notes} />}
            <Row label="Requested by"   value={reorder.requested_by} />
          </div>
        </div>

        {/* ── Actions ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={handleIssueAnother} className="btn-primary flex-1 py-2.5">
            Issue Another Coupon
          </button>
          <Link href="/admin" className="btn-secondary flex-1 py-2.5 text-center">
            View All Records
          </Link>
        </div>
      </main>
    </div>
  );
}
