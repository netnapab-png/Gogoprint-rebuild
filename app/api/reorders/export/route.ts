import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSessionProfile, resolveCountries } from '@/lib/supabase/get-session-profile';
import { COUPON_TYPES, ALL_COUNTRIES } from '@/lib/constants';

function escape(val: string | null | undefined): string {
  const s = val ?? '';
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
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

    if (allowedTypes.length === 0) {
      return NextResponse.json({ error: 'No countries assigned.' }, { status: 403 });
    }

    const supabase = createAdminClient();
    let query = supabase
      .from('reorders')
      .select('*')
      .in('coupon_type', allowedTypes)
      .order('created_at', { ascending: false });

    // Regular users only export their own records
    if (profile.role !== 'admin') {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query;
    if (error) throw error;
    const sorted = data ?? [];

    const header = [
      'ID', 'Date/Time', 'Requested By', 'Coupon Code', 'Coupon Type',
      'Order Number', 'New Order Number', 'Reason', 'Problem Source',
      'Problem Category', 'Notes',
    ].join(',');

    const rows = sorted.map((r) =>
      [
        r.id,
        escape(new Date(r.created_at).toLocaleString('en-GB')),
        escape(r.requested_by),
        escape(r.coupon_code),
        escape(r.coupon_type),
        escape(r.order_number),
        escape(r.new_order_number),
        escape(r.reason),
        escape(r.problem_source),
        escape(r.problem_category),
        escape(r.notes),
      ].join(',')
    );

    const csv      = [header, ...rows].join('\r\n');
    const filename = `coupon-records-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type':        'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error('export error:', err);
    return NextResponse.json({ error: 'Export failed.' }, { status: 500 });
  }
}
