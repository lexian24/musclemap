import { createClient } from '@/lib/supabase/server'
import { emptyFatigueState } from '@/lib/fatigue'
import { ALL_MUSCLE_GROUPS } from '@/types'
import type { DbMuscleFatigueCache, FatigueState, MuscleGroup } from '@/types'

/** Reads the cached fatigue state for a user from the database. */
export async function getFatigueState(userId: string): Promise<FatigueState> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('muscle_fatigue_cache')
    .select('muscle_group, fatigue_value')
    .eq('user_id', userId)

  if (error) throw new Error(`Failed to fetch fatigue state: ${error.message}`)

  const state = emptyFatigueState()

  for (const row of (data as Pick<DbMuscleFatigueCache, 'muscle_group' | 'fatigue_value'>[]) ??
    []) {
    if ((ALL_MUSCLE_GROUPS as string[]).includes(row.muscle_group)) {
      state[row.muscle_group as MuscleGroup] = row.fatigue_value
    }
  }

  return state
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
