-- Delete all fake seeded mock influencer profiles
-- These are generated/seeded users with fake names, not real accounts
DELETE FROM profiles WHERE id IN (
  'daaa20b4-38b2-4ae2-8478-421ce3ad5eef', -- Leo B.
  '81b21301-30f4-41b2-bdf3-7abf395f59fc', -- Maya P.
  '79e4c77c-0f64-4c7b-9e6e-655423344b55', -- Ethan D.
  '202d1468-71b9-4d7d-adcd-31b07b245ed6', -- Mia L.
  '23df5995-6e9d-4562-9b0d-218eda886195', -- Samir K.
  'fa4ed895-4a4d-497b-91dd-d9d9c9388dfc', -- Mia L. (dupe)
  'acc89d03-9e2c-4ac1-8dfc-098ce29db74b', -- Samir K. (dupe)
  '210241b3-ae1b-4739-b758-ad3e0dec3c85', -- Chloe W.
  'b029a794-34cf-445c-8494-92bebb42960e', -- Devon G.
  'a266bbf1-85dc-4a97-8f83-2e43c8ac4417', -- Chloe W. (dupe)
  'd50868b5-5081-4024-9f62-fdc25d783dc8', -- Devon G. (dupe)
  '1c6acc94-727f-4961-9b0a-08aca2560810', -- Ava V.
  '5d17405b-5645-40ef-bbae-025ff19e7bb9', -- Aria S.
  'cfa130f3-cedf-4b92-8091-840998296022', -- Leo B. (dupe)
  '330aa0a3-403b-4471-93d8-a6c26df20e14', -- Sophia M.
  '27a22a52-0392-49dc-8080-3ab31c686de2', -- Lucas N.
  'e0487c5e-b1d5-4f6c-a1f1-00c6dcefd103', -- Isabella T.
  '426fc2c9-0374-4ded-a919-85fbf621e85c', -- Mason K.
  '18b2d535-0b1f-4dcf-a2e0-12e2cf024e96', -- minimalist_jess fake profile
  '70d55897-57c5-4db5-802c-f7ee449784ff', -- Charlotte E.
  'edd42b62-9842-4f6b-badb-f42459a19870', -- Noah J.
  '5dd74ccf-84c2-4034-ad3d-ae0aa4c65091', -- Nina R.
  'e0f0ced3-546c-4d7d-8a36-84d406598a92', -- Omar F.
  '09f13697-8299-4932-8b01-f97f1e9b8a2c', -- Zoe C.
  '7c577e35-0aee-4b48-9a6a-6562415540cb', -- Jake T.
  '93a201f1-551b-43e2-9bc7-d18f2920f31e', -- Liam H.
  '3725a43f-8e2e-43ab-a9eb-bb8d3486b8d3', -- Aria S. (dupe)
  'b7f14348-bd79-4fe4-9b66-0749595d9ad3', -- null display_name with mock niches
  '11aa0cf1-1853-4c28-9500-bf630e68c513', -- null display_name
  '190f5ade-3445-4733-9815-d26878180a1a', -- null display_name
  '51e42457-7168-41de-b59f-8f4fa96c3ff9'  -- null display_name
);
