'use client'

import { useState } from 'react'
import type { Exercise } from '@/types'

type SetLoggerProps = {
  exercise: Exercise | null
  onLogSet: (sets: number, reps: number) => void
}

export function SetLogger({ exercise, onLogSet }: SetLoggerProps) {
  const [sets, setSets] = useState(3)
  const [reps, setReps] = useState(10)
  const [success, setSuccess] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!exercise) return
    onLogSet(sets, reps)
    setSuccess(true)
    setSets(3)
    setReps(10)
    setTimeout(() => setSuccess(false), 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm text-[#aaa]">Selected exercise</p>
        <p className={`text-base font-semibold ${exercise ? 'text-white' : 'text-[#555]'}`}>
          {exercise ? exercise.name : 'Select an exercise'}
        </p>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 space-y-1">
          <label htmlFor="sl-sets" className="block text-xs text-[#aaa]">
            Sets
          </label>
          <input
            id="sl-sets"
            type="number"
            min={1}
            max={20}
            value={sets}
            onChange={(e) => setSets(Math.max(1, Number(e.target.value)))}
            className="w-full rounded-md border border-[#333] bg-[#1a1a1a] px-3 py-2 text-sm text-white focus:border-[#FF2020] focus:outline-none"
          />
        </div>
        <div className="flex-1 space-y-1">
          <label htmlFor="sl-reps" className="block text-xs text-[#aaa]">
            Reps
          </label>
          <input
            id="sl-reps"
            type="number"
            min={1}
            max={100}
            value={reps}
            onChange={(e) => setReps(Math.max(1, Number(e.target.value)))}
            className="w-full rounded-md border border-[#333] bg-[#1a1a1a] px-3 py-2 text-sm text-white focus:border-[#FF2020] focus:outline-none"
          />
        </div>
      </div>

      {success && (
        <p className="text-sm text-green-400">Set logged!</p>
      )}

      <button
        type="submit"
        disabled={!exercise}
        className="w-full rounded-md bg-[#FF2020] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
      >
        Log Set
      </button>
    </form>
  )
}
