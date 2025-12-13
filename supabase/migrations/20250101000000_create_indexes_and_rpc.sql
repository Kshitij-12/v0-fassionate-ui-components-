-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_followers_follower_id ON followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following_id ON followers(following_id);
CREATE INDEX IF NOT EXISTS idx_taste_matches_user_id ON taste_matches(user_id);

-- RPC function to get public feed with like counts and current user's like status
CREATE OR REPLACE FUNCTION get_feed_public(limit_arg INTEGER, current_user_id UUID)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  caption TEXT,
  image_url TEXT,
  tags TEXT[],
  created_at TIMESTAMP,
  author_id UUID,
  author_username TEXT,
  author_avatar_url TEXT,
  like_count INTEGER,
  user_has_liked BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.user_id,
    p.caption,
    p.image_url,
    p.tags,
    p.created_at,
    pr.id,
    pr.username,
    pr.avatar_url,
    COUNT(l.id)::INTEGER as like_count,
    EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = current_user_id) as user_has_liked
  FROM posts p
  LEFT JOIN profiles pr ON p.user_id = pr.id
  LEFT JOIN likes l ON p.id = l.post_id
  GROUP BY p.id, pr.id, pr.username, pr.avatar_url
  ORDER BY p.created_at DESC
  LIMIT limit_arg;
END;
$$ LANGUAGE plpgsql STABLE;
