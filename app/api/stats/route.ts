import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { COUPON_TYPES } from '@/lib/constants';

export async function GET() {
  try {
    const { coupons, reorders } = readDb();

    const todayStr = new Date().toISOString().slice(0, 10);

    const totalIssued  = reorders.length;
    const issuedToday  = reorders.filter((r) => r.created_at.startsWith(todayStr)).length;

    // Available codes per type (include all known types, even 0)
    const countByType: Record<string, number> = {};
    for (const ct of COUPON_TYPES) countByType[ct.type] = 0;
    for (const c of coupons) {
      if (c.is_used === 0) countByType[c.type] = (countByType[c.type] ?? 0) + 1;
    }

    // Chart data — all types, sorted by available count desc
    const availableByType = COUPON_TYPES.map((ct) => ({
      type:      ct.type,
      country:   ct.country,
      available: countByType[ct.type] ?? 0,
    })).sort((a, b) => b.available - a.available);

    // Available per country
    const availableByCountry: Record<string, number> = {};
    for (const c of coupons) {
      if (c.is_used === 0) {
        availableByCountry[c.country] = (availableByCountry[c.country] ?? 0) + 1;
      }
    }

    // Types with low stock (≤ 2 remaining)
    const lowStockTypes = availableByType
      .filter((t) => t.available <= 2)
      .map((t) => ({ type: t.type, count: t.available }));

    // Recent 5 records
    const recentReorders = [...reorders]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 5);

    return NextResponse.json({
      totalIssued,
      issuedToday,
      totalAvailable: coupons.filter((c) => c.is_used === 0).length,
      availableByCountry,
      availableByType,
      lowStockTypes,
      recentReorders,
    });
  } catch (err) {
    console.error('stats error:', err);
    return NextResponse.json({ error: 'Failed to load stats.' }, { status: 500 });
  }
}
