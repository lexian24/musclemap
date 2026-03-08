import {
  FATIGUE_COLOR_STOPS,
  FATIGUE_DECAY_PER_HOUR,
  MUSCLE_RECOVERY_MULTIPLIERS,
  VOLUME_NORMALISER,
} from '@/lib/constants'
import { ALL_MUSCLE_GROUPS } from '@/types'
import type { FatigueState, MuscleActivation, MuscleGroup } from '@/types'

/** Returns a zeroed FatigueState (all muscles fully recovered). */
export function emptyFatigueState(): FatigueState {
  return Object.fromEntries(
    ALL_MUSCLE_GROUPS.map((m) => [m, 0]),
  ) as FatigueState
}

/**
 * Applies fatigue from one logged set to the current fatigue state.
 *
 * @param current  Current fatigue state
 * @param muscles  Muscles activated by the exercise, with intensity 0–1
 * @param sets     Number of sets performed
 * @param reps     Reps per set
 */
export function applySetFatigue(
  current: FatigueState,
  muscles: MuscleActivation[],
  sets: number,
  reps: number,
): FatigueState {
  const volume = (sets * reps) / VOLUME_NORMALISER
  const next = { ...current }

  for (const { muscle, intensity } of muscles) {
    const delta = intensity * volume
    next[muscle] = Math.min(1, next[muscle] + delta)
  }

  return next
}

/**
 * Decays fatigue for all muscles based on elapsed time.
 *
 * @param state       Current fatigue state
 * @param elapsedMs   Milliseconds since the fatigue was last calculated
 */
export function decayFatigue(state: FatigueState, elapsedMs: number): FatigueState {
  const elapsedHours = elapsedMs / 3_600_000
  const next = { ...state }

  for (const muscle of ALL_MUSCLE_GROUPS) {
    const decayRate = FATIGUE_DECAY_PER_HOUR * MUSCLE_RECOVERY_MULTIPLIERS[muscle]
    const decayed = next[muscle] - decayRate * elapsedHours
    next[muscle] = Math.max(0, decayed)
  }

  return next
}

/**
 * Recalculates fatigue fresh from a list of logged sets, each with a timestamp.
 * Used on page load to avoid stale cached values.
 */
export function recalculateFatigue(
  sets: Array<{
    muscles: MuscleActivation[]
    sets: number
    reps: number
    loggedAt: Date
  }>,
  now: Date = new Date(),
): FatigueState {
  // Sort oldest first
  const sorted = [...sets].sort((a, b) => a.loggedAt.getTime() - b.loggedAt.getTime())

  let state = emptyFatigueState()

  for (const entry of sorted) {
    const elapsedMs = now.getTime() - entry.loggedAt.getTime()
    // Apply fatigue then immediately decay by elapsed time
    state = applySetFatigue(state, entry.muscles, entry.sets, entry.reps)
    state = decayFatigue(state, elapsedMs)
  }

  return state
}

/**
 * Converts a fatigue value (0–1) to a hex color by interpolating
 * between the defined color stops in constants.ts.
 */
export function fatigueToColor(fatigue: number): string {
  const clamped = Math.max(0, Math.min(1, fatigue))
  const stops = FATIGUE_COLOR_STOPS

  for (let i = 1; i < stops.length; i++) {
    if (clamped <= stops[i].at) {
      const prev = stops[i - 1]
      const next = stops[i]
      const t = (clamped - prev.at) / (next.at - prev.at)
      return interpolateHex(prev.color, next.color, t)
    }
  }

  return stops[stops.length - 1].color
}

function interpolateHex(a: string, b: string, t: number): string {
  const ar = parseInt(a.slice(1, 3), 16)
  const ag = parseInt(a.slice(3, 5), 16)
  const ab = parseInt(a.slice(5, 7), 16)
  const br = parseInt(b.slice(1, 3), 16)
  const bg = parseInt(b.slice(3, 5), 16)
  const bb = parseInt(b.slice(5, 7), 16)

  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const blue = Math.round(ab + (bb - ab) * t)

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`
}

/** Rounds a fatigue value to 2 decimal places for display. */
export function formatFatigue(fatigue: number): number {
  return Math.round(fatigue * 100) / 100
}

/** Returns a human-readable label for a muscle group. */
export function muscleLabel(muscle: MuscleGroup): string {
  return muscle
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ')
}
