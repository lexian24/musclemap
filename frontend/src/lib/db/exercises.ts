import { createClient } from '@/lib/supabase/server'
import type { DbExercise, Exercise } from '@/types'

function toExercise(row: DbExercise): Exercise {
  return {
    id: row.id,
    name: row.name,
    muscles: row.muscles,
  }
}

export async function getAllExercises(): Promise<Exercise[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name')

  if (error) throw new Error(`Failed to fetch exercises: ${error.message}`)
  return (data as DbExercise[]).map(toExercise)
}

export async function getExerciseById(id: string): Promise<Exercise | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch exercise: ${error.message}`)
  }
  return toExercise(data as DbExercise)
}
