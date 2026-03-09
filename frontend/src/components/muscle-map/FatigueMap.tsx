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
    <div className="flex flex-col gap-5">
      <div className="relative inline-flex justify-center">
        <BodyDiagram
          fatigueState={fatigueState}
          onMuscleClick={onMuscleClick}
          onMuscleHover={setHoveredMuscle}
        />
        {hoveredMuscle !== null && (
          <div
            className="pointer-events-none absolute -right-2 top-4 translate-x-full"
            role="tooltip"
          >
            <div className="rounded-lg border border-border bg-card/90 backdrop-blur-sm px-3 py-2.5 shadow-xl shadow-black/40 min-w-[120px]">
              <p className="text-xs font-semibold text-foreground mb-1.5">
                {muscleLabel(hoveredMuscle)}
              </p>
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-full border border-white/10"
                  style={{ backgroundColor: fatigueToColor(fatigueState[hoveredMuscle]) }}
                />
                <p className="text-[11px] text-muted-foreground">
                  {Math.round(fatigueState[hoveredMuscle] * 100)}% fatigued
                </p>
              </div>
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
    <div className="space-y-2">
      <div
        className="h-2 w-full rounded-full"
        style={{ background: `linear-gradient(to right, ${gradientStops})` }}
        aria-label="Fatigue color scale"
      />
      <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
        <span>Recovered</span>
        <span>Fatigued</span>
      </div>
    </div>
  )
}
