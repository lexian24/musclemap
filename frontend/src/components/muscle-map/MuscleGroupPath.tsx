import { fatigueToColor, muscleLabel } from '@/lib/fatigue'
import type { MuscleGroup } from '@/types'

type MuscleGroupPathProps = {
  muscle: MuscleGroup
  d: string
  fatigue: number
}

export function MuscleGroupPath({ muscle, d, fatigue }: MuscleGroupPathProps) {
  const color = fatigueToColor(fatigue)
  const label = muscleLabel(muscle)

  return (
    <path
      d={d}
      fill={color}
      fillOpacity={fatigue > 0 ? 0.85 : 0.3}
      stroke="#9CA3AF"
      strokeWidth="0.5"
      aria-label={`${label}: ${Math.round(fatigue * 100)}% fatigued`}
    >
      <title>
        {label}: {Math.round(fatigue * 100)}% fatigued
      </title>
    </path>
  )
}
