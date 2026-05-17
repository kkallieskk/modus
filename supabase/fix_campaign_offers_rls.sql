-- Fix: RLS Policies for campaign_offers
-- Run this in Supabase SQL Editor

-- Step 1: Make sure RLS is enabled on campaign_offers
ALTER TABLE public.campaign_offers ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop any old/conflicting policies
DROP POLICY IF EXISTS "Brands can view their own offers" ON public.campaign_offers;
DROP POLICY IF EXISTS "Brands can update their own offers" ON public.campaign_offers;
DROP POLICY IF EXISTS "Creators can view their own offers" ON public.campaign_offers;
DROP POLICY IF EXISTS "Creators can update their own offers" ON public.campaign_offers;
DROP POLICY IF EXISTS "Brands can insert offers" ON public.campaign_offers;
DROP POLICY IF EXISTS "Admins full access to offers" ON public.campaign_offers;

-- Step 3: Add correct policies

-- Brands can see all offers on their campaigns
CREATE POLICY "Brands can view their own offers"
ON public.campaign_offers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_offers.campaign_id
    AND c.brand_id = auth.uid()
  )
);

-- Brands can UPDATE offers on their own campaigns (approve, revision, etc.)
CREATE POLICY "Brands can update their own offers"
ON public.campaign_offers FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_offers.campaign_id
    AND c.brand_id = auth.uid()
  )
);

-- Brands can INSERT offers (when creating a campaign)
CREATE POLICY "Brands can insert offers"
ON public.campaign_offers FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_offers.campaign_id
    AND c.brand_id = auth.uid()
  )
);

-- Creators can see their own offers
CREATE POLICY "Creators can view their own offers"
ON public.campaign_offers FOR SELECT
USING (creator_id = auth.uid());

-- Creators can update their own offers (e.g., submitting deliverable_url)
CREATE POLICY "Creators can update their own offers"
ON public.campaign_offers FOR UPDATE
USING (creator_id = auth.uid());

-- Admins have full access
CREATE POLICY "Admins full access to offers"
ON public.campaign_offers FOR ALL
USING (public.is_admin());
