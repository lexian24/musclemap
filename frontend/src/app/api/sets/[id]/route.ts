import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRecentSets } from '@/lib/db/sessions'
import { updateFatigueCache } from '@/lib/db/fatigue'
import { getUserMaxes } from '@/lib/db/userMaxes'
import { recalculateFatigue } from '@/lib/fatigue'

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params

  // Verify the user owns this set by joining through workout_sessions
  const { data: existing, error: fetchError } = await supabase
    .from('logged_sets')
    .select('id, workout_sessions!inner(user_id)')
    .eq('id', id)
    .eq('workout_sessions.user_id', user.id)
    .maybeSingle()

  if (fetchError) {
    return NextResponse.json({ error: 'Failed to verify ownership' }, { status: 500 })
  }

  if (!existing) {
    return NextResponse.json({ error: 'Set not found or not authorized' }, { status: 404 })
  }

  // Delete the set
  const { error: deleteError } = await supabase
    .from('logged_sets')
    .delete()
    .eq('id', id)

  if (deleteError) {
    return NextResponse.json({ error: 'Failed to delete set' }, { status: 500 })
  }

  // Recalculate fatigue using stored maxes so historical sets use the intensity-zone
  // formula consistently rather than the crude VOLUME_NORMALISER fallback.
  const [recentSets, storedMaxes] = await Promise.all([
    getRecentSets(user.id),
    getUserMaxes(user.id),
  ])
  const maxByExercise = new Map(storedMaxes.map((m) => [m.exerciseId, m.maxValue]))

  const newFatigue = recalculateFatigue(
    recentSets.map((s) => ({
      muscles: s.muscles,
      sets: s.sets,
      reps: s.reps,
      loggedAt: new Date(s.loggedAt),
      userMax: maxByExercise.get(s.exerciseId),
    })),
  )
  await updateFatigueCache(user.id, newFatigue)

  return NextResponse.json({ fatigue: newFatigue }, { status: 200 })
}
