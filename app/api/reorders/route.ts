import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSessionProfile, resolveCountries } from '@/lib/supabase/get-session-profile';
import { COUPON_TYPES, ALL_COUNTRIES } from '@/lib/constants';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionProfile();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const { user, profile } = session;
    const userCountries = resolveCountries(profile, ALL_COUNTRIES);
    const allowedTypes  = COUPON_TYPES
      .filter((ct) => userCountries.includes(ct.country))
      .map((ct) => ct.type);

    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim().toLowerCase() || '';
    const type   = searchParams.get('type')?.trim() || '';
    const source = searchParams.get('source')?.trim() || '';
    const scope  = searchParams.get('scope')?.trim() || 'all'; // 'mine' | 'all'
    const limit  = Math.min(parseInt(searchParams.get('limit') || '100', 10), 500);

    let query = supabase
      .from('reorders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(limit);

    // Country scoping: always restrict to allowed coupon types
    if (allowedTypes.length > 0) {
      query = query.in('coupon_type', allowedTypes);
    } else {
      // No countries assigned → no records
      return NextResponse.json({ reorders: [], total: 0 });
    }

    // Scope: regular users always see only their own; admins can toggle
    if (profile.role !== 'admin' || scope === 'mine') {
      query = query.eq('user_id', user.id);
    }

    if (type)   query = query.eq('coupon_type', type);
    if (source) query = query.eq('problem_source', source);

    const { data: reorders, count, error } = await query;
    if (error) throw error;

    let filtered = reorders ?? [];
    if (search) {
      filtered = filtered.filter(
        (r) =>
          r.order_number.toLowerCase().includes(search) ||
          r.coupon_code.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ reorders: filtered, total: search ? filtered.length : (count ?? 0) });
  } catch (err) {
    console.error('reorders GET error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
