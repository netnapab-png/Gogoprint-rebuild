export interface Coupon {
  id: number;
  code: string;
  type: string;
  country: string;
  discount_value: number;
  discount_type: 'fixed' | 'percentage';
  is_used: number; // 0 = unused, 1 = used
  used_at: string | null;
  assigned_reorder_id: number | null;
  created_at: string;
}

export interface Reorder {
  id: number;
  created_at: string;
  requested_by: string;
  coupon_id: number;
  coupon_code: string;
  coupon_type: string;
  order_number: string;
  new_order_number: string | null;
  reorder_value: number | null;
  reason: string;
  problem_source: string;
  problem_category: string;
  notes: string | null;
}

export interface CouponTypeInfo {
  type: string;
  country: string;
  label: string;
  discountValue: number;
  discountType: 'fixed' | 'percentage';
  currency?: string;
}

export interface IssueCouponRequest {
  couponType: string;
  orderNumber: string;
  reason: string;
  problemSource: string;
  problemCategory: string;
  notes?: string;
}

export interface IssueCouponResponse {
  success: boolean;
  reorder?: Reorder;
  error?: string;
}

export interface ReordersResponse {
  reorders: Reorder[];
  total: number;
}
