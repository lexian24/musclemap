import { createClient } from '@/lib/supabase/server'
import { getFatigueState } from '@/lib/db/fatigue'
import { getExercises } from '@/lib/db/exercises'
import { MuscleMap } from '@/components/muscle-map/MuscleMap'
import { ExerciseLogger } from '@/components/exercises/ExerciseLogger'
import { emptyFatigueState } from '@/lib/fatigue'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [fatigueState, exercises] = await Promise.all([
    user ? getFatigueState(user.id) : Promise.resolve(emptyFatigueState()),
    getExercises(),
  ])

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <section className="flex-1">
        <h2 className="text-lg font-semibold mb-4">Muscle Recovery</h2>
        <MuscleMap fatigueState={fatigueState} />
      </section>
      <section className="w-full lg:w-96">
        <h2 className="text-lg font-semibold mb-4">Log a Set</h2>
        <ExerciseLogger exercises={exercises} />
      </section>
    </div>
  )
}
