/**
 * Lightweight JSON file database.
 * Uses atomic write (write-then-rename) so a crash mid-write never corrupts the file.
 * Node.js is single-threaded, so synchronous reads/writes within one process
 * are safe from race conditions on a single server.
 */
import fs from 'fs';
import path from 'path';
import type { Coupon, Reorder } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH  = path.join(DATA_DIR, 'db.json');

export interface DbData {
  coupons:       Coupon[];
  reorders:      Reorder[];
  nextCouponId:  number;
  nextReorderId: number;
}

// ─── Seed placeholder codes (replace via CSV import with real codes) ──────────

function makeSeedCoupons(): Coupon[] {
  const now = new Date().toISOString();
  let id = 1;

  function make(
    code: string,
    type: string,
    country: string,
    discount_value: number,
    discount_type: 'fixed' | 'percentage'
  ): Coupon {
    return { id: id++, code, type, country, discount_value, discount_type, is_used: 0, used_at: null, assigned_reorder_id: null, created_at: now };
  }

  return [
    // GGP MY RM25
    make('GGP-MY-25RM-SAMPLE01', 'GGP MY RM25',   'MY', 25,  'fixed'),
    make('GGP-MY-25RM-SAMPLE02', 'GGP MY RM25',   'MY', 25,  'fixed'),
    // GGP MY RM50
    make('GGP-MY-50RM-SAMPLE01', 'GGP MY RM50',   'MY', 50,  'fixed'),
    make('GGP-MY-50RM-SAMPLE02', 'GGP MY RM50',   'MY', 50,  'fixed'),
    // GGP MY RM100
    make('GGP-MY-100RM-SAMPLE01','GGP MY RM100',  'MY', 100, 'fixed'),
    make('GGP-MY-100RM-SAMPLE02','GGP MY RM100',  'MY', 100, 'fixed'),
    // GGP MY 10%
    make('GGP-MY-10P-SAMPLE01',  'GGP MY 10%',    'MY', 10,  'percentage'),
    make('GGP-MY-10P-SAMPLE02',  'GGP MY 10%',    'MY', 10,  'percentage'),
    // GGP MY 20%
    make('GGP-MY-20P-SAMPLE01',  'GGP MY 20%',    'MY', 20,  'percentage'),
    make('GGP-MY-20P-SAMPLE02',  'GGP MY 20%',    'MY', 20,  'percentage'),
    // GGP MY 30%
    make('GGP-MY-30P-SAMPLE01',  'GGP MY 30%',    'MY', 30,  'percentage'),
    make('GGP-MY-30P-SAMPLE02',  'GGP MY 30%',    'MY', 30,  'percentage'),
    // GGP MY REORDER
    make('GGP-MY-RO-SAMPLE01',   'GGP MY REORDER','MY', 100, 'percentage'),
    make('GGP-MY-RO-SAMPLE02',   'GGP MY REORDER','MY', 100, 'percentage'),
    // GGP MY CLAIM
    make('GGP-MY-CLM-SAMPLE01',  'GGP MY CLAIM',  'MY', 0,   'fixed'),
    make('GGP-MY-CLM-SAMPLE02',  'GGP MY CLAIM',  'MY', 0,   'fixed'),
    // GGP MY Low Discount Voucher 15%
    make('GGP-MY-LDV-SAMPLE01',  'GGP MY Low Discount Voucher 15%',    'MY', 15, 'percentage'),
    make('GGP-MY-LDV-SAMPLE02',  'GGP MY Low Discount Voucher 15%',    'MY', 15, 'percentage'),
    // GGP MY Medium Discount Voucher 20%
    make('GGP-MY-MDV-SAMPLE01',  'GGP MY Medium Discount Voucher 20%', 'MY', 20, 'percentage'),
    make('GGP-MY-MDV-SAMPLE02',  'GGP MY Medium Discount Voucher 20%', 'MY', 20, 'percentage'),
    // GGP MY High Discount Voucher 40%
    make('GGP-MY-HDV-SAMPLE01',  'GGP MY High Discount Voucher 40%',   'MY', 40, 'percentage'),
    make('GGP-MY-HDV-SAMPLE02',  'GGP MY High Discount Voucher 40%',   'MY', 40, 'percentage'),
    // New Customer MY
    make('GGP-MY-NEW-SAMPLE01',  'New Customer MY','MY', 0,   'fixed'),
    make('GGP-MY-NEW-SAMPLE02',  'New Customer MY','MY', 0,   'fixed'),

    // GGP SG S$15
    make('GGP-SG-15-SAMPLE01',   'GGP SG S$15',   'SG', 15,  'fixed'),
    make('GGP-SG-15-SAMPLE02',   'GGP SG S$15',   'SG', 15,  'fixed'),
    // GGP SG S$30
    make('GGP-SG-30-SAMPLE01',   'GGP SG S$30',   'SG', 30,  'fixed'),
    make('GGP-SG-30-SAMPLE02',   'GGP SG S$30',   'SG', 30,  'fixed'),
    // GGP SG S$50
    make('GGP-SG-50-SAMPLE01',   'GGP SG S$50',   'SG', 50,  'fixed'),
    make('GGP-SG-50-SAMPLE02',   'GGP SG S$50',   'SG', 50,  'fixed'),
    // GGP SG 10%
    make('GGP-SG-10P-SAMPLE01',  'GGP SG 10%',    'SG', 10,  'percentage'),
    make('GGP-SG-10P-SAMPLE02',  'GGP SG 10%',    'SG', 10,  'percentage'),
    // GGP SG 20%
    make('GGP-SG-20P-SAMPLE01',  'GGP SG 20%',    'SG', 20,  'percentage'),
    make('GGP-SG-20P-SAMPLE02',  'GGP SG 20%',    'SG', 20,  'percentage'),
    // GGP SG 30%
    make('GGP-SG-30P-SAMPLE01',  'GGP SG 30%',    'SG', 30,  'percentage'),
    make('GGP-SG-30P-SAMPLE02',  'GGP SG 30%',    'SG', 30,  'percentage'),
    // GGP SG REORDER
    make('GGP-SG-RO-SAMPLE01',   'GGP SG REORDER','SG', 100, 'percentage'),
    make('GGP-SG-RO-SAMPLE02',   'GGP SG REORDER','SG', 100, 'percentage'),
    // GGP SG CLAIM
    make('GGP-SG-CLM-SAMPLE01',  'GGP SG CLAIM',  'SG', 0,   'fixed'),
    make('GGP-SG-CLM-SAMPLE02',  'GGP SG CLAIM',  'SG', 0,   'fixed'),
    // GGP SG Low Discount Voucher 15%
    make('GGP-SG-LDV-SAMPLE01',  'GGP SG Low Discount Voucher 15%',    'SG', 15, 'percentage'),
    make('GGP-SG-LDV-SAMPLE02',  'GGP SG Low Discount Voucher 15%',    'SG', 15, 'percentage'),
    // GGP SG Medium Discount Voucher 20%
    make('GGP-SG-MDV-SAMPLE01',  'GGP SG Medium Discount Voucher 20%', 'SG', 20, 'percentage'),
    make('GGP-SG-MDV-SAMPLE02',  'GGP SG Medium Discount Voucher 20%', 'SG', 20, 'percentage'),
    // GGP SG High Discount Voucher 40%
    make('GGP-SG-HDV-SAMPLE01',  'GGP SG High Discount Voucher 40%',   'SG', 40, 'percentage'),
    make('GGP-SG-HDV-SAMPLE02',  'GGP SG High Discount Voucher 40%',   'SG', 40, 'percentage'),
    // New Customer SG
    make('GGP-SG-NEW-SAMPLE01',  'New Customer SG','SG', 0,   'fixed'),
    make('GGP-SG-NEW-SAMPLE02',  'New Customer SG','SG', 0,   'fixed'),

    // GGP AU AUD5
    make('GGP-AU-5-SAMPLE01',    'GGP AU AUD5',   'AU', 5,   'fixed'),
    make('GGP-AU-5-SAMPLE02',    'GGP AU AUD5',   'AU', 5,   'fixed'),
    // GGP AU AUD10
    make('GGP-AU-10-SAMPLE01',   'GGP AU AUD10',  'AU', 10,  'fixed'),
    make('GGP-AU-10-SAMPLE02',   'GGP AU AUD10',  'AU', 10,  'fixed'),
    // GGP AU AUD20
    make('GGP-AU-20-SAMPLE01',   'GGP AU AUD20',  'AU', 20,  'fixed'),
    make('GGP-AU-20-SAMPLE02',   'GGP AU AUD20',  'AU', 20,  'fixed'),
    // GGP AU AUD40
    make('GGP-AU-40-SAMPLE01',   'GGP AU AUD40',  'AU', 40,  'fixed'),
    make('GGP-AU-40-SAMPLE02',   'GGP AU AUD40',  'AU', 40,  'fixed'),
    // GGP AU 10%
    make('GGP-AU-10P-SAMPLE01',  'GGP AU 10%',    'AU', 10,  'percentage'),
    make('GGP-AU-10P-SAMPLE02',  'GGP AU 10%',    'AU', 10,  'percentage'),
    // GGP AU 20%
    make('GGP-AU-20P-SAMPLE01',  'GGP AU 20%',    'AU', 20,  'percentage'),
    make('GGP-AU-20P-SAMPLE02',  'GGP AU 20%',    'AU', 20,  'percentage'),
    // GGP AU Re-order
    make('GGP-AU-RO-SAMPLE01',   'GGP AU Re-order','AU', 100, 'percentage'),
    make('GGP-AU-RO-SAMPLE02',   'GGP AU Re-order','AU', 100, 'percentage'),
    // GGP AU Claim
    make('GGP-AU-CLM-SAMPLE01',  'GGP AU Claim',  'AU', 0,   'fixed'),
    make('GGP-AU-CLM-SAMPLE02',  'GGP AU Claim',  'AU', 0,   'fixed'),
    // New Customer AU
    make('GGP-AU-NEW-SAMPLE01',  'New Customer AU','AU', 0,   'fixed'),
    make('GGP-AU-NEW-SAMPLE02',  'New Customer AU','AU', 0,   'fixed'),
  ];
}

// ─── I/O ──────────────────────────────────────────────────────────────────────

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function readDb(): DbData {
  ensureDataDir();
  if (!fs.existsSync(DB_PATH)) {
    const seed = makeSeedCoupons();
    const initial: DbData = {
      coupons:       seed,
      reorders:      [],
      nextCouponId:  seed.length + 1,
      nextReorderId: 1,
    };
    writeDb(initial);
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')) as DbData;
}

export function writeDb(data: DbData): void {
  ensureDataDir();
  const tmp = DB_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmp, DB_PATH); // atomic swap
}
