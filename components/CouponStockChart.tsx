'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';

interface TypeStock {
  type:      string;
  country:   string;
  available: number;
}

const COUNTRY_COLOR: Record<string, string> = {
  MY: '#7C3AED', // violet — matches sidebar accent
  SG: '#2563EB', // blue
  TH: '#E11D48', // rose — Thailand
};

const REFRESH_MS = 30_000;

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: TypeStock }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const color = d.available === 0 ? '#94a3b8' : (COUNTRY_COLOR[d.country] ?? '#7C3AED');
  return (
    <div className="bg-white border border-slate-200 shadow-lg rounded-xl px-4 py-3 text-sm">
      <p className="font-semibold text-slate-800 mb-0.5">{d.type}</p>
      <p className="text-slate-500 text-xs">
        Available:{' '}
        <span className="font-bold" style={{ color }}>
          {d.available === 0 ? 'empty' : d.available}
        </span>
      </p>
    </div>
  );
}

export default function CouponStockChart() {
  const [data, setData]               = useState<TypeStock[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing]   = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res  = await fetch('/api/stats', { cache: 'no-store' });
      const json = await res.json();
      setData(json.availableByType ?? []);
      setLastUpdated(new Date());
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(() => fetchData(true), REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchData]);

  const chartHeight = Math.max(320, data.length * 36 + 60);
  const maxLabelLen = data.reduce((m, d) => Math.max(m, d.type.length), 0);
  const yAxisWidth  = Math.min(Math.max(maxLabelLen * 6.5, 120), 240);

  if (loading) {
    return (
      <div className="card p-6">
        <div className="h-4 bg-slate-100 rounded w-48 mb-5 animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-2.5 bg-slate-100 rounded w-32 animate-pulse" />
              <div className="h-5 bg-slate-100 rounded animate-pulse" style={{ width: `${Math.random() * 40 + 20}%` }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 text-sm text-slate-400 text-center">
        Could not load chart data.
      </div>
    );
  }

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Coupon stock — available codes per type</h2>
          <p className="text-xs text-slate-400 mt-0.5">Auto-refreshes every 30 s</p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3">
            {Object.entries(COUNTRY_COLOR).map(([country, color]) => (
              <span key={country} className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: color }} />
                {country === 'MY' ? 'Malaysia' : country === 'SG' ? 'Singapore' : 'Thailand'}
              </span>
            ))}
          </div>
          {/* Refresh */}
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            title="Refresh now"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-40"
          >
            <svg className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? (
              <span>Refreshing…</span>
            ) : lastUpdated ? (
              <span>{lastUpdated.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            ) : null}
          </button>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 52, bottom: 0, left: 0 }}
            barSize={20}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="type"
              width={yAxisWidth}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
            <Bar dataKey="available" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.available === 0
                    ? '#e2e8f0'
                    : (COUNTRY_COLOR[entry.country] ?? '#7C3AED')}
                />
              ))}
              <LabelList
                dataKey="available"
                position="right"
                style={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                formatter={(v) => Number(v) === 0 ? 'empty' : v}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Zero-stock callout */}
      {data.some((d) => d.available === 0) && (
        <div className="mt-5 flex items-center gap-2.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="flex-1 min-w-0 truncate">
            {data.filter((d) => d.available === 0).map((d) => d.type).join(', ')} — out of stock
          </span>
          <a href="/admin/import"
            className="shrink-0 font-semibold underline underline-offset-2 hover:text-red-800 ml-auto">
            Import codes →
          </a>
        </div>
      )}
    </div>
  );
}
