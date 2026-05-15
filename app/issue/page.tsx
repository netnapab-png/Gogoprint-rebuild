import { notFound } from 'next/navigation';
import Link from 'next/link';
import { COUPON_TYPE_MAP } from '@/lib/constants';
import IssueForm from './IssueForm';

interface PageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function IssuePage({ searchParams }: PageProps) {
  const { type: rawType = '' } = await searchParams;
  const couponType = COUPON_TYPE_MAP[rawType];
  if (!couponType) notFound();

  const COUNTRY_LABELS: Record<string, string> = {
    MY: '🇲🇾 Malaysia',
    SG: '🇸🇬 Singapore',
    TH: '🇹🇭 Thailand',
  };
  const countryLabel = COUNTRY_LABELS[couponType.country] ?? couponType.country;

  return (
    <div className="flex-1 flex flex-col animate-fade-in">
      {/* ── Top bar ──────────────────────────────────────────── */}
      <div className="sticky top-0 lg:top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200 px-6 lg:px-8 h-14 flex items-center gap-3 shrink-0">
        <Link href="/coupons" className="text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-sm font-semibold text-slate-900">Issue Coupon</h1>
        <span className="text-slate-300 hidden sm:inline">/</span>
        <span className="text-xs text-slate-500 hidden sm:inline truncate">{couponType.type}</span>
      </div>

      <main className="flex-1 px-6 lg:px-8 py-7">
        <div className="max-w-4xl mx-auto lg:grid lg:grid-cols-[1fr_280px] lg:gap-8 lg:items-start">

          {/* ── Form card ────────────────────────────────────── */}
          <div className="card p-6 lg:p-8">
            <div className="mb-6">
              <h2 className="text-base font-bold text-slate-900">Issue Coupon</h2>
              <p className="text-sm text-slate-500 mt-1">
                Fill in the details below. A code will be assigned on submission.
              </p>
            </div>
            <IssueForm couponType={couponType} />
          </div>

          {/* ── Info panel ───────────────────────────────────── */}
          <div className="hidden lg:flex flex-col gap-4 mt-0">
            {/* Coupon summary */}
            <div className="card p-5">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Selected coupon</p>
              <p className="text-sm font-bold text-slate-900 mb-0.5">{couponType.type}</p>
              <p className="text-xs text-slate-500 mb-3">{couponType.label}</p>
              {couponType.discountValue > 0 && (
                <div className="bg-violet-50 rounded-lg px-3 py-2.5 flex items-center justify-between">
                  <span className="text-xs text-violet-600 font-medium">Discount value</span>
                  <span className="text-sm font-bold text-violet-800">
                    {couponType.discountType === 'fixed'
                      ? `${couponType.currency ?? ''}${couponType.discountValue} off`
                      : `${couponType.discountValue}% off`}
                  </span>
                </div>
              )}
              {couponType.minPurchase != null && (
                <div className="mt-2 bg-slate-50 rounded-lg px-3 py-2.5 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Min. purchase</span>
                  <span className="text-xs font-semibold text-slate-700">
                    {couponType.currency ?? ''}{couponType.minPurchase} before tax
                  </span>
                </div>
              )}
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <span>{countryLabel}</span>
              </div>
            </div>

            {/* Reminder */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-amber-800 leading-relaxed">
                  A code is assigned only after submission. Do not share codes externally.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile reminder */}
        <p className="lg:hidden text-xs text-slate-400 text-center mt-6">
          A coupon code is assigned only after form submission.
        </p>
      </main>
    </div>
  );
}
