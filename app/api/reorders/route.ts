import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import type { Reorder } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search  = searchParams.get('search')?.trim().toLowerCase() || '';
    const type    = searchParams.get('type')?.trim()  || '';
    const source  = searchParams.get('source')?.trim() || '';
    const limit   = Math.min(parseInt(searchParams.get('limit') || '100', 10), 500);

    const { reorders } = readDb();

    let filtered: Reorder[] = [...reorders];

    if (search) {
      filtered = filtered.filter(
        (r) =>
          r.order_number.toLowerCase().includes(search) ||
          r.coupon_code.toLowerCase().includes(search)
      );
    }
    if (type)   filtered = filtered.filter((r) => r.coupon_type === type);
    if (source) filtered = filtered.filter((r) => r.problem_source === source);

    // Most recent first
    filtered.sort((a, b) => b.created_at.localeCompare(a.created_at));

    const total = filtered.length;
    const page  = filtered.slice(0, limit);

    return NextResponse.json({ reorders: page, total });
  } catch (err) {
    console.error('reorders GET error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
