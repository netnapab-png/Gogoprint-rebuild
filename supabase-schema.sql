-- ============================================================
-- Gogoprint Coupon Management — Supabase Schema
-- Run this in the Supabase SQL editor (Dashboard → SQL editor)
-- ============================================================

-- ── user_profiles ────────────────────────────────────────────
CREATE TABLE public.user_profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email       TEXT NOT NULL,
  name        TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'staff'   CHECK (role   IN ('admin', 'staff')),
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'deleted')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "users_read_own" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "admins_read_all" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

-- Admins can update any profile (for approval workflow)
CREATE POLICY "admins_update_all" ON public.user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

-- Auto-create profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── coupons ──────────────────────────────────────────────────
CREATE TABLE public.coupons (
  id                   BIGSERIAL PRIMARY KEY,
  code                 TEXT NOT NULL UNIQUE,
  type                 TEXT NOT NULL,
  country              TEXT NOT NULL,
  discount_value       NUMERIC NOT NULL DEFAULT 0,
  discount_type        TEXT NOT NULL CHECK (discount_type IN ('fixed', 'percentage')),
  is_used              BOOLEAN NOT NULL DEFAULT FALSE,
  used_at              TIMESTAMPTZ,
  assigned_reorder_id  BIGINT,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "active_users_read_coupons" ON public.coupons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "active_users_update_coupons" ON public.coupons
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "admins_insert_coupons" ON public.coupons
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

-- ── reorders ─────────────────────────────────────────────────
CREATE TABLE public.reorders (
  id                BIGSERIAL PRIMARY KEY,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  user_id           UUID REFERENCES auth.users(id),
  requested_by      TEXT NOT NULL,
  coupon_id         BIGINT REFERENCES public.coupons(id),
  coupon_code       TEXT NOT NULL,
  coupon_type       TEXT NOT NULL,
  order_number      TEXT NOT NULL,
  new_order_number  TEXT,
  reorder_value     NUMERIC,
  reason            TEXT NOT NULL,
  problem_source    TEXT NOT NULL,
  problem_category  TEXT NOT NULL,
  notes             TEXT
);

ALTER TABLE public.reorders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "active_users_read_reorders" ON public.reorders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "active_users_insert_reorders" ON public.reorders
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND status = 'active'
    )
  );
