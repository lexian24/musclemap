-- ============================================================
-- seed.sql  — MuscleMap exercise catalogue
-- 40+ calisthenics exercises from dieringe.com/blog/calisthenics-skills
-- + essential supplementary exercises, categorised and with unit.
--
-- Run AFTER 002_exercise_fields_and_user_maxes.sql migration.
-- Uses ON CONFLICT (name) DO UPDATE so it is safe to re-run.
-- ============================================================

INSERT INTO exercises (name, category, unit, muscles) VALUES

-- ── PUSH ─────────────────────────────────────────────────────
('Push-ups', 'push', 'reps', '[{"muscle":"chest","intensity":0.8},{"muscle":"triceps","intensity":0.6},{"muscle":"front_delts","intensity":0.5},{"muscle":"abs","intensity":0.2}]'),
('Decline Push-ups', 'push', 'reps', '[{"muscle":"front_delts","intensity":0.7},{"muscle":"chest","intensity":0.6},{"muscle":"triceps","intensity":0.5},{"muscle":"abs","intensity":0.2}]'),
('Diamond Push-ups', 'push', 'reps', '[{"muscle":"triceps","intensity":0.9},{"muscle":"chest","intensity":0.5},{"muscle":"front_delts","intensity":0.4}]'),
('Archer Push-ups', 'push', 'reps', '[{"muscle":"chest","intensity":0.9},{"muscle":"triceps","intensity":0.6},{"muscle":"front_delts","intensity":0.4},{"muscle":"biceps","intensity":0.3}]'),
('One Arm Push-ups', 'push', 'reps', '[{"muscle":"chest","intensity":1.0},{"muscle":"triceps","intensity":0.8},{"muscle":"front_delts","intensity":0.5},{"muscle":"obliques","intensity":0.4}]'),
('Bulgarian Push-ups', 'push', 'reps', '[{"muscle":"chest","intensity":0.8},{"muscle":"front_delts","intensity":0.7},{"muscle":"triceps","intensity":0.5},{"muscle":"lower_back","intensity":0.3}]'),
('Pike Push-ups', 'push', 'reps', '[{"muscle":"front_delts","intensity":0.8},{"muscle":"side_delts","intensity":0.5},{"muscle":"triceps","intensity":0.6},{"muscle":"upper_back","intensity":0.3}]'),
('Dips', 'push', 'reps', '[{"muscle":"triceps","intensity":0.8},{"muscle":"chest","intensity":0.6},{"muscle":"front_delts","intensity":0.5}]'),
('Ring Dips', 'push', 'reps', '[{"muscle":"triceps","intensity":0.9},{"muscle":"chest","intensity":0.8},{"muscle":"front_delts","intensity":0.5}]'),
('Weighted Dips', 'push', 'reps', '[{"muscle":"triceps","intensity":0.9},{"muscle":"chest","intensity":0.7},{"muscle":"front_delts","intensity":0.5}]'),
('Bulgarian Dips', 'push', 'reps', '[{"muscle":"triceps","intensity":0.8},{"muscle":"chest","intensity":0.7},{"muscle":"front_delts","intensity":0.5}]'),
('Handstand Push-ups', 'push', 'reps', '[{"muscle":"front_delts","intensity":0.9},{"muscle":"side_delts","intensity":0.7},{"muscle":"triceps","intensity":0.7},{"muscle":"upper_back","intensity":0.4}]'),
('Handstand Hold', 'push', 'seconds', '[{"muscle":"front_delts","intensity":0.7},{"muscle":"side_delts","intensity":0.6},{"muscle":"triceps","intensity":0.4},{"muscle":"abs","intensity":0.4},{"muscle":"upper_back","intensity":0.5}]'),
('Support Hold', 'push', 'seconds', '[{"muscle":"triceps","intensity":0.4},{"muscle":"front_delts","intensity":0.4},{"muscle":"chest","intensity":0.2}]'),
('RTO Ring Support Hold', 'push', 'seconds', '[{"muscle":"chest","intensity":0.7},{"muscle":"front_delts","intensity":0.5},{"muscle":"triceps","intensity":0.4},{"muscle":"side_delts","intensity":0.4}]'),

