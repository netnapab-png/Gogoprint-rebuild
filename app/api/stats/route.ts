import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSessionProfile, resolveCountries } from '@/lib/supabase/get-session-profile';
import { COUPON_TYPES, ALL_COUNTRIES } from '@/lib/constants';

export async function GET() {
  try {
    const session = await getSessionProfile();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const { user, profile } = session;
    const userCountries = resolveCountries(profile, ALL_COUNTRIES);

    if (userCountries.length === 0) {
      return NextResponse.json({
        totalIssued: 0,
        issuedToday: 0,
        totalAvailable: 0,
        availableByCountry: {},
        availableByType: [],
        lowStockTypes: [],
        recentReorders: [],
        userCountries: [],
      });
    }

    const supabase = createAdminClient();

    // Filter coupon types to user's assigned countries
    const allowedTypes = COUPON_TYPES.filter((ct) => userCountries.includes(ct.country));
    // Coupon types allowed for the user's country list that have distinct country values
    const allowedTypesForCount = allowedTypes.filter((ct) => userCountries.includes(ct.country));

    // Parallel: per-type stock counts (HEAD), reorder counts, recent reorders
    const [typeCountResults, reordersResult, recentResult] = await Promise.all([
      Promise.all(
        allowedTypesForCount.map((ct) =>
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
      // Reorder totals scoped to user's countries' coupon types
      supabase
        .from('reorders')
        .select('created_at, coupon_type, user_id')
        .in('coupon_type', allowedTypes.map((ct) => ct.type)),
      // Recent reorders: admins see all in their countries; users see only their own
      profile.role === 'admin'
        ? supabase
            .from('reorders')
            .select('*')
            .in('coupon_type', allowedTypes.map((ct) => ct.type))
            .order('created_at', { ascending: false })
            .limit(5)
        : supabase
            .from('reorders')
            .select('*')
            .eq('user_id', user.id)
            .in('coupon_type', allowedTypes.map((ct) => ct.type))
            .order('created_at', { ascending: false })
            .limit(5),
    ]);

    if (reordersResult.error) throw reordersResult.error;
    if (recentResult.error)   throw recentResult.error;

    const reorders       = reordersResult.data ?? [];
    const recentReorders = recentResult.data   ?? [];

    const todayStr     = new Date().toISOString().slice(0, 10);
    const totalIssued  = reorders.length;
    const issuedToday  = reorders.filter((r) => r.created_at.startsWith(todayStr)).length;

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
      userCountries,
    });
  } catch (err) {
    console.error('stats error:', err);
    return NextResponse.json({ error: 'Failed to load stats.' }, { status: 500 });
  }
}
