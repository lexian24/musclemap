export type MuscleGroup =
  | 'chest'
  | 'front_delts'
  | 'side_delts'
  | 'rear_delts'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'upper_back'
  | 'lats'
  | 'lower_back'
  | 'abs'
  | 'obliques'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'calves'

export const ALL_MUSCLE_GROUPS: MuscleGroup[] = [
  'chest',
  'front_delts',
  'side_delts',
  'rear_delts',
  'biceps',
  'triceps',
  'forearms',
  'upper_back',
  'lats',
  'lower_back',
  'abs',
  'obliques',
  'glutes',
  'quads',
  'hamstrings',
  'calves',
]

export type MuscleActivation = {
  muscle: MuscleGroup
  intensity: number // 0.0 to 1.0 — how hard this muscle worked
}

export type Exercise = {
  id: string
  name: string
  muscles: MuscleActivation[]
}

export type FatigueState = Record<MuscleGroup, number> // 0.0 (fresh) to 1.0 (destroyed)

export type WorkoutSet = {
  id: string
  exerciseId: string
  reps: number
  sets: number
  loggedAt: string // ISO timestamp
}

export type WorkoutSession = {
  id: string
  userId: string
  sets: WorkoutSet[]
  startedAt: string
  endedAt: string | null
}

// DB row shapes (snake_case from Supabase)
export type DbExercise = {
  id: string
  name: string
  muscles: MuscleActivation[]
  created_at: string
}

export type DbWorkoutSession = {
  id: string
  user_id: string
  logged_at: string
}

export type DbLoggedSet = {
  id: string
  session_id: string
  exercise_id: string
  sets: number
  reps: number
  logged_at: string
}

export type DbMuscleFatigueCache = {
  user_id: string
  muscle_group: string
  fatigue_value: number
  last_updated: string
}

// App-level types for session/set model
export type TodaySession = {
  id: string
  userId: string
  loggedAt: string
}

export type LoggedSet = {
  id: string
  sessionId: string
  exerciseId: string
  exerciseName: string
  muscles: MuscleActivation[]
  sets: number
  reps: number
  loggedAt: string
}

export type InsertedSet = {
  id: string
  sessionId: string
  exerciseId: string
  sets: number
  reps: number
  loggedAt: string
}
