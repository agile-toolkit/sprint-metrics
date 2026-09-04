import { describe, it, expect } from 'vitest'
import type { SprintData, ProjectConfig } from './types'
import { computeAgileEvm } from './agileEvm'

function makeSprint(overrides: Partial<SprintData> = {}): SprintData {
  return { id: crypto.randomUUID(), name: 'Sprint', planned: 20, completed: 18, carriedOver: 0, ...overrides }
}

const baseConfig: ProjectConfig = { name: 'P', targetScope: 100, sprintLengthWeeks: 2 }

describe('computeAgileEvm', () => {
  it('returns null without a plannedSprints baseline', () => {
    expect(computeAgileEvm([], baseConfig)).toBeNull()
    expect(computeAgileEvm([], { ...baseConfig, plannedSprints: 0 })).toBeNull()
  })

  it('computes PV/EV/SPI on schedule', () => {
    // 10 sprints planned, BAC 100 SP -> PV per sprint = 10 SP.
    const config = { ...baseConfig, plannedSprints: 10 }
    const sprints = [makeSprint({ completed: 10 }), makeSprint({ completed: 10 })]
    const result = computeAgileEvm(sprints, config)!
    expect(result.pv).toBeCloseTo(20) // 2/10 * 100
    expect(result.ev).toBe(20)
    expect(result.spi).toBeCloseTo(1)
    expect(result.estimatedTotalSprints).toBeCloseTo(10)
  })

  it('flags schedule slippage when earned value trails the baseline', () => {
    const config = { ...baseConfig, plannedSprints: 10 }
    const sprints = [makeSprint({ completed: 5 }), makeSprint({ completed: 5 })]
    const result = computeAgileEvm(sprints, config)!
    expect(result.spi).toBeCloseTo(0.5) // 10 earned / 20 planned
    expect(result.estimatedTotalSprints).toBeCloseTo(20) // 10 / 0.5
  })

  it('flags running ahead of schedule when SPI > 1', () => {
    const config = { ...baseConfig, plannedSprints: 10 }
    const sprints = [makeSprint({ completed: 20 }), makeSprint({ completed: 20 })]
    const result = computeAgileEvm(sprints, config)!
    expect(result.spi).toBeCloseTo(2) // 40 earned / 20 planned
    expect(result.estimatedTotalSprints).toBeCloseTo(5) // 10 / 2
  })

  it('builds a per-sprint point series for charting', () => {
    const config = { ...baseConfig, plannedSprints: 4 }
    const sprints = [makeSprint({ name: 'S1', completed: 20 }), makeSprint({ name: 'S2', completed: 30 })]
    const result = computeAgileEvm(sprints, config)!
    expect(result.points).toEqual([
      { name: 'S1', pv: 25, ev: 20 },
      { name: 'S2', pv: 50, ev: 50 },
    ])
  })

  it('returns null spi/estimatedTotalSprints when the release has not started', () => {
    const config = { ...baseConfig, plannedSprints: 10 }
    const result = computeAgileEvm([], config)!
    expect(result.pv).toBe(0)
    expect(result.spi).toBeNull()
    expect(result.estimatedTotalSprints).toBeNull()
  })
})
