import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/supabase/require-admin';
import { COUPON_TYPES } from '@/lib/constants';

export async function GET() {
  try {
    if (!await requireAdmin()) {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const supabase = createAdminClient();

    const [
      { data: coupons,  error: couponsErr },
      { data: reorders, error: reordersErr },
    ] = await Promise.all([
      supabase.from('coupons').select('type, country, is_used'),
      supabase.from('reorders').select('created_at'),
    ]);

    if (couponsErr)  throw couponsErr;
    if (reordersErr) throw reordersErr;
    if (!coupons || !reorders) {
      return NextResponse.json({ error: 'Failed to load data.' }, { status: 500 });
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const totalIssued = reorders.length;
    const issuedToday = reorders.filter((r) => r.created_at.startsWith(todayStr)).length;

    // Available codes per type
    const countByType: Record<string, number> = {};
    for (const ct of COUPON_TYPES) countByType[ct.type] = 0;
    for (const c of coupons) {
      if (!c.is_used) countByType[c.type] = (countByType[c.type] ?? 0) + 1;
    }

    const availableByType = COUPON_TYPES.map((ct) => ({
      type:      ct.type,
      country:   ct.country,
      available: countByType[ct.type] ?? 0,
    })).sort((a, b) => b.available - a.available);

    const availableByCountry: Record<string, number> = {};
    for (const c of coupons) {
      if (!c.is_used) {
        availableByCountry[c.country] = (availableByCountry[c.country] ?? 0) + 1;
      }
    }

    const lowStockTypes = availableByType
      .filter((t) => t.available <= 2)
      .map((t) => ({ type: t.type, count: t.available }));

    // Recent 5 reorders
    const { data: recentReorders, error: recentErr } = await supabase
      .from('reorders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentErr) throw recentErr;

    return NextResponse.json({
      totalIssued,
      issuedToday,
      totalAvailable: coupons.filter((c) => !c.is_used).length,
      availableByCountry,
      availableByType,
      lowStockTypes,
      recentReorders: recentReorders ?? [],
    });
  } catch (err) {
    console.error('stats error:', err);
    return NextResponse.json({ error: 'Failed to load stats.' }, { status: 500 });
  }
}
