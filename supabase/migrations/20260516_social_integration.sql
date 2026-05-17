-- MODUS BACKEND ARCHITECTURE: SOCIAL INTEGRATION LAYER
-- Focus: Multi-Platform Sync, OAuth Management, and Real-Time Metrics

-- 1. SOCIAL ACCOUNTS TABLE
-- Storing raw platform data and tokens for automated syncing
CREATE TABLE IF NOT EXISTS public.social_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID REFERENCES public.profiles(id) NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('tiktok', 'instagram', 'youtube', 'twitter')),
    platform_user_id TEXT NOT NULL, -- The unique ID from the platform (e.g. Instagram User ID)
    username TEXT NOT NULL,
    display_name TEXT,
    profile_picture_url TEXT,
    follower_count BIGINT DEFAULT 0,
    average_engagement_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- AUTHENTICATION (Encrypted at application layer, stored as text here)
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    
    is_verified BOOLEAN DEFAULT false,
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(platform, platform_user_id)
);

-- 2. HISTORICAL METRICS (For Growth Charts)
CREATE TABLE IF NOT EXISTS public.social_metrics_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    social_account_id UUID REFERENCES public.social_accounts(id) ON DELETE CASCADE NOT NULL,
    follower_count BIGINT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS POLICIES
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_metrics_history ENABLE ROW LEVEL SECURITY;

-- Creators can see their own linked accounts
CREATE POLICY "Creators can manage their own social accounts" ON public.social_accounts
    FOR ALL USING (auth.uid() = creator_id);

-- Brands can see metrics for social accounts (Read Only)
CREATE POLICY "Brands can view social metrics" ON public.social_accounts
    FOR SELECT USING (true); -- Publicly viewable stats for discovery

-- 4. HELPER FUNCTION TO UPDATE LAST SYNCED
CREATE OR REPLACE FUNCTION set_last_synced_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_synced_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_metrics_update
    BEFORE UPDATE ON public.social_accounts
    FOR EACH ROW
    WHEN (OLD.follower_count IS DISTINCT FROM NEW.follower_count)
    EXECUTE FUNCTION set_last_synced_at();
