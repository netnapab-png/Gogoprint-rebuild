-- ============================================================
-- Gogoprint — Trim excess coupon codes
-- Keeps the first N unused codes per type (by id), deletes the rest.
-- Target: AU → 100 per type, MY/SG → 50 per type
-- Only touches is_used = FALSE rows; issued codes are never deleted.
-- ============================================================

-- ── Malaysia: keep 50 per type ───────────────────────────────
DELETE FROM public.coupons
WHERE is_used = FALSE
  AND country = 'MY'
  AND id NOT IN (
    SELECT id FROM (
      SELECT id,
             ROW_NUMBER() OVER (PARTITION BY type ORDER BY id) AS rn
      FROM   public.coupons
      WHERE  is_used = FALSE AND country = 'MY'
    ) t WHERE rn <= 50
  );

-- ── Singapore: keep 50 per type ──────────────────────────────
DELETE FROM public.coupons
WHERE is_used = FALSE
  AND country = 'SG'
  AND id NOT IN (
    SELECT id FROM (
      SELECT id,
             ROW_NUMBER() OVER (PARTITION BY type ORDER BY id) AS rn
      FROM   public.coupons
      WHERE  is_used = FALSE AND country = 'SG'
    ) t WHERE rn <= 50
  );

-- ── Australia: keep 100 per type ─────────────────────────────
DELETE FROM public.coupons
WHERE is_used = FALSE
  AND country = 'AU'
  AND id NOT IN (
    SELECT id FROM (
      SELECT id,
             ROW_NUMBER() OVER (PARTITION BY type ORDER BY id) AS rn
      FROM   public.coupons
      WHERE  is_used = FALSE AND country = 'AU'
    ) t WHERE rn <= 100
  );

-- ── Verify ───────────────────────────────────────────────────
SELECT type, country, COUNT(*) AS remaining
FROM   public.coupons
WHERE  is_used = FALSE
GROUP  BY type, country
ORDER  BY country, type;
