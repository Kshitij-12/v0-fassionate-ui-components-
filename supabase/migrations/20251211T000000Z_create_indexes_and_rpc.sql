CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_followers_following_id ON followers(following_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_followers_follower_id ON followers(follower_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_taste_matches_user_id ON taste_matches(user_id);

CREATE OR REPLACE FUNCTION get_feed_public(limit_arg INT DEFAULT 50)
RETURNS TABLE (
  id UUID,
  image_url TEXT,
  caption TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ,
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  like_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.image_url,
    p.caption,
    p.tags,
    p.created_at,
    p.user_id,
    pr.username,
    pr.avatar_url,
    COUNT(l.user_id)::BIGINT AS like_count
  FROM posts p
  LEFT JOIN profiles pr ON p.user_id = pr.id
  LEFT JOIN likes l ON p.id = l.post_id
  GROUP BY p.id, pr.id
  ORDER BY p.created_at DESC
  LIMIT limit_arg;
END;
$$ LANGUAGE plpgsql;
