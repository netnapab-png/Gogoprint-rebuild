'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { COUPON_TYPES } from '@/lib/constants';

interface ImportResult {
  added:      number;
  skipped:    number;
  errors:     string[];
  addedCodes: string[];
}

const TEMPLATE_ROWS = [
  'GGP-MY-25RM-YOURCODE1,GGP MY RM25',
  'GGP-MY-25RM-YOURCODE2,GGP MY RM25',
  'GGP-SG-50-YOURCODE1,GGP SG S$50',
].join('\n');

export default function ImportPage() {
  const [csvText, setCsvText]     = useState('');
  const [result, setResult]       = useState<ImportResult | null>(null);
  const [error, setError]         = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCsvText((ev.target?.result as string) ?? '');
    reader.readAsText(file);
  }

  async function handleImport() {
    if (!csvText.trim()) { setError('Please paste or upload CSV data first.'); return; }
    setError('');
    setResult(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/coupons/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: csvText }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { setError(data.error ?? 'Import failed.'); return; }
      setResult(data);
      setCsvText('');
      if (fileRef.current) fileRef.current.value = '';
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function downloadTemplate() {
    const header   = 'code,type';
    const allTypes = COUPON_TYPES.map((ct) => `YOURCODE,${ct.type}`).join('\n');
    const blob = new Blob([`${header}\n${allTypes}`], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'coupon-import-template.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  const lineCount = csvText.trim().split('\n').filter(Boolean).length;

  return (
    <div className="flex-1 flex flex-col animate-fade-in">
      {/* ── Top bar ──────────────────────────────────────────── */}
      <div className="sticky top-0 lg:top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200 px-6 lg:px-8 h-14 flex items-center gap-3 shrink-0">
        <Link href="/admin" className="text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-sm font-semibold text-slate-900">Import Coupon Codes</h1>
      </div>

      <main className="flex-1 px-6 lg:px-8 py-7 max-w-3xl mx-auto w-full">

        <div className="mb-7">
          <h2 className="text-base font-bold text-slate-900">Import Coupon Codes</h2>
          <p className="text-sm text-slate-500 mt-1">
            Upload or paste a CSV file with real coupon codes. Duplicate codes are skipped automatically.
          </p>
        </div>

        {/* ── Success result ───────────────────────────────────── */}
        {result && (
          <div className="mb-6 card p-5 bg-emerald-50 border border-emerald-200 !ring-emerald-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-emerald-900">Import complete</p>
                <p className="text-sm text-emerald-700 mt-0.5">
                  <strong>{result.added}</strong> code{result.added !== 1 ? 's' : ''} added
                  {result.skipped > 0 && <>, <strong>{result.skipped}</strong> skipped (already existed)</>}.
                </p>
                {result.errors.length > 0 && (
                  <div className="mt-3 bg-white/60 rounded-lg p-3 space-y-1">
                    <p className="text-xs font-semibold text-emerald-800">Rows with errors (skipped):</p>
                    {result.errors.map((e, i) => (
                      <p key={i} className="text-xs text-emerald-700">· {e}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Error ────────────────────────────────────────────── */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3.5 text-sm">
            {error}
          </div>
        )}

        <div className="card p-6 lg:p-8 space-y-6">

          {/* Format reference */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expected CSV format</p>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-700 font-semibold transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download template
              </button>
            </div>
            <pre className="text-xs text-slate-700 font-mono leading-relaxed">
{`code,type
GGP-MY-25RM-ABC123,GGP MY RM25
GGP-SG-50-DEF456,GGP SG S$50`}
            </pre>
          </div>

          {/* File upload */}
          <div>
            <label className="label">Upload CSV file</label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-violet-300 transition-colors cursor-pointer"
              onClick={() => fileRef.current?.click()}>
              <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-slate-500 mb-1">
                <span className="text-violet-600 font-semibold">Click to upload</span> or drag & drop
              </p>
              <p className="text-xs text-slate-400">CSV files only</p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-slate-200" />
            <span className="text-xs text-slate-400 font-medium">or paste CSV directly</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* Paste area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="csvPaste" className="label mb-0">Paste CSV data</label>
              {csvText.trim() && (
                <span className="text-xs text-slate-400">{lineCount} line{lineCount !== 1 ? 's' : ''}</span>
              )}
            </div>
            <textarea
              id="csvPaste"
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows={10}
              placeholder={`code,type\n${TEMPLATE_ROWS}`}
              className="input resize-none font-mono text-xs"
              spellCheck={false}
            />
          </div>

          {/* Supported types */}
          <details className="group">
            <summary className="text-xs font-medium text-slate-500 cursor-pointer hover:text-slate-700 list-none flex items-center gap-1.5 select-none">
              <svg className="w-3.5 h-3.5 transition-transform group-open:rotate-90 text-slate-400"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              View all valid coupon type names ({COUPON_TYPES.length} types)
            </summary>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1 pl-5">
              {COUPON_TYPES.map((ct) => (
                <code key={ct.type} className="text-[11px] text-slate-500 font-mono">{ct.type}</code>
              ))}
            </div>
          </details>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
            <button
              onClick={handleImport}
              disabled={isLoading || !csvText.trim()}
              className="btn-primary flex-1 sm:flex-none sm:min-w-[140px]"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Importing…
                </>
              ) : 'Import Codes'}
            </button>
            <Link href="/admin" className="text-sm text-slate-400 hover:text-slate-700 font-medium transition-colors">
              Cancel
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
