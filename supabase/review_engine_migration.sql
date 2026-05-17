-- Module 6: Review & Approval Engine - DB Migration
-- Run this in your Supabase SQL Editor

-- Step 1: Add new columns to campaign_offers
ALTER TABLE public.campaign_offers
  ADD COLUMN IF NOT EXISTS deliverable_url TEXT,
  ADD COLUMN IF NOT EXISTS revision_notes TEXT;

-- Step 2: Safely update the CHECK constraint on status
-- We drop the old constraint and add the new expanded one.
-- The constraint name may vary; this covers the most common naming patterns.
ALTER TABLE public.campaign_offers
  DROP CONSTRAINT IF EXISTS campaign_offers_status_check;

ALTER TABLE public.campaign_offers
  ADD CONSTRAINT campaign_offers_status_check
  CHECK (status IN (
    'pending',
    'accepted',
    'pending_review',
    'revision_requested',
    'completed'
  ));

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'campaign_offers' 
  AND column_name IN ('deliverable_url', 'revision_notes', 'status');
