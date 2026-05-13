import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { COUPON_TYPES } from '@/lib/constants';
import type { IssueCouponRequest } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    // ── Auth ───────────────────────────────────────────────────
    const sessionClient = await createClient();
    const { data: { user } } = await sessionClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const supabase = createAdminClient();

    const { data: profile, error: profileErr } = await supabase
      .from('user_profiles')
      .select('name, status')
      .eq('id', user.id)
      .single();

    if (profileErr) {
      console.error('profile fetch error:', profileErr);
      return NextResponse.json({ success: false, error: 'Could not verify account.' }, { status: 500 });
    }

    if (!profile || profile.status !== 'active') {
      return NextResponse.json({ success: false, error: 'Access denied.' }, { status: 403 });
    }

    // ── Parse body ─────────────────────────────────────────────
    const body: IssueCouponRequest = await req.json();

    // ── Validation ─────────────────────────────────────────────
    const errors: Record<string, string> = {};

    if (!body.couponType) {
      errors.couponType = 'Coupon type is required.';
    } else if (!COUPON_TYPES.find((ct) => ct.type === body.couponType)) {
      errors.couponType = 'Invalid coupon type.';
    }
    if (!body.orderNumber?.trim())     errors.orderNumber     = 'Order number is required.';
    if (!body.problemSource?.trim())   errors.problemSource   = 'Problem source is required.';
    if (!body.problemCategory?.trim()) errors.problemCategory = 'Problem category is required.';
    if (!body.reason?.trim()) {
      errors.reason = 'Reason is required.';
    } else if (body.reason.trim().length < 50) {
      errors.reason = `At least 50 characters required (${body.reason.trim().length}/50).`;
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    // ── Find an available coupon ────────────────────────────────
    const { data: available, error: couponErr } = await supabase
      .from('coupons')
      .select('id, code')
      .eq('type', body.couponType)
      .eq('is_used', false)
      .limit(1)
      .single();

    if (couponErr || !available) {
      console.error('coupon fetch error:', couponErr);
      return NextResponse.json(
        { success: false, error: 'No unused coupon codes available for this type. Please contact an admin to import more.' },
        { status: 409 }
      );
    }

    // ── Insert reorder record ──────────────────────────────────
    const requestedBy = profile.name || user.email || 'Unknown';

    const { data: reorder, error: reorderError } = await supabase
      .from('reorders')
      .insert({
        user_id:          user.id,
        requested_by:     requestedBy,
        coupon_id:        Number(available.id),
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
      console.error('reorder insert error:', JSON.stringify(reorderError));
      // Surface the DB error message to aid debugging (internal tool)
      const detail = reorderError?.message ?? 'Unknown error';
      const code   = reorderError?.code   ?? '';
      return NextResponse.json(
        { success: false, error: `Failed to create reorder record. (${code}: ${detail})` },
        { status: 500 }
      );
    }

    // ── Mark coupon as used (atomic: only succeeds if still unused) ─
    const { data: updatedRows, error: updateError } = await supabase
      .from('coupons')
      .update({ is_used: true, used_at: new Date().toISOString(), assigned_reorder_id: Number(reorder.id) })
      .eq('id', Number(available.id))
      .eq('is_used', false)
      .select('id');

    if (updateError) {
      // Log but don't fail — reorder is already saved; coupon will be cleaned up manually
      console.error('coupon update error:', JSON.stringify(updateError));
    }

    if (!updatedRows || updatedRows.length === 0) {
      // Coupon was claimed by a concurrent request — roll back the reorder
      await supabase.from('reorders').delete().eq('id', reorder.id);
      return NextResponse.json(
        { success: false, error: 'Coupon was just claimed by another request. Please try again.' },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true, reorder });

  } catch (err) {
    console.error('issue-coupon unexpected error:', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: `Unexpected error: ${message}` }, { status: 500 });
  }
}
