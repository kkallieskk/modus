-- Step 1: Ensure the bio column exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- Step 2: Enrich the existing demo creators with realistic bios
DO $$
DECLARE
  r RECORD;
  idx INT := 1;
  bios TEXT[] := ARRAY[
    'Certified personal trainer and wellness coach passionate about helping you achieve your fitness goals with sustainable, science-backed habits.',
    'Globe-trotter and adventurer sharing breathtaking landscapes, hidden gems, and practical travel tips from around the world.',
    'Competitive esports player and gaming enthusiast streaming top-tier gameplay, reviews, and community events.',
    'Mom of two sharing realistic parenting advice, fun family activities, and tips for navigating the chaos of raising kids.',
    'Professional dog trainer and animal lover dedicated to teaching you how to build a stronger bond with your furry best friend.',
    'DIY expert and interior design enthusiast transforming spaces on a budget with creative, easy-to-follow projects.',
    'Financial literacy advocate breaking down complex crypto, investing, and personal finance topics into simple, actionable steps.',
    'Car fanatic reviewing the latest models, sharing maintenance tips, and taking you behind the wheel of incredible vehicles.',
    'Digital artist and illustrator showcasing my creative process, tutorials, and inspiration for fellow artists.',
    'Educator and lifelong learner creating accessible tutorials and study hacks to help students succeed academically.',
    'Stand-up comedian and sketch writer bringing daily laughs and relatable humor to your feed.',
    'Professional photographer and videographer sharing behind-the-scenes looks, camera tips, and visual storytelling techniques.',
    'Eco-conscious creator sharing simple, impactful ways to live a more sustainable and zero-waste lifestyle.',
    'Indie musician and producer sharing original tracks, cover songs, and music production tutorials.',
    'Yoga instructor and holistic health advocate focusing on mind-body connection and mindful living.',
    'Outdoor enthusiast documenting hiking trails, camping gear reviews, and nature photography.',
    'Software engineer and tech reviewer exploring the latest gadgets, coding tips, and industry trends.',
    'Fashion stylist and trend forecaster helping you build a versatile, confident wardrobe for any occasion.',
    'Skincare expert reviewing products, sharing routines, and debunking common beauty myths.',
    'Home chef and recipe developer sharing delicious, easy-to-make meals for busy weeknights.',
    'Amateur athlete and sports analyst breaking down games, sharing workout routines, and celebrating sports culture.',
    'Avid reader and book reviewer sharing recommendations, literary analysis, and cozy reading aesthetic.',
    'Startup founder and business coach sharing entrepreneurial insights, productivity hacks, and leadership advice.',
    'Mental health advocate sharing personal experiences, coping strategies, and mindfulness practices.',
    'Urban gardener and plant parent sharing tips for keeping your indoor jungle thriving.',
    'Sneakerhead and streetwear collector reviewing the latest drops, styling tips, and brand history.',
    'Luxury lifestyle content creator sharing high-end fashion, fine dining, and exclusive experiences.',
    'Marathon runner and fitness coach sharing training plans, nutrition tips, and motivation for runners.',
    'Retro gaming collector and historian exploring classic consoles, hidden gems, and the history of video games.',
    'Graphic designer and typographer sharing design principles, software tutorials, and creative inspiration.'
  ];
BEGIN
  FOR r IN
    SELECT id FROM public.profiles
    WHERE role = 'influencer'
    ORDER BY created_at ASC
    LIMIT 30
  LOOP
    UPDATE public.profiles SET
      bio = bios[idx]
    WHERE id = r.id;
    idx := idx + 1;
  END LOOP;
END $$;
