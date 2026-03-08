import { createClient } from '@/lib/supabase/server'
import { recalculateFatigue } from '@/lib/fatigue'
import { getAllExercises } from '@/lib/db/exercises'
import { getRecentSets } from '@/lib/db/sessions'
import type { FatigueState } from '@/types'

/**
 * Builds the current fatigue state for the authenticated user by fetching
 * recent sets and recalculating decay from logged timestamps.
 * Fatigue is never cached — always fresh on load.
 */
export async function getCurrentFatigue(): Promise<FatigueState> {
  const [recentSets, exercises] = await Promise.all([
    getRecentSets(72), // only last 72h matter given decay rate
    getAllExercises(),
  ])

  const exerciseMap = new Map(exercises.map((e) => [e.id, e]))

  const inputs = recentSets.flatMap((set) => {
    const exercise = exerciseMap.get(set.exerciseId)
    if (!exercise) return []
    return [
      {
        muscles: exercise.muscles,
        sets: set.sets,
        reps: set.reps,
        loggedAt: new Date(set.loggedAt),
      },
    ]
  })

  return recalculateFatigue(inputs)
}

/**
 * Persists a fatigue snapshot to Supabase.
 * Called after each set is logged so realtime subscribers receive updates.
 */
export async function saveFatigueSnapshot(state: FatigueState): Promise<void> {
  const supabase = await createClient()

  const rows = Object.entries(state).map(([muscle, fatigue]) => ({
    muscle,
    fatigue,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase
    .from('fatigue_snapshots')
    .upsert(rows, { onConflict: 'user_id,muscle' })

  if (error) throw new Error(`Failed to save fatigue snapshot: ${error.message}`)
}
