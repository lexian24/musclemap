import type { MuscleGroup, WeeklyVolumeTarget } from '@/types'

// Fatigue decay rate: fraction of fatigue lost per hour of rest.
// The base rate applies to an "average" muscle; MUSCLE_RECOVERY_MULTIPLIERS
// scale this per-muscle so each group recovers at its own pace.
export const FATIGUE_DECAY_PER_HOUR = 0.05

// Volume normalisation: a 3×10 set equals 1.0 volume unit.
export const VOLUME_NORMALISER = 30 // sets * reps / VOLUME_NORMALISER

// Fatigue scale for the intensity-zone path (userMax present).
// Calibrated so that 15 moderate-effort sets of a primary muscle (intensity 0.8,
// effortRatio ≈ 0.67) accumulates exactly 1.0 fatigue (fully destroyed).
// Adjust this constant to make the whole model more or less aggressive.
export const SET_FATIGUE_SCALE = 8

// How far back to fetch sets when recalculating fatigue from history.
// Longest recovery time is 80h (lower_back/hamstrings); 96h adds a safe margin
// so no lingering fatigue is silently dropped.
export const FATIGUE_LOOKBACK_HOURS = 96

// Fatigue color thresholds (fatigue value → hex color)
export const FATIGUE_COLOR_STOPS: Array<{ at: number; color: string }> = [
  { at: 0.0, color: '#FFFFFF' },
  { at: 0.25, color: '#FFD6D6' },
  { at: 0.5, color: '#FF8080' },
  { at: 0.75, color: '#FF2020' },
  { at: 1.0, color: '#8B0000' },
]

/**
 * Per-muscle fatigue decay multipliers relative to FATIGUE_DECAY_PER_HOUR.
 * Multiplier = 20 / recoveryHours, so larger/damage-prone muscles recover slower.
 *
 * Science basis: RP (Israetel), Schoenfeld meta-analyses, Henselmans recovery research.
 * Adjusted ~10-15% faster than barbell baselines for calisthenics (lower mechanical damage).
 *
 * Recovery tiers:
 *   72h muscles (quads, hamstrings, glutes, lower_back): multiplier ≈ 0.28
 *   60h muscles (chest, upper_back, lats):               multiplier ≈ 0.33
 *   48h muscles (biceps, triceps):                       multiplier ≈ 0.42
 *   36h muscles (delts, calves):                         multiplier ≈ 0.56
 *   24h muscles (abs, obliques, forearms):               multiplier ≈ 0.83
 */
export const MUSCLE_RECOVERY_MULTIPLIERS: Record<MuscleGroup, number> = {
  chest: 0.33,        // 60h — large pec major, moderate eccentric damage
  front_delts: 0.50,  // 40h — upper compound but small muscle
  side_delts: 0.67,   // 30h — isolation, small muscle
  rear_delts: 0.50,   // 40h — upper compound, moderate size
  biceps: 0.42,       // 48h — moderate; eccentrics from pulling cause DOMS
  triceps: 0.42,      // 48h — moderate; heavy pressing involvement
  forearms: 0.83,     // 24h — slow-twitch dominant, high endurance capacity
  upper_back: 0.33,   // 60h — traps/rhomboids, dense muscle
  lats: 0.33,         // 60h — large pulling muscle, 48-72h in literature
  lower_back: 0.25,   // 80h — spinal erectors, highest fatigue sensitivity, injury risk
  abs: 0.83,          // 24h — evolved for endurance, slow-twitch dominant
  obliques: 0.83,     // 24h — same as abs
  glutes: 0.28,       // 72h — largest muscle, powerful contractions
  quads: 0.28,        // 72h — massive volume, high load even bodyweight
  hamstrings: 0.25,   // 80h — highest eccentric damage, slowest recovery
  calves: 0.56,       // 36h — soleus is very slow-twitch; recovers faster than size suggests
}

/**
 * Intensity zones based on effort ratio (reps / userMax).
 * Maps to approximate % 1RM effort for calisthenics.
 * Higher intensity → more fatigue per set (exponential cost near failure).
 *
 * fatigueMultiplier: scales the per-set fatigue delta.
 *   Light sets (easy, far from failure) cost ~0.7× baseline.
 *   Max effort (near failure) costs ~2.2× baseline.
 *
 * recoveryBoost: additional multiplier applied to the muscle's
 *   base decay rate when this zone is used. 1.0 = no change.
 *   Heavier training slows recovery (muscles stay fatigued longer).
 */
