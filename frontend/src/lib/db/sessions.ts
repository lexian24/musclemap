import { createClient } from '@/lib/supabase/server'
import type { DbWorkoutSet, WorkoutSet } from '@/types'

function toWorkoutSet(row: DbWorkoutSet): WorkoutSet {
  return {
    id: row.id,
    exerciseId: row.exercise_id,
    reps: row.reps,
    sets: row.sets,
    loggedAt: row.logged_at,
  }
}

/** Fetches all sets logged by the current user within the given time window. */
export async function getRecentSets(sinceHours = 72): Promise<WorkoutSet[]> {
  const supabase = await createClient()
  const since = new Date(Date.now() - sinceHours * 3_600_000).toISOString()

  const { data, error } = await supabase
    .from('workout_sets')
    .select('*')
    .gte('logged_at', since)
    .order('logged_at', { ascending: false })

  if (error) throw new Error(`Failed to fetch recent sets: ${error.message}`)
  return (data as DbWorkoutSet[]).map(toWorkoutSet)
}

/** Logs a new set for the authenticated user. */
export async function logSet(
  exerciseId: string,
  sets: number,
  reps: number,
): Promise<WorkoutSet> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('workout_sets')
    .insert({ exercise_id: exerciseId, sets, reps })
    .select()
    .single()

  if (error) throw new Error(`Failed to log set: ${error.message}`)
  return toWorkoutSet(data as DbWorkoutSet)
}

/** Deletes a logged set (users can correct mistakes). */
export async function deleteSet(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('workout_sets').delete().eq('id', id)
  if (error) throw new Error(`Failed to delete set: ${error.message}`)
}
