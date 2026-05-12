'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { Reorder } from '@/lib/types';

const CouponStockChart = dynamic(() => import('@/components/CouponStockChart'), { ssr: false });

interface Stats {
  totalIssued:        number;
  issuedToday:        number;
  totalAvailable:     number;
  availableByCountry: Record<string, number>;
  lowStockTypes:      { type: string; count: number }[];
  recentReorders:     Reorder[];
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatTime(dt: string) {
  return new Date(dt).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

// ── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label:   string;
  value:   number | string;
  sub?:    string;
  icon:    React.ReactNode;
  iconBg:  string;
  danger?: boolean;
}

function StatCard({ label, value, sub, icon, iconBg, danger }: StatCardProps) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider leading-none mb-1.5">{label}</p>
        <p className={`text-2xl font-bold leading-none ${danger ? 'text-red-500' : 'text-slate-900'}`}>{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Action card ──────────────────────────────────────────────────────────────

interface ActionCardProps {
  href:        string;
  icon:        React.ReactNode;
  iconBg:      string;
  title:       string;
  description: string;
  badge?:      string;
  badgeColor?: string;
  cta:         string;
  ctaColor:    string;
}

function ActionCard({ href, icon, iconBg, title, description, badge, badgeColor, cta, ctaColor }: ActionCardProps) {
  return (
    <Link
      href={href}
      className="card p-5 flex flex-col gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 group"
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        {badge && (
          <span className={`text-[11px] font-semibold rounded-full px-2.5 py-0.5 ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
        <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">{description}</p>
      </div>
      <div className={`flex items-center gap-1 text-xs font-semibold ${ctaColor} group-hover:gap-2 transition-all`}>
        {cta}
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [stats, setStats]       = useState<Stats | null>(null);
  const [statsErr, setStatsErr] = useState(false);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => setStatsErr(true));
  }, []);

  const lowCount = stats?.lowStockTypes.length ?? 0;
  const totalAvailable = stats?.totalAvailable ?? 0;
  const stockDanger = totalAvailable > 0 && totalAvailable < 10;

  return (
    <main className="flex-1 px-6 lg:px-8 py-8 animate-fade-in max-w-6xl w-full mx-auto">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="mb-8">
        <p className="text-sm text-slate-400 mb-1">{greeting()}</p>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Issue compensation coupons, track reorders, and manage coupon inventory.
        </p>
      </div>

      {/* ── Stat strip ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats ? (
          <>
            <StatCard
              label="Issued today"
              value={stats.issuedToday}
              sub="since midnight"
              iconBg="bg-violet-100"
              icon={
                <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
            <StatCard
              label="Total issued"
              value={stats.totalIssued}
              sub="all time"
              iconBg="bg-blue-100"
              icon={
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />
            <StatCard
              label="Available codes"
              value={stats.totalAvailable}
              sub="across all types"
              danger={stockDanger}
              iconBg={stockDanger ? 'bg-red-100' : 'bg-emerald-100'}
              icon={
                <svg className={`w-5 h-5 ${stockDanger ? 'text-red-500' : 'text-emerald-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              }
            />
            {/* By country */}
            <div className="card p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider leading-none mb-2">By country</p>
                <div className="space-y-1.5">
                  {(['MY', 'SG', 'AU'] as const).map((c) => {
                    const n = stats.availableByCountry[c] ?? 0;
                    return (
                      <div key={c} className="flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-500">
                          {c === 'MY' ? '🇲🇾 MY' : c === 'SG' ? '🇸🇬 SG' : '🇦🇺 AU'}
                        </span>
                        <span className={`text-xs font-bold tabular-nums ${n < 5 ? 'text-red-500' : 'text-slate-800'}`}>{n}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        ) : statsErr ? (
          <div className="col-span-4 card p-6 text-sm text-slate-400 text-center">
            Could not load stats.
          </div>
        ) : (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-2.5 bg-slate-100 rounded w-2/3" />
                <div className="h-6 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Low stock alert ───────────────────────────────────── */}
      {stats && lowCount > 0 && (
        <div className="mb-8 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5">
          <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900">
              {lowCount} coupon type{lowCount > 1 ? 's' : ''} running low
            </p>
            <p className="text-xs text-amber-700 mt-0.5 truncate">
              {stats.lowStockTypes.slice(0, 5).map((t) => `${t.type} (${t.count})`).join(' · ')}
              {lowCount > 5 && ` · +${lowCount - 5} more`}
            </p>
          </div>
          <Link href="/admin/import"
            className="shrink-0 text-xs font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-2 whitespace-nowrap">
            Import now →
          </Link>
        </div>
      )}

      {/* ── Stock chart ───────────────────────────────────────── */}
      <div className="mb-8">
        <CouponStockChart />
      </div>

      {/* ── Quick actions ─────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Quick actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionCard
            href="/coupons"
            iconBg="bg-violet-100"
            icon={
              <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            }
            title="Issue a Coupon"
            description="Select a type and fill in order details to issue a code."
            cta="Issue coupon"
            ctaColor="text-violet-600"
          />
          <ActionCard
            href="/admin"
            iconBg="bg-blue-100"
            icon={
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            }
            title="Issued Records"
            description="Browse and search the full history of issued codes."
            cta="View records"
            ctaColor="text-blue-600"
          />
          <ActionCard
            href="/admin/import"
            iconBg="bg-emerald-100"
            icon={
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            }
            title="Import Codes"
            description="Upload a CSV with real coupon codes to stock the system."
            badge={lowCount > 0 ? `${lowCount} low` : undefined}
            badgeColor="bg-red-100 text-red-600"
            cta="Import codes"
            ctaColor="text-emerald-600"
          />
          <ActionCard
            href="/admin"
            iconBg="bg-slate-100"
            icon={
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            }
            title="Export Records"
            description="Download all issued coupon records as a CSV file."
            cta="Export CSV"
            ctaColor="text-slate-600"
          />
        </div>
      </div>

      {/* ── Recent activity ───────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700">Recent activity</h2>
          <Link href="/admin" className="text-xs text-slate-400 hover:text-violet-600 transition-colors font-medium">
            View all →
          </Link>
        </div>

        {!stats ? (
          <div className="card divide-y divide-slate-100">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-5 py-4 animate-pulse flex items-center gap-4">
                <div className="h-3.5 bg-slate-100 rounded w-20 shrink-0" />
                <div className="h-3.5 bg-slate-100 rounded w-28" />
                <div className="h-3.5 bg-slate-100 rounded w-24 ml-auto" />
              </div>
            ))}
          </div>
        ) : stats.recentReorders.length === 0 ? (
          <div className="card px-6 py-14 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm text-slate-500">No coupons issued yet.</p>
            <Link href="/coupons"
              className="mt-3 inline-flex btn-primary text-xs px-4 py-2">
              Issue your first coupon
            </Link>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {['Time', 'Staff', 'Code', 'Type', 'Order #', 'Source'].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.recentReorders.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3 text-xs text-slate-400 whitespace-nowrap">{formatTime(r.created_at)}</td>
                    <td className="px-5 py-3 font-medium text-slate-800 whitespace-nowrap">{r.requested_by}</td>
                    <td className="px-5 py-3">
                      <code className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded whitespace-nowrap">
                        {r.coupon_code}
                      </code>
                    </td>
                    <td className="px-5 py-3 text-slate-600 whitespace-nowrap text-xs">{r.coupon_type}</td>
                    <td className="px-5 py-3 text-slate-700 font-medium whitespace-nowrap">{r.order_number}</td>
                    <td className="px-5 py-3">
                      <span className="text-[11px] bg-slate-100 text-slate-600 rounded-md px-2 py-0.5 font-medium whitespace-nowrap">
                        {r.problem_source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
