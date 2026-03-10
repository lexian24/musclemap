import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserMaxes } from '@/lib/db/userMaxes'
import { getRecentSets } from '@/lib/db/sessions'
import { recalculateFatigue } from '@/lib/fatigue'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [userMaxes, recentSets] = await Promise.all([
    getUserMaxes(user.id),
    getRecentSets(user.id),
  ])

  const maxByExercise = new Map(userMaxes.map((m) => [m.exerciseId, m.maxValue]))

  // Build the same payload that /api/sets would build
  const payload = recentSets.map((s) => ({
    muscles: s.muscles,
    sets: s.sets,
    reps: s.reps,
    loggedAt: new Date(s.loggedAt),
    userMax: maxByExercise.get(s.exerciseId),
  }))

  // Recalculate fatigue the same way the sets API does
  const fatigue = recalculateFatigue(payload)
  const nonZeroFatigue = Object.fromEntries(
    Object.entries(fatigue).filter(([, v]) => v > 0.001),
  )

  return NextResponse.json({
    _v: 'v1.0-pr12',
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? 'local',
    userId: user.id,
    userMaxesCount: userMaxes.length,
    userMaxes,
    recentSetsCount: recentSets.length,
    recentSets: recentSets.map((s) => ({
      id: s.id,
      exerciseId: s.exerciseId,
      exerciseName: s.exerciseName,
      sets: s.sets,
      reps: s.reps,
      loggedAt: s.loggedAt,
      resolvedUserMax: maxByExercise.get(s.exerciseId) ?? 'MISSING',
    })),
    fatigue: nonZeroFatigue,
  })
}
