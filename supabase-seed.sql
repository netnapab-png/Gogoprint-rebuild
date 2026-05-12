-- ============================================================
-- Gogoprint Coupon Management — Demo Coupon Seed
-- Run this in the Supabase SQL editor (Dashboard → SQL editor)
-- Safe to re-run at any time (ON CONFLICT DO NOTHING).
--
-- Split into 3 independent blocks (MY / SG / AU) so each can be
-- run separately if the editor times out on the full script.
-- ============================================================

-- ── BLOCK 1: Malaysia (12 types × 50 codes = 600 rows) ───────
DO $$
DECLARE
  chars CONSTANT TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  sfx TEXT; cd TEXT; i INT; j INT; rec RECORD;
BEGIN
  FOR rec IN (SELECT * FROM (VALUES
    ('GGP-MY-RM25',  'GGP MY RM25',                       'MY',  25::NUMERIC, 'fixed'),
    ('GGP-MY-RM50',  'GGP MY RM50',                       'MY',  50::NUMERIC, 'fixed'),
    ('GGP-MY-RM100', 'GGP MY RM100',                      'MY', 100::NUMERIC, 'fixed'),
    ('GGP-MY-10P',   'GGP MY 10%',                        'MY',  10::NUMERIC, 'percentage'),
    ('GGP-MY-20P',   'GGP MY 20%',                        'MY',  20::NUMERIC, 'percentage'),
    ('GGP-MY-30P',   'GGP MY 30%',                        'MY',  30::NUMERIC, 'percentage'),
    ('GGP-MY-RO',    'GGP MY REORDER',                    'MY', 100::NUMERIC, 'percentage'),
    ('GGP-MY-CLM',   'GGP MY CLAIM',                      'MY',   0::NUMERIC, 'fixed'),
    ('GGP-MY-LDV15', 'GGP MY Low Discount Voucher 15%',   'MY',  15::NUMERIC, 'percentage'),
    ('GGP-MY-MDV20', 'GGP MY Medium Discount Voucher 20%','MY',  20::NUMERIC, 'percentage'),
    ('GGP-MY-HDV40', 'GGP MY High Discount Voucher 40%',  'MY',  40::NUMERIC, 'percentage'),
    ('GGP-MY-NC',    'New Customer MY',                   'MY',   0::NUMERIC, 'fixed')
  ) AS t(prefix, ctype, country, dval, dtype)) LOOP
    FOR i IN 1..50 LOOP
      sfx := '';
      FOR j IN 1..6 LOOP
        sfx := sfx || substr(chars, (floor(random() * 32) + 1)::INT, 1);
      END LOOP;
      cd := rec.prefix || '-' || sfx;
      INSERT INTO public.coupons
        (code, type, country, discount_value, discount_type, is_used, assigned_reorder_id)
      VALUES (cd, rec.ctype, rec.country, rec.dval, rec.dtype, FALSE, NULL)
      ON CONFLICT (code) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- ── BLOCK 2: Singapore (12 types × 50 codes = 600 rows) ──────
DO $$
DECLARE
  chars CONSTANT TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  sfx TEXT; cd TEXT; i INT; j INT; rec RECORD;
BEGIN
  FOR rec IN (SELECT * FROM (VALUES
    ('GGP-SG-SGD15', 'GGP SG S$15',                       'SG',  15::NUMERIC, 'fixed'),
    ('GGP-SG-SGD30', 'GGP SG S$30',                       'SG',  30::NUMERIC, 'fixed'),
    ('GGP-SG-SGD50', 'GGP SG S$50',                       'SG',  50::NUMERIC, 'fixed'),
    ('GGP-SG-10P',   'GGP SG 10%',                        'SG',  10::NUMERIC, 'percentage'),
    ('GGP-SG-20P',   'GGP SG 20%',                        'SG',  20::NUMERIC, 'percentage'),
    ('GGP-SG-30P',   'GGP SG 30%',                        'SG',  30::NUMERIC, 'percentage'),
    ('GGP-SG-RO',    'GGP SG REORDER',                    'SG', 100::NUMERIC, 'percentage'),
    ('GGP-SG-CLM',   'GGP SG CLAIM',                      'SG',   0::NUMERIC, 'fixed'),
    ('GGP-SG-LDV15', 'GGP SG Low Discount Voucher 15%',   'SG',  15::NUMERIC, 'percentage'),
    ('GGP-SG-MDV20', 'GGP SG Medium Discount Voucher 20%','SG',  20::NUMERIC, 'percentage'),
    ('GGP-SG-HDV40', 'GGP SG High Discount Voucher 40%',  'SG',  40::NUMERIC, 'percentage'),
    ('GGP-SG-NC',    'New Customer SG',                   'SG',   0::NUMERIC, 'fixed')
  ) AS t(prefix, ctype, country, dval, dtype)) LOOP
    FOR i IN 1..50 LOOP
      sfx := '';
      FOR j IN 1..6 LOOP
        sfx := sfx || substr(chars, (floor(random() * 32) + 1)::INT, 1);
      END LOOP;
      cd := rec.prefix || '-' || sfx;
      INSERT INTO public.coupons
        (code, type, country, discount_value, discount_type, is_used, assigned_reorder_id)
      VALUES (cd, rec.ctype, rec.country, rec.dval, rec.dtype, FALSE, NULL)
      ON CONFLICT (code) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- ── BLOCK 3: Australia (9 types × 50 codes = 450 rows) ───────
DO $$
DECLARE
  chars CONSTANT TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  sfx TEXT; cd TEXT; i INT; j INT; rec RECORD;
BEGIN
  FOR rec IN (SELECT * FROM (VALUES
    ('GGP-AU-AUD5',  'GGP AU AUD5',     'AU',   5::NUMERIC, 'fixed'),
    ('GGP-AU-AUD10', 'GGP AU AUD10',    'AU',  10::NUMERIC, 'fixed'),
    ('GGP-AU-AUD20', 'GGP AU AUD20',    'AU',  20::NUMERIC, 'fixed'),
    ('GGP-AU-AUD40', 'GGP AU AUD40',    'AU',  40::NUMERIC, 'fixed'),
    ('GGP-AU-10P',   'GGP AU 10%',      'AU',  10::NUMERIC, 'percentage'),
    ('GGP-AU-20P',   'GGP AU 20%',      'AU',  20::NUMERIC, 'percentage'),
    ('GGP-AU-RO',    'GGP AU Re-order', 'AU', 100::NUMERIC, 'percentage'),
    ('GGP-AU-CLM',   'GGP AU Claim',    'AU',   0::NUMERIC, 'fixed'),
    ('GGP-AU-NC',    'New Customer AU', 'AU',   0::NUMERIC, 'fixed')
  ) AS t(prefix, ctype, country, dval, dtype)) LOOP
    FOR i IN 1..50 LOOP
      sfx := '';
      FOR j IN 1..6 LOOP
        sfx := sfx || substr(chars, (floor(random() * 32) + 1)::INT, 1);
      END LOOP;
      cd := rec.prefix || '-' || sfx;
      INSERT INTO public.coupons
        (code, type, country, discount_value, discount_type, is_used, assigned_reorder_id)
      VALUES (cd, rec.ctype, rec.country, rec.dval, rec.dtype, FALSE, NULL)
      ON CONFLICT (code) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- ── Verify: count per type ────────────────────────────────────
SELECT type, country, COUNT(*) AS total
FROM public.coupons
GROUP BY type, country
ORDER BY country, type;
