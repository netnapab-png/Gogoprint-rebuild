import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Gogoprint Coupon & Reorder Management',
  description: 'Internal tool for issuing and tracking customer compensation coupons',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen bg-slate-50">
          <Sidebar />
          <div className="flex-1 min-w-0 flex flex-col">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
