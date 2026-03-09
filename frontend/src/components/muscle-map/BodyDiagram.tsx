'use client'

import type { FatigueState, MuscleGroup } from '@/types'
import { MuscleGroupPath } from './MuscleGroupPath'

type MuscleDef = {
  muscleId: MuscleGroup
  d: string
}

// Front-view muscle paths (viewBox "0 0 100 260")
// Redesigned for better anatomical proportions — wider shoulders, defined waist, realistic legs.
const FRONT_MUSCLES: MuscleDef[] = [
  {
    muscleId: 'chest',
    d: 'M 27 42 Q 50 36 73 42 L 71 74 Q 50 80 29 74 Z',
  },
  {
    muscleId: 'front_delts',
    d: 'M 10 38 L 25 37 L 24 56 L 9 57 Z M 75 37 L 90 38 L 91 57 L 76 56 Z',
  },
  {
    muscleId: 'side_delts',
    d: 'M 5 40 L 11 37 L 10 60 L 4 59 Z M 89 37 L 95 40 L 96 59 L 90 60 Z',
  },
  {
    muscleId: 'biceps',
    d: 'M 6 61 L 14 59 L 13 96 L 5 97 Z M 86 59 L 94 61 L 95 97 L 87 96 Z',
  },
  {
    muscleId: 'forearms',
    d: 'M 4 98 L 15 97 L 14 138 L 3 137 Z M 85 97 L 96 98 L 97 137 L 86 138 Z',
  },
  {
    muscleId: 'abs',
    d: 'M 34 76 L 66 76 L 65 112 L 35 112 Z',
  },
  {
    muscleId: 'obliques',
    d: 'M 27 76 L 35 76 L 34 112 L 24 108 Z M 65 76 L 73 76 L 76 108 L 66 112 Z',
  },
  {
    muscleId: 'quads',
    d: 'M 28 118 L 47 118 L 46 196 L 27 194 Z M 53 118 L 72 118 L 73 194 L 54 196 Z',
  },
  {
    muscleId: 'calves',
    d: 'M 28 198 L 46 198 L 45 250 L 27 248 Z M 54 198 L 72 198 L 73 248 L 55 250 Z',
  },
]

// Back-view muscle paths (viewBox "0 0 100 260")
const BACK_MUSCLES: MuscleDef[] = [
  {
    muscleId: 'upper_back',
    d: 'M 25 40 L 75 40 L 73 80 L 27 80 Z',
  },
  {
    muscleId: 'lats',
    d: 'M 9 52 L 26 48 L 28 110 L 7 116 Z M 74 48 L 91 52 L 93 116 L 72 110 Z',
  },
  {
    muscleId: 'lower_back',
    d: 'M 29 82 L 71 82 L 73 114 L 27 114 Z',
  },
  {
    muscleId: 'rear_delts',
    d: 'M 10 38 L 25 37 L 24 56 L 9 57 Z M 75 37 L 90 38 L 91 57 L 76 56 Z',
  },
  {
    muscleId: 'triceps',
    d: 'M 5 58 L 14 56 L 13 97 L 4 98 Z M 86 56 L 95 58 L 96 98 L 87 97 Z',
  },
  {
    muscleId: 'glutes',
    d: 'M 27 116 L 73 116 L 75 156 L 25 156 Z',
  },
  {
    muscleId: 'hamstrings',
    d: 'M 27 158 L 47 158 L 46 218 L 26 216 Z M 53 158 L 73 158 L 74 216 L 54 218 Z',
  },
  {
    muscleId: 'calves',
    d: 'M 27 220 L 46 220 L 45 250 L 26 248 Z M 54 220 L 73 220 L 74 248 L 55 250 Z',
  },
]

