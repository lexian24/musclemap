import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getTodaySession, logSet, getTodaySets } from '@/lib/db/sessions'
import { updateFatigueCache } from '@/lib/db/fatigue'
import { recalculateFatigue } from '@/lib/fatigue'

const logSetSchema = z.object({
  exerciseId: z.string().uuid(),
  sets: z.number().int().min(1).max(20),
  reps: z.number().int().min(1).max(100),
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

  const { exerciseId, sets, reps } = parsed.data
  const session = await getTodaySession(user.id)
  const workoutSet = await logSet(session.id, exerciseId, sets, reps)

  // Recalculate fatigue from all of today's sets (including the one just inserted)
  const todaySets = await getTodaySets(user.id)
  const newFatigue = recalculateFatigue(
    todaySets.map((s) => ({
      muscles: s.muscles,
      sets: s.sets,
      reps: s.reps,
      loggedAt: new Date(s.loggedAt),
    })),
  )
  await updateFatigueCache(user.id, newFatigue)

  return NextResponse.json({ ...workoutSet, fatigue: newFatigue }, { status: 201 })
}
