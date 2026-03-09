'use client'

import type { FatigueState, MuscleGroup } from '@/types'
import { MuscleGroupPath } from './MuscleGroupPath'

type MuscleDef = {
  muscleId: MuscleGroup
  d: string
}

// Front-view muscle paths (viewBox "0 0 100 260")
// Anatomically shaped with bezier curves for realistic muscle contours.
const FRONT_MUSCLES: MuscleDef[] = [
  {
    // Pectorals: two curved pec shapes with rounded lower border
    muscleId: 'chest',
    d: [
      // Left pec
      'M 29 44 Q 36 41 49 43 L 48 65 Q 40 72 29 68 Q 26 62 27 54 Z',
      // Right pec
      'M 71 44 Q 64 41 51 43 L 52 65 Q 60 72 71 68 Q 74 62 73 54 Z',
    ].join(' '),
  },
  {
    // Front deltoids: rounded cap on front of each shoulder
    muscleId: 'front_delts',
    d: [
      // Left front delt
      'M 12 40 Q 18 35 27 38 Q 26 50 20 55 Q 12 52 11 46 Z',
      // Right front delt
      'M 88 40 Q 82 35 73 38 Q 74 50 80 55 Q 88 52 89 46 Z',
    ].join(' '),
  },
  {
    // Side deltoids: outer shoulder caps
    muscleId: 'side_delts',
    d: [
      // Left side delt
      'M 6 44 Q 10 38 14 40 Q 13 54 10 58 Q 5 55 5 50 Z',
      // Right side delt
      'M 94 44 Q 90 38 86 40 Q 87 54 90 58 Q 95 55 95 50 Z',
    ].join(' '),
  },
  {
    // Biceps: elongated teardrop on upper arm
    muscleId: 'biceps',
    d: [
      // Left bicep
      'M 8 57 Q 14 54 18 58 Q 17 80 15 94 Q 10 96 7 93 Q 6 80 7 65 Z',
      // Right bicep
      'M 92 57 Q 86 54 82 58 Q 83 80 85 94 Q 90 96 93 93 Q 94 80 93 65 Z',
    ].join(' '),
  },
  {
    // Forearms: tapered cylinder
    muscleId: 'forearms',
    d: [
      // Left forearm
      'M 6 96 Q 14 94 17 97 Q 16 126 14 138 Q 9 140 5 138 Q 4 126 5 99 Z',
      // Right forearm
      'M 94 96 Q 86 94 83 97 Q 84 126 86 138 Q 91 140 95 138 Q 96 126 95 99 Z',
    ].join(' '),
  },
  {
    // Abs: 6-pack — three pairs of blocks with slight rounding
    muscleId: 'abs',
    d: [
      // Row 1 left
      'M 35 76 Q 36 75 44 76 L 43 88 Q 36 90 34 88 Z',
      // Row 1 right
      'M 65 76 Q 64 75 56 76 L 57 88 Q 64 90 66 88 Z',
      // Row 2 left
      'M 34 90 Q 35 89 43 90 L 42 103 Q 35 105 33 103 Z',
      // Row 2 right
      'M 66 90 Q 65 89 57 90 L 58 103 Q 65 105 67 103 Z',
      // Row 3 left
      'M 33 105 Q 34 104 42 105 L 42 116 Q 35 118 33 116 Z',
      // Row 3 right
      'M 67 105 Q 66 104 58 105 L 58 116 Q 65 118 67 116 Z',
    ].join(' '),
  },
  {
    // Obliques: diagonal slanted shapes on sides of torso
    muscleId: 'obliques',
    d: [
      // Left oblique
      'M 27 72 Q 32 70 35 74 Q 34 100 31 112 Q 25 114 22 108 Q 22 96 25 80 Z',
      // Right oblique
      'M 73 72 Q 68 70 65 74 Q 66 100 69 112 Q 75 114 78 108 Q 78 96 75 80 Z',
    ].join(' '),
  },
  {
    // Quads: wider top tapering to knee, rectus femoris dominant shape
    muscleId: 'quads',
    d: [
      // Left quad
      'M 28 119 Q 36 116 47 118 Q 48 148 46 192 Q 39 196 31 193 Q 26 150 27 130 Z',
      // Right quad
      'M 72 119 Q 64 116 53 118 Q 52 148 54 192 Q 61 196 69 193 Q 74 150 73 130 Z',
    ].join(' '),
  },
  {
    // Calves: diamond/teardrop shape on lower leg
    muscleId: 'calves',
    d: [
      // Left calf
      'M 29 196 Q 38 193 46 196 Q 46 218 43 244 Q 37 248 31 246 Q 27 220 28 206 Z',
      // Right calf
      'M 71 196 Q 62 193 54 196 Q 54 218 57 244 Q 63 248 69 246 Q 73 220 72 206 Z',
    ].join(' '),
  },
]

