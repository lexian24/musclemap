import { createClient } from '@/lib/supabase/server'
import { decayFatigue, emptyFatigueState, recalculateFatigue } from '@/lib/fatigue'
import { getRecentSets } from '@/lib/db/sessions'
import { getUserMaxes } from '@/lib/db/userMaxes'
import { ALL_MUSCLE_GROUPS } from '@/types'
import type { DbMuscleFatigueCache, FatigueState, MuscleGroup } from '@/types'

/**
 * Reads the cached fatigue state for a user and applies passive decay from
 * the cache's last_updated timestamp to now. This ensures the body diagram
 * reflects real-time recovery even when the user hasn't logged any new sets.
 */
export async function getFatigueState(userId: string): Promise<FatigueState> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('muscle_fatigue_cache')
    .select('muscle_group, fatigue_value, last_updated')
    .eq('user_id', userId)

  if (error) throw new Error(`Failed to fetch fatigue state: ${error.message}`)

  const state = emptyFatigueState()
  let lastUpdated: Date | null = null

  for (const row of (data as Pick<DbMuscleFatigueCache, 'muscle_group' | 'fatigue_value' | 'last_updated'>[]) ?? []) {
    if ((ALL_MUSCLE_GROUPS as string[]).includes(row.muscle_group)) {
      state[row.muscle_group as MuscleGroup] = row.fatigue_value
      const ts = new Date(row.last_updated)
      if (!lastUpdated || ts > lastUpdated) lastUpdated = ts
    }
  }

  // Apply time-based decay from when the cache was last written to now so the
  // user sees muscles recovering in real time without needing to log a new set.
  if (lastUpdated) {
    return decayFatigue(state, Date.now() - lastUpdated.getTime())
  }

  return state
}

/**
 * Computes the current fatigue state fresh from the past FATIGUE_LOOKBACK_HOURS of
 * session history, applying stored userMaxes to every set. This is the authoritative
 * source of truth and bypasses the cache entirely, so stale cached values from old
 * formula runs can never cause inflated fatigue on page load.
 *
 * Used by the dashboard page on every load. The API routes (log/delete) use the same
 * logic inline and update the cache for their own response payloads.
 */
export async function computeFatigueFromHistory(userId: string): Promise<FatigueState> {
  const [recentSets, storedMaxes] = await Promise.all([
    getRecentSets(userId),
    getUserMaxes(userId),
  ])
  const maxByExercise = new Map(storedMaxes.map((m) => [m.exerciseId, m.maxValue]))

  return recalculateFatigue(
    recentSets.map((s) => ({
      muscles: s.muscles,
      sets: s.sets,
      reps: s.reps,
      loggedAt: new Date(s.loggedAt),
      userMax: maxByExercise.get(s.exerciseId),
    })),
  )
}

/** Upserts the full fatigue state for a user into the cache table. */
export async function updateFatigueCache(
  userId: string,
  fatigueState: FatigueState,
): Promise<void> {
  const supabase = await createClient()

  const rows = Object.entries(fatigueState).map(([muscle_group, fatigue_value]) => ({
    user_id: userId,
    muscle_group,
    fatigue_value,
    last_updated: new Date().toISOString(),
  }))

  const { error } = await supabase
    .from('muscle_fatigue_cache')
    .upsert(rows, { onConflict: 'user_id,muscle_group' })

  if (error) throw new Error(`Failed to update fatigue cache: ${error.message}`)
}