-- ── PULL ─────────────────────────────────────────────────────
('Pull-ups', 'pull', 'reps', '[{"muscle":"lats","intensity":0.9},{"muscle":"biceps","intensity":0.7},{"muscle":"upper_back","intensity":0.6},{"muscle":"rear_delts","intensity":0.4}]'),
('Chin-ups', 'pull', 'reps', '[{"muscle":"biceps","intensity":0.9},{"muscle":"lats","intensity":0.8},{"muscle":"upper_back","intensity":0.5},{"muscle":"rear_delts","intensity":0.3}]'),
('Archer Pull-ups', 'pull', 'reps', '[{"muscle":"lats","intensity":1.0},{"muscle":"biceps","intensity":0.8},{"muscle":"upper_back","intensity":0.7},{"muscle":"rear_delts","intensity":0.4}]'),
('One Arm Pull-ups', 'pull', 'reps', '[{"muscle":"lats","intensity":1.0},{"muscle":"biceps","intensity":1.0},{"muscle":"upper_back","intensity":0.7},{"muscle":"rear_delts","intensity":0.5}]'),
('Explosive Pull-ups', 'pull', 'reps', '[{"muscle":"lats","intensity":0.9},{"muscle":"biceps","intensity":0.8},{"muscle":"upper_back","intensity":0.6},{"muscle":"rear_delts","intensity":0.4}]'),
('Row', 'pull', 'reps', '[{"muscle":"upper_back","intensity":0.9},{"muscle":"rear_delts","intensity":0.7},{"muscle":"lats","intensity":0.6},{"muscle":"biceps","intensity":0.5}]'),
('Passive Hang', 'pull', 'seconds', '[{"muscle":"lats","intensity":0.3},{"muscle":"forearms","intensity":0.6},{"muscle":"upper_back","intensity":0.3},{"muscle":"biceps","intensity":0.2}]'),
('Skin The Cat', 'pull', 'reps', '[{"muscle":"lats","intensity":0.8},{"muscle":"upper_back","intensity":0.7},{"muscle":"biceps","intensity":0.5},{"muscle":"lower_back","intensity":0.3},{"muscle":"abs","intensity":0.4}]'),
('Bar Muscle-ups', 'pull', 'reps', '[{"muscle":"lats","intensity":0.8},{"muscle":"biceps","intensity":0.7},{"muscle":"triceps","intensity":0.7},{"muscle":"chest","intensity":0.5},{"muscle":"upper_back","intensity":0.6}]'),
('Ring Muscle-ups', 'pull', 'reps', '[{"muscle":"lats","intensity":0.8},{"muscle":"biceps","intensity":0.7},{"muscle":"triceps","intensity":0.8},{"muscle":"chest","intensity":0.6},{"muscle":"upper_back","intensity":0.6}]'),
('Front Lever Hold', 'pull', 'seconds', '[{"muscle":"lats","intensity":1.0},{"muscle":"upper_back","intensity":0.8},{"muscle":"abs","intensity":0.7},{"muscle":"biceps","intensity":0.5},{"muscle":"lower_back","intensity":0.4}]'),
('Back Lever Hold', 'pull', 'seconds', '[{"muscle":"upper_back","intensity":0.8},{"muscle":"lats","intensity":0.6},{"muscle":"biceps","intensity":0.5},{"muscle":"lower_back","intensity":0.5},{"muscle":"chest","intensity":0.4}]'),

