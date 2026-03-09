import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getFatigueState } from '@/lib/db/fatigue'
import { getExercises } from '@/lib/db/exercises'
import { getTodaySets, getWeeklyVolume } from '@/lib/db/sessions'
import { getUserMaxes } from '@/lib/db/userMaxes'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [fatigueState, exercises, todaySets, initialUserMaxes, weeklyVolume] = await Promise.all([
    getFatigueState(user.id),
    getExercises(),
    getTodaySets(user.id),
    getUserMaxes(user.id),
    getWeeklyVolume(user.id),
  ])

  return (
    <DashboardClient
      initialFatigueState={fatigueState}
      exercises={exercises}
      initialSets={todaySets}
      initialUserMaxes={initialUserMaxes}
      weeklyVolume={weeklyVolume}
    />
  )
}
