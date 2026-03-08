-- ============================================================
-- seed.sql
-- 15 calisthenics exercises with muscle activation data
-- ============================================================

INSERT INTO exercises (name, muscles) VALUES

-- Push-ups: primary chest, significant triceps and front delts
('Push-ups', '[
  {"muscle": "chest",       "intensity": 0.8},
  {"muscle": "triceps",     "intensity": 0.6},
  {"muscle": "front_delts", "intensity": 0.5},
  {"muscle": "abs",         "intensity": 0.2}
]'),

-- Pull-ups: primary lats and biceps, significant upper back
('Pull-ups', '[
  {"muscle": "lats",        "intensity": 0.9},
  {"muscle": "biceps",      "intensity": 0.7},
  {"muscle": "upper_back",  "intensity": 0.6},
  {"muscle": "rear_delts",  "intensity": 0.4}
]'),

-- Dips: triceps and chest, anterior delts secondary
('Dips', '[
  {"muscle": "triceps",     "intensity": 0.8},
  {"muscle": "chest",       "intensity": 0.6},
  {"muscle": "front_delts", "intensity": 0.5}
]'),

-- Pike push-ups: overhead pressing pattern — front delts primary
('Pike Push-ups', '[
  {"muscle": "front_delts", "intensity": 0.8},
  {"muscle": "triceps",     "intensity": 0.6},
  {"muscle": "upper_back",  "intensity": 0.3},
  {"muscle": "chest",       "intensity": 0.2}
]'),

-- Diamond push-ups: triceps emphasis, chest secondary
('Diamond Push-ups', '[
  {"muscle": "triceps",     "intensity": 0.9},
  {"muscle": "chest",       "intensity": 0.5},
  {"muscle": "front_delts", "intensity": 0.4}
]'),

-- Australian rows: horizontal pull — upper back and rear delts
('Australian Rows', '[
  {"muscle": "upper_back",  "intensity": 0.7},
  {"muscle": "rear_delts",  "intensity": 0.6},
  {"muscle": "lats",        "intensity": 0.4},
  {"muscle": "biceps",      "intensity": 0.5}
]'),

-- Decline push-ups: shifts load to upper chest and front delts
('Decline Push-ups', '[
  {"muscle": "front_delts", "intensity": 0.7},
  {"muscle": "chest",       "intensity": 0.6},
  {"muscle": "triceps",     "intensity": 0.5},
  {"muscle": "abs",         "intensity": 0.2}
]'),

-- Archer push-ups: extreme unilateral chest and triceps load
('Archer Push-ups', '[
  {"muscle": "chest",       "intensity": 0.9},
  {"muscle": "triceps",     "intensity": 0.5},
  {"muscle": "front_delts", "intensity": 0.4},
  {"muscle": "biceps",      "intensity": 0.3}
]'),

-- Muscle-ups: compound pull + push — lats, triceps, chest
('Muscle-ups', '[
  {"muscle": "lats",        "intensity": 0.8},
  {"muscle": "triceps",     "intensity": 0.7},
  {"muscle": "biceps",      "intensity": 0.6},
  {"muscle": "chest",       "intensity": 0.5},
  {"muscle": "upper_back",  "intensity": 0.5},
  {"muscle": "front_delts", "intensity": 0.4}
]'),

-- Squats: quads primary, glutes secondary
('Squats', '[
  {"muscle": "quads",       "intensity": 0.8},
  {"muscle": "glutes",      "intensity": 0.7},
  {"muscle": "hamstrings",  "intensity": 0.4},
  {"muscle": "abs",         "intensity": 0.2}
]'),

-- Lunges: unilateral leg work — quads and glutes
('Lunges', '[
  {"muscle": "quads",       "intensity": 0.7},
  {"muscle": "glutes",      "intensity": 0.6},
  {"muscle": "hamstrings",  "intensity": 0.5},
  {"muscle": "calves",      "intensity": 0.3}
]'),

-- Pistol squats: demanding single-leg — high quad and glute intensity
('Pistol Squats', '[
  {"muscle": "quads",       "intensity": 0.9},
  {"muscle": "glutes",      "intensity": 0.7},
  {"muscle": "hamstrings",  "intensity": 0.5},
  {"muscle": "calves",      "intensity": 0.4},
  {"muscle": "abs",         "intensity": 0.3}
]'),

-- Calf raises: isolated gastrocnemius and soleus
('Calf Raises', '[
  {"muscle": "calves",      "intensity": 0.9}
]'),

-- Glute bridges: posterior chain — glutes primary, hamstrings secondary
('Glute Bridges', '[
  {"muscle": "glutes",      "intensity": 0.9},
  {"muscle": "hamstrings",  "intensity": 0.5},
  {"muscle": "lower_back",  "intensity": 0.3}
]'),

-- Hollow body hold: isometric core — abs and obliques
('Hollow Body Hold', '[
  {"muscle": "abs",         "intensity": 0.9},
  {"muscle": "obliques",    "intensity": 0.5},
  {"muscle": "quads",       "intensity": 0.3},
  {"muscle": "lower_back",  "intensity": 0.2}
]');
