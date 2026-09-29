/*
# Create learning_sessions and user_rewards tables

1. New Tables
- `learning_sessions`
  - id (uuid PK)
  - user_id (uuid, FK to auth.users, default auth.uid())
  - session_start (timestamptz)
  - session_end (timestamptz, nullable)
  - duration_seconds (int, nullable)
  - activities_completed (int, default 0)
- `user_rewards`
  - id (uuid PK)
  - user_id (uuid, FK to auth.users, default auth.uid())
  - reward_id (text, not null)
  - earned_at (timestamptz)
  - UNIQUE(user_id, reward_id) to prevent duplicates

2. Security
- RLS enabled on both tables.
- Owner-scoped CRUD: authenticated users can only access rows where user_id = auth.uid().
- 4 policies per table (SELECT, INSERT, UPDATE, DELETE).

3. Notes
- No existing tables modified.
- user_id defaults to auth.uid() so inserts from the frontend work without passing it.
*/

CREATE TABLE IF NOT EXISTS learning_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  session_start timestamptz NOT NULL DEFAULT now(),
  session_end timestamptz,
  duration_seconds int,
  activities_completed int NOT NULL DEFAULT 0
);

ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_sessions" ON learning_sessions;
CREATE POLICY "select_own_sessions" ON learning_sessions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_sessions" ON learning_sessions;
CREATE POLICY "insert_own_sessions" ON learning_sessions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_sessions" ON learning_sessions;
CREATE POLICY "update_own_sessions" ON learning_sessions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_sessions" ON learning_sessions;
CREATE POLICY "delete_own_sessions" ON learning_sessions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS user_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id text NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, reward_id)
);

ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_rewards" ON user_rewards;
CREATE POLICY "select_own_rewards" ON user_rewards FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_rewards" ON user_rewards;
CREATE POLICY "insert_own_rewards" ON user_rewards FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_rewards" ON user_rewards;
CREATE POLICY "update_own_rewards" ON user_rewards FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_rewards" ON user_rewards;
CREATE POLICY "delete_own_rewards" ON user_rewards FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
