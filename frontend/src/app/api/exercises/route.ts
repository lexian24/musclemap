import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAllExercises } from '@/lib/db/exercises'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const exercises = await getAllExercises()
  return NextResponse.json(exercises)
}
