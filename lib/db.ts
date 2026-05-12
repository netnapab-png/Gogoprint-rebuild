/**
 * In-memory database — works on Vercel serverless (no filesystem writes).
 *
 * State lives in a module-level variable for the lifetime of a warm serverless
 * instance. On a cold start the seed data is restored automatically.
 * For persistent storage, replace readDb/writeDb with a real database client
 * (e.g. Supabase, PlanetScale, Redis) without touching any API route.
 */
import type { Coupon, Reorder } from './types';

export interface DbData {
  coupons:       Coupon[];
  reorders:      Reorder[];
  nextCouponId:  number;
  nextReorderId: number;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

function makeSeedCoupons(): Coupon[] {
  const now = new Date().toISOString();
  let id = 1;

  function make(
    code: string,
    type: string,
    country: string,
    discount_value: number,
    discount_type: 'fixed' | 'percentage',
  ): Coupon {
    return {
      id: id++, code, type, country,
      discount_value, discount_type,
      is_used: 0, used_at: null, assigned_reorder_id: null, created_at: now,
    };
  }

  return [
    // ── Malaysia ──────────────────────────────────────────────
    make('GGP-MY-25RM-SAMPLE01',  'GGP MY RM25',   'MY', 25,  'fixed'),
    make('GGP-MY-25RM-SAMPLE02',  'GGP MY RM25',   'MY', 25,  'fixed'),
    make('GGP-MY-50RM-SAMPLE01',  'GGP MY RM50',   'MY', 50,  'fixed'),
    make('GGP-MY-50RM-SAMPLE02',  'GGP MY RM50',   'MY', 50,  'fixed'),
    make('GGP-MY-100RM-SAMPLE01', 'GGP MY RM100',  'MY', 100, 'fixed'),
    make('GGP-MY-100RM-SAMPLE02', 'GGP MY RM100',  'MY', 100, 'fixed'),
    make('GGP-MY-10P-SAMPLE01',   'GGP MY 10%',    'MY', 10,  'percentage'),
    make('GGP-MY-10P-SAMPLE02',   'GGP MY 10%',    'MY', 10,  'percentage'),
    make('GGP-MY-20P-SAMPLE01',   'GGP MY 20%',    'MY', 20,  'percentage'),
    make('GGP-MY-20P-SAMPLE02',   'GGP MY 20%',    'MY', 20,  'percentage'),
    make('GGP-MY-30P-SAMPLE01',   'GGP MY 30%',    'MY', 30,  'percentage'),
    make('GGP-MY-30P-SAMPLE02',   'GGP MY 30%',    'MY', 30,  'percentage'),
    make('GGP-MY-RO-SAMPLE01',    'GGP MY REORDER','MY', 100, 'percentage'),
    make('GGP-MY-RO-SAMPLE02',    'GGP MY REORDER','MY', 100, 'percentage'),
    make('GGP-MY-CLM-SAMPLE01',   'GGP MY CLAIM',  'MY', 0,   'fixed'),
    make('GGP-MY-CLM-SAMPLE02',   'GGP MY CLAIM',  'MY', 0,   'fixed'),
    make('GGP-MY-LDV-SAMPLE01',   'GGP MY Low Discount Voucher 15%',    'MY', 15, 'percentage'),
    make('GGP-MY-LDV-SAMPLE02',   'GGP MY Low Discount Voucher 15%',    'MY', 15, 'percentage'),
    make('GGP-MY-MDV-SAMPLE01',   'GGP MY Medium Discount Voucher 20%', 'MY', 20, 'percentage'),
    make('GGP-MY-MDV-SAMPLE02',   'GGP MY Medium Discount Voucher 20%', 'MY', 20, 'percentage'),
    make('GGP-MY-HDV-SAMPLE01',   'GGP MY High Discount Voucher 40%',   'MY', 40, 'percentage'),
    make('GGP-MY-HDV-SAMPLE02',   'GGP MY High Discount Voucher 40%',   'MY', 40, 'percentage'),
    make('GGP-MY-NEW-SAMPLE01',   'New Customer MY','MY', 0,   'fixed'),
    make('GGP-MY-NEW-SAMPLE02',   'New Customer MY','MY', 0,   'fixed'),

    // ── Singapore ─────────────────────────────────────────────
    make('GGP-SG-15-SAMPLE01',    'GGP SG S$15',   'SG', 15,  'fixed'),
    make('GGP-SG-15-SAMPLE02',    'GGP SG S$15',   'SG', 15,  'fixed'),
    make('GGP-SG-30-SAMPLE01',    'GGP SG S$30',   'SG', 30,  'fixed'),
    make('GGP-SG-30-SAMPLE02',    'GGP SG S$30',   'SG', 30,  'fixed'),
    make('GGP-SG-50-SAMPLE01',    'GGP SG S$50',   'SG', 50,  'fixed'),
    make('GGP-SG-50-SAMPLE02',    'GGP SG S$50',   'SG', 50,  'fixed'),
    make('GGP-SG-10P-SAMPLE01',   'GGP SG 10%',    'SG', 10,  'percentage'),
    make('GGP-SG-10P-SAMPLE02',   'GGP SG 10%',    'SG', 10,  'percentage'),
    make('GGP-SG-20P-SAMPLE01',   'GGP SG 20%',    'SG', 20,  'percentage'),
    make('GGP-SG-20P-SAMPLE02',   'GGP SG 20%',    'SG', 20,  'percentage'),
    make('GGP-SG-30P-SAMPLE01',   'GGP SG 30%',    'SG', 30,  'percentage'),
    make('GGP-SG-30P-SAMPLE02',   'GGP SG 30%',    'SG', 30,  'percentage'),
    make('GGP-SG-RO-SAMPLE01',    'GGP SG REORDER','SG', 100, 'percentage'),
    make('GGP-SG-RO-SAMPLE02',    'GGP SG REORDER','SG', 100, 'percentage'),
    make('GGP-SG-CLM-SAMPLE01',   'GGP SG CLAIM',  'SG', 0,   'fixed'),
    make('GGP-SG-CLM-SAMPLE02',   'GGP SG CLAIM',  'SG', 0,   'fixed'),
    make('GGP-SG-LDV-SAMPLE01',   'GGP SG Low Discount Voucher 15%',    'SG', 15, 'percentage'),
    make('GGP-SG-LDV-SAMPLE02',   'GGP SG Low Discount Voucher 15%',    'SG', 15, 'percentage'),
    make('GGP-SG-MDV-SAMPLE01',   'GGP SG Medium Discount Voucher 20%', 'SG', 20, 'percentage'),
    make('GGP-SG-MDV-SAMPLE02',   'GGP SG Medium Discount Voucher 20%', 'SG', 20, 'percentage'),
    make('GGP-SG-HDV-SAMPLE01',   'GGP SG High Discount Voucher 40%',   'SG', 40, 'percentage'),
    make('GGP-SG-HDV-SAMPLE02',   'GGP SG High Discount Voucher 40%',   'SG', 40, 'percentage'),
    make('GGP-SG-NEW-SAMPLE01',   'New Customer SG','SG', 0,   'fixed'),
    make('GGP-SG-NEW-SAMPLE02',   'New Customer SG','SG', 0,   'fixed'),

    // ── Australia ─────────────────────────────────────────────
    make('GGP-AU-5-SAMPLE01',     'GGP AU AUD5',    'AU', 5,   'fixed'),
    make('GGP-AU-5-SAMPLE02',     'GGP AU AUD5',    'AU', 5,   'fixed'),
    make('GGP-AU-10-SAMPLE01',    'GGP AU AUD10',   'AU', 10,  'fixed'),
    make('GGP-AU-10-SAMPLE02',    'GGP AU AUD10',   'AU', 10,  'fixed'),
    make('GGP-AU-20-SAMPLE01',    'GGP AU AUD20',   'AU', 20,  'fixed'),
    make('GGP-AU-20-SAMPLE02',    'GGP AU AUD20',   'AU', 20,  'fixed'),
    make('GGP-AU-40-SAMPLE01',    'GGP AU AUD40',   'AU', 40,  'fixed'),
    make('GGP-AU-40-SAMPLE02',    'GGP AU AUD40',   'AU', 40,  'fixed'),
    make('GGP-AU-10P-SAMPLE01',   'GGP AU 10%',     'AU', 10,  'percentage'),
    make('GGP-AU-10P-SAMPLE02',   'GGP AU 10%',     'AU', 10,  'percentage'),
    make('GGP-AU-20P-SAMPLE01',   'GGP AU 20%',     'AU', 20,  'percentage'),
    make('GGP-AU-20P-SAMPLE02',   'GGP AU 20%',     'AU', 20,  'percentage'),
    make('GGP-AU-RO-SAMPLE01',    'GGP AU Re-order','AU', 100, 'percentage'),
    make('GGP-AU-RO-SAMPLE02',    'GGP AU Re-order','AU', 100, 'percentage'),
    make('GGP-AU-CLM-SAMPLE01',   'GGP AU Claim',   'AU', 0,   'fixed'),
    make('GGP-AU-CLM-SAMPLE02',   'GGP AU Claim',   'AU', 0,   'fixed'),
    make('GGP-AU-NEW-SAMPLE01',   'New Customer AU','AU', 0,   'fixed'),
    make('GGP-AU-NEW-SAMPLE02',   'New Customer AU','AU', 0,   'fixed'),
  ];
}

// ─── In-memory store ──────────────────────────────────────────────────────────

let _db: DbData | null = null;

function init(): DbData {
  const seed = makeSeedCoupons();
  return {
    coupons:       seed,
    reorders:      [],
    nextCouponId:  seed.length + 1,
    nextReorderId: 1,
  };
}

export function readDb(): DbData {
  if (!_db) _db = init();
  return _db;
}

export function writeDb(data: DbData): void {
  _db = data;
}
