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

    // Use HEAD requests (count: 'exact', head: true) — returns a COUNT(*) from
    // the database with zero rows transferred, so the server-side max-rows cap
    // (1 000 on Supabase Cloud) never applies. One request per coupon type,
    // all fired in parallel.
    const [typeCountResults, reordersResult, recentResult] = await Promise.all([
      Promise.all(
        COUPON_TYPES.map((ct) =>
          supabase
            .from('coupons')
            .select('*', { count: 'exact', head: true })
            .eq('is_used', false)
            .eq('type', ct.type)
            .then(({ count, error }) => {
              if (error) throw error;
              return { type: ct.type, country: ct.country, count: count ?? 0 };
            })
        )
      ),
      supabase.from('reorders').select('created_at'),
      supabase
        .from('reorders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    if (reordersResult.error)  throw reordersResult.error;
    if (recentResult.error)    throw recentResult.error;

    const reorders      = reordersResult.data ?? [];
    const recentReorders = recentResult.data  ?? [];

    const todayStr   = new Date().toISOString().slice(0, 10);
    const totalIssued  = reorders.length;
    const issuedToday  = reorders.filter((r) => r.created_at.startsWith(todayStr)).length;

    // Derive all aggregates from the per-type counts (no row fetching needed)
    const availableByType = typeCountResults
      .map(({ type, country, count }) => ({ type, country, available: count }))
      .sort((a, b) => b.available - a.available);

    const availableByCountry: Record<string, number> = {};
    for (const { country, count } of typeCountResults) {
      availableByCountry[country] = (availableByCountry[country] ?? 0) + count;
    }

    const totalAvailable = typeCountResults.reduce((sum, { count }) => sum + count, 0);

    const lowStockTypes = availableByType
      .filter((t) => t.available <= 2)
      .map((t) => ({ type: t.type, count: t.available }));

    return NextResponse.json({
      totalIssued,
      issuedToday,
      totalAvailable,
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
