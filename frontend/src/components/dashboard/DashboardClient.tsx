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
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      {/* Left panel — muscle fatigue map */}
      <aside className="shrink-0 lg:w-80">
        <div className="rounded-xl border border-border bg-card p-5 shadow-lg shadow-black/20">
          <div className="flex items-center gap-2 mb-5">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Muscle Recovery
            </h2>
          </div>
          <FatigueMap fatigueState={fatigueState} />
        </div>
      </aside>

      {/* Right panel — exercise logger + history */}
      <section className="min-w-0 flex-1 space-y-6">
        {/* Choose Exercise */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-lg shadow-black/20">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Choose Exercise
            </h2>
          </div>
          <ExerciseGrid
            exercises={exercises}
            selectedId={selectedExerciseId}
            onSelect={setSelectedExerciseId}
          />
        </div>

        {/* Log a Set */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-lg shadow-black/20">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Log a Set
            </h2>
          </div>
          <SetLogger exercise={selectedExercise} onLogSet={handleLogSet} />
          {mutation.isPending && (
            <p className="mt-3 text-sm text-muted-foreground flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Saving…
            </p>
          )}
          {error && (
            <div className="mt-3 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2">
              <p className="text-sm text-destructive flex-1">{error}</p>
              <button
                onClick={() => {
                  setError(null)
                  mutation.reset()
                }}
                className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors flex-shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Today's Sets */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-lg shadow-black/20">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Today&apos;s Sets
            </h2>
            {loggedSets.length > 0 && (
              <span className="ml-auto text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                {loggedSets.length}
              </span>
            )}
          </div>
          <LoggedSetsList sets={loggedSets} />
        </div>
      </section>
    </div>
  )
}
