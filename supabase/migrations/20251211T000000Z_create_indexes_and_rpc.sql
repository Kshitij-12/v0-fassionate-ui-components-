-- 2025-12-11 03:00:00 UTC
-- Create useful indexes and the get_feed_public RPC.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- GIN index for posts.tags.
-- Assumes posts.tags is text[]; if jsonb adjust to (tags jsonb_path_ops) or create expression index.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_tags_gin ON public.posts USING GIN (tags);

-- Index on posts.created_at for ordering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_created_at ON public.posts (created_at DESC);

-- Index for likes by post_id (fast count)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_likes_post_id ON public.likes (post_id);

-- Index for profiles.username (lookup)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_username ON public.profiles (username);

-- Indexes for taste_matches
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_taste_matches_user_id ON public.taste_matches (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_taste_matches_matched_user_id ON public.taste_matches (matched_user_id);

-- Indexes for followers
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_followers_follower_id ON public.followers (follower_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_followers_following_id ON public.followers (following_id);

-- RPC: get_feed_public(limit integer)
-- Returns rows with post + author info + like_count
CREATE OR REPLACE FUNCTION public.get_feed_public(limit_arg integer)
RETURNS TABLE (
  id uuid,
  image_url text,
  caption text,
  tags text[],
  created_at timestamptz,
  author_id uuid,
  author_username text,
  author_avatar_url text,
  like_count integer
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.id,
    p.image_url,
    p.caption,
    p.tags,
    p.created_at,
    pr.id AS author_id,
    pr.username AS author_username,
    pr.avatar_url AS author_avatar_url,
    COALESCE(lc.count, 0)::int AS like_count
  FROM public.posts p
  JOIN public.profiles pr ON pr.id = p.user_id
  LEFT JOIN (
    SELECT post_id, count(*)::int AS count FROM public.likes GROUP BY post_id
  ) lc ON lc.post_id = p.id
  ORDER BY p.created_at DESC
  LIMIT $1;
$$;
$$;

-- Grant execute to authenticated and anon so RPC can be called publicly (RPC still returns only allowed columns)
GRANT EXECUTE ON FUNCTION public.get_feed_public(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_feed_public(integer) TO anon;

