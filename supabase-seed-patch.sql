-- ============================================================
-- Gogoprint — Coupon Seed PATCH
-- Run this if the full seed timed out and AU / some SG types
-- show 0 codes. Safe to re-run (ON CONFLICT DO NOTHING).
-- ============================================================

-- ── Missing SG types (Low/Medium/High Voucher + New Customer) ─
DO $$
DECLARE
  chars CONSTANT TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  sfx TEXT; cd TEXT; i INT; j INT; rec RECORD;
BEGIN
  FOR rec IN (SELECT * FROM (VALUES
    ('GGP-SG-LDV15', 'GGP SG Low Discount Voucher 15%',   'SG', 15::NUMERIC, 'percentage'),
    ('GGP-SG-MDV20', 'GGP SG Medium Discount Voucher 20%','SG', 20::NUMERIC, 'percentage'),
    ('GGP-SG-HDV40', 'GGP SG High Discount Voucher 40%',  'SG', 40::NUMERIC, 'percentage'),
    ('GGP-SG-NC',    'New Customer SG',                   'SG',  0::NUMERIC, 'fixed')
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

-- ── All AU types ──────────────────────────────────────────────
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
    FOR i IN 1..100 LOOP
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

-- ── Verify counts ─────────────────────────────────────────────
SELECT country, COUNT(*) AS total_codes
FROM public.coupons
WHERE is_used = FALSE
GROUP BY country
ORDER BY country;
