import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { COUPON_TYPES } from '@/lib/constants';
import type { IssueCouponRequest } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    // Identify the caller via their session cookie
    const sessionClient = await createClient();
    const { data: { user } } = await sessionClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    // All DB queries use the admin client (bypasses RLS, avoids recursive policy errors)
    const supabase = createAdminClient();

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('name, status')
      .eq('id', user.id)
      .single();

    if (!profile || profile.status !== 'active') {
      return NextResponse.json({ success: false, error: 'Access denied.' }, { status: 403 });
    }

    const body: IssueCouponRequest = await req.json();

    // ── Validation ─────────────────────────────────────────────
    const errors: Record<string, string> = {};

    if (!body.couponType) {
      errors.couponType = 'Coupon type is required.';
    } else if (!COUPON_TYPES.find((ct) => ct.type === body.couponType)) {
      errors.couponType = 'Invalid coupon type.';
    }
    if (!body.orderNumber?.trim())  errors.orderNumber  = 'Order number is required.';
    if (!body.reason?.trim())       errors.reason       = 'Reason is required.';
    else if (body.reason.trim().length < 50)
      errors.reason = `Reason must be at least 50 characters (currently ${body.reason.trim().length}).`;
    if (!body.problemSource?.trim())   errors.problemSource   = 'Problem source is required.';
    if (!body.problemCategory?.trim()) errors.problemCategory = 'Problem category is required.';

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    // ── Atomic coupon assignment ────────────────────────────────
    const { data: available } = await supabase
      .from('coupons')
      .select('id, code')
      .eq('type', body.couponType)
      .eq('is_used', false)
      .limit(1)
      .single();

    if (!available) {
      return NextResponse.json(
        { success: false, error: 'No unused coupon codes available for this type. Please contact an admin.' },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const requestedBy = profile.name || user.email || 'Unknown';

    const { data: reorder, error: reorderError } = await supabase
      .from('reorders')
      .insert({
        user_id:          user.id,
        requested_by:     requestedBy,
        coupon_id:        available.id,
        coupon_code:      available.code,
        coupon_type:      body.couponType,
        order_number:     body.orderNumber.trim(),
        reason:           body.reason.trim(),
        problem_source:   body.problemSource.trim(),
        problem_category: body.problemCategory.trim(),
        notes:            body.notes?.trim() || null,
      })
      .select()
      .single();

    if (reorderError || !reorder) {
      console.error('reorder insert error:', reorderError);
      return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
    }

    // Mark coupon used — atomic: only succeeds if still unused
    const { count } = await supabase
      .from('coupons')
      .update({ is_used: true, used_at: now, assigned_reorder_id: reorder.id })
      .eq('id', available.id)
      .eq('is_used', false);

    if (count === 0) {
      await supabase.from('reorders').delete().eq('id', reorder.id);
      return NextResponse.json(
        { success: false, error: 'Coupon was just claimed by another request. Please try again.' },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true, reorder });
  } catch (err) {
    console.error('issue-coupon error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}
