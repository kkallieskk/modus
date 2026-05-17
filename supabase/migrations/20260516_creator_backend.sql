-- MODUS BACKEND ARCHITECTURE: CORE SCHEMA V2
-- Focus: Scalability, Security, and State Management

-- 1. CREATOR ENTITY (Extended Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    display_name TEXT,
    role TEXT CHECK (role IN ('creator', 'brand')),
    social_handles JSONB DEFAULT '{}'::jsonb, -- { "tiktok": "@user", "instagram": "@user" }
    follower_counts JSONB DEFAULT '{}'::jsonb, -- { "tiktok": 50000, "instagram": 12000 }
    niches TEXT[] DEFAULT '{}',
    stripe_account_id TEXT,
    bio TEXT,
    rating DECIMAL(3,2) DEFAULT 0.0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PITCH ENTITY (Prospecting)
CREATE TYPE pitch_status AS ENUM ('draft', 'submitted', 'viewed', 'accepted', 'declined');

CREATE TABLE IF NOT EXISTS public.campaign_pitches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID REFERENCES public.profiles(id) NOT NULL,
    campaign_id UUID REFERENCES public.campaigns(id) NOT NULL,
    pitch_text TEXT NOT NULL,
    portfolio_links TEXT[] DEFAULT '{}',
    status pitch_status DEFAULT 'draft',
    is_active BOOLEAN DEFAULT true, -- Soft Delete
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SUBMISSION ENTITY (The Work Lifecycle)
CREATE TYPE submission_status AS ENUM (
    'awaiting_upload', 
    'in_review', 
    'revision_requested', 
    'approved', 
    'pending_post', 
    'completed',
    'disputed'
);

CREATE TABLE IF NOT EXISTS public.campaign_offers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES public.campaigns(id) NOT NULL,
    creator_id UUID REFERENCES public.profiles(id) NOT NULL,
    deliverable_url TEXT, -- Path to Cloud Storage
    live_link TEXT, -- Social media post URL
    revision_count INTEGER DEFAULT 0,
    revision_notes TEXT,
    status submission_status DEFAULT 'awaiting_upload',
    submitted_at TIMESTAMPTZ, -- For Anti-Ghosting Timer
    is_disputed BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true, -- Soft Delete
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DISPUTE TRACKING
CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    offer_id UUID REFERENCES public.campaign_offers(id) NOT NULL,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    reason TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_offers ENABLE ROW LEVEL SECURITY;

-- Creators can see their own pitches
CREATE POLICY "Creators can manage their own pitches" ON public.campaign_pitches
    FOR ALL USING (auth.uid() = creator_id);

-- Brands can see pitches for their campaigns
CREATE POLICY "Brands can see pitches for their campaigns" ON public.campaign_pitches
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.campaigns 
            WHERE id = campaign_pitches.campaign_id 
            AND brand_id = auth.uid()
        )
    );

-- 6. AUTOMATION TRIGGERS (Anti-Ghosting Logic Example)
-- Note: Real logic would run in a background worker, but DB stamps the time.
CREATE OR REPLACE FUNCTION update_submission_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'in_review' AND OLD.status != 'in_review' THEN
        NEW.submitted_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_status_change
    BEFORE UPDATE ON public.campaign_offers
    FOR EACH ROW
    EXECUTE FUNCTION update_submission_timestamp();
