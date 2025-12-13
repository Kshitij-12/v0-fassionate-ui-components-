-- Create swipes table for rating system
CREATE TABLE IF NOT EXISTS swipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  value INTEGER NOT NULL CHECK (value IN (0, 1, 2)), -- 0=skip, 1=drip, 2=superdrip
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_swipes_user_id ON swipes(user_id);
CREATE INDEX IF NOT EXISTS idx_swipes_post_id ON swipes(post_id);
CREATE INDEX IF NOT EXISTS idx_swipes_created_at ON swipes(created_at DESC);

-- Add taste_vector column to profiles for ML/matching
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS taste_vector JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS college TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS aesthetics TEXT[] DEFAULT '{}';

-- Update posts table to ensure proper columns
ALTER TABLE posts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE posts ALTER COLUMN user_id SET NOT NULL;

-- RLS policies for swipes
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own swipes"
  ON swipes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own swipes"
  ON swipes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to update taste vector after swipe
CREATE OR REPLACE FUNCTION update_taste_vector_on_swipe()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple incremental update: increment count for post tags
  UPDATE profiles
  SET taste_vector = COALESCE(taste_vector, '{}'::jsonb) || 
    jsonb_build_object(
      'last_updated', now()::text,
      'total_swipes', COALESCE((taste_vector->>'total_swipes')::int, 0) + 1
    )
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_taste_vector
  AFTER INSERT ON swipes
  FOR EACH ROW
  EXECUTE FUNCTION update_taste_vector_on_swipe();

-- Add user_badges table for gamification
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_name)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own badges"
  ON user_badges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Add blocks and reports tables for moderation
CREATE TABLE IF NOT EXISTS blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON blocks(blocked_id);

ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own blocks"
  ON blocks FOR ALL
  TO authenticated
  USING (auth.uid() = blocker_id)
  WITH CHECK (auth.uid() = blocker_id);

CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reported_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);