-- ── CORE ─────────────────────────────────────────────────────
('Hollow Body Hold', 'core', 'seconds', '[{"muscle":"abs","intensity":0.9},{"muscle":"obliques","intensity":0.4},{"muscle":"quads","intensity":0.3},{"muscle":"lower_back","intensity":0.2}]'),
('Toes To Bar', 'core', 'reps', '[{"muscle":"abs","intensity":0.9},{"muscle":"obliques","intensity":0.5},{"muscle":"lats","intensity":0.4}]'),
('L-Sit Hold', 'core', 'seconds', '[{"muscle":"abs","intensity":0.9},{"muscle":"quads","intensity":0.6},{"muscle":"triceps","intensity":0.4},{"muscle":"forearms","intensity":0.4}]'),
('V-Sit Hold', 'core', 'seconds', '[{"muscle":"abs","intensity":1.0},{"muscle":"quads","intensity":0.7},{"muscle":"lower_back","intensity":0.4},{"muscle":"obliques","intensity":0.3}]'),
('Dragon Flag', 'core', 'reps', '[{"muscle":"abs","intensity":1.0},{"muscle":"obliques","intensity":0.6},{"muscle":"lower_back","intensity":0.4},{"muscle":"lats","intensity":0.3}]'),
('Human Flag Hold', 'core', 'seconds', '[{"muscle":"obliques","intensity":1.0},{"muscle":"lats","intensity":0.9},{"muscle":"abs","intensity":0.7},{"muscle":"side_delts","intensity":0.6}]'),
('Crow Pose Hold', 'core', 'seconds', '[{"muscle":"abs","intensity":0.5},{"muscle":"triceps","intensity":0.4},{"muscle":"front_delts","intensity":0.3},{"muscle":"forearms","intensity":0.4}]'),
('Bridge Hold', 'core', 'seconds', '[{"muscle":"lower_back","intensity":0.7},{"muscle":"glutes","intensity":0.7},{"muscle":"hamstrings","intensity":0.5},{"muscle":"chest","intensity":0.2}]'),

-- ── LEGS ─────────────────────────────────────────────────────
('Squats', 'legs', 'reps', '[{"muscle":"quads","intensity":0.8},{"muscle":"glutes","intensity":0.7},{"muscle":"hamstrings","intensity":0.4},{"muscle":"calves","intensity":0.3},{"muscle":"abs","intensity":0.2}]'),
('Pistol Squats', 'legs', 'reps', '[{"muscle":"quads","intensity":1.0},{"muscle":"glutes","intensity":0.8},{"muscle":"hamstrings","intensity":0.5},{"muscle":"calves","intensity":0.4},{"muscle":"abs","intensity":0.3}]'),
('Dragon Squats', 'legs', 'reps', '[{"muscle":"quads","intensity":0.9},{"muscle":"glutes","intensity":0.6},{"muscle":"hamstrings","intensity":0.5},{"muscle":"calves","intensity":0.3}]'),
('Reverse Nordic', 'legs', 'reps', '[{"muscle":"quads","intensity":1.0},{"muscle":"calves","intensity":0.3}]'),
('Lunges', 'legs', 'reps', '[{"muscle":"quads","intensity":0.8},{"muscle":"glutes","intensity":0.7},{"muscle":"hamstrings","intensity":0.5},{"muscle":"calves","intensity":0.3}]'),
('Calf Raises', 'legs', 'reps', '[{"muscle":"calves","intensity":0.9}]'),
('Glute Bridges', 'legs', 'reps', '[{"muscle":"glutes","intensity":0.9},{"muscle":"hamstrings","intensity":0.5},{"muscle":"lower_back","intensity":0.3}]'),
('Nordic Curl', 'legs', 'reps', '[{"muscle":"hamstrings","intensity":1.0},{"muscle":"glutes","intensity":0.4},{"muscle":"calves","intensity":0.3}]'),
('Wall Sit', 'legs', 'seconds', '[{"muscle":"quads","intensity":0.9},{"muscle":"glutes","intensity":0.5},{"muscle":"calves","intensity":0.3}]')

ON CONFLICT (name) DO UPDATE SET
  category = EXCLUDED.category,
  unit     = EXCLUDED.unit,
  muscles  = EXCLUDED.muscles;
