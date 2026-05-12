import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim().toLowerCase() || '';
    const type   = searchParams.get('type')?.trim() || '';
    const source = searchParams.get('source')?.trim() || '';
    const limit  = Math.min(parseInt(searchParams.get('limit') || '100', 10), 500);

    let query = supabase
      .from('reorders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (type)   query = query.eq('coupon_type', type);
    if (source) query = query.eq('problem_source', source);

    const { data: reorders, count, error } = await query;

    if (error) throw error;

    let filtered = reorders ?? [];

    // Client-side text search (order number or coupon code)
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
