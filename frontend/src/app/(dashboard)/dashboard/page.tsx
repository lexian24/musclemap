import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getFatigueState } from '@/lib/db/fatigue'
import { getExercises } from '@/lib/db/exercises'
import { getTodaySets } from '@/lib/db/sessions'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [fatigueState, exercises, todaySets] = await Promise.all([
    getFatigueState(user.id),
    getExercises(),
    getTodaySets(user.id),
  ])

  return (
    <DashboardClient
      initialFatigueState={fatigueState}
      exercises={exercises}
      initialSets={todaySets}
    />
  )
}
