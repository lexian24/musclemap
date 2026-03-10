'use client'

import { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { FatigueMap } from '@/components/muscle-map/FatigueMap'
import { ExerciseGrid } from '@/components/exercises/ExerciseGrid'
import { SetLogger } from '@/components/exercises/SetLogger'
import { LoggedSetsList } from '@/components/exercises/LoggedSetsList'
import { WeeklyVolumePanel } from '@/components/dashboard/WeeklyVolumePanel'
import { applySetFatigue, muscleLabel } from '@/lib/fatigue'
import type { Exercise, FatigueState, LoggedSet, InsertedSet, UserExerciseMax, WeeklyVolume } from '@/types'

type DashboardClientProps = {
  initialFatigueState: FatigueState
  exercises: Exercise[]
  initialSets: LoggedSet[]
  initialUserMaxes: UserExerciseMax[]
  weeklyVolume: WeeklyVolume
}

type LogSetApiResponse = InsertedSet & { fatigue: FatigueState }
type DeleteSetApiResponse = { fatigue: FatigueState }

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

export function DashboardClient({
  initialFatigueState,
  exercises,
  initialSets,
  initialUserMaxes,
  weeklyVolume,
}: DashboardClientProps) {
  const [fatigueState, setFatigueState] = useState(initialFatigueState)
  const [loggedSets, setLoggedSets] = useState(initialSets)
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [userMaxes, setUserMaxes] = useState<UserExerciseMax[]>(initialUserMaxes)
  const [settingMax, setSettingMax] = useState(false)
  const [maxInput, setMaxInput] = useState<number>(1)
  const [savingMax, setSavingMax] = useState(false)
  const [volumePanelOpen, setVolumePanelOpen] = useState(false)
  const prevFatigueRef = useRef(initialFatigueState)

  const selectedExercise = exercises.find((e) => e.id === selectedExerciseId) ?? null
  const currentMax = selectedExerciseId
    ? (userMaxes.find((m) => m.exerciseId === selectedExerciseId)?.maxValue ?? null)
    : null

  // Count today's sets for the primary muscle of the selected exercise
  const primaryMuscle = selectedExercise?.muscles[0]?.muscle ?? null
  const sessionSetCountForPrimary = primaryMuscle
    ? loggedSets
        .filter((s) => s.muscles.some((m) => m.muscle === primaryMuscle))
        .reduce((acc, s) => acc + s.sets, 0)
    : 0

  // When selecting an exercise, check if we need to prompt for max
  function handleSelectExercise(id: string) {
    setSelectedExerciseId(id)
    setError(null)
    const hasMax = userMaxes.some((m) => m.exerciseId === id)
    setSettingMax(!hasMax)
    setMaxInput(1)
  }

  async function handleSaveMax() {
    if (!selectedExerciseId || maxInput < 1) return
    setSavingMax(true)
    setError(null)
    try {
      const res = await fetch('/api/user-maxes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseId: selectedExerciseId, maxValue: maxInput }),
      })
      if (!res.ok) throw new Error('Failed to save max')
      setUserMaxes((prev) => {
        const without = prev.filter((m) => m.exerciseId !== selectedExerciseId)
        return [...without, { exerciseId: selectedExerciseId, maxValue: maxInput }]
      })
      setSettingMax(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save max')
    } finally {
      setSavingMax(false)
    }
  }

  const mutation = useMutation<
    LogSetApiResponse,
    Error,
    { exerciseId: string; sets: number; reps: number; userMax?: number }
  >({
    mutationFn: async ({ exerciseId, sets, reps, userMax }) => {
      const res = await fetch('/api/sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseId, sets, reps, userMax }),
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

  async function handleDeleteSet(id: string) {
    const removedSet = loggedSets.find((s) => s.id === id)
    // Optimistically remove the set
    setLoggedSets((prev) => prev.filter((s) => s.id !== id))
    setError(null)

    try {
      const res = await fetch(`/api/sets/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete set')
      const data = (await res.json()) as DeleteSetApiResponse
      setFatigueState(data.fatigue)
    } catch (err) {
      // Restore the set on error
      if (removedSet) {
        setLoggedSets((prev) => [removedSet, ...prev])
      }
      setError(err instanceof Error ? err.message : 'Failed to delete set')
    }
  }

  function handleLogSet(sets: number, reps: number) {
    if (!selectedExercise) return
    setError(null)
    prevFatigueRef.current = fatigueState

    const userMax = currentMax ?? undefined

    // If user logged more than their current max, update it optimistically
    if (userMax !== undefined && reps > userMax) {
      setUserMaxes((prev) => {
        const without = prev.filter((m) => m.exerciseId !== selectedExercise.id)
        return [...without, { exerciseId: selectedExercise.id, maxValue: reps }]
      })
      // Fire-and-forget update to API
      void fetch('/api/user-maxes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseId: selectedExercise.id, maxValue: reps }),
      })
    }

    // Only do the optimistic update when userMax is known — without it,
    // applySetFatigue falls back to the VOLUME_NORMALISER path which can produce
    // wildly wrong values (e.g. 100% from 3 light sets).
    if (userMax !== undefined) {
      setFatigueState(applySetFatigue(fatigueState, selectedExercise.muscles, sets, reps, userMax))
    }
    mutation.mutate({ exerciseId: selectedExercise.id, sets, reps, userMax })
  }

  const unit = selectedExercise?.unit ?? 'reps'

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      {/* Left panel — muscle fatigue map */}
      <aside className="shrink-0">
        <div className="glass-card p-5 w-fit">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-sm shadow-red-500/50" />
            <h2 className="section-title">
              Muscle Recovery
            </h2>
          </div>
          <FatigueMap fatigueState={fatigueState} />

          {/* Weekly Volume collapsible panel */}
          <div className="mt-5 pt-5 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={() => setVolumePanelOpen((prev) => !prev)}
              className="flex items-center gap-2 section-title hover:text-foreground transition-colors w-full cursor-pointer"
            >
              <span>Weekly Volume</span>
              <span className="ml-auto">
                <ChevronIcon open={volumePanelOpen} />
              </span>
            </button>
            <div
              className={`grid transition-all duration-300 ease-in-out ${volumePanelOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'}`}
            >
              <div className="overflow-hidden">
                <div className="max-h-64 overflow-y-auto pr-1">
                  <p className="text-[10px] text-muted-foreground/50 mb-2">Sets per muscle this week</p>
                  <WeeklyVolumePanel weeklyVolume={weeklyVolume} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Right panel — exercise logger + history */}
      <section className="min-w-0 flex-1 space-y-5">
        {/* Choose Exercise */}
        <div className="glass-card p-5">
          <h2 className="section-title mb-4">
            Choose Exercise
          </h2>
          <ExerciseGrid
            exercises={exercises}
            selectedId={selectedExerciseId}
            onSelect={handleSelectExercise}
          />
        </div>

        {/* Set Your Max prompt (shown when exercise selected but no max recorded) */}
        {selectedExercise && settingMax && (
          <div className="glass-card p-5">
            <h2 className="section-title mb-4">
              Set Your Max
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              What&apos;s the most {unit} you can do in 1 set of{' '}
              <span className="font-semibold text-foreground">{selectedExercise.name}</span>?
            </p>
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-1.5">
                <label htmlFor="max-input" className="block text-xs font-medium text-muted-foreground">
                  Max {unit}
                </label>
                <input
                  id="max-input"
                  type="number"
                  min={1}
                  value={maxInput}
                  onChange={(e) => setMaxInput(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
                />
              </div>
              <button
                onClick={() => void handleSaveMax()}
                disabled={savingMax || maxInput < 1}
                className="rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-red-500/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30"
              >
                {savingMax ? 'Saving...' : 'Save Max'}
              </button>
            </div>
          </div>
        )}

        {/* Log a Set */}
        <div className="glass-card p-5">
          <h2 className="section-title mb-4">
            Log a Set
          </h2>
          <SetLogger
            exercise={selectedExercise}
            onLogSet={handleLogSet}
            userMax={currentMax ?? undefined}
            disabled={selectedExercise !== null && settingMax}
          />
          {primaryMuscle !== null && sessionSetCountForPrimary >= 4 && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400 shrink-0" aria-hidden="true">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <p className="text-xs text-amber-300/80">
                {sessionSetCountForPrimary} sets for{' '}
                <span className="font-medium text-amber-300">{muscleLabel(primaryMuscle)}</span>{' '}
                today — diminishing returns above 6
              </p>
            </div>
          )}
          {mutation.isPending && (
            <div className="mt-3 flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              <p className="text-sm text-muted-foreground">Saving...</p>
            </div>
          )}
          {error && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5">
              <p className="text-sm text-red-400 flex-1">{error}</p>
              <button
                onClick={() => {
                  setError(null)
                  mutation.reset()
                }}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Today's Sets */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="section-title">
              Today&apos;s Sets
            </h2>
            {loggedSets.length > 0 && (
              <span className="ml-auto text-xs font-semibold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full">
                {loggedSets.length}
              </span>
            )}
          </div>
          <LoggedSetsList sets={loggedSets} onDelete={(id) => void handleDeleteSet(id)} />
        </div>
      </section>
    </div>
  )
}
