import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { COUPON_TYPES } from '@/lib/constants';
import type { IssueCouponRequest, Reorder } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body: IssueCouponRequest & { staffName?: string } = await req.json();

    // ── Validation ──────────────────────────────────────────────────────────
    const errors: Record<string, string> = {};

    if (!body.staffName?.trim()) {
      errors.staffName = 'Your name is required.';
    }

    if (!body.couponType) {
      errors.couponType = 'Coupon type is required.';
    } else if (!COUPON_TYPES.find((ct) => ct.type === body.couponType)) {
      errors.couponType = 'Invalid coupon type.';
    }

    if (!body.orderNumber?.trim()) {
      errors.orderNumber = 'Order number is required.';
    }

    if (!body.reason?.trim()) {
      errors.reason = 'Reason is required.';
    } else if (body.reason.trim().length < 50) {
      errors.reason = `Reason must be at least 50 characters (currently ${body.reason.trim().length}).`;
    }

    if (!body.problemSource?.trim()) {
      errors.problemSource = 'Problem source is required.';
    }

    if (!body.problemCategory?.trim()) {
      errors.problemCategory = 'Problem category is required.';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    // ── Atomic assignment ────────────────────────────────────────────────────
    const data = readDb();

    const coupon = data.coupons.find(
      (c) => c.type === body.couponType && c.is_used === 0
    );

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'No unused coupon codes are available for this coupon type. Please contact an admin.' },
        { status: 409 }
      );
    }

    const now      = new Date().toISOString();
    const reorderId = data.nextReorderId;

    const reorder: Reorder = {
      id:               reorderId,
      created_at:       now,
      requested_by:     body.staffName!.trim(),
      coupon_id:        coupon.id,
      coupon_code:      coupon.code,
      coupon_type:      body.couponType,
      order_number:     body.orderNumber.trim(),
      new_order_number: null,
      reorder_value:    null,
      reason:           body.reason.trim(),
      problem_source:   body.problemSource.trim(),
      problem_category: body.problemCategory.trim(),
      notes:            body.notes?.trim() || null,
    };

    coupon.is_used             = 1;
    coupon.used_at             = now;
    coupon.assigned_reorder_id = reorderId;

    data.reorders.push(reorder);
    data.nextReorderId += 1;

    writeDb(data);

    return NextResponse.json({ success: true, reorder });
  } catch (err) {
    console.error('issue-coupon error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}