// Premium dark body silhouette with gradient fills and depth
function BodySilhouette() {
  return (
    <g>
      {/* Gradient definitions */}
      <defs>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1E2530" />
          <stop offset="50%" stopColor="#252D3A" />
          <stop offset="100%" stopColor="#1E2530" />
        </linearGradient>
        <linearGradient id="bodyGradVert" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#262E3C" />
          <stop offset="100%" stopColor="#1A2028" />
        </linearGradient>
      </defs>

      {/* Head */}
      <ellipse cx="50" cy="14" rx="11" ry="13" fill="url(#bodyGrad)" stroke="#3A4455" strokeWidth="0.6" />
      {/* Neck */}
      <path d="M 45 26 L 55 26 L 56 37 L 44 37 Z" fill="url(#bodyGrad)" stroke="#3A4455" strokeWidth="0.5" />

      {/* Torso — wider shoulders, defined waist */}
      <path
        d="M 20 36 Q 50 30 80 36 L 76 80 Q 66 86 66 116 L 34 116 Q 34 86 24 80 Z"
        fill="url(#bodyGradVert)"
        stroke="#3A4455"
        strokeWidth="0.6"
      />

      {/* Left upper arm */}
      <path d="M 6 38 L 21 37 L 19 100 L 4 100 Z" fill="url(#bodyGrad)" stroke="#3A4455" strokeWidth="0.5" />
      {/* Right upper arm */}
      <path d="M 79 37 L 94 38 L 96 100 L 81 100 Z" fill="url(#bodyGrad)" stroke="#3A4455" strokeWidth="0.5" />

      {/* Left forearm */}
      <path d="M 3 101 L 18 101 L 17 140 L 2 139 Z" fill="url(#bodyGrad)" stroke="#3A4455" strokeWidth="0.5" />
      {/* Right forearm */}
      <path d="M 82 101 L 97 101 L 98 139 L 83 140 Z" fill="url(#bodyGrad)" stroke="#3A4455" strokeWidth="0.5" />

      {/* Left leg — tapers slightly at knee */}
      <path d="M 27 116 L 48 116 L 47 200 L 28 198 Z" fill="url(#bodyGradVert)" stroke="#3A4455" strokeWidth="0.5" />
      {/* Right leg */}
      <path d="M 52 116 L 73 116 L 72 198 L 53 200 Z" fill="url(#bodyGradVert)" stroke="#3A4455" strokeWidth="0.5" />

      {/* Left calf — slightly narrower */}
      <path d="M 28 200 L 47 200 L 46 252 L 27 250 Z" fill="url(#bodyGrad)" stroke="#3A4455" strokeWidth="0.5" />
      {/* Right calf */}
      <path d="M 53 200 L 72 200 L 73 250 L 54 252 Z" fill="url(#bodyGrad)" stroke="#3A4455" strokeWidth="0.5" />

      {/* Subtle collarbone / shoulder line highlight */}
      <path d="M 28 37 Q 50 33 72 37" fill="none" stroke="#4A5568" strokeWidth="0.4" opacity="0.5" />
    </g>
  )
}

type BodyViewProps = {
  label: string
  muscles: MuscleDef[]
  fatigueState: FatigueState
  onMuscleClick?: (muscle: MuscleGroup) => void
  onMuscleHover?: (muscle: MuscleGroup | null) => void
}

function BodyView({ label, muscles, fatigueState, onMuscleClick, onMuscleHover }: BodyViewProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
        {label}
      </span>
      <svg
        viewBox="0 0 100 260"
        className="h-auto w-44"
        aria-label={`${label} body view`}
      >
        <BodySilhouette />
        {muscles.map(({ muscleId, d }) => (
          <MuscleGroupPath
            key={muscleId}
            muscleId={muscleId}
            d={d}
            fatigueValue={fatigueState[muscleId]}
            onClick={onMuscleClick ? () => onMuscleClick(muscleId) : undefined}
            onMouseEnter={() => onMuscleHover?.(muscleId)}
            onMouseLeave={() => onMuscleHover?.(null)}
          />
        ))}
      </svg>
    </div>
  )
}

type BodyDiagramProps = {
  fatigueState: FatigueState
  onMuscleClick?: (muscle: MuscleGroup) => void
  onMuscleHover?: (muscle: MuscleGroup | null) => void
}

export function BodyDiagram({ fatigueState, onMuscleClick, onMuscleHover }: BodyDiagramProps) {
  return (
    <div className="flex gap-8 justify-center">
      <BodyView
        label="Front"
        muscles={FRONT_MUSCLES}
        fatigueState={fatigueState}
        onMuscleClick={onMuscleClick}
        onMuscleHover={onMuscleHover}
      />
      <BodyView
        label="Back"
        muscles={BACK_MUSCLES}
        fatigueState={fatigueState}
        onMuscleClick={onMuscleClick}
        onMuscleHover={onMuscleHover}
      />
    </div>
  )
}
