import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { ProjectRecord, SprintData } from './types'
import {
  PROJECTS_KEY, ACTIVE_PROJECT_KEY, LEGACY_SPRINTS_KEY, LEGACY_CONFIG_KEY,
  MOTIVATOR_KEY, MM_LAST_SESSION_KEY, SM_LAST_SESSION_KEY, TEAM_IDENTITY_KEY,
  hasTwoConsecutiveDeclines, tryParse, saveProjects, initAppState,
  loadMotivatorSnapshot, saveMotivatorSnapshot, writeLastSession,
  parseCSV, exportCSV, buildImprovementBoardUrl, loadTeamIdentitySnapshot,
} from './sprintData'

beforeEach(() => {
  localStorage.clear()
})

function makeSprint(overrides: Partial<SprintData> = {}): SprintData {
  return { id: 's1', name: 'Sprint 1', planned: 20, completed: 18, carriedOver: 0, ...overrides }
}

describe('hasTwoConsecutiveDeclines', () => {
  it('returns false with fewer than 3 values', () => {
    expect(hasTwoConsecutiveDeclines([])).toBe(false)
    expect(hasTwoConsecutiveDeclines([5, 3])).toBe(false)
  })

  it('detects two consecutive declines at the tail', () => {
    expect(hasTwoConsecutiveDeclines([10, 8, 6])).toBe(true)
    expect(hasTwoConsecutiveDeclines([1, 10, 8, 6])).toBe(true)
  })

  it('returns false when the tail is not strictly declining', () => {
    expect(hasTwoConsecutiveDeclines([6, 8, 10])).toBe(false)
    expect(hasTwoConsecutiveDeclines([10, 6, 8])).toBe(false)
    expect(hasTwoConsecutiveDeclines([10, 10, 10])).toBe(false)
  })
})

describe('tryParse', () => {
  it('returns the fallback for null input', () => {
    expect(tryParse(null, 'fallback')).toBe('fallback')
  })

  it('returns the fallback for invalid JSON', () => {
    expect(tryParse('{not json', [])).toEqual([])
  })

  it('parses valid JSON', () => {
    expect(tryParse('[1,2,3]', [])).toEqual([1, 2, 3])
  })
})

describe('initAppState', () => {
  it('creates a first empty project when no data exists', () => {
    const state = initAppState()
    expect(state.projects).toHaveLength(1)
    expect(state.projects[0].sprints).toEqual([])
    expect(state.activeId).toBe(state.projects[0].id)
    expect(state.migrationPending).toBe(false)
    expect(localStorage.getItem(PROJECTS_KEY)).not.toBeNull()
  })

  it('migrates legacy single-project data into a ProjectRecord', () => {
    localStorage.setItem(LEGACY_SPRINTS_KEY, JSON.stringify([makeSprint()]))
    localStorage.setItem(LEGACY_CONFIG_KEY, JSON.stringify({ name: 'Legacy Proj', targetScope: 100, sprintLengthWeeks: 2 }))

    const state = initAppState()
    expect(state.migrationPending).toBe(true)
    expect(state.projects).toHaveLength(1)
    expect(state.projects[0].name).toBe('Legacy Proj')
    expect(state.projects[0].sprints).toHaveLength(1)
  })

  it('loads existing projects and falls back to the first when the saved active id is stale', () => {
    const projects: ProjectRecord[] = [
      { id: 'p1', name: 'A', config: { name: 'A', targetScope: 50, sprintLengthWeeks: 2 }, sprints: [], createdAt: '2026-01-01' },
      { id: 'p2', name: 'B', config: { name: 'B', targetScope: 50, sprintLengthWeeks: 2 }, sprints: [], createdAt: '2026-01-01' },
    ]
    saveProjects(projects)
    localStorage.setItem(ACTIVE_PROJECT_KEY, 'does-not-exist')

    const state = initAppState()
    expect(state.projects).toEqual(projects)
    expect(state.activeId).toBe('p1')
  })
})

describe('loadMotivatorSnapshot / saveMotivatorSnapshot', () => {
  it('returns null when nothing is stored', () => {
    expect(loadMotivatorSnapshot()).toBeNull()
  })

  it('reads its own snapshot key first', () => {
    saveMotivatorSnapshot({ date: '2026-09-01', topMotivators: ['Curiosity', 'Mastery'] })
    expect(loadMotivatorSnapshot()).toEqual({ date: '2026-09-01', topMotivators: ['Curiosity', 'Mastery'] })
  })

  it('falls back to a Moving Motivators session with top motivators', () => {
    localStorage.setItem(MM_LAST_SESSION_KEY, JSON.stringify({ date: '2026-08-15', topMotivators: ['Freedom'], shifts: [] }))
    expect(loadMotivatorSnapshot()).toEqual({ date: '2026-08-15', topMotivators: ['Freedom'], shifts: [] })
  })

  it('ignores a Moving Motivators session with no top motivators', () => {
    localStorage.setItem(MM_LAST_SESSION_KEY, JSON.stringify({ date: '2026-08-15', topMotivators: [] }))
    expect(loadMotivatorSnapshot()).toBeNull()
  })

  it('clears the key when saving null', () => {
    localStorage.setItem(MOTIVATOR_KEY, JSON.stringify({ date: '2026-09-01', topMotivators: ['X'] }))
    saveMotivatorSnapshot(null)
    expect(localStorage.getItem(MOTIVATOR_KEY)).toBeNull()
  })
})

