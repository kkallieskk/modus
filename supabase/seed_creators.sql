-- ------------------------------------------------------------
-- Seed script for dummy influencer profiles (Idempotent)
-- ------------------------------------------------------------
-- 1️⃣ Add missing columns to profiles if they don't exist
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS base_price INTEGER;

-- 2️⃣ Insert dummy users into auth.users, which triggers profile creation, then update profiles
DO $$
DECLARE
  uid1 uuid := gen_random_uuid();
  uid2 uuid := gen_random_uuid();
  uid3 uuid := gen_random_uuid();
  uid4 uuid := gen_random_uuid();
  uid5 uuid := gen_random_uuid();
BEGIN
  -- Insert into auth.users (this fires the trigger that creates the profile)
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
  VALUES
    (uid1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'aisha@demo.com', 'dummy_hash', now(), '{"role":"influencer"}', now(), now()),
    (uid2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rohan@demo.com', 'dummy_hash', now(), '{"role":"influencer"}', now(), now()),
    (uid3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lena@demo.com', 'dummy_hash', now(), '{"role":"influencer"}', now(), now()),
    (uid4, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'carlos@demo.com', 'dummy_hash', now(), '{"role":"influencer"}', now(), now()),
    (uid5, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mira@demo.com', 'dummy_hash', now(), '{"role":"influencer"}', now(), now());

  -- Update the auto-created profiles with the rest of the data
  UPDATE public.profiles SET 
    status = 'approved',
    display_name = 'Aisha K.',
    niche_industry = 'Fashion & Apparel',
    avatar_url = 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop',
    portfolio_thumbnail_url = 'https://images.unsplash.com/photo-1493558103805-03cf4e3d2a79?w=600&h=400&fit=crop',
    base_price = 4000
  WHERE id = uid1;

  UPDATE public.profiles SET 
    status = 'approved',
    display_name = 'Rohan Sharma',
    niche_industry = 'Tech & Gadgets',
    avatar_url = 'https://images.unsplash.com/photo-1503443207920-c2aab9d1f9b7?w=400&h=400&fit=crop',
    portfolio_thumbnail_url = 'https://images.unsplash.com/photo-1517059224940-d4af9eec41e3?w=600&h=400&fit=crop',
    base_price = 7500
  WHERE id = uid2;

  UPDATE public.profiles SET 
    status = 'approved',
    display_name = 'Lena M.',
    niche_industry = 'Skincare & Beauty',
    avatar_url = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
    portfolio_thumbnail_url = 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=400&fit=crop',
    base_price = 6200
  WHERE id = uid3;

  UPDATE public.profiles SET 
    status = 'approved',
    display_name = 'Carlos D.',
    niche_industry = 'Food & Beverage',
    avatar_url = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop',
    portfolio_thumbnail_url = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop',
    base_price = 5000
  WHERE id = uid4;

  UPDATE public.profiles SET 
    status = 'approved',
    display_name = 'Mira S.',
    niche_industry = 'Premium Retail',
    avatar_url = 'https://images.unsplash.com/photo-1602524202741-5d8b0d28fa6b?w=400&h=400&fit=crop',
    portfolio_thumbnail_url = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=400&fit=crop',
    base_price = 12000
  WHERE id = uid5;

END $$;
