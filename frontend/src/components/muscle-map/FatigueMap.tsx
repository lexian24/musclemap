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
      <BodyDiagram
        fatigueState={fatigueState}
        onMuscleClick={onMuscleClick}
        onMuscleHover={setHoveredMuscle}
      />

      {/* Tooltip — centered below diagram so it never overflows on mobile or gets clipped by adjacent panels */}
      <div className="h-10 flex items-center justify-center">
        {hoveredMuscle !== null ? (
          <div
            role="tooltip"
            className="inline-flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-card/95 backdrop-blur-xl px-3.5 py-2.5 shadow-2xl shadow-black/50"
          >
            <span
              className="h-3 w-3 flex-shrink-0 rounded-full ring-1 ring-white/10"
              style={{ backgroundColor: fatigueToColor(fatigueState[hoveredMuscle]) }}
            />
            <p className="text-xs font-semibold text-foreground">
              {muscleLabel(hoveredMuscle)}
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              {Math.round(fatigueState[hoveredMuscle] * 100)}%
            </p>
          </div>
        ) : (
          <p className="text-[10px] text-muted-foreground/40">Hover a muscle to see fatigue</p>
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
        className="h-2 w-full rounded-full ring-1 ring-white/[0.06]"
        style={{ background: `linear-gradient(to right, ${gradientStops})` }}
        aria-label="Fatigue color scale"
      />
      <div className="flex justify-between text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">
        <span>Recovered</span>
        <span>Fatigued</span>
      </div>
    </div>
  )
}
