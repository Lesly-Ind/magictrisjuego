/*
# Create audio_preferences table

## Purpose
Store per-user audio settings (voice volume, voice speed, effects volume).

## New Table
### audio_preferences
- user_id (uuid, PK, references auth.users, ON DELETE CASCADE)
- voice_volume (int, default 100) — 0, 25, 50, 75, 100
- voice_speed (text, default 'slow') — 'slow', 'normal', 'fast'
- effects_volume (text, default 'normal') — 'normal', 'soft', 'off'
- updated_at (timestamptz, default now())

## Security
- RLS enabled.
- Authenticated users can only CRUD their own row (auth.uid() = user_id).
- Uses upsert pattern (one row per user).
*/

CREATE TABLE IF NOT EXISTS audio_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  voice_volume int NOT NULL DEFAULT 100 CHECK (voice_volume IN (0, 25, 50, 75, 100)),
  voice_speed text NOT NULL DEFAULT 'slow' CHECK (voice_speed IN ('slow', 'normal', 'fast')),
  effects_volume text NOT NULL DEFAULT 'normal' CHECK (effects_volume IN ('normal', 'soft', 'off')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE audio_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_audio_prefs" ON audio_preferences;
CREATE POLICY "select_own_audio_prefs" ON audio_preferences FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_audio_prefs" ON audio_preferences;
CREATE POLICY "insert_own_audio_prefs" ON audio_preferences FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_audio_prefs" ON audio_preferences;
CREATE POLICY "update_own_audio_prefs" ON audio_preferences FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_audio_prefs" ON audio_preferences;
CREATE POLICY "delete_own_audio_prefs" ON audio_preferences FOR DELETE
  TO authenticated USING (auth.uid() = user_id);