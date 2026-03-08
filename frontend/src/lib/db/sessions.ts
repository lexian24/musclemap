import { createClient } from '@/lib/supabase/server'
import type {
  DbWorkoutSession,
  DbLoggedSet,
  InsertedSet,
  LoggedSet,
  MuscleActivation,
  TodaySession,
} from '@/types'

function startOfTodayUTC(): string {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString()
}

function toTodaySession(row: DbWorkoutSession): TodaySession {
  return {
    id: row.id,
    userId: row.user_id,
    loggedAt: row.logged_at,
  }
}

function toInsertedSet(row: DbLoggedSet): InsertedSet {
  return {
    id: row.id,
    sessionId: row.session_id,
    exerciseId: row.exercise_id,
    sets: row.sets,
    reps: row.reps,
    loggedAt: row.logged_at,
  }
}

/** Gets today's workout session for the user, creating one if none exists. */
export async function getTodaySession(userId: string): Promise<TodaySession> {
  const supabase = await createClient()
  const todayStart = startOfTodayUTC()

  const { data: existing, error: fetchError } = await supabase
    .from('workout_sessions')
    .select('id, user_id, logged_at')
    .eq('user_id', userId)
    .gte('logged_at', todayStart)
    .maybeSingle()

  if (fetchError) throw new Error(`Failed to find session: ${fetchError.message}`)
  if (existing) return toTodaySession(existing as DbWorkoutSession)

  const { data: created, error: createError } = await supabase
    .from('workout_sessions')
    .insert({ user_id: userId })
    .select('id, user_id, logged_at')
    .single()

  if (createError) throw new Error(`Failed to create session: ${createError.message}`)
  return toTodaySession(created as DbWorkoutSession)
}

/** Inserts a logged set into the given session. */
export async function logSet(
  sessionId: string,
  exerciseId: string,
  sets: number,
  reps: number,
): Promise<InsertedSet> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('logged_sets')
    .insert({ session_id: sessionId, exercise_id: exerciseId, sets, reps })
    .select('id, session_id, exercise_id, sets, reps, logged_at')
    .single()

  if (error) throw new Error(`Failed to log set: ${error.message}`)
  return toInsertedSet(data as DbLoggedSet)
}

type LoggedSetRow = DbLoggedSet & {
  // Supabase returns joined rows as an array when using select() without generated types
  exercises: Array<{ name: string; muscles: MuscleActivation[] }>
}

/** Returns all sets logged today for the user, joined with exercise data. */
export async function getTodaySets(userId: string): Promise<LoggedSet[]> {
  const supabase = await createClient()
  const todayStart = startOfTodayUTC()

  // Find today's session without creating one
  const { data: session, error: sessionError } = await supabase
    .from('workout_sessions')
    .select('id')
    .eq('user_id', userId)
    .gte('logged_at', todayStart)
    .maybeSingle()

  if (sessionError) throw new Error(`Failed to find session: ${sessionError.message}`)
  if (!session) return []

  const { data, error } = await supabase
    .from('logged_sets')
    .select('id, session_id, exercise_id, sets, reps, logged_at, exercises(name, muscles)')
    .eq('session_id', session.id)
    .order('logged_at', { ascending: false })

  if (error) throw new Error(`Failed to fetch today's sets: ${error.message}`)

  return (data as unknown as LoggedSetRow[]).map((row) => ({
    id: row.id,
    sessionId: row.session_id,
    exerciseId: row.exercise_id,
    exerciseName: row.exercises[0]?.name ?? '',
    muscles: row.exercises[0]?.muscles ?? [],
    sets: row.sets,
    reps: row.reps,
    loggedAt: row.logged_at,
  }))
}
