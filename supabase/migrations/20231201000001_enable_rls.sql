-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE taste_matches ENABLE ROW LEVEL SECURITY;

-- ==================== PROFILES POLICIES ====================
-- SELECT: public can read all profiles
CREATE POLICY "Profiles are publicly readable" ON profiles
  FOR SELECT USING (true);

-- INSERT: only authenticated users can create their own profile
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- UPDATE: users can only update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ==================== POSTS POLICIES ====================
-- SELECT: public can read all posts
CREATE POLICY "Posts are publicly readable" ON posts
  FOR SELECT USING (true);

-- INSERT: only authenticated users can create posts
CREATE POLICY "Users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE: only post owner can update
CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- DELETE: only post owner can delete
CREATE POLICY "Users can delete their own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- ==================== LIKES POLICIES ====================
-- SELECT: public can view likes (optional)
CREATE POLICY "Likes are publicly readable" ON likes
  FOR SELECT USING (true);

-- INSERT: only authenticated users can like
CREATE POLICY "Users can like posts" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- DELETE: users can only unlike their own likes
CREATE POLICY "Users can unlike their own likes" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- ==================== FOLLOWERS POLICIES ====================
-- SELECT: public can view follower relationships
CREATE POLICY "Followers are publicly readable" ON followers
  FOR SELECT USING (true);

-- INSERT: only authenticated users can follow
CREATE POLICY "Users can follow other users" ON followers
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- DELETE: users can only unfollow themselves
CREATE POLICY "Users can unfollow" ON followers
  FOR DELETE USING (auth.uid() = follower_id);

-- ==================== TASTE_MATCHES POLICIES ====================
-- SELECT: users can view their own taste matches
CREATE POLICY "Users can view their own taste matches" ON taste_matches
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT: authenticated users can create taste matches for themselves
CREATE POLICY "Users can create taste matches" ON taste_matches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE: disallow updates (optional, can be removed if needed)
CREATE POLICY "Taste matches cannot be updated" ON taste_matches
  FOR UPDATE USING (false);

-- DELETE: disallow deletes (optional, can be removed if needed)
CREATE POLICY "Taste matches cannot be deleted" ON taste_matches
  FOR DELETE USING (false);
