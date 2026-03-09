import {
  applySetFatigue,
  decayFatigue,
  emptyFatigueState,
  fatigueToColor,
  formatFatigue,
  recalculateFatigue,
} from './fatigue'

describe('emptyFatigueState', () => {
  it('returns 0 for all muscles', () => {
    const state = emptyFatigueState()
    for (const value of Object.values(state)) {
      expect(value).toBe(0)
    }
  })

  it('contains all expected muscle groups', () => {
    const state = emptyFatigueState()
    expect(state).toHaveProperty('chest')
    expect(state).toHaveProperty('quads')
    expect(state).toHaveProperty('calves')
  })
})

describe('applySetFatigue', () => {
  it('adds fatigue proportional to intensity and volume', () => {
    const state = emptyFatigueState()
    // 3 sets × 10 reps = 1.0 volume unit, intensity 0.8 → delta 0.8
    const next = applySetFatigue(state, [{ muscle: 'chest', intensity: 0.8 }], 3, 10)
    expect(next.chest).toBeCloseTo(0.8)
  })

  it('does not exceed 1.0', () => {
    const state = emptyFatigueState()
    const next = applySetFatigue(state, [{ muscle: 'chest', intensity: 1.0 }], 30, 10)
    expect(next.chest).toBe(1)
  })

  it('only affects targeted muscles', () => {
    const state = emptyFatigueState()
    const next = applySetFatigue(state, [{ muscle: 'biceps', intensity: 0.5 }], 3, 10)
    expect(next.chest).toBe(0)
    expect(next.biceps).toBeGreaterThan(0)
  })

  it('accumulates fatigue from multiple muscles', () => {
    const state = emptyFatigueState()
    const next = applySetFatigue(
      state,
      [
        { muscle: 'chest', intensity: 0.8 },
        { muscle: 'triceps', intensity: 0.4 },
      ],
      3,
      10,
    )
    expect(next.chest).toBeCloseTo(0.8)
    expect(next.triceps).toBeCloseTo(0.4)
  })
})

describe('decayFatigue', () => {
  it('reduces fatigue over time', () => {
    const state = { ...emptyFatigueState(), chest: 1.0 }
    // 10 hours elapsed
    const next = decayFatigue(state, 10 * 3_600_000)
    expect(next.chest).toBeLessThan(1.0)
  })

  it('does not go below 0', () => {
    const state = { ...emptyFatigueState(), chest: 0.01 }
    // 100 hours elapsed
    const next = decayFatigue(state, 100 * 3_600_000)
    expect(next.chest).toBe(0)
  })

  it('returns 0 fatigue for fresh muscles', () => {
    const state = emptyFatigueState()
    const next = decayFatigue(state, 5 * 3_600_000)
    for (const value of Object.values(next)) {
      expect(value).toBe(0)
    }
  })
})

describe('recalculateFatigue', () => {
  it('returns empty state when no sets logged', () => {
    const state = recalculateFatigue([])
    for (const value of Object.values(state)) {
      expect(value).toBe(0)
    }
  })

  it('accumulates fatigue correctly across multiple sets on the same muscle', () => {
    const now = new Date()
    // Two chest sets logged: first 3h ago, second 1h ago
    const firstSet = {
      muscles: [{ muscle: 'chest' as const, intensity: 0.5 }],
      sets: 3,
      reps: 10,
      loggedAt: new Date(now.getTime() - 3 * 3_600_000),
    }
    const secondSet = {
      muscles: [{ muscle: 'chest' as const, intensity: 0.5 }],
      sets: 3,
      reps: 10,
      loggedAt: new Date(now.getTime() - 1 * 3_600_000),
    }
    const state = recalculateFatigue([firstSet, secondSet], now)
    // The second set should add to (not replace) the first set's remaining fatigue.
    // With correct forward-simulation, chest should be higher than a single set 1h ago.
    const singleSetState = recalculateFatigue([secondSet], now)
    expect(state.chest).toBeGreaterThan(singleSetState.chest)
  })

  it('reflects recent sets with more fatigue than old sets', () => {
    const now = new Date()
    const recentSet = {
      muscles: [{ muscle: 'chest' as const, intensity: 0.8 }],
      sets: 3,
      reps: 10,
      loggedAt: new Date(now.getTime() - 1 * 3_600_000), // 1 hour ago
    }
    const oldSet = {
      muscles: [{ muscle: 'quads' as const, intensity: 0.8 }],
      sets: 3,
      reps: 10,
      loggedAt: new Date(now.getTime() - 20 * 3_600_000), // 20 hours ago
    }
    const state = recalculateFatigue([recentSet, oldSet], now)
    expect(state.chest).toBeGreaterThan(state.quads)
  })
})

describe('fatigueToColor', () => {
  it('returns white for 0 fatigue', () => {
    expect(fatigueToColor(0)).toBe('#ffffff')
  })

  it('returns deep red for 1.0 fatigue', () => {
    expect(fatigueToColor(1)).toBe('#8b0000')
  })

  it('returns a value between white and deep red for mid fatigue', () => {
    const color = fatigueToColor(0.5)
    expect(color).toMatch(/^#[0-9a-f]{6}$/)
    expect(color).not.toBe('#ffffff')
    expect(color).not.toBe('#8b0000')
  })

  it('clamps values above 1.0', () => {
    expect(fatigueToColor(1.5)).toBe(fatigueToColor(1.0))
  })

  it('clamps values below 0', () => {
    expect(fatigueToColor(-0.5)).toBe(fatigueToColor(0))
  })
})

describe('formatFatigue', () => {
  it('rounds to 2 decimal places', () => {
    expect(formatFatigue(0.12345)).toBe(0.12)
    expect(formatFatigue(0.999)).toBe(1)
    expect(formatFatigue(0.005)).toBe(0.01)
  })
})
