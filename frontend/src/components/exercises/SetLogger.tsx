'use client'

import { useState } from 'react'
import type { Exercise } from '@/types'

// Intensity zone boundaries (effortRatio = reps / userMax).
// UI-only — defined inline to avoid circular dependency with constants.ts.
const INTENSITY_ZONE_LABELS = [
  { label: 'Very Light', minEffort: 0,    maxEffort: 0.50, color: 'text-zinc-400 bg-zinc-500/15' },
  { label: 'Light',      minEffort: 0.50, maxEffort: 0.65, color: 'text-blue-400 bg-blue-500/15' },
  { label: 'Moderate',   minEffort: 0.65, maxEffort: 0.75, color: 'text-emerald-400 bg-emerald-500/15' },
  { label: 'Heavy',      minEffort: 0.75, maxEffort: 0.85, color: 'text-amber-400 bg-amber-500/15' },
  { label: 'Very Heavy', minEffort: 0.85, maxEffort: 0.92, color: 'text-orange-400 bg-orange-500/15' },
  { label: 'Max Effort', minEffort: 0.92, maxEffort: 1.01, color: 'text-red-400 bg-red-500/15' },
] as const

function getIntensityZone(effortRatio: number): typeof INTENSITY_ZONE_LABELS[number] {
  for (const zone of INTENSITY_ZONE_LABELS) {
    if (effortRatio >= zone.minEffort && effortRatio < zone.maxEffort) return zone
  }
  return INTENSITY_ZONE_LABELS[INTENSITY_ZONE_LABELS.length - 1]
}

type SetLoggerProps = {
  exercise: Exercise | null
  userMax?: number
  disabled?: boolean
  onLogSet: (sets: number, reps: number) => void
}

// A stepper input: – [text field] + that supports both direct typing and button clicks.
function NumericField({
  id,
  label,
  value,
  min,
  max,
  onChange,
}: {
  id: string
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  const [raw, setRaw] = useState(String(value))

  // Sync display when parent resets
  function handleBlur() {
    const n = parseInt(raw, 10)
    if (!isNaN(n)) {
      const clamped = Math.min(max, Math.max(min, n))
      onChange(clamped)
      setRaw(String(clamped))
    } else {
      setRaw(String(value))
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRaw(e.target.value)
    const n = parseInt(e.target.value, 10)
    if (!isNaN(n) && n >= min && n <= max) {
      onChange(n)
    }
  }

  function step(delta: number) {
    const next = Math.min(max, Math.max(min, value + delta))
    onChange(next)
    setRaw(String(next))
  }

  // Keep raw in sync when value changes from outside (e.g. form reset)
  if (raw !== String(value) && document.activeElement?.id !== id) {
    setRaw(String(value))
  }

  return (
    <div className="flex-1 space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <div className="flex items-center rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
        <button
          type="button"
          onClick={() => step(-1)}
          className="px-3.5 py-2.5 text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors select-none text-base leading-none cursor-pointer"
          aria-label={`Decrease ${label}`}
        >
          -
        </button>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={raw}
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-full bg-transparent text-center text-sm font-semibold text-foreground focus:outline-none py-2.5 min-w-0"
          aria-label={label}
        />
        <button
          type="button"
          onClick={() => step(1)}
          className="px-3.5 py-2.5 text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors select-none text-base leading-none cursor-pointer"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  )
}

export function SetLogger({ exercise, userMax, disabled = false, onLogSet }: SetLoggerProps) {
  const [sets, setSets] = useState(3)
  const [reps, setReps] = useState(10)
  const [success, setSuccess] = useState(false)

  const isTimeBased = exercise?.unit === 'seconds'
  const repLabel = isTimeBased ? 'Seconds' : 'Reps'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!exercise || disabled) return
    onLogSet(sets, reps)
    setSuccess(true)
    setSets(3)
    setReps(10)
    setTimeout(() => setSuccess(false), 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-xs text-muted-foreground">Selected exercise</p>
        <p className={`mt-1 text-sm font-semibold ${exercise ? 'text-foreground' : 'text-muted-foreground/40'}`}>
          {exercise ? exercise.name : 'Select an exercise above'}
        </p>
        {userMax !== undefined && userMax > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Your max: <span className="font-semibold text-red-400">{userMax} {repLabel.toLowerCase()}</span>
            </span>
            {reps > 0 && (
              <span className="text-[11px] text-muted-foreground/50">
                ({Math.min(100, Math.round((reps / userMax) * 100))}% effort)
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <NumericField
          id="sl-sets"
          label="Sets"
          value={sets}
          min={1}
          max={20}
          onChange={setSets}
        />
        <NumericField
          id="sl-reps"
          label={repLabel}
          value={reps}
          min={1}
          max={isTimeBased ? 3600 : 200}
          onChange={setReps}
        />
      </div>

      {userMax !== undefined && userMax > 0 && reps > 0 && !isTimeBased && (() => {
        const effortRatio = reps / userMax
        const zone = getIntensityZone(Math.min(effortRatio, 1))
        return (
          <p className="text-xs">
            <span className={`inline-block px-2.5 py-1 rounded-lg font-semibold leading-none ${zone.color}`}>
              {zone.label}
            </span>
          </p>
        )
      })()}

      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <p className="text-sm font-medium text-emerald-400">Set logged!</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!exercise || disabled}
        className="w-full rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-4 py-3 text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-red-500/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:shadow-none cursor-pointer"
      >
        {disabled ? 'Set your max first' : 'Log Set'}
      </button>
    </form>
  )
}
