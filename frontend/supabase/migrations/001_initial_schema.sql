-- ============================================================
-- 001_initial_schema.sql
-- MuscleMap initial schema
-- ============================================================

-- ── exercises ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exercises (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  muscles    JSONB       NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read exercises (shared catalogue)
CREATE POLICY "Authenticated users can read exercises"
  ON exercises FOR SELECT
  TO authenticated
  USING (true);

-- ── workout_sessions ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workout_sessions (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own sessions"
  ON workout_sessions FOR ALL
  TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── logged_sets ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS logged_sets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID        NOT NULL REFERENCES workout_sessions (id) ON DELETE CASCADE,
  exercise_id UUID        NOT NULL REFERENCES exercises (id),
  sets        INTEGER     NOT NULL CHECK (sets > 0),
  reps        INTEGER     NOT NULL CHECK (reps > 0),
  logged_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE logged_sets ENABLE ROW LEVEL SECURITY;

-- Users can only access sets that belong to their own sessions
CREATE POLICY "Users manage own logged sets"
  ON logged_sets FOR ALL
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM workout_sessions WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    session_id IN (
      SELECT id FROM workout_sessions WHERE user_id = auth.uid()
    )
  );

-- ── muscle_fatigue_cache ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS muscle_fatigue_cache (
  user_id       UUID         NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  muscle_group  TEXT         NOT NULL,
  fatigue_value NUMERIC      NOT NULL DEFAULT 0 CHECK (fatigue_value >= 0 AND fatigue_value <= 1),
  last_updated  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, muscle_group)
);

ALTER TABLE muscle_fatigue_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own fatigue cache"
  ON muscle_fatigue_cache FOR ALL
  TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_logged_at
  ON workout_sessions (user_id, logged_at DESC);

CREATE INDEX IF NOT EXISTS idx_logged_sets_session_id
  ON logged_sets (session_id);

CREATE INDEX IF NOT EXISTS idx_logged_sets_exercise_id
  ON logged_sets (exercise_id);
