'use client'

import { useState } from 'react'
import type { FatigueState, MuscleGroup } from '@/types'
import { MuscleGroupPath } from './MuscleGroupPath'
import { ANATOMY_PATHS, type AnatomyGender, type MusclePathEntry } from './anatomyPaths'

// ─── New anatomy-based body diagram ────────────────────────────────────────
// Uses detailed anatomical SVG paths from vue-human-muscle-anatomy.
// viewBox 0 0 1024 1024: front view on the left half, back view on the right half.
// Both views are rendered in a single SVG with the full path data.
// ────────────────────────────────────────────────────────────────────────────

function GenderToggle({
  gender,
  onChange,
}: {
  gender: AnatomyGender
  onChange: (g: AnatomyGender) => void
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-white/[0.08] bg-card/60 backdrop-blur-sm p-0.5 gap-0.5">
      <button
        type="button"
        onClick={() => onChange('male')}
        className={`px-3 py-1 rounded-md text-[11px] font-semibold tracking-wide transition-all ${
          gender === 'male'
            ? 'bg-white/[0.1] text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground/70'
        }`}
      >
        Male
      </button>
      <button
        type="button"
        onClick={() => onChange('female')}
        className={`px-3 py-1 rounded-md text-[11px] font-semibold tracking-wide transition-all ${
          gender === 'female'
            ? 'bg-white/[0.1] text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground/70'
        }`}
      >
        Female
      </button>
    </div>
  )
}

function AnatomyMusclePath({
  entry,
  fatigueValue,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: {
  entry: MusclePathEntry
  fatigueValue: number
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}) {
  return (
    <g transform={entry.transform}>
      <MuscleGroupPath
        muscleId={entry.id}
        d={entry.d}
        fatigueValue={fatigueValue}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />
    </g>
  )
}

type BodyDiagramProps = {
  fatigueState: FatigueState
  onMuscleClick?: (muscle: MuscleGroup) => void
  onMuscleHover?: (muscle: MuscleGroup | null) => void
}

export function BodyDiagram({ fatigueState, onMuscleClick, onMuscleHover }: BodyDiagramProps) {
  const [gender, setGender] = useState<AnatomyGender>('male')
  const anatomy = ANATOMY_PATHS[gender]

  const bodyFill = '#151C24'
  const bodyStroke = '#2A3444'

  return (
    <div className="flex flex-col items-center gap-3">
      <GenderToggle gender={gender} onChange={setGender} />

      <div className="flex gap-2 sm:gap-4 justify-center">
        {/* Front view label */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">
            Front
          </span>
        </div>
        {/* Back view label */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">
            Back
          </span>
        </div>
      </div>

      <svg
        viewBox={anatomy.viewBox}
        className="h-auto w-full max-w-[400px]"
        aria-label={`${gender} body diagram showing muscle fatigue`}
      >
        {/* Outline-back (body silhouette, back view — right half) */}
        <g transform={anatomy.outlineBackTransform}>
          <path
            d={anatomy.outlineBack}
            fill={bodyFill}
            stroke={bodyStroke}
            strokeWidth="1"
          />
        </g>

        {/* Outline-front (body silhouette, front view — left half) */}
        <path
          d={anatomy.outlineFront}
          fill={bodyFill}
          stroke={bodyStroke}
          strokeWidth="1"
        />

        {/* Muscle group paths with fatigue colors */}
        {anatomy.muscles.map((entry, i) => (
          <AnatomyMusclePath
            key={`${entry.id}-${i}`}
            entry={entry}
            fatigueValue={fatigueState[entry.id]}
            onClick={onMuscleClick ? () => onMuscleClick(entry.id) : undefined}
            onMouseEnter={() => onMuscleHover?.(entry.id)}
            onMouseLeave={() => onMuscleHover?.(null)}
          />
        ))}
      </svg>
    </div>
  )
}