// Back-view muscle paths (viewBox "0 0 100 260")
const BACK_MUSCLES: MuscleDef[] = [
  {
    // Trapezius: diamond/kite shape centered on upper back
    muscleId: 'upper_back',
    d: 'M 50 38 Q 68 40 74 48 Q 70 64 66 78 Q 58 82 50 80 Q 42 82 34 78 Q 30 64 26 48 Q 32 40 50 38 Z',
  },
  {
    // Lats: large wing-like flare from armpits down to lower back
    muscleId: 'lats',
    d: [
      // Left lat
      'M 10 54 Q 18 48 27 50 Q 30 72 31 100 Q 28 110 22 114 Q 10 110 8 96 Q 6 76 8 62 Z',
      // Right lat
      'M 90 54 Q 82 48 73 50 Q 70 72 69 100 Q 72 110 78 114 Q 90 110 92 96 Q 94 76 92 62 Z',
    ].join(' '),
  },
  {
    // Lower back (erector spinae): two columns flanking lumbar spine
    muscleId: 'lower_back',
    d: [
      // Left erector
      'M 35 82 Q 42 80 47 82 L 47 116 Q 42 118 35 116 Z',
      // Right erector
      'M 65 82 Q 58 80 53 82 L 53 116 Q 58 118 65 116 Z',
    ].join(' '),
  },
  {
    // Rear deltoids: rounded cap on back of each shoulder
    muscleId: 'rear_delts',
    d: [
      // Left rear delt
      'M 10 40 Q 18 35 26 38 Q 25 52 19 58 Q 10 56 9 50 Z',
      // Right rear delt
      'M 90 40 Q 82 35 74 38 Q 75 52 81 58 Q 90 56 91 50 Z',
    ].join(' '),
  },
  {
    // Triceps: horseshoe shape on back of upper arm
    muscleId: 'triceps',
    d: [
      // Left tricep
      'M 7 57 Q 14 54 19 58 Q 20 76 17 95 Q 11 98 7 95 Q 5 80 6 66 Z',
      // Right tricep
      'M 93 57 Q 86 54 81 58 Q 80 76 83 95 Q 89 98 93 95 Q 95 80 94 66 Z',
    ].join(' '),
  },
  {
    // Glutes: two rounded shapes on buttocks
    muscleId: 'glutes',
    d: [
      // Left glute
      'M 27 118 Q 36 114 47 116 Q 50 130 48 152 Q 42 160 34 158 Q 24 154 24 140 Q 23 128 26 120 Z',
      // Right glute
      'M 73 118 Q 64 114 53 116 Q 50 130 52 152 Q 58 160 66 158 Q 76 154 76 140 Q 77 128 74 120 Z',
    ].join(' '),
  },
  {
    // Hamstrings: oval shapes on back of thigh
    muscleId: 'hamstrings',
    d: [
      // Left hamstring
      'M 27 160 Q 36 156 47 158 Q 49 184 46 212 Q 39 218 31 216 Q 25 186 26 168 Z',
      // Right hamstring
      'M 73 160 Q 64 156 53 158 Q 51 184 54 212 Q 61 218 69 216 Q 75 186 74 168 Z',
    ].join(' '),
  },
  {
    // Calves (back view): gastrocnemius — prominent diamond shape
    muscleId: 'calves',
    d: [
      // Left calf back
      'M 28 216 Q 38 213 46 216 Q 47 234 44 248 Q 37 252 31 250 Q 26 234 27 222 Z',
      // Right calf back
      'M 72 216 Q 62 213 54 216 Q 53 234 56 248 Q 63 252 69 250 Q 74 234 73 222 Z',
    ].join(' '),
  },
]

