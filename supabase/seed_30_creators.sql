-- Seed script: 30 diverse influencer profiles (picsum.photos - no API key needed)
DO $$
DECLARE
  uid1 uuid := gen_random_uuid(); uid2 uuid := gen_random_uuid(); uid3 uuid := gen_random_uuid();
  uid4 uuid := gen_random_uuid(); uid5 uuid := gen_random_uuid(); uid6 uuid := gen_random_uuid();
  uid7 uuid := gen_random_uuid(); uid8 uuid := gen_random_uuid(); uid9 uuid := gen_random_uuid();
  uid10 uuid := gen_random_uuid(); uid11 uuid := gen_random_uuid(); uid12 uuid := gen_random_uuid();
  uid13 uuid := gen_random_uuid(); uid14 uuid := gen_random_uuid(); uid15 uuid := gen_random_uuid();
  uid16 uuid := gen_random_uuid(); uid17 uuid := gen_random_uuid(); uid18 uuid := gen_random_uuid();
  uid19 uuid := gen_random_uuid(); uid20 uuid := gen_random_uuid(); uid21 uuid := gen_random_uuid();
  uid22 uuid := gen_random_uuid(); uid23 uuid := gen_random_uuid(); uid24 uuid := gen_random_uuid();
  uid25 uuid := gen_random_uuid(); uid26 uuid := gen_random_uuid(); uid27 uuid := gen_random_uuid();
  uid28 uuid := gen_random_uuid(); uid29 uuid := gen_random_uuid(); uid30 uuid := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
  VALUES
    (uid1,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','v3_jake@demo.com','dummy_hash',now(),'{"role":"influencer"}',now(),now()),
    (uid2,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','v3_mia@demo.com','dummy_hash',now(),'{"role":"influencer"}',now(),now()),
    (uid3,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','v3_samir@demo.com','dummy_hash',now(),'{"role":"influencer"}',now(),now()),
    (uid4,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','v3_chloe@demo.com','dummy_hash',now(),'{"role":"influencer"}',now(),now()),
    (uid5,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','v3_devon@demo.com','dummy_hash',now(),'{"role":"influencer"}',now(),now()),
    (uid6,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','v3_aria@demo.com','dummy_hash',now(),'{"role":"influencer"}',now(),now()),
    (uid7,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','v3_leo@demo.com','dummy_hash',now(),'{"role":"influencer"}',now(),now()),
    (uid8,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','v3_nina@demo.com','dummy_hash',now(),'{"role":"influencer"}',now(),now()),
    (uid9,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','v3_omar@demo.com','dummy_hash',now(),'{"role":"influencer"}',now(),now()),
    (uid10,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','v3_zoe@demo.com','dummy_hash',now(),'{"role":"influencer"}',now(),now()),
    (uid11,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','v3_liam@demo.com','dummy_hash',now(),'{"role":"influencer"}',now(),now()),
    (uid12,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','v3_maya@demo.com','dummy_hash',now(),'{"role":"influencer"}',now(),now()),
    (uid13,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','v3_ethan@demo.com','dummy_hash',now(),'{"role":"influencer"}',now(),now()),
    (uid14,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','v3_sophia@demo.com','dummy_hash',now(),'{"role":"influencer"}',now(),now()),
    (uid15,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','v3_noah@demo.com','dummy_hash',now(),'{"role":"influencer"}',now(),now()),
    (uid16,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','v3_ava@demo.com','dummy_hash',now(),'{"role":"influencer"}',now(),now()),
    (uid17,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','v3_lucas@demo.com','dummy_hash',now(),'{"role":"influencer"}',now(),now()),
    (uid18,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','v3_isabella@demo.com','dummy_hash',now(),'{"role":"influencer"}',now(),now()),
    (uid19,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','v3_mason@demo.com','dummy_hash',now(),'{"role":"influencer"}',now(),now()),
    (uid20,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','v3_charlotte@demo.com','dummy_hash',now(),'{"role":"influencer"}',now(),now()),
    (uid21,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','v3_oliver@demo.com','dummy_hash',now(),'{"role":"influencer"}',now(),now()),
    (uid22,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','v3_amelia@demo.com','dummy_hash',now(),'{"role":"influencer"}',now(),now()),
    (uid23,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','v3_elijah@demo.com','dummy_hash',now(),'{"role":"influencer"}',now(),now()),
    (uid24,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','v3_harper@demo.com','dummy_hash',now(),'{"role":"influencer"}',now(),now()),
    (uid25,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','v3_james@demo.com','dummy_hash',now(),'{"role":"influencer"}',now(),now()),
    (uid26,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','v3_evelyn@demo.com','dummy_hash',now(),'{"role":"influencer"}',now(),now()),
    (uid27,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','v3_ben@demo.com','dummy_hash',now(),'{"role":"influencer"}',now(),now()),
    (uid28,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','v3_abby@demo.com','dummy_hash',now(),'{"role":"influencer"}',now(),now()),
    (uid29,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','v3_eli@demo.com','dummy_hash',now(),'{"role":"influencer"}',now(),now()),
    (uid30,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','v3_nora@demo.com','dummy_hash',now(),'{"role":"influencer"}',now(),now());

  -- picsum.photos: /id/{seed}/width/height - always returns a real image, no API key
  UPDATE public.profiles SET status='approved',display_name='Jake T.',niche_industry='Fitness & Wellness',avatar_url='https://picsum.photos/seed/jake/200/200',portfolio_thumbnail_url='https://picsum.photos/seed/jake_port/600/400',base_price=5500 WHERE id=uid1;
  UPDATE public.profiles SET status='approved',display_name='Mia L.',niche_industry='Travel & Outdoors',avatar_url='https://picsum.photos/seed/mia/200/200',portfolio_thumbnail_url='https://picsum.photos/seed/mia_port/600/400',base_price=8000 WHERE id=uid2;
  UPDATE public.profiles SET status='approved',display_name='Samir K.',niche_industry='Gaming & Esports',avatar_url='https://picsum.photos/seed/samir/200/200',portfolio_thumbnail_url='https://picsum.photos/seed/samir_port/600/400',base_price=4500 WHERE id=uid3;
  UPDATE public.profiles SET status='approved',display_name='Chloe W.',niche_industry='Parenting & Family',avatar_url='https://picsum.photos/seed/chloe/200/200',portfolio_thumbnail_url='https://picsum.photos/seed/chloe_port/600/400',base_price=3500 WHERE id=uid4;
  UPDATE public.profiles SET status='approved',display_name='Devon G.',niche_industry='Pet Care',avatar_url='https://picsum.photos/seed/devon/200/200',portfolio_thumbnail_url='https://picsum.photos/seed/devon_port/600/400',base_price=3000 WHERE id=uid5;
  UPDATE public.profiles SET status='approved',display_name='Aria S.',niche_industry='Home & DIY',avatar_url='https://picsum.photos/seed/aria/200/200',portfolio_thumbnail_url='https://picsum.photos/seed/aria_port/600/400',base_price=4200 WHERE id=uid6;
  UPDATE public.profiles SET status='approved',display_name='Leo B.',niche_industry='Finance & Crypto',avatar_url='https://picsum.photos/seed/leo/200/200',portfolio_thumbnail_url='https://picsum.photos/seed/leo_port/600/400',base_price=9500 WHERE id=uid7;
  UPDATE public.profiles SET status='approved',display_name='Nina R.',niche_industry='Automotive',avatar_url='https://picsum.photos/seed/nina/200/200',portfolio_thumbnail_url='https://picsum.photos/seed/nina_port/600/400',base_price=7500 WHERE id=uid8;
  UPDATE public.profiles SET status='approved',display_name='Omar F.',niche_industry='Art & Design',avatar_url='https://picsum.photos/seed/omar/200/200',portfolio_thumbnail_url='https://picsum.photos/seed/omar_port/600/400',base_price=4800 WHERE id=uid9;
  UPDATE public.profiles SET status='approved',display_name='Zoe C.',niche_industry='Education & Tutorials',avatar_url='https://picsum.photos/seed/zoe/200/200',portfolio_thumbnail_url='https://picsum.photos/seed/zoe_port/600/400',base_price=3800 WHERE id=uid10;
  UPDATE public.profiles SET status='approved',display_name='Liam H.',niche_industry='Comedy & Entertainment',avatar_url='https://picsum.photos/seed/liam/200/200',portfolio_thumbnail_url='https://picsum.photos/seed/liam_port/600/400',base_price=6000 WHERE id=uid11;
  UPDATE public.profiles SET status='approved',display_name='Maya P.',niche_industry='Photography & Videography',avatar_url='https://picsum.photos/seed/mayap/200/200',portfolio_thumbnail_url='https://picsum.photos/seed/mayap_port/600/400',base_price=7000 WHERE id=uid12;
  UPDATE public.profiles SET status='approved',display_name='Ethan D.',niche_industry='Sustainable Living',avatar_url='https://picsum.photos/seed/ethan/200/200',portfolio_thumbnail_url='https://picsum.photos/seed/ethan_port/600/400',base_price=4000 WHERE id=uid13;
  UPDATE public.profiles SET status='approved',display_name='Sophia M.',niche_industry='Music & Audio',avatar_url='https://picsum.photos/seed/sophia/200/200',portfolio_thumbnail_url='https://picsum.photos/seed/sophia_port/600/400',base_price=5200 WHERE id=uid14;
  UPDATE public.profiles SET status='approved',display_name='Noah J.',niche_industry='Fitness & Wellness',avatar_url='https://picsum.photos/seed/noah/200/200',portfolio_thumbnail_url='https://picsum.photos/seed/noah_port/600/400',base_price=5800 WHERE id=uid15;
  UPDATE public.profiles SET status='approved',display_name='Ava V.',niche_industry='Travel & Outdoors',avatar_url='https://picsum.photos/seed/ava/200/200',portfolio_thumbnail_url='https://picsum.photos/seed/ava_port/600/400',base_price=9000 WHERE id=uid16;
  UPDATE public.profiles SET status='approved',display_name='Lucas N.',niche_industry='Tech & Software',avatar_url='https://picsum.photos/seed/lucas/200/200',portfolio_thumbnail_url='https://picsum.photos/seed/lucas_port/600/400',base_price=8500 WHERE id=uid17;
  UPDATE public.profiles SET status='approved',display_name='Isabella T.',niche_industry='Fashion & Apparel',avatar_url='https://picsum.photos/seed/isabella/200/200',portfolio_thumbnail_url='https://picsum.photos/seed/isabella_port/600/400',base_price=6500 WHERE id=uid18;
  UPDATE public.profiles SET status='approved',display_name='Mason K.',niche_industry='Skincare & Beauty',avatar_url='https://picsum.photos/seed/mason/200/200',portfolio_thumbnail_url='https://picsum.photos/seed/mason_port/600/400',base_price=5000 WHERE id=uid19;
  UPDATE public.profiles SET status='approved',display_name='Charlotte E.',niche_industry='Food & Beverage',avatar_url='https://picsum.photos/seed/charlotte/200/200',portfolio_thumbnail_url='https://picsum.photos/seed/charlotte_port/600/400',base_price=4500 WHERE id=uid20;
  UPDATE public.profiles SET status='approved',display_name='Oliver C.',niche_industry='Sports & Athletics',avatar_url='https://picsum.photos/seed/oliver/200/200',portfolio_thumbnail_url='https://picsum.photos/seed/oliver_port/600/400',base_price=7200 WHERE id=uid21;
  UPDATE public.profiles SET status='approved',display_name='Amelia S.',niche_industry='Books & Literature',avatar_url='https://picsum.photos/seed/amelia/200/200',portfolio_thumbnail_url='https://picsum.photos/seed/amelia_port/600/400',base_price=3200 WHERE id=uid22;
  UPDATE public.profiles SET status='approved',display_name='Elijah W.',niche_industry='Business & Entrepreneurship',avatar_url='https://picsum.photos/seed/elijah/200/200',portfolio_thumbnail_url='https://picsum.photos/seed/elijah_port/600/400',base_price=11000 WHERE id=uid23;
  UPDATE public.profiles SET status='approved',display_name='Harper B.',niche_industry='Mental Health & Mindfulness',avatar_url='https://picsum.photos/seed/harper/200/200',portfolio_thumbnail_url='https://picsum.photos/seed/harper_port/600/400',base_price=4000 WHERE id=uid24;
  UPDATE public.profiles SET status='approved',display_name='James L.',niche_industry='Gardening & Plants',avatar_url='https://picsum.photos/seed/james/200/200',portfolio_thumbnail_url='https://picsum.photos/seed/james_port/600/400',base_price=3000 WHERE id=uid25;
  UPDATE public.profiles SET status='approved',display_name='Evelyn R.',niche_industry='Sneakers & Streetwear',avatar_url='https://picsum.photos/seed/evelyn/200/200',portfolio_thumbnail_url='https://picsum.photos/seed/evelyn_port/600/400',base_price=6800 WHERE id=uid26;
  UPDATE public.profiles SET status='approved',display_name='Ben F.',niche_industry='Luxury Lifestyle',avatar_url='https://picsum.photos/seed/benf/200/200',portfolio_thumbnail_url='https://picsum.photos/seed/benf_port/600/400',base_price=15000 WHERE id=uid27;
  UPDATE public.profiles SET status='approved',display_name='Abby D.',niche_industry='Fitness & Wellness',avatar_url='https://picsum.photos/seed/abby/200/200',portfolio_thumbnail_url='https://picsum.photos/seed/abby_port/600/400',base_price=4800 WHERE id=uid28;
  UPDATE public.profiles SET status='approved',display_name='Eli P.',niche_industry='Gaming & Esports',avatar_url='https://picsum.photos/seed/elip/200/200',portfolio_thumbnail_url='https://picsum.photos/seed/elip_port/600/400',base_price=5500 WHERE id=uid29;
  UPDATE public.profiles SET status='approved',display_name='Nora G.',niche_industry='Art & Design',avatar_url='https://picsum.photos/seed/nora/200/200',portfolio_thumbnail_url='https://picsum.photos/seed/nora_port/600/400',base_price=5200 WHERE id=uid30;

END $$;
