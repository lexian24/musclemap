// Run in Supabase dashboard:
// CREATE TABLE IF NOT EXISTS user_exercise_maxes (
//   user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
//   exercise_id uuid REFERENCES exercises(id) ON DELETE CASCADE,
//   max_value int NOT NULL CHECK (max_value > 0),
//   updated_at timestamptz DEFAULT now(),
//   PRIMARY KEY (user_id, exercise_id)
// );
// ALTER TABLE user_exercise_maxes ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "Users manage own maxes" ON user_exercise_maxes
//   USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

import { createClient } from '@/lib/supabase/server'
import type { UserExerciseMax } from '@/types'

type DbUserExerciseMax = {
  user_id: string
  exercise_id: string
  max_value: number
  updated_at: string
}

/** Fetches all user 1RM maxes for the given user. */
export async function getUserMaxes(userId: string): Promise<UserExerciseMax[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_exercise_maxes')
    .select('exercise_id, max_value')
    .eq('user_id', userId)

  if (error) throw new Error(`Failed to fetch user maxes: ${error.message}`)

  return (data as Pick<DbUserExerciseMax, 'exercise_id' | 'max_value'>[]).map((row) => ({
    exerciseId: row.exercise_id,
    maxValue: row.max_value,
  }))
}

/** Upserts (inserts or updates) the personal max for a user/exercise combination. */
export async function upsertUserMax(
  userId: string,
  exerciseId: string,
  maxValue: number,
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.from('user_exercise_maxes').upsert(
    {
      user_id: userId,
      exercise_id: exerciseId,
      max_value: maxValue,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,exercise_id' },
  )

  if (error) throw new Error(`Failed to upsert user max: ${error.message}`)
}
