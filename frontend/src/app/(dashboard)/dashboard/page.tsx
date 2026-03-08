import { getCurrentFatigue } from '@/lib/db/fatigue'
import { getAllExercises } from '@/lib/db/exercises'
import { MuscleMap } from '@/components/muscle-map/MuscleMap'
import { ExerciseLogger } from '@/components/exercises/ExerciseLogger'

export default async function DashboardPage() {
  const [fatigueState, exercises] = await Promise.all([
    getCurrentFatigue(),
    getAllExercises(),
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
