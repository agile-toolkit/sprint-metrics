import { describe, it, expect } from 'vitest'
import { groupSprintsIntoQuarters, buildQuarterlyCsv } from './quarterlyRollup'
import type { SprintData } from '../types'

function sprint(overrides: Partial<SprintData> = {}): SprintData {
  return { id: crypto.randomUUID(), name: 'Sprint', planned: 20, completed: 15, carriedOver: 2, ...overrides }
}

describe('groupSprintsIntoQuarters', () => {
  it('returns an empty array for no sprints', () => {
    expect(groupSprintsIntoQuarters([], 2)).toEqual([])
  })

  it('groups by parsed quarter when every sprint name embeds one', () => {
    const sprints = [
      sprint({ name: '2026-Q1 Sprint 1', planned: 20, completed: 18 }),
      sprint({ name: '2026-Q1 Sprint 2', planned: 20, completed: 20 }),
      sprint({ name: '2026-Q2 Sprint 1', planned: 25, completed: 20 }),
    ]
    const result = groupSprintsIntoQuarters(sprints, 2)
    expect(result.map(q => q.key)).toEqual(['2026-Q1', '2026-Q2'])
    expect(result[0].sprints).toHaveLength(2)
    expect(result[0].totalPlanned).toBe(40)
    expect(result[0].totalCompleted).toBe(38)
    expect(result[1].sprints).toHaveLength(1)
  })

  it('sorts parsed quarters chronologically regardless of input order', () => {
    const sprints = [
      sprint({ name: '2026-Q2 Sprint 1' }),
      sprint({ name: '2025-Q4 Sprint 1' }),
      sprint({ name: '2026-Q1 Sprint 1' }),
    ]
    const result = groupSprintsIntoQuarters(sprints, 2)
    expect(result.map(q => q.key)).toEqual(['2025-Q4', '2026-Q1', '2026-Q2'])
  })

  it('recognizes the "Q1 2026" name order too', () => {
    const sprints = [sprint({ name: 'Q1 2026 kickoff' })]
    const result = groupSprintsIntoQuarters(sprints, 2)
    expect(result[0].key).toBe('2026-Q1')
  })

  it('falls back to insertion-order batching when not every name has a parseable quarter', () => {
    const sprints = [
      sprint({ name: 'Sprint 1' }),
      sprint({ name: '2026-Q1 kickoff' }), // one parseable name isn't enough — must be ALL
      sprint({ name: 'Sprint 3' }),
    ]
    const result = groupSprintsIntoQuarters(sprints, 2)
    expect(result.every(q => q.key.startsWith('Q'))).toBe(true)
    expect(result[0].key).not.toMatch(/^\d{4}/)
  })

  it('batches sprints into roughly quarter-sized groups based on sprint length', () => {
    // sprintLengthWeeks=2 -> ceil(13/2) = 7 sprints per quarter
    const sprints = Array.from({ length: 10 }, (_, i) => sprint({ name: `Sprint ${i + 1}` }))
    const result = groupSprintsIntoQuarters(sprints, 2)
    expect(result).toHaveLength(2)
    expect(result[0].sprints).toHaveLength(7)
    expect(result[1].sprints).toHaveLength(3)
    expect(result[0].key).toBe('Q1')
    expect(result[1].key).toBe('Q2')
  })

  it('computes velocity percent, avg mood, and avg team size per bucket', () => {
    const sprints = [
      sprint({ name: 'Sprint 1', planned: 20, completed: 10, mood: 3, teamSize: 5 }),
      sprint({ name: 'Sprint 2', planned: 20, completed: 20, mood: 5, teamSize: 7 }),
    ]
    const result = groupSprintsIntoQuarters(sprints, 6)
    expect(result).toHaveLength(1)
    expect(result[0].velocityPercent).toBe(75)
    expect(result[0].avgMood).toBe(4)
    expect(result[0].avgTeamSize).toBe(6)
  })

  it('returns null velocity percent when total planned is zero', () => {
    const result = groupSprintsIntoQuarters([sprint({ name: 'Sprint 1', planned: 0, completed: 0 })], 2)
    expect(result[0].velocityPercent).toBeNull()
  })

  it('returns null avgMood/avgTeamSize when no sprint has that data', () => {
    const result = groupSprintsIntoQuarters([sprint({ name: 'Sprint 1' })], 2)
    expect(result[0].avgMood).toBeNull()
    expect(result[0].avgTeamSize).toBeNull()
  })
})

describe('buildQuarterlyCsv', () => {
  it('produces a header row and one row per quarter', () => {
    const quarters = groupSprintsIntoQuarters([
      sprint({ name: '2026-Q1 s1', planned: 20, completed: 18, mood: 4 }),
    ], 2)
    const csv = buildQuarterlyCsv(quarters)
    const lines = csv.split('\n')
    expect(lines[0]).toBe('Quarter,Sprint Count,Total Planned,Total Completed,Total Carried Over,Velocity %,Avg Mood,Avg Team Size')
    expect(lines[1]).toBe('2026-Q1,1,20,18,2,90,4,')
  })

  it('produces just the header for no quarters', () => {
    expect(buildQuarterlyCsv([])).toBe('Quarter,Sprint Count,Total Planned,Total Completed,Total Carried Over,Velocity %,Avg Mood,Avg Team Size\n')
  })
})