// Premium dark body silhouette with bezier-curved anatomy
function BodySilhouette() {
  return (
    <g>
      <defs>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1A2028" />
          <stop offset="50%" stopColor="#222A36" />
          <stop offset="100%" stopColor="#1A2028" />
        </linearGradient>
        <linearGradient id="bodyGradVert" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#222A36" />
          <stop offset="100%" stopColor="#161D24" />
        </linearGradient>
      </defs>

      {/* Head */}
      <ellipse cx="50" cy="13" rx="10" ry="12" fill="url(#bodyGrad)" stroke="#3A4455" strokeWidth="0.6" />

      {/* Neck */}
      <path d="M 46 24 Q 50 22 54 24 L 55 36 Q 50 34 45 36 Z" fill="url(#bodyGrad)" stroke="#3A4455" strokeWidth="0.5" />

      {/* Torso: wide shoulders curving in at waist, slight hip flare */}
      <path
        d="M 18 36 Q 50 28 82 36 Q 78 58 76 80 Q 70 88 68 116 L 32 116 Q 30 88 24 80 Q 22 58 18 36 Z"
        fill="url(#bodyGradVert)"
        stroke="#3A4455"
        strokeWidth="0.6"
      />

      {/* Left upper arm: slightly curved */}
      <path d="M 5 44 Q 12 40 20 44 Q 20 72 18 100 Q 12 102 6 100 Q 4 72 4 56 Z" fill="url(#bodyGrad)" stroke="#3A4455" strokeWidth="0.5" />
      {/* Right upper arm */}
      <path d="M 95 44 Q 88 40 80 44 Q 80 72 82 100 Q 88 102 94 100 Q 96 72 96 56 Z" fill="url(#bodyGrad)" stroke="#3A4455" strokeWidth="0.5" />

      {/* Left forearm: tapering cylinder */}
      <path d="M 5 101 Q 12 99 18 101 Q 17 128 15 140 Q 9 142 4 140 Q 3 126 4 106 Z" fill="url(#bodyGrad)" stroke="#3A4455" strokeWidth="0.5" />
      {/* Right forearm */}
      <path d="M 95 101 Q 88 99 82 101 Q 83 128 85 140 Q 91 142 96 140 Q 97 126 96 106 Z" fill="url(#bodyGrad)" stroke="#3A4455" strokeWidth="0.5" />

      {/* Left upper leg: tapers at knee */}
      <path d="M 26 116 Q 36 114 48 116 Q 49 150 47 194 Q 39 198 31 196 Q 24 154 24 130 Z" fill="url(#bodyGradVert)" stroke="#3A4455" strokeWidth="0.5" />
      {/* Right upper leg */}
      <path d="M 74 116 Q 64 114 52 116 Q 51 150 53 194 Q 61 198 69 196 Q 76 154 76 130 Z" fill="url(#bodyGradVert)" stroke="#3A4455" strokeWidth="0.5" />

      {/* Left lower leg */}
      <path d="M 27 196 Q 38 193 47 196 Q 46 228 43 252 Q 36 256 30 254 Q 25 228 26 206 Z" fill="url(#bodyGrad)" stroke="#3A4455" strokeWidth="0.5" />
      {/* Right lower leg */}
      <path d="M 73 196 Q 62 193 53 196 Q 54 228 57 252 Q 64 256 70 254 Q 75 228 74 206 Z" fill="url(#bodyGrad)" stroke="#3A4455" strokeWidth="0.5" />

      {/* Collarbone / shoulder highlight */}
      <path d="M 26 37 Q 50 32 74 37" fill="none" stroke="#4A5568" strokeWidth="0.4" opacity="0.5" />
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
        className="h-auto w-36"
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
    <div className="flex gap-4 justify-center">
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
