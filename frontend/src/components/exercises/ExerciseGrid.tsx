'use client'

import { useState } from 'react'
import { ExerciseCard } from './ExerciseCard'
import type { Exercise, ExerciseCategory } from '@/types'

type ExerciseGridProps = {
  exercises: Exercise[]
  selectedId: string | null
  onSelect: (id: string) => void
}

const CATEGORIES: { key: ExerciseCategory | 'all'; label: string }[] = [
  { key: 'all',  label: 'All'  },
  { key: 'push', label: 'Push' },
  { key: 'pull', label: 'Pull' },
  { key: 'core', label: 'Core' },
  { key: 'legs', label: 'Legs' },
]

export function ExerciseGrid({ exercises, selectedId, onSelect }: ExerciseGridProps) {
  const [activeCategory, setActiveCategory] = useState<ExerciseCategory | 'all'>('all')

  // Only show category tabs if at least some exercises have a category
  const hasCategoryData = exercises.some((e) => e.category != null)

  const filtered = activeCategory === 'all'
    ? exercises
    : exercises.filter((e) => e.category === activeCategory)

  return (
    <div className="space-y-4">
      {hasCategoryData && (
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveCategory(key)}
              className={[
                'rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 cursor-pointer',
                activeCategory === key
                  ? 'bg-red-500/15 text-red-400 ring-1 ring-red-500/30'
                  : 'bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            selected={exercise.id === selectedId}
            onSelect={onSelect}
          />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground py-6 text-center">
            No exercises in this category yet.
          </p>
        )}
      </div>
    </div>
  )
}
