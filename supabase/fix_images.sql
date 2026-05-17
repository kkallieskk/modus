-- Fix: Update image URLs for existing creators using picsum.photos (no API key required)
-- This updates already-existing profiles in order of creation. No new users needed.

DO $$
DECLARE
  r RECORD;
  idx INT := 1;
  names TEXT[] := ARRAY[
    'Jake T.','Mia L.','Samir K.','Chloe W.','Devon G.',
    'Aria S.','Leo B.','Nina R.','Omar F.','Zoe C.',
    'Liam H.','Maya P.','Ethan D.','Sophia M.','Noah J.',
    'Ava V.','Lucas N.','Isabella T.','Mason K.','Charlotte E.',
    'Oliver C.','Amelia S.','Elijah W.','Harper B.','James L.',
    'Evelyn R.','Ben F.','Abby D.','Eli P.','Nora G.'
  ];
  niches TEXT[] := ARRAY[
    'Fitness & Wellness','Travel & Outdoors','Gaming & Esports','Parenting & Family','Pet Care',
    'Home & DIY','Finance & Crypto','Automotive','Art & Design','Education & Tutorials',
    'Comedy & Entertainment','Photography & Videography','Sustainable Living','Music & Audio','Fitness & Wellness',
    'Travel & Outdoors','Tech & Software','Fashion & Apparel','Skincare & Beauty','Food & Beverage',
    'Sports & Athletics','Books & Literature','Business & Entrepreneurship','Mental Health & Mindfulness','Gardening & Plants',
    'Sneakers & Streetwear','Luxury Lifestyle','Fitness & Wellness','Gaming & Esports','Art & Design'
  ];
  prices INT[] := ARRAY[
    5500,8000,4500,3500,3000,4200,9500,7500,4800,3800,
    6000,7000,4000,5200,5800,9000,8500,6500,5000,4500,
    7200,3200,11000,4000,3000,6800,15000,4800,5500,5200
  ];
  seeds TEXT[] := ARRAY[
    'jake','mia','samir','chloe','devon','aria','leo','nina','omar','zoe',
    'liam','mayap','ethan','sophia','noah','ava','lucas','isabella','mason','charlotte',
    'oliver','amelia','elijah','harper','james','evelyn','benf','abby','elip','nora'
  ];
BEGIN
  FOR r IN
    SELECT id FROM public.profiles
    WHERE role = 'influencer'
    ORDER BY created_at ASC
    LIMIT 30
  LOOP
    UPDATE public.profiles SET
      status = 'approved',
      display_name = names[idx],
      niche_industry = niches[idx],
      avatar_url = 'https://picsum.photos/seed/' || seeds[idx] || '/200/200',
      portfolio_thumbnail_url = 'https://picsum.photos/seed/' || seeds[idx] || '_port/600/400',
      base_price = prices[idx]
    WHERE id = r.id;
    idx := idx + 1;
  END LOOP;
END $$;
