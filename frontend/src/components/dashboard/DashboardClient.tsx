'use client'

import { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { FatigueMap } from '@/components/muscle-map/FatigueMap'
import { ExerciseGrid } from '@/components/exercises/ExerciseGrid'
import { SetLogger } from '@/components/exercises/SetLogger'
import { LoggedSetsList } from '@/components/exercises/LoggedSetsList'
import { applySetFatigue } from '@/lib/fatigue'
import type { Exercise, FatigueState, LoggedSet, InsertedSet } from '@/types'

type DashboardClientProps = {
  initialFatigueState: FatigueState
  exercises: Exercise[]
  initialSets: LoggedSet[]
}

type LogSetApiResponse = InsertedSet & { fatigue: FatigueState }

export function DashboardClient({
  initialFatigueState,
  exercises,
  initialSets,
}: DashboardClientProps) {
  const [fatigueState, setFatigueState] = useState(initialFatigueState)
  const [loggedSets, setLoggedSets] = useState(initialSets)
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const prevFatigueRef = useRef(initialFatigueState)

  const selectedExercise = exercises.find((e) => e.id === selectedExerciseId) ?? null

  const mutation = useMutation<
    LogSetApiResponse,
    Error,
    { exerciseId: string; sets: number; reps: number }
  >({
    mutationFn: async ({ exerciseId, sets, reps }) => {
      const res = await fetch('/api/sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseId, sets, reps }),
      })
      if (!res.ok) throw new Error('Failed to log set')
      return res.json() as Promise<LogSetApiResponse>
    },
    onSuccess: (data, variables) => {
      setError(null)
      // Replace optimistic fatigue with server-recalculated accurate value
      setFatigueState(data.fatigue)
      // Prepend new set to the history list
      const exercise = exercises.find((e) => e.id === variables.exerciseId)
      if (exercise) {
        setLoggedSets((prev) => [
          {
            id: data.id,
            sessionId: data.sessionId,
            exerciseId: data.exerciseId,
            exerciseName: exercise.name,
            muscles: exercise.muscles,
            sets: data.sets,
            reps: data.reps,
            loggedAt: data.loggedAt,
          },
          ...prev,
        ])
      }
    },
    onError: (err) => {
      // Roll back the optimistic fatigue update
      setFatigueState(prevFatigueRef.current)
      setError(err.message)
    },
  })

  function handleLogSet(sets: number, reps: number) {
    if (!selectedExercise) return
    setError(null)
    prevFatigueRef.current = fatigueState
    // Immediate optimistic update so the map reacts before the network call returns
    setFatigueState(applySetFatigue(fatigueState, selectedExercise.muscles, sets, reps))
    mutation.mutate({ exerciseId: selectedExercise.id, sets, reps })
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      {/* Left panel — muscle fatigue map */}
      <section className="shrink-0 lg:w-72">
        <h2 className="mb-4 text-lg font-semibold">Muscle Recovery</h2>
        <FatigueMap fatigueState={fatigueState} />
      </section>

      {/* Right panel — exercise logger + history */}
      <section className="min-w-0 flex-1 space-y-8">
        <div>
          <h2 className="mb-4 text-lg font-semibold">Choose Exercise</h2>
          <ExerciseGrid
            exercises={exercises}
            selectedId={selectedExerciseId}
            onSelect={setSelectedExerciseId}
          />
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Log a Set</h2>
          <SetLogger exercise={selectedExercise} onLogSet={handleLogSet} />
          {mutation.isPending && (
            <p className="mt-2 text-sm text-muted-foreground">Saving…</p>
          )}
          {error && (
            <div className="mt-3 flex items-center gap-3">
              <p className="text-sm text-destructive">{error}</p>
              <button
                onClick={() => {
                  setError(null)
                  mutation.reset()
                }}
                className="text-sm underline underline-offset-2"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Today&apos;s Sets</h2>
          <LoggedSetsList sets={loggedSets} />
        </div>
      </section>
    </div>
  )
}