export const INTENSITY_ZONES = [
  { label: 'Very Light', minEffort: 0,    maxEffort: 0.50, fatigueMultiplier: 0.7,  recoveryBoost: 1.3  },
  { label: 'Light',      minEffort: 0.50, maxEffort: 0.65, fatigueMultiplier: 0.85, recoveryBoost: 1.15 },
  { label: 'Moderate',   minEffort: 0.65, maxEffort: 0.75, fatigueMultiplier: 1.0,  recoveryBoost: 1.0  },
  { label: 'Heavy',      minEffort: 0.75, maxEffort: 0.85, fatigueMultiplier: 1.4,  recoveryBoost: 0.85 },
  { label: 'Very Heavy', minEffort: 0.85, maxEffort: 0.92, fatigueMultiplier: 1.8,  recoveryBoost: 0.75 },
  { label: 'Max Effort', minEffort: 0.92, maxEffort: 1.01, fatigueMultiplier: 2.2,  recoveryBoost: 0.65 },
] as const

export type IntensityZone = typeof INTENSITY_ZONES[number]

/**
 * Session SFR (Stimulus-to-Fatigue Ratio) diminishing returns.
 * After the 4th set of the same muscle in one session, fatigue cost rises.
 * setNumber is 1-indexed (1 = first set for that muscle this session).
 */
export const SESSION_SFR_MULTIPLIERS: Record<number, number> = {
  1: 1.0,
  2: 1.0,
  3: 1.0,
  4: 1.0,
  5: 1.3,
  6: 1.3,
} // For 7+ sets, use 1.6 (see getSessionSfrMultiplier helper)

/**
 * Evidence-based weekly volume targets per muscle group (direct sets per week).
 * Based on RP MEV/MAV/MRV framework (Israetel et al.) and Schoenfeld/Krieger meta-analyses.
 * Slightly conservative for calisthenics: compound movements count toward multiple muscles.
 *
 * minSets:     MEV — minimum to maintain/make progress
 * optimalSets: MAV — sweet spot for hypertrophy
 * maxSets:     MRV — ceiling; above this, recovery is compromised
 */
export const WEEKLY_VOLUME_TARGETS: Record<MuscleGroup, WeeklyVolumeTarget> = {
  chest:       { minSets: 8,  optimalSets: 16, maxSets: 22 },
  front_delts: { minSets: 6,  optimalSets: 12, maxSets: 16 }, // Often hit via pressing
  side_delts:  { minSets: 8,  optimalSets: 16, maxSets: 22 },
  rear_delts:  { minSets: 6,  optimalSets: 16, maxSets: 20 },
  biceps:      { minSets: 8,  optimalSets: 14, maxSets: 20 },
  triceps:     { minSets: 6,  optimalSets: 14, maxSets: 20 }, // Heavy indirect from pressing
  forearms:    { minSets: 4,  optimalSets: 12, maxSets: 20 }, // High MRV, slow-twitch tolerant
  upper_back:  { minSets: 8,  optimalSets: 16, maxSets: 22 },
  lats:        { minSets: 8,  optimalSets: 16, maxSets: 25 }, // High MRV in RP literature
  lower_back:  { minSets: 4,  optimalSets: 8,  maxSets: 12 }, // Low MRV; injury risk
  abs:         { minSets: 8,  optimalSets: 16, maxSets: 25 }, // High frequency tolerance
  obliques:    { minSets: 6,  optimalSets: 12, maxSets: 20 },
  glutes:      { minSets: 8,  optimalSets: 16, maxSets: 25 },
  quads:       { minSets: 8,  optimalSets: 16, maxSets: 22 },
  hamstrings:  { minSets: 6,  optimalSets: 12, maxSets: 20 }, // Damage-prone, lower MRV
  calves:      { minSets: 8,  optimalSets: 16, maxSets: 30 }, // Very high MRV; fatigue-resistant
}
