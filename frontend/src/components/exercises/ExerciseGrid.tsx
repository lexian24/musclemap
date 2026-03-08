'use client'

import { ExerciseCard } from './ExerciseCard'
import type { Exercise } from '@/types'

type ExerciseGridProps = {
  exercises: Exercise[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function ExerciseGrid({ exercises, selectedId, onSelect }: ExerciseGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          selected={exercise.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
