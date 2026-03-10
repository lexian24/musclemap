import { createClient } from '@/lib/supabase/server'
import { FATIGUE_LOOKBACK_HOURS } from '@/lib/constants'
import type {
  DbWorkoutSession,
  DbLoggedSet,
  InsertedSet,
  LoggedSet,
  MuscleActivation,
  MuscleGroup,
  TodaySession,
  WeeklyVolume,
} from '@/types'

export type HistoryDay = {
  date: string // ISO date string "YYYY-MM-DD"
  sets: LoggedSet[]
}

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

// Supabase returns many-to-one joins (logged_sets.exercise_id → exercises.id)
// as a single object, not an array.
type LoggedSetRow = DbLoggedSet & {
  exercises: { name: string; muscles: MuscleActivation[] } | null
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
    exerciseName: row.exercises?.name ?? '',
    muscles: row.exercises?.muscles ?? [],
    sets: row.sets,
    reps: row.reps,
    loggedAt: row.logged_at,
  }))
}

/**
 * Returns all logged sets from the past FATIGUE_LOOKBACK_HOURS hours, across all
 * sessions, sorted chronologically. Used by fatigue recalculation on every set
 * log/delete so that previous-day fatigue is correctly carried forward rather
 * than being overwritten with zero.
 */
export async function getRecentSets(userId: string): Promise<LoggedSet[]> {
  const supabase = await createClient()
  const cutoff = new Date(Date.now() - FATIGUE_LOOKBACK_HOURS * 3_600_000)

  const { data, error } = await supabase
    .from('workout_sessions')
    .select('id, logged_at, logged_sets(id, session_id, exercise_id, sets, reps, logged_at, exercises(name, muscles))')
    .eq('user_id', userId)
    .gte('logged_at', cutoff.toISOString())
    .order('logged_at', { ascending: true })

  if (error) throw new Error(`Failed to fetch recent sets: ${error.message}`)

  const rows = data as unknown as HistorySessionRow[]
  const sets: LoggedSet[] = []

  for (const session of rows) {
    for (const row of session.logged_sets) {
      sets.push({
        id: row.id,
        sessionId: row.session_id,
        exerciseId: row.exercise_id,
        exerciseName: row.exercises?.name ?? '',
        muscles: row.exercises?.muscles ?? [],
        sets: row.sets,
        reps: row.reps,
        loggedAt: row.logged_at,
      })
    }
  }

  sets.sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime())
  return sets
}

type WeeklySessionRow = {
  id: string
  logged_at: string
  logged_sets: LoggedSetRow[]
}

type HistorySessionRow = {
  id: string
  logged_at: string
  logged_sets: LoggedSetRow[]
}

/** Returns grouped workout history for the user, newest days first. */
export async function getWorkoutHistory(userId: string, limit = 30): Promise<HistoryDay[]> {
  const supabase = await createClient()

  const cutoff = new Date()
  cutoff.setUTCDate(cutoff.getUTCDate() - limit)
  cutoff.setUTCHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('workout_sessions')
    .select('id, logged_at, logged_sets(id, session_id, exercise_id, sets, reps, logged_at, exercises(name, muscles))')
    .eq('user_id', userId)
    .gte('logged_at', cutoff.toISOString())
    .order('logged_at', { ascending: false })

  if (error) throw new Error(`Failed to fetch workout history: ${error.message}`)

  const rows = data as unknown as HistorySessionRow[]

  // Group by UTC date (YYYY-MM-DD)
  const dayMap = new Map<string, LoggedSet[]>()

  for (const session of rows) {
    const dateKey = session.logged_at.slice(0, 10)
    if (!dayMap.has(dateKey)) {
      dayMap.set(dateKey, [])
    }
    const sets = session.logged_sets.map((row) => ({
      id: row.id,
      sessionId: row.session_id,
      exerciseId: row.exercise_id,
      exerciseName: row.exercises?.name ?? '',
      muscles: row.exercises?.muscles ?? [],
      sets: row.sets,
      reps: row.reps,
      loggedAt: row.logged_at,
    }))
    // Sort sets newest first within each session
    sets.sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime())
    dayMap.get(dateKey)!.push(...sets)
  }

  // Convert to sorted array (newest day first)
  return Array.from(dayMap.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, sets]) => ({ date, sets }))
}

/**
 * Returns the total effective sets per muscle group logged in the past 7 days.
 * "Effective sets" = logged_set.sets × muscle_activation (each activated muscle
 * counts the set count, not fractional).
 */
export async function getWeeklyVolume(userId: string): Promise<WeeklyVolume> {
  const supabase = await createClient()

  const cutoff = new Date()
  cutoff.setUTCDate(cutoff.getUTCDate() - 7)
  cutoff.setUTCHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('workout_sessions')
    .select('id, logged_at, logged_sets(id, session_id, exercise_id, sets, reps, logged_at, exercises(name, muscles))')
    .eq('user_id', userId)
    .gte('logged_at', cutoff.toISOString())

  if (error) throw new Error(`Failed to fetch weekly volume: ${error.message}`)

  const rows = data as unknown as WeeklySessionRow[]
  const totals: Partial<Record<MuscleGroup, number>> = {}

  for (const session of rows) {
    for (const row of session.logged_sets) {
      const muscles = row.exercises?.muscles ?? []
      for (const activation of muscles) {
        const current = totals[activation.muscle] ?? 0
        totals[activation.muscle] = current + row.sets
      }
    }
  }

  return totals
}
