-- Module 6 Test Seed
-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 1: Run this to find your IDs:
--   SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;
--   SELECT id, display_name FROM public.profiles WHERE role = 'influencer' LIMIT 3;
--
-- STEP 2: Replace the two UUIDs below with your actual values, then run.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_brand_id   UUID := 'YOUR_BRAND_USER_ID_HERE';   -- ← paste your brand UUID here
  v_creator_id UUID := 'ANY_INFLUENCER_ID_HERE';    -- ← paste any influencer UUID here
  v_campaign_id UUID;
BEGIN
  INSERT INTO public.campaigns (brand_id, title, deliverable_type, budget, status)
  VALUES (v_brand_id, '🧪 Test Review Campaign', 'Instagram Reel', 15000, 'active')
  RETURNING id INTO v_campaign_id;

  INSERT INTO public.campaign_offers (campaign_id, creator_id, rank, status, deliverable_url)
  VALUES (
    v_campaign_id,
    v_creator_id,
    1,
    'pending_review',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  );

  RAISE NOTICE 'Done! Campaign ID: %', v_campaign_id;
END $$;

-- Verify
SELECT co.id, co.status, co.deliverable_url, c.title, c.budget
FROM campaign_offers co
JOIN campaigns c ON c.id = co.campaign_id
WHERE co.status = 'pending_review';

