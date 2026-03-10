import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getTodaySession, logSet, getRecentSets } from '@/lib/db/sessions'
import { updateFatigueCache } from '@/lib/db/fatigue'
import { getUserMaxes } from '@/lib/db/userMaxes'
import { recalculateFatigue } from '@/lib/fatigue'

const logSetSchema = z.object({
  exerciseId: z.string().uuid(),
  sets: z.number().int().min(1).max(20),
  reps: z.number().int().min(1).max(200),
  userMax: z.number().int().min(1).optional(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: unknown = await request.json()
  const parsed = logSetSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  const { exerciseId, sets, reps, userMax } = parsed.data
  const session = await getTodaySession(user.id)
  const workoutSet = await logSet(session.id, exerciseId, sets, reps)

  // Fetch recent sets and stored maxes in parallel so historical sets use the
  // intensity-zone formula (same scale as the new path) instead of falling back
  // to the crude VOLUME_NORMALISER which produces wildly different fatigue values.
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
      // Prefer caller-supplied userMax for the new set (it may be a new PR that
      // hasn't been persisted yet). Fall back to the stored max for all other sets.
      userMax: s.id === workoutSet.id ? userMax : maxByExercise.get(s.exerciseId),
    })),
  )
  await updateFatigueCache(user.id, newFatigue)

  return NextResponse.json({ ...workoutSet, fatigue: newFatigue }, { status: 201 })
}
