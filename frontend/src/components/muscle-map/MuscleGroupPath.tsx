'use client'

import { useState } from 'react'
import { fatigueToColor, muscleLabel } from '@/lib/fatigue'
import type { MuscleGroup } from '@/types'

type MuscleGroupPathProps = {
  muscleId: MuscleGroup
  d: string
  fatigueValue: number
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export function MuscleGroupPath({
  muscleId,
  d,
  fatigueValue,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: MuscleGroupPathProps) {
  const [hovered, setHovered] = useState(false)
  const color = fatigueToColor(fatigueValue)
  const label = muscleLabel(muscleId)

  function handleMouseEnter() {
    setHovered(true)
    onMouseEnter?.()
  }

  function handleMouseLeave() {
    setHovered(false)
    onMouseLeave?.()
  }

  return (
    <path
      d={d}
      stroke="#6B7280"
      strokeWidth="0.8"
      style={{
        fill: color,
        fillOpacity: fatigueValue > 0 ? 0.85 : 0.35,
        transition: 'fill 0.5s ease, filter 0.15s ease',
        cursor: onClick ? 'pointer' : 'default',
        filter: hovered ? 'brightness(1.25)' : 'none',
      }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={`${label}: ${Math.round(fatigueValue * 100)}% fatigued`}
    />
  )
}
