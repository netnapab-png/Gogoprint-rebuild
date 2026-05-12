'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { label: 'Production View',     href: '#', external: true },
  { label: 'Accounting View',     href: '#', external: true },
  { label: 'Quoting Area',        href: '#', external: true },
  { label: 'Quote Submission',    href: '#', external: true },
  { label: 'Analytics',           href: '#', external: true },
  { label: 'Tableau WDC',         href: '#', external: true },
  { label: 'Re-Orders & Coupons', href: '/', external: false },
];

export default function GlobalNav() {
  const pathname = usePathname();

  // Everything in this app is part of "Re-Orders & Coupons"
  const activeLabel = 'Re-Orders & Coupons';

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      {/* Brand row */}
      <div className="max-w-screen-xl mx-auto px-6 pt-3 pb-0 flex items-center">
        <span className="font-bold text-gray-900 text-lg tracking-tight">
          Gogoprint – Production MY
        </span>
      </div>

      {/* Tab row */}
      <div className="max-w-screen-xl mx-auto px-4">
        <nav className="flex overflow-x-auto scrollbar-none -mb-px">
          {TABS.map((tab) => {
            const isActive = tab.label === activeLabel;
            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={`
                  relative shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap
                  border-b-2 transition-colors duration-100
                  ${isActive
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
