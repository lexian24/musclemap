-- ============================================================
-- 002_exercise_fields_and_user_maxes.sql
-- Adds category + unit to exercises; adds user_exercise_maxes table;
-- adds feedback table.
-- Run in Supabase SQL editor.
-- ============================================================

-- ── Add unit and category to exercises ──────────────────────
ALTER TABLE exercises
  ADD COLUMN IF NOT EXISTS unit     TEXT NOT NULL DEFAULT 'reps'
                                    CHECK (unit IN ('reps', 'seconds')),
  ADD COLUMN IF NOT EXISTS category TEXT
                                    CHECK (category IN ('push', 'pull', 'core', 'legs'));

-- ── user_exercise_maxes ─────────────────────────────────────
-- Stores each user's personal 1-set maximum for an exercise.
-- max_value is in reps for rep-based exercises, seconds for timed ones.
CREATE TABLE IF NOT EXISTS user_exercise_maxes (
  user_id     UUID    NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  exercise_id UUID    NOT NULL REFERENCES exercises (id)  ON DELETE CASCADE,
  max_value   INTEGER NOT NULL CHECK (max_value > 0),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, exercise_id)
);

ALTER TABLE user_exercise_maxes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own maxes"
  ON user_exercise_maxes FOR ALL
  TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── feedback ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID  REFERENCES auth.users (id) ON DELETE SET NULL,
  type       TEXT  NOT NULL CHECK (type IN ('bug', 'feature', 'general')),
  message    TEXT  NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own feedback"
  ON feedback FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own feedback"
  ON feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
