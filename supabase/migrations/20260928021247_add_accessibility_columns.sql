/*
# Add accessibility preference columns to audio_preferences

1. Modified Tables
- `audio_preferences`
  - Added `high_contrast` boolean (default false) — enables high-contrast visual mode
  - Added `reduce_motion` boolean (default false) — reduces decorative animations

2. Security
- No new tables. Existing RLS policies on `audio_preferences` already cover all CRUD operations
  scoped to `auth.uid() = user_id`. The new columns are covered by the same UPDATE policy.

3. Notes
- Columns are nullable-safe with defaults so existing rows are unaffected.
- No data is lost; this is a purely additive migration.
*/

ALTER TABLE audio_preferences
  ADD COLUMN IF NOT EXISTS high_contrast boolean DEFAULT false;

ALTER TABLE audio_preferences
  ADD COLUMN IF NOT EXISTS reduce_motion boolean DEFAULT false;