describe('loadTeamIdentitySnapshot', () => {
  it('returns null when nothing is stored', () => {
    expect(loadTeamIdentitySnapshot()).toBeNull()
  })

  it('returns null for invalid JSON', () => {
    localStorage.setItem(TEAM_IDENTITY_KEY, '{not json')
    expect(loadTeamIdentitySnapshot()).toBeNull()
  })

  it('returns null when required fields are missing', () => {
    localStorage.setItem(TEAM_IDENTITY_KEY, JSON.stringify({ teamName: 'Nightwatch' }))
    expect(loadTeamIdentitySnapshot()).toBeNull()
  })

  it('parses a valid snapshot', () => {
    const snapshot = { teamName: 'Nightwatch', symbol: '🦉', valuesCount: 5, agreementsCount: 3, membersCount: 6, savedAt: 1234 }
    localStorage.setItem(TEAM_IDENTITY_KEY, JSON.stringify(snapshot))
    expect(loadTeamIdentitySnapshot()).toEqual(snapshot)
  })
})

describe('writeLastSession', () => {
  it('does nothing for an empty sprint list', () => {
    writeLastSession([], { name: 'P', targetScope: 100, sprintLengthWeeks: 2 }, 'p1')
    expect(localStorage.getItem(SM_LAST_SESSION_KEY)).toBeNull()
  })

  it('computes average velocity and sprints remaining from all sprints', () => {
    const sprints = [makeSprint({ id: 's1', completed: 10 }), makeSprint({ id: 's2', completed: 20 })]
    writeLastSession(sprints, { name: 'P', targetScope: 100, sprintLengthWeeks: 2 }, 'p1')
    const saved = JSON.parse(localStorage.getItem(SM_LAST_SESSION_KEY)!)
    expect(saved.avgVelocity).toBe(15)
    expect(saved.totalCompleted).toBe(30)
    expect(saved.sprintsRemaining).toBe(Math.ceil((100 - 30) / 15))
    expect(saved.projectId).toBe('p1')
  })

  it('reports null sprintsRemaining when average velocity is zero', () => {
    const sprints = [makeSprint({ completed: 0 })]
    writeLastSession(sprints, { name: 'P', targetScope: 100, sprintLengthWeeks: 2 }, 'p1')
    const saved = JSON.parse(localStorage.getItem(SM_LAST_SESSION_KEY)!)
    expect(saved.sprintsRemaining).toBeNull()
  })
})

describe('buildImprovementBoardUrl', () => {
  it('points at the Improvement Board endpoint with a prefilled title and utm_source tag', () => {
    const url = new URL(buildImprovementBoardUrl('Sprint 12'))
    expect(url.origin + url.pathname).toBe('https://agile-toolkit.github.io/improvement-board/')
    expect(url.searchParams.get('prefill')).toBe('Velocity drop in Sprint 12')
    expect(url.searchParams.get('utm_source')).toBe('sprint-metrics')
  })
})

describe('parseCSV', () => {
  it('parses well-formed rows', () => {
    const rows = parseCSV('Sprint 1,20,18,2\nSprint 2,25,25,0')
    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({ name: 'Sprint 1', planned: 20, completed: 18, carriedOver: 2 })
    expect(rows[1]).toMatchObject({ name: 'Sprint 2', planned: 25, completed: 25, carriedOver: 0 })
  })

  it('skips blank lines and comment lines', () => {
    const rows = parseCSV('# header comment\n\nSprint 1,10,10,0\n')
    expect(rows).toHaveLength(1)
    expect(rows[0].name).toBe('Sprint 1')
  })

  it('defaults missing numeric fields to 0', () => {
    const rows = parseCSV('Sprint 1')
    expect(rows[0]).toMatchObject({ name: 'Sprint 1', planned: 0, completed: 0, carriedOver: 0 })
  })
})

describe('exportCSV', () => {
  it('triggers a CSV download without throwing', () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    URL.createObjectURL = URL.createObjectURL ?? (() => 'blob:mock')
    URL.revokeObjectURL = URL.revokeObjectURL ?? (() => {})

    expect(() => exportCSV([makeSprint()], 'My Project')).not.toThrow()
    expect(clickSpy).toHaveBeenCalledTimes(1)
    clickSpy.mockRestore()
  })
})
