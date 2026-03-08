import type { MuscleGroup } from '@/types'

// Fatigue decay rate: fraction of fatigue lost per hour of rest.
// A muscle at 1.0 fatigue takes 1 / FATIGUE_DECAY_PER_HOUR hours to fully recover.
export const FATIGUE_DECAY_PER_HOUR = 0.05

// Volume normalisation: a 3×10 set equals 1.0 volume unit.
export const VOLUME_NORMALISER = 30 // sets * reps / VOLUME_NORMALISER

// Fatigue color thresholds (fatigue value → hex color)
export const FATIGUE_COLOR_STOPS: Array<{ at: number; color: string }> = [
  { at: 0.0, color: '#FFFFFF' },
  { at: 0.25, color: '#FFD6D6' },
  { at: 0.5, color: '#FF8080' },
  { at: 0.75, color: '#FF2020' },
  { at: 1.0, color: '#8B0000' },
]

// Per-muscle recovery multipliers (1.0 = default rate).
// Larger muscles recover slightly slower; small muscles slightly faster.
export const MUSCLE_RECOVERY_MULTIPLIERS: Record<MuscleGroup, number> = {
  chest: 1.0,
  front_delts: 0.9,
  side_delts: 0.9,
  rear_delts: 0.9,
  biceps: 0.85,
  triceps: 0.85,
  forearms: 0.8,
  upper_back: 1.1,
  lats: 1.1,
  lower_back: 1.2,
  abs: 0.75,
  obliques: 0.75,
  glutes: 1.1,
  quads: 1.15,
  hamstrings: 1.15,
  calves: 0.7,
}
