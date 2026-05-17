const fs = require('fs');

const niches = [
  'Fitness & Wellness', 'Travel & Outdoors', 'Gaming & Esports', 
  'Parenting & Family', 'Pet Care', 'Home & DIY', 
  'Finance & Crypto', 'Automotive', 'Art & Design', 
  'Education & Tutorials', 'Comedy & Entertainment', 'Photography & Videography',
  'Sustainable Living', 'Music & Audio', 'Fitness & Wellness',
  'Travel & Outdoors', 'Gaming & Esports', 'Parenting & Family',
  'Tech & Software', 'Fashion & Apparel', 'Skincare & Beauty',
  'Food & Beverage', 'Premium Retail', 'Sports & Athletics',
  'Books & Literature', 'Business & Entrepreneurship', 'Mental Health & Mindfulness',
  'Gardening & Plants', 'Sneakers & Streetwear', 'Luxury Lifestyle'
];

const names = [
  'Jake T.', 'Mia L.', 'Samir K.', 'Chloe W.', 'Devon G.', 'Aria S.', 'Leo B.', 'Nina R.',
  'Omar F.', 'Zoe C.', 'Liam H.', 'Maya P.', 'Ethan D.', 'Sophia M.', 'Noah J.', 'Ava V.',
  'Lucas N.', 'Isabella T.', 'Mason K.', 'Charlotte E.', 'Oliver C.', 'Amelia S.', 'Elijah W.',
  'Harper B.', 'James L.', 'Evelyn R.', 'Ben F.', 'Abby D.', 'Eli P.', 'Nora G.'
];

let sql = `-- ------------------------------------------------------------
-- Seed script for 30 diverse dummy influencer profiles
-- ------------------------------------------------------------
DO $$
DECLARE
`;

for (let i = 1; i <= 30; i++) {
  sql += `  uid${i} uuid := gen_random_uuid();\n`;
}

sql += `BEGIN\n  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)\n  VALUES\n`;

const batchId = Math.floor(Math.random() * 100000);
for (let i = 1; i <= 30; i++) {
  const isLast = i === 30;
  sql += `    (uid${i}, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'demo_influencer_${i}_${batchId}@demo.com', 'dummy_hash', now(), '{"role":"influencer"}', now(), now())${isLast ? ';' : ','}\n`;
}

sql += `\n`;

for (let i = 1; i <= 30; i++) {
  const name = names[i-1];
  const niche = niches[i-1];
  const price = Math.floor(Math.random() * 15000) + 1000;
  // random unsplash image
  const avatar = `https://images.unsplash.com/photo-${1500000000000 + i * 10000}?w=400&h=400&fit=crop`;
  const portfolio = `https://images.unsplash.com/photo-${1600000000000 + i * 10000}?w=600&h=400&fit=crop`;
  
  sql += `  UPDATE public.profiles SET 
    status = 'approved',
    display_name = '${name}',
    niche_industry = '${niche}',
    avatar_url = '${avatar}',
    portfolio_thumbnail_url = '${portfolio}',
    base_price = ${price}
  WHERE id = uid${i};\n\n`;
}

sql += `END $$;\n`;

fs.writeFileSync('supabase/seed_30_creators.sql', sql);
console.log('Generated supabase/seed_30_creators.sql');
