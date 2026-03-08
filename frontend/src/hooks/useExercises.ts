'use client'

import { useQuery } from '@tanstack/react-query'
import type { Exercise } from '@/types'

export function useExercises() {
  return useQuery<Exercise[]>({
    queryKey: ['exercises'],
    queryFn: async () => {
      const res = await fetch('/api/exercises')
      if (!res.ok) throw new Error('Failed to fetch exercises')
      return res.json() as Promise<Exercise[]>
    },
    staleTime: 10 * 60 * 1000, // exercises change rarely
  })
}
