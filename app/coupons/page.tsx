import Link from 'next/link';
import { COUPON_TYPES, COUNTRIES } from '@/lib/constants';
import type { CouponTypeInfo } from '@/lib/types';

const COUNTRY_ACCENT: Record<string, { badge: string; ring: string; dot: string }> = {
  MY: { badge: 'bg-violet-100 text-violet-700', ring: 'hover:ring-violet-300', dot: 'bg-violet-400' },
  SG: { badge: 'bg-blue-100 text-blue-700',     ring: 'hover:ring-blue-300',   dot: 'bg-blue-400'   },
  AU: { badge: 'bg-amber-100 text-amber-700',   ring: 'hover:ring-amber-300',  dot: 'bg-amber-400'  },
};

function CouponCard({ ct }: { ct: CouponTypeInfo }) {
  const accent = COUNTRY_ACCENT[ct.country] ?? {
    badge: 'bg-slate-100 text-slate-600',
    ring: 'hover:ring-slate-300',
    dot: 'bg-slate-400',
  };

  return (
    <Link
      href={`/issue?type=${encodeURIComponent(ct.type)}`}
      className={`group bg-white rounded-xl ring-1 ring-slate-900/5 shadow-sm p-4 flex flex-col gap-3
                  hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 ${accent.ring}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${accent.badge}`}>
          {ct.country}
        </span>
        <svg className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0 mt-0.5"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      <div className="flex-1">
        <p className="text-[13px] font-semibold text-slate-900 leading-snug">{ct.type}</p>
        <p className="text-xs text-slate-400 mt-0.5 leading-tight">{ct.label}</p>
      </div>

      {ct.discountValue > 0 && (
        <div className="pt-2.5 border-t border-slate-100">
          <span className="text-base font-bold text-slate-800">
            {ct.discountType === 'fixed'
              ? `${ct.currency ?? ''}${ct.discountValue}`
              : `${ct.discountValue}%`}
          </span>
          <span className="text-xs text-slate-400 ml-1">
            {ct.discountType === 'fixed' ? 'off' : 'discount'}
          </span>
        </div>
      )}
    </Link>
  );
}

export default function CouponsPage() {
  const knownCodes = new Set(COUNTRIES.map((c) => c.code));
  const otherTypes = COUPON_TYPES.filter((ct) => !knownCodes.has(ct.country));

  return (
    <div className="flex-1 flex flex-col animate-fade-in">
      {/* ── Top bar ──────────────────────────────────────────── */}
      <div className="sticky top-0 lg:top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200 px-6 lg:px-8 h-14 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-sm font-semibold text-slate-900">Select Coupon Type</h1>
        </div>
        <p className="text-xs text-slate-400 hidden sm:block">Choose a type to continue to the issue form</p>
      </div>

      <main className="flex-1 px-6 lg:px-8 py-7 max-w-6xl w-full mx-auto">

        {COUNTRIES.map((country) => {
          const types = COUPON_TYPES.filter((ct) => ct.country === country.code);
          if (types.length === 0) return null;
          return (
            <section key={country.code} className="mb-9">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg leading-none">{country.flag}</span>
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{country.name}</h2>
                <span className="text-xs text-slate-300 ml-1">· {types.length} types</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {types.map((ct) => <CouponCard key={ct.type} ct={ct} />)}
              </div>
            </section>
          );
        })}

        {otherTypes.length > 0 && (
          <section className="mb-9">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Other</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {otherTypes.map((ct) => <CouponCard key={ct.type} ct={ct} />)}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
