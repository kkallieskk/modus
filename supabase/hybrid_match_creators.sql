-- Phase 5: Pure LLM Semantic Search (No Vectors)
-- Uses a point-based scoring system driven by Groq's intelligent categorization.

DROP FUNCTION IF EXISTS match_creators(vector, float, int);
DROP FUNCTION IF EXISTS match_creators(vector, text, float, int);
DROP FUNCTION IF EXISTS match_creators(vector, text, float, int, int, int, text);
DROP FUNCTION IF EXISTS match_creators(vector, text, float, int, int, int, text[]);
DROP FUNCTION IF EXISTS match_creators(vector, float, int, int, int, text[]);

CREATE OR REPLACE FUNCTION match_creators (
  target_niches    text[] DEFAULT '{}',
  fallback_niches  text[] DEFAULT '{}',
  vibe_keywords    text[] DEFAULT '{}',
  match_count      int DEFAULT 15,
  min_price        int DEFAULT NULL,
  max_price        int DEFAULT NULL,
  match_threshold  float DEFAULT 10.0
)
RETURNS TABLE (
  id                      uuid,
  display_name            text,
  niche_industry          text,
  avatar_url              text,
  portfolio_thumbnail_url text,
  base_price              int,
  similarity              float -- We still call it similarity for the frontend
)
LANGUAGE sql STABLE
AS $$
  WITH scored_profiles AS (
    SELECT
      p.id,
      p.display_name,
      p.niche_industry,
      p.avatar_url,
      p.portfolio_thumbnail_url,
      p.base_price,
      (
        -- Baseline Score:
        -- If no target niches were provided (generic query), everyone starts with 10 points
        CASE WHEN array_length(target_niches, 1) IS NULL THEN 10.0 ELSE 0.0 END
        +
        -- Target Niche Badge Match: +20 points (ONLY niche badge, not bio)
        (
          SELECT coalesce(max(20.0), 0.0)
          FROM unnest(target_niches) t
          WHERE lower(p.niche_industry) ILIKE '%' || lower(t) || '%'
        )
        +
        -- Fallback Niche Badge Match: +10 points (ONLY niche badge)
        (
          SELECT coalesce(max(10.0), 0.0)
          FROM unnest(fallback_niches) f
          WHERE lower(p.niche_industry) ILIKE '%' || lower(f) || '%'
        )
        +
        -- Vibe/Synonym Keywords: +2 points per keyword in bio/name/niche (bonus only)
        (
          SELECT coalesce(sum(2.0), 0.0)
          FROM unnest(vibe_keywords) v
          WHERE 
            lower(p.display_name) ILIKE '%' || lower(v) || '%' OR
            lower(p.niche_industry) ILIKE '%' || lower(v) || '%' OR
            lower(coalesce(p.bio, '')) ILIKE '%' || lower(v) || '%'
        )
      ) AS similarity
    FROM public.profiles p
    WHERE
      p.role = 'influencer'
      AND p.status = 'approved'
      -- Strict Price Constraints
      AND (min_price IS NULL OR coalesce(p.base_price, 0) >= min_price)
      AND (max_price IS NULL OR coalesce(p.base_price, 0) <= max_price)
  )
  SELECT * FROM scored_profiles
  -- Must have at least a fallback niche badge match (score >=10) to qualify
  -- Vibe-keyword-only matches (score < 10) are excluded
  WHERE similarity >= match_threshold
  ORDER BY similarity DESC, base_price ASC
  LIMIT match_count;
$$;
