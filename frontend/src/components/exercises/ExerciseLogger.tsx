'use client'

import { useState } from 'react'
import { useLogSet, useApplyOptimisticFatigue } from '@/hooks/useFatigue'
import type { Exercise } from '@/types'

type ExerciseLoggerProps = {
  exercises: Exercise[]
}

export function ExerciseLogger({ exercises }: ExerciseLoggerProps) {
  const [selectedId, setSelectedId] = useState('')
  const [sets, setSets] = useState(3)
  const [reps, setReps] = useState(10)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const logSet = useLogSet()
  const applyOptimistic = useApplyOptimisticFatigue()

  const selectedExercise = exercises.find((e) => e.id === selectedId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedExercise) return

    // Optimistic update — colour the map immediately
    applyOptimistic(selectedExercise.muscles, sets, reps)

    logSet.mutate(
      { exerciseId: selectedId, sets, reps },
      {
        onSuccess: () => {
          setSuccessMsg(`Logged ${sets}×${reps} ${selectedExercise.name}`)
          setTimeout(() => setSuccessMsg(null), 3000)
        },
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="exercise" className="text-sm font-medium">
          Exercise
        </label>
        <select
          id="exercise"
          required
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Select an exercise…</option>
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>
      </div>

      {selectedExercise && (
        <p className="text-xs text-muted-foreground">
          Targets:{' '}
          {selectedExercise.muscles
            .map((m) => m.muscle.replace('_', ' '))
            .join(', ')}
        </p>
      )}

      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <label htmlFor="sets" className="text-sm font-medium">
            Sets
          </label>
          <input
            id="sets"
            type="number"
            min={1}
            max={20}
            value={sets}
            onChange={(e) => setSets(Number(e.target.value))}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex-1 space-y-2">
          <label htmlFor="reps" className="text-sm font-medium">
            Reps
          </label>
          <input
            id="reps"
            type="number"
            min={1}
            max={100}
            value={reps}
            onChange={(e) => setReps(Number(e.target.value))}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {logSet.isError && (
        <p className="text-sm text-destructive">
          Failed to log set. Please try again.
        </p>
      )}
      {successMsg && (
        <p className="text-sm text-green-600">{successMsg}</p>
      )}

      <button
        type="submit"
        disabled={!selectedId || logSet.isPending}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {logSet.isPending ? 'Logging…' : 'Log Set'}
      </button>
    </form>
  )
}
