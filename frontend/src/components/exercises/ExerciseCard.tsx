'use client'

import { fatigueToColor } from '@/lib/fatigue'
import type { Exercise } from '@/types'

type ExerciseCardProps = {
  exercise: Exercise
  selected: boolean
  onSelect: (id: string) => void
}

export function ExerciseCard({ exercise, selected, onSelect }: ExerciseCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(exercise.id)}
      className={[
        'w-full text-left rounded-xl border p-3 transition-all duration-150 cursor-pointer',
        'bg-white/[0.02] hover:bg-white/[0.05]',
        selected
          ? 'border-red-500/50 ring-1 ring-red-500/30 shadow-md shadow-red-500/10'
          : 'border-white/[0.06] hover:border-white/[0.12]',
      ].join(' ')}
    >
      <p className="text-sm font-medium text-foreground truncate">{exercise.name}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {exercise.muscles.map(({ muscle, intensity }) => (
          <span
            key={muscle}
            title={`${muscle.replace(/_/g, ' ')} (${Math.round(intensity * 100)}%)`}
            className="inline-block h-2 w-2 rounded-full ring-1 ring-white/10"
            style={{ backgroundColor: fatigueToColor(intensity) }}
          />
        ))}
      </div>
    </button>
  )
}
