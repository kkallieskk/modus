-- ==========================================
-- 1. ENUMS
-- ==========================================
CREATE TYPE user_role AS ENUM ('admin', 'brand', 'influencer');
CREATE TYPE user_status AS ENUM ('pending', 'approved', 'suspended');
CREATE TYPE campaign_status AS ENUM (
    'draft', 
    'pending_admin', 
    'pending_influencer', 
    'active', 
    'submitted', 
    'completed', 
    'rejected'
);

-- ==========================================
-- 2. PROFILES TABLE
-- ==========================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'brand',
    status user_status NOT NULL DEFAULT 'approved',
    display_name TEXT,
    niche_industry TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 2️⃣  Add additional columns for influencer assets
-- ------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS base_price INTEGER;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check if current user is an Admin
-- (Using SECURITY DEFINER prevents infinite recursion when querying profiles in RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Profile Policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins have full read access to profiles" 
ON public.profiles FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins have full update access to profiles" 
ON public.profiles FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete profiles" 
ON public.profiles FOR DELETE USING (public.is_admin());

-- ------------------------------------------------------------
-- Policy: allow any authenticated user to read approved influencer profiles
-- ------------------------------------------------------------
CREATE POLICY "All users can read approved influencers"
ON public.profiles
FOR SELECT USING (
  role = 'influencer' AND status = 'approved'
);


-- ==========================================
-- 3. CAMPAIGNS TABLE (The State Machine)
-- ==========================================
CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    influencer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status campaign_status NOT NULL DEFAULT 'draft',
    campaign_brief TEXT,
    brand_budget NUMERIC(10, 2) NOT NULL DEFAULT 0,
    creator_payout NUMERIC(10, 2) NOT NULL DEFAULT 0,
    -- Generated Column for Commission (Postgres 12+ feature)
    platform_commission NUMERIC(10, 2) GENERATED ALWAYS AS (brand_budget - creator_payout) STORED,
    deliverable_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Campaigns Policies (Admins)
CREATE POLICY "Admins have full access to campaigns" 
ON public.campaigns FOR ALL USING (public.is_admin());

-- Campaigns Policies (Brands)
CREATE POLICY "Brands can view own campaigns" 
ON public.campaigns FOR SELECT USING (auth.uid() = brand_id);

CREATE POLICY "Brands can insert own campaigns" 
ON public.campaigns FOR INSERT WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Brands can update own campaigns" 
ON public.campaigns FOR UPDATE USING (auth.uid() = brand_id);

-- Campaigns Policies (Influencers)
CREATE POLICY "Influencers can view assigned campaigns past draft/admin stage" 
ON public.campaigns FOR SELECT 
USING (
    auth.uid() = influencer_id 
    AND status NOT IN ('draft', 'pending_admin')
);

CREATE POLICY "Influencers can update assigned campaigns past draft/admin stage" 
ON public.campaigns FOR UPDATE 
USING (
    auth.uid() = influencer_id 
    AND status NOT IN ('draft', 'pending_admin')
);

-- Auto-update `updated_at` column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_campaign_update
BEFORE UPDATE ON public.campaigns
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();


-- ==========================================
-- 4. AUTH HOOKS (Auto-Create Profile)
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, display_name)
  VALUES (
    NEW.id,
    -- Frontend should pass 'role' in the user_metadata upon signup. Defaults to 'brand' if missing.
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'brand'::user_role),
    -- Capture display name if passed during signup
    NEW.raw_user_meta_data->>'display_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
