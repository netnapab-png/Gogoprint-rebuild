-- ============================================================
-- Gogoprint — Coupon Seed PATCH
-- Run this if the full seed timed out and TH / some SG types
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

-- ── All TH types ──────────────────────────────────────────────
DO $$
DECLARE
  chars CONSTANT TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  sfx TEXT; cd TEXT; i INT; j INT; rec RECORD;
BEGIN
  FOR rec IN (SELECT * FROM (VALUES
    ('GGP-TH-200',  'GGP TH 200',  'TH',  200::NUMERIC, 'fixed'),
    ('GGP-TH-300',  'GGP TH 300',  'TH',  300::NUMERIC, 'fixed'),
    ('GGP-TH-500',  'GGP TH 500',  'TH',  500::NUMERIC, 'fixed'),
    ('GGP-TH-1000', 'GGP TH 1000', 'TH', 1000::NUMERIC, 'fixed')
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

-- ── Verify counts ─────────────────────────────────────────────
SELECT country, COUNT(*) AS total_codes
FROM public.coupons
WHERE is_used = FALSE
GROUP BY country
ORDER BY country;
