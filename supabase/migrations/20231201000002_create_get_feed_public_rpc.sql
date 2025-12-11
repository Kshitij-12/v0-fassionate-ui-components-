-- Create RPC function to fetch public feed with author info and like counts
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
  display_name TEXT,
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
    pr.display_name,
    COUNT(l.user_id)::BIGINT AS like_count
  FROM posts p
  LEFT JOIN profiles pr ON p.user_id = pr.id
  LEFT JOIN likes l ON p.id = l.post_id
  GROUP BY p.id, pr.id
  ORDER BY p.created_at DESC
  LIMIT limit_arg;
END;
$$ LANGUAGE plpgsql;
