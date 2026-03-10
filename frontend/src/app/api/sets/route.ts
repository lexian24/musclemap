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

  console.log('[sets/POST] parsed input:', { exerciseId, sets, reps, userMax })

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

  console.log('[sets/POST] storedMaxes:', storedMaxes)
  console.log('[sets/POST] workoutSet.id:', workoutSet.id)
  console.log('[sets/POST] recentSets count:', recentSets.length)

  const payload = recentSets.map((s) => ({
    muscles: s.muscles,
    sets: s.sets,
    reps: s.reps,
    loggedAt: new Date(s.loggedAt),
    // For all sets: prefer the caller-supplied userMax (handles new PRs not yet persisted),
    // but ALWAYS fall back to the stored max. This prevents the VOLUME_NORMALISER fallback
    // from firing just because the client omitted userMax.
    userMax: s.id === workoutSet.id
      ? (userMax ?? maxByExercise.get(s.exerciseId))
      : maxByExercise.get(s.exerciseId),
  }))

  console.log('[sets/POST] payload userMaxes:', payload.map((p) => ({
    sets: p.sets,
    reps: p.reps,
    userMax: p.userMax,
    muscleCount: p.muscles.length,
  })))

  const newFatigue = recalculateFatigue(payload)

  // Log muscles with non-zero fatigue for debugging
  const nonZero = Object.entries(newFatigue).filter(([, v]) => v > 0.001)
  console.log('[sets/POST] fatigue result:', nonZero)

  await updateFatigueCache(user.id, newFatigue)

  return NextResponse.json({ ...workoutSet, fatigue: newFatigue, _v: 'v1.0-pr12' }, { status: 201 })
}
