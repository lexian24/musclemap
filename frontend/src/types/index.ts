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

export type DbWorkoutSet = {
  id: string
  user_id: string
  exercise_id: string
  reps: number
  sets: number
  logged_at: string
}

export type DbFatigueSnapshot = {
  id: string
  user_id: string
  muscle: MuscleGroup
  fatigue: number
  updated_at: string
}

export type LoggedSet = {
  id: string
  exerciseName: string
  sets: number
  reps: number
  loggedAt: string // ISO timestamp
}
