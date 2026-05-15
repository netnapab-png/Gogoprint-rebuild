import type { CouponTypeInfo } from './types';

export const COUPON_TYPES: CouponTypeInfo[] = [
  // ── Malaysia ───────────────────────────────────────────────────────────────
  { type: 'GGP MY RM25',                        country: 'MY', label: 'RM25 Fixed Discount',           discountValue: 25,   discountType: 'fixed',      currency: 'RM' },
  { type: 'GGP MY RM50',                        country: 'MY', label: 'RM50 Fixed Discount',           discountValue: 50,   discountType: 'fixed',      currency: 'RM' },
  { type: 'GGP MY RM100',                       country: 'MY', label: 'RM100 Fixed Discount',          discountValue: 100,  discountType: 'fixed',      currency: 'RM' },
  { type: 'GGP MY 10%',                         country: 'MY', label: '10% Discount',                  discountValue: 10,   discountType: 'percentage' },
  { type: 'GGP MY 20%',                         country: 'MY', label: '20% Discount',                  discountValue: 20,   discountType: 'percentage' },
  { type: 'GGP MY 30%',                         country: 'MY', label: '30% Discount',                  discountValue: 30,   discountType: 'percentage' },
  { type: 'GGP MY REORDER',                     country: 'MY', label: 'Free Reorder',                  discountValue: 100,  discountType: 'percentage' },
  { type: 'GGP MY CLAIM',                       country: 'MY', label: 'Customer Claim',                discountValue: 0,    discountType: 'fixed' },
  { type: 'GGP MY Low Discount Voucher 15%',    country: 'MY', label: 'Low Discount Voucher 15%',      discountValue: 15,   discountType: 'percentage' },
  { type: 'GGP MY Medium Discount Voucher 20%', country: 'MY', label: 'Medium Discount Voucher 20%',   discountValue: 20,   discountType: 'percentage' },
  { type: 'GGP MY High Discount Voucher 40%',   country: 'MY', label: 'High Discount Voucher 40%',     discountValue: 40,   discountType: 'percentage' },
  { type: 'New Customer MY',                    country: 'MY', label: 'New Customer Discount',         discountValue: 0,    discountType: 'fixed' },

  // ── Singapore ──────────────────────────────────────────────────────────────
  { type: 'GGP SG S$15',                        country: 'SG', label: 'S$15 Fixed Discount',           discountValue: 15,   discountType: 'fixed',      currency: 'S$' },
  { type: 'GGP SG S$30',                        country: 'SG', label: 'S$30 Fixed Discount',           discountValue: 30,   discountType: 'fixed',      currency: 'S$' },
  { type: 'GGP SG S$50',                        country: 'SG', label: 'S$50 Fixed Discount',           discountValue: 50,   discountType: 'fixed',      currency: 'S$' },
  { type: 'GGP SG 10%',                         country: 'SG', label: '10% Discount',                  discountValue: 10,   discountType: 'percentage' },
  { type: 'GGP SG 20%',                         country: 'SG', label: '20% Discount',                  discountValue: 20,   discountType: 'percentage' },
  { type: 'GGP SG 30%',                         country: 'SG', label: '30% Discount',                  discountValue: 30,   discountType: 'percentage' },
  { type: 'GGP SG REORDER',                     country: 'SG', label: 'Free Reorder',                  discountValue: 100,  discountType: 'percentage' },
  { type: 'GGP SG CLAIM',                       country: 'SG', label: 'Customer Claim',                discountValue: 0,    discountType: 'fixed' },
  { type: 'GGP SG Low Discount Voucher 15%',    country: 'SG', label: 'Low Discount Voucher 15%',      discountValue: 15,   discountType: 'percentage' },
  { type: 'GGP SG Medium Discount Voucher 20%', country: 'SG', label: 'Medium Discount Voucher 20%',   discountValue: 20,   discountType: 'percentage' },
  { type: 'GGP SG High Discount Voucher 40%',   country: 'SG', label: 'High Discount Voucher 40%',     discountValue: 40,   discountType: 'percentage' },
  { type: 'New Customer SG',                    country: 'SG', label: 'New Customer Discount',         discountValue: 0,    discountType: 'fixed' },

  // ── Thailand ───────────────────────────────────────────────────────────────
  { type: 'GGP TH 200',  country: 'TH', label: '200 THB Fixed Discount',  discountValue: 200,  discountType: 'fixed', currency: '฿', minPurchase: 500  },
  { type: 'GGP TH 300',  country: 'TH', label: '300 THB Fixed Discount',  discountValue: 300,  discountType: 'fixed', currency: '฿', minPurchase: 1000 },
  { type: 'GGP TH 500',  country: 'TH', label: '500 THB Fixed Discount',  discountValue: 500,  discountType: 'fixed', currency: '฿', minPurchase: 2000 },
  { type: 'GGP TH 1000', country: 'TH', label: '1000 THB Fixed Discount', discountValue: 1000, discountType: 'fixed', currency: '฿', minPurchase: 3000 },
];

// Canonical country list — single source of truth for all API routes and UI
export const ALL_COUNTRIES = ['MY', 'SG', 'TH'] as const;
export type CountryCode = (typeof ALL_COUNTRIES)[number];

export const COUNTRIES = [
  { code: 'MY', name: 'Malaysia',  flag: '🇲🇾', accentBadge: 'bg-blue-100 text-blue-700',   accentCard: 'hover:border-blue-300',  accentArrow: 'group-hover:text-blue-500'  },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', accentBadge: 'bg-red-100 text-red-700',     accentCard: 'hover:border-red-300',   accentArrow: 'group-hover:text-red-500'   },
  { code: 'TH', name: 'Thailand',  flag: '🇹🇭', accentBadge: 'bg-rose-100 text-rose-700',   accentCard: 'hover:border-rose-300',  accentArrow: 'group-hover:text-rose-500'  },
];

export const PROBLEM_SOURCES = [
  'Sales Team',
  'Customer',
  'Artwork Team',
  'Production Team',
  'Printing Partner',
  'Logistics / Delivery',
  'System Issue',
  'Other / Unclear',
];

export const PROBLEM_CATEGORIES: Record<string, string[]> = {
  'Sales Team': [
    'Lack of knowledge',
    'Wrong information given to customer',
    'Incorrect quote',
    'Wrong product specification',
    'Missed customer request',
  ],
  'Customer': [
    'Customer uploaded wrong artwork',
    'Customer selected wrong product',
    'Customer entered wrong information',
    'Customer changed their mind',
    'Customer misunderstood requirements',
  ],
  'Artwork Team': [
    'Artwork check mistake',
    'Wrong file preparation',
    'Missing warning to customer',
    'Design adjustment issue',
  ],
  'Production Team': [
    'Printing error',
    'Cutting error',
    'Wrong material used',
    'Wrong quantity produced',
    'Quality control issue',
  ],
  'Printing Partner': [
    'Partner printing mistake',
    'Late production',
    'Wrong finishing',
    'Poor print quality',
  ],
  'Logistics / Delivery': [
    'Late delivery',
    'Lost shipment',
    'Damaged during delivery',
    'Wrong address issue',
  ],
  'System Issue': [
    'Website bug',
    'Payment issue',
    'Order data error',
    'Coupon/payment calculation issue',
  ],
  'Other / Unclear': [
    'Unknown reason',
    'Needs manual review',
    'Other',
  ],
};

export const COUPON_TYPE_MAP = Object.fromEntries(
  COUPON_TYPES.map((ct) => [ct.type, ct])
);
