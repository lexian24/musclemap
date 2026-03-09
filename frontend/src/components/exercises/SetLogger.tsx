'use client'

import { useState } from 'react'
import type { Exercise } from '@/types'

// Intensity zone boundaries (effortRatio = reps / userMax).
// UI-only — defined inline to avoid circular dependency with constants.ts.
const INTENSITY_ZONE_LABELS = [
  { label: 'Very Light', minEffort: 0,    maxEffort: 0.50, color: 'text-muted-foreground bg-secondary' },
  { label: 'Light',      minEffort: 0.50, maxEffort: 0.65, color: 'text-blue-400 bg-blue-500/15' },
  { label: 'Moderate',   minEffort: 0.65, maxEffort: 0.75, color: 'text-green-400 bg-green-500/15' },
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
    <div className="flex-1 space-y-1">
      <label htmlFor={id} className="block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <div className="flex items-center rounded-md border border-border bg-secondary overflow-hidden">
        <button
          type="button"
          onClick={() => step(-1)}
          className="px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors select-none text-base leading-none"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={raw}
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-full bg-transparent text-center text-sm font-semibold text-foreground focus:outline-none py-2 min-w-0"
          aria-label={label}
        />
        <button
          type="button"
          onClick={() => step(1)}
          className="px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors select-none text-base leading-none"
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
        <p className={`mt-0.5 text-sm font-semibold ${exercise ? 'text-foreground' : 'text-muted-foreground/50'}`}>
          {exercise ? exercise.name : 'Select an exercise above'}
        </p>
        {userMax !== undefined && userMax > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            Your max: <span className="font-medium text-primary">{userMax} {repLabel.toLowerCase()}</span>
            {reps > 0 && (
              <span className="ml-2 text-muted-foreground/60">
                ({Math.min(100, Math.round((reps / userMax) * 100))}% effort)
              </span>
            )}
          </p>
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
            <span className={`inline-block px-2 py-0.5 rounded-full font-medium leading-none ${zone.color}`}>
              {zone.label}
            </span>
          </p>
        )
      })()}

      {success && (
        <p className="text-sm text-green-400 flex items-center gap-1.5">
          <span>✓</span> Set logged!
        </p>
      )}

      <button
        type="submit"
        disabled={!exercise || disabled}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
      >
        {disabled ? 'Set your max first' : 'Log Set'}
      </button>
    </form>
  )
}
