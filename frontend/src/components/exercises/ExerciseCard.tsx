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
        'w-full text-left rounded-lg border p-3 transition-colors',
        'bg-[#1a1a1a] hover:bg-[#222]',
        selected
          ? 'border-[#FF2020] ring-1 ring-[#FF2020]'
          : 'border-[#333] hover:border-[#555]',
      ].join(' ')}
    >
      <p className="text-sm font-medium text-white truncate">{exercise.name}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {exercise.muscles.map(({ muscle, intensity }) => (
          <span
            key={muscle}
            title={`${muscle.replace(/_/g, ' ')} (${Math.round(intensity * 100)}%)`}
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: fatigueToColor(intensity) }}
          />
        ))}
      </div>
    </button>
  )
}
