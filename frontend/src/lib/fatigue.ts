import {
  FATIGUE_COLOR_STOPS,
  FATIGUE_DECAY_PER_HOUR,
  INTENSITY_ZONES,
  MUSCLE_RECOVERY_MULTIPLIERS,
  SESSION_SFR_MULTIPLIERS,
  SET_FATIGUE_SCALE,
  VOLUME_NORMALISER,
} from '@/lib/constants'
import type { IntensityZone } from '@/lib/constants'
import { ALL_MUSCLE_GROUPS } from '@/types'
import type { FatigueState, MuscleActivation, MuscleGroup } from '@/types'

/**
 * Returns the intensity zone for a given effort ratio (reps / userMax).
 * If effortRatio is out of all zone ranges, falls back to the Moderate zone.
 */
export function getIntensityZone(effortRatio: number): IntensityZone {
  const clamped = Math.max(0, effortRatio)
  for (const zone of INTENSITY_ZONES) {
    if (clamped >= zone.minEffort && clamped < zone.maxEffort) {
      return zone
    }
  }
  // Fallback: Moderate zone (index 2)
  return INTENSITY_ZONES[2]
}

/**
 * Returns the session SFR multiplier for the Nth set of a muscle this session.
 * setNumber is 1-indexed. Returns 1.6 for 7+ sets (diminishing returns plateau).
 */
export function getSessionSfrMultiplier(setNumber: number): number {
  return SESSION_SFR_MULTIPLIERS[setNumber] ?? 1.6
}

/** Returns a zeroed FatigueState (all muscles fully recovered). */
export function emptyFatigueState(): FatigueState {
  return Object.fromEntries(
    ALL_MUSCLE_GROUPS.map((m) => [m, 0]),
  ) as FatigueState
}

/**
 * Applies fatigue from one logged set to the current fatigue state.
 *
 * @param current           Current fatigue state
 * @param muscles           Muscles activated by the exercise, with intensity 0–1
 * @param sets              Number of sets performed
 * @param reps              Reps per set
 * @param userMax           Optional personal max reps — if provided, enables the
 *                          intensity-zone and SFR path; otherwise falls back to
 *                          (sets * reps) / VOLUME_NORMALISER (backward-compat)
 * @param sessionSetCounts  How many sets of each muscle have already been logged
 *                          this session, used to apply SFR diminishing returns
 */
export function applySetFatigue(
  current: FatigueState,
  muscles: MuscleActivation[],
  sets: number,
  reps: number,
  userMax?: number,
  sessionSetCounts?: Partial<Record<MuscleGroup, number>>,
): FatigueState {
  const next = { ...current }

  if (userMax !== undefined && userMax > 0) {
    // New path: intensity-zone + per-set SFR multiplier + global scale
    const effortRatio = Math.min(1, reps / userMax)
    const zone = getIntensityZone(effortRatio)

    for (const { muscle, intensity } of muscles) {
      // Sum the SFR multiplier for each individual set so that sets 5, 6, 7+
      // each get their own (increasing) penalty rather than the whole entry
      // being pegged to the first set's multiplier.
      const startSetNumber = sessionSetCounts?.[muscle] ?? 0
      let sfrSum = 0
      for (let s = 1; s <= sets; s++) {
        sfrSum += getSessionSfrMultiplier(startSetNumber + s)
      }
      // Divide by SET_FATIGUE_SCALE so that ~15 moderate sets of a primary
      // muscle (intensity 0.8, effortRatio 0.67) equals 1.0 fatigue.
      const volume = (effortRatio * zone.fatigueMultiplier * sfrSum) / SET_FATIGUE_SCALE
      const delta = intensity * volume
      next[muscle] = Math.min(1, next[muscle] + delta)
    }
  } else {
    // Old path: no userMax — use original VOLUME_NORMALISER formula
    const volume = (sets * reps) / VOLUME_NORMALISER
    for (const { muscle, intensity } of muscles) {
      const delta = intensity * volume
      next[muscle] = Math.min(1, next[muscle] + delta)
    }
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
 * Uses forward-simulation: apply each set's fatigue, then decay only the time
 * between consecutive sets (not all the way to now), preventing double-decay of
 * older sets when multiple sets are logged.
 *
 * Session set counts are tracked per UTC calendar day so SFR diminishing returns
 * are correctly applied within each day and reset across days.
 *
 * Used on page load to avoid stale cached values.
 */
export function recalculateFatigue(
  sets: Array<{
    muscles: MuscleActivation[]
    sets: number
    reps: number
    loggedAt: Date
    userMax?: number
  }>,
  now: Date = new Date(),
): FatigueState {
  if (sets.length === 0) return emptyFatigueState()

  // Sort oldest first
  const sorted = [...sets].sort((a, b) => a.loggedAt.getTime() - b.loggedAt.getTime())

  let state = emptyFatigueState()
  let currentDay = ''
  let sessionSetCounts: Partial<Record<MuscleGroup, number>> = {}

  for (let i = 0; i < sorted.length; i++) {
    const entry = sorted[i]
    const entryDay = entry.loggedAt.toISOString().slice(0, 10)

    // Reset session set counts when we move to a new UTC calendar day
    if (entryDay !== currentDay) {
      currentDay = entryDay
      sessionSetCounts = {}
    }

    // Apply this set's fatigue contribution (with session SFR tracking)
    state = applySetFatigue(
      state,
      entry.muscles,
      entry.sets,
      entry.reps,
      entry.userMax,
      sessionSetCounts,
    )

    // Increment session set counts for each activated muscle
    for (const { muscle } of entry.muscles) {
      sessionSetCounts[muscle] = (sessionSetCounts[muscle] ?? 0) + entry.sets
    }

    // Decay from this set to the next set (or to now for the last entry)
    const nextTime = i + 1 < sorted.length ? sorted[i + 1].loggedAt.getTime() : now.getTime()
    const decayMs = Math.max(0, nextTime - entry.loggedAt.getTime())
    state = decayFatigue(state, decayMs)
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
