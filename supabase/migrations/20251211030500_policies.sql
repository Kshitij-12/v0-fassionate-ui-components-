-- 2025-12-11 03:05:00 UTC
-- Enable RLS and create policies for least-privilege access.

-- Enable RLS on tables
ALTER TABLE IF EXISTS public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.taste_matches ENABLE ROW LEVEL SECURITY;

-- POSTS
-- Allow owners to insert rows where author_id = auth.uid()
CREATE POLICY posts_insert_owner ON public.posts
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Allow owners to update/delete their posts
CREATE POLICY posts_modify_owner ON public.posts
  FOR UPDATE, DELETE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Allow select of posts to authenticated users and anon only via RPC (RPC has separate grants)
-- For safety, restrict direct SELECT to authenticated users; allow anon select on limited columns if desired.
CREATE POLICY posts_select_authenticated ON public.posts
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- PROFILES
-- Allow public read for profiles (basic info) - permit select to authenticated and anon
CREATE POLICY profiles_select_public ON public.profiles
  FOR SELECT
  USING (true);

-- Allow user to update their profile
CREATE POLICY profiles_update_owner ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- LIKES
-- Allow authenticated users to insert like rows where user_id = auth.uid()
CREATE POLICY likes_insert_owner ON public.likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow delete of likes by the owner
CREATE POLICY likes_delete_owner ON public.likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Allow select of likes only to authenticated users (for private checks)
CREATE POLICY likes_select_authenticated ON public.likes
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- FOLLOWERS
-- Allow authenticated users to follow/unfollow where follower_id = auth.uid()
CREATE POLICY followers_insert_owner ON public.followers
  FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY followers_delete_owner ON public.followers
  FOR DELETE
  USING (auth.uid() = follower_id);

-- Allow select of followers to authenticated users (to see following lists)
CREATE POLICY followers_select_authenticated ON public.followers
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- TASTE_MATCHES
-- Allow authenticated users to insert where user_id = auth.uid()
CREATE POLICY taste_matches_insert_owner ON public.taste_matches
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to select their own taste matches
CREATE POLICY taste_matches_select_owner ON public.taste_matches
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow delete/update only by owner
CREATE POLICY taste_matches_modify_owner ON public.taste_matches
  FOR UPDATE, DELETE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ensure RPC usage: grant execute on functions done in migrations where RPC is created.
