'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PROBLEM_SOURCES, PROBLEM_CATEGORIES } from '@/lib/constants';
import type { CouponTypeInfo } from '@/lib/types';

interface Props {
  couponType: CouponTypeInfo;
}

interface FormErrors {
  orderNumber?:     string;
  reason?:          string;
  problemSource?:   string;
  problemCategory?: string;
  general?:         string;
}

function Field({ id, label, hint, error, children }: {
  id: string; label: string; hint?: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
        {hint && <span className="ml-1.5 text-[11px] font-normal text-slate-400">{hint}</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function IssueForm({ couponType }: Props) {
  const router = useRouter();

  const [orderNumber, setOrderNumber]         = useState('');
  const [reason, setReason]                   = useState('');
  const [problemSource, setProblemSource]     = useState('');
  const [problemCategory, setProblemCategory] = useState('');
  const [notes, setNotes]                     = useState('');
  const [errors, setErrors]                   = useState<FormErrors>({});
  const [orderWarning, setOrderWarning]       = useState(false);
  const [isSubmitting, setIsSubmitting]       = useState(false);

  const categories = problemSource ? (PROBLEM_CATEGORIES[problemSource] ?? []) : [];

  useEffect(() => { setProblemCategory(''); }, [problemSource]);

  useEffect(() => {
    setOrderWarning(!!orderNumber && !orderNumber.toUpperCase().startsWith('OR'));
  }, [orderNumber]);

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!orderNumber.trim()) e.orderNumber = 'Order number is required.';
    if (!reason.trim())      e.reason = 'Reason is required.';
    else if (reason.trim().length < 50)
      e.reason = `At least 50 characters required (${reason.trim().length}/50).`;
    if (!problemSource)      e.problemSource = 'Problem source is required.';
    if (!problemCategory)    e.problemCategory = 'Problem category is required.';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/issue-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couponType:      couponType.type,
          orderNumber:     orderNumber.trim(),
          reason:          reason.trim(),
          problemSource,
          problemCategory,
          notes:           notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrors(data.errors ?? { general: data.error || 'Something went wrong.' });
        return;
      }
      sessionStorage.setItem('lastReorder', JSON.stringify(data.reorder));
      router.push('/success');
    } catch {
      setErrors({ general: 'Network error. Please check your connection.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass = (err?: string) =>
    `input ${err ? 'input-error' : ''}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 text-sm">
          {errors.general}
        </div>
      )}

      {/* Order number */}
      <Field id="orderNumber" label="Problem order number" error={errors.orderNumber}>
        <input
          id="orderNumber" type="text" value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="e.g. OR-123456"
          className={inputClass(errors.orderNumber)}
        />
        {orderWarning && !errors.orderNumber && (
          <p className="mt-1.5 text-xs text-amber-600">
            Order numbers usually start with "OR" — please double-check.
          </p>
        )}
      </Field>

      {/* Problem source + category — side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field id="problemSource" label="Problem source" error={errors.problemSource}>
          <select
            id="problemSource" value={problemSource}
            onChange={(e) => setProblemSource(e.target.value)}
            className={inputClass(errors.problemSource)}
          >
            <option value="">Select source…</option>
            {PROBLEM_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>

        <Field id="problemCategory" label="Problem category" error={errors.problemCategory}>
          <select
            id="problemCategory" value={problemCategory}
            onChange={(e) => setProblemCategory(e.target.value)}
            disabled={!problemSource}
            className={`${inputClass(errors.problemCategory)} disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed`}
          >
            <option value="">
              {problemSource ? 'Select category…' : 'Select a source first'}
            </option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      {/* Reason */}
      <Field id="reason" label="Reason for issuing coupon" hint="min. 50 characters" error={errors.reason}>
        <textarea
          id="reason" value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="Describe what went wrong with the order and why this coupon is being issued…"
          className={`${inputClass(errors.reason)} resize-none`}
        />
        <p className={`mt-1 text-xs ${errors.reason ? 'text-red-600' : 'text-slate-400'}`}>
          {errors.reason ? '' : `${reason.trim().length} / 50 minimum`}
        </p>
      </Field>

      {/* Notes */}
      <Field id="notes" label="Additional notes" hint="optional">
        <textarea
          id="notes" value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Any additional context, customer name, or follow-up required…"
          className="input resize-none"
        />
      </Field>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 sm:flex-none sm:min-w-[160px]">
          {isSubmitting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Issuing…
            </>
          ) : (
            'Issue Coupon'
          )}
        </button>
        <Link href="/coupons" className="text-sm text-slate-400 hover:text-slate-700 font-medium transition-colors">
          Cancel
        </Link>
      </div>
    </form>
  );
}
