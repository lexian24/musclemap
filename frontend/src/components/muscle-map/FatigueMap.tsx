'use client'

import { useState } from 'react'
import { fatigueToColor, muscleLabel } from '@/lib/fatigue'
import { FATIGUE_COLOR_STOPS } from '@/lib/constants'
import type { FatigueState, MuscleGroup } from '@/types'
import { BodyDiagram } from './BodyDiagram'

type FatigueMapProps = {
  fatigueState: FatigueState
  onMuscleClick?: (muscle: MuscleGroup) => void
}

export function FatigueMap({ fatigueState, onMuscleClick }: FatigueMapProps) {
  const [hoveredMuscle, setHoveredMuscle] = useState<MuscleGroup | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <div className="relative inline-flex">
        <BodyDiagram
          fatigueState={fatigueState}
          onMuscleClick={onMuscleClick}
          onMuscleHover={setHoveredMuscle}
        />
        {hoveredMuscle !== null && (
          <div
            className="pointer-events-none absolute -right-2 top-0 translate-x-full rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md"
            role="tooltip"
          >
            <p className="text-sm font-semibold">{muscleLabel(hoveredMuscle)}</p>
            <div className="mt-1 flex items-center gap-2">
              <span
                className="h-3 w-3 flex-shrink-0 rounded-full border border-gray-300"
                style={{ backgroundColor: fatigueToColor(fatigueState[hoveredMuscle]) }}
              />
              <p className="text-xs text-gray-500">
                {Math.round(fatigueState[hoveredMuscle] * 100)}% fatigued
              </p>
            </div>
          </div>
        )}
      </div>
      <FatigueLegend />
    </div>
  )
}

function FatigueLegend() {
  const gradientStops = FATIGUE_COLOR_STOPS.map((s) => `${s.color} ${s.at * 100}%`).join(', ')

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="h-3 w-full rounded-full"
        style={{ background: `linear-gradient(to right, ${gradientStops})` }}
        aria-label="Fatigue color scale"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>Fully recovered</span>
        <span>Max fatigue</span>
      </div>
    </div>
  )
}
