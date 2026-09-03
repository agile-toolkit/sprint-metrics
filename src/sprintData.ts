import type { SprintData, ProjectConfig, ProjectRecord, MotivatorSnapshot } from './types'

export const PROJECTS_KEY = 'sprint-metrics-projects'
export const ACTIVE_PROJECT_KEY = 'sprint-metrics-active-project'
export const LEGACY_SPRINTS_KEY = 'sprint-metrics-sprints'
export const LEGACY_CONFIG_KEY = 'sprint-metrics-config'
export const MOTIVATOR_KEY = 'sprint-metrics:motivatorSnapshot'
export const MM_LAST_SESSION_KEY = 'moving-motivators:lastSession'
export const SM_LAST_SESSION_KEY = 'sprint-metrics:lastSession'

export const DEFAULT_CONFIG: ProjectConfig = { name: 'My Project', targetScope: 200, sprintLengthWeeks: 2 }

export function hasTwoConsecutiveDeclines(values: number[]): boolean {
  const n = values.length
  if (n < 3) return false
  return values[n - 3] > values[n - 2] && values[n - 2] > values[n - 1]
}

/**
 * Parses `raw`, falling back when it is absent, unparseable, or — with a
 * `guard` — the wrong shape.
 *
 * The guard is the point. Without one this only ever validated JSON *syntax*,
 * so a key holding valid JSON of the wrong shape sailed through the cast and
 * blew up at the first property access instead. That is not hypothetical here:
 * these keys are written by other apps in the suite, survive schema changes,
 * and can arrive half-restored from a workspace snapshot.
 */
export function tryParse<T>(
  raw: string | null,
  fallback: T,
  guard?: (value: unknown) => value is T,
): T {
  if (!raw) return fallback
  try {
    const parsed: unknown = JSON.parse(raw)
    if (guard) return guard(parsed) ? parsed : fallback
    return parsed as T
  } catch {
    return fallback
  }
}

/** A record with an `id`, which is all `initAppState` needs to trust the list. */
function isProjectRecordArray(value: unknown): value is ProjectRecord[] {
  return (
    Array.isArray(value) &&
    value.every(p => p !== null && typeof p === 'object' && typeof (p as ProjectRecord).id === 'string')
  )
}

function isSprintDataArray(value: unknown): value is SprintData[] {
  return Array.isArray(value) && value.every(s => s !== null && typeof s === 'object')
}

function isProjectConfig(value: unknown): value is ProjectConfig {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function saveProjects(ps: ProjectRecord[]) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(ps))
}

export function initAppState(): { projects: ProjectRecord[]; activeId: string; migrationPending: boolean } {
  // Guarded: this runs before first paint, so an unexpected shape here used to
  // throw on `stored[0].id` and leave a blank page with no way back.
  const stored = tryParse<ProjectRecord[]>(
    localStorage.getItem(PROJECTS_KEY), [], isProjectRecordArray,
  )
  if (stored.length > 0) {
    const savedId = localStorage.getItem(ACTIVE_PROJECT_KEY)
    const activeId = stored.find(p => p.id === savedId) ? savedId! : stored[0].id
    return { projects: stored, activeId, migrationPending: false }
  }

  // Check for legacy single-project data
  const legacySprints = tryParse<SprintData[]>(
    localStorage.getItem(LEGACY_SPRINTS_KEY), [], isSprintDataArray,
  )
  const legacyConfig = tryParse<ProjectConfig>(
    localStorage.getItem(LEGACY_CONFIG_KEY), DEFAULT_CONFIG, isProjectConfig,
  )

  if (legacySprints.length > 0) {
    const migProject: ProjectRecord = {
      id: crypto.randomUUID(),
      name: legacyConfig.name || 'My Project',
      config: legacyConfig,
      sprints: legacySprints,
      createdAt: new Date().toISOString(),
    }
    return { projects: [migProject], activeId: migProject.id, migrationPending: true }
  }

  const firstProject: ProjectRecord = {
    id: crypto.randomUUID(),
    name: 'My Project',
    config: DEFAULT_CONFIG,
    sprints: [],
    createdAt: new Date().toISOString(),
  }
  saveProjects([firstProject])
  localStorage.setItem(ACTIVE_PROJECT_KEY, firstProject.id)
  return { projects: [firstProject], activeId: firstProject.id, migrationPending: false }
}

export function loadMotivatorSnapshot(): MotivatorSnapshot | null {
  try {
    const saved = localStorage.getItem(MOTIVATOR_KEY)
    if (saved) {
      // Checked rather than cast: consumers render `topMotivators` directly.
      const parsed: unknown = JSON.parse(saved)
      if (Array.isArray((parsed as MotivatorSnapshot)?.topMotivators)) {
        return parsed as MotivatorSnapshot
      }
    }
    const mm = localStorage.getItem(MM_LAST_SESSION_KEY)
    if (mm) {
      const parsed = JSON.parse(mm)
      if (Array.isArray(parsed?.topMotivators) && parsed.topMotivators.length > 0) {
        return { date: parsed.date ?? new Date().toISOString().slice(0, 10), topMotivators: parsed.topMotivators, shifts: parsed.shifts }
      }
    }
  } catch { /* ignore */ }
  return null
}

export function saveMotivatorSnapshot(s: MotivatorSnapshot | null) {
  if (s) localStorage.setItem(MOTIVATOR_KEY, JSON.stringify(s))
  else localStorage.removeItem(MOTIVATOR_KEY)
}

export function writeLastSession(allSprints: SprintData[], config: ProjectConfig, projectId: string): void {
  if (allSprints.length === 0) return
  const last = allSprints[allSprints.length - 1]
  const totalCompleted = allSprints.reduce((s, sp) => s + sp.completed, 0)
  const avgVelocity = Math.round(totalCompleted / allSprints.length)
  const sprintsRemaining = avgVelocity > 0
    ? Math.max(0, Math.ceil((config.targetScope - totalCompleted) / avgVelocity))
    : null
  localStorage.setItem(SM_LAST_SESSION_KEY, JSON.stringify({
    projectId,
    projectName: config.name,
    lastSprintName: last.name,
    lastSprintGoal: last.goal ?? '',
    lastVelocity: last.completed,
    avgVelocity,
    lastMood: last.mood ?? null,
    targetScope: config.targetScope,
    totalCompleted,
    sprintsRemaining,
    updatedAt: new Date().toISOString(),
  }))
}

const IMPROVEMENT_BOARD_URL = 'https://agile-toolkit.github.io/improvement-board/'

/**
 * Issue #4 (agile-toolkit/improvement-board): a two-sided deep-link so a
 * poor sprint outcome (velocity/mood decline) can become an improvement
 * item with one click instead of manually re-typing the context. The
 * Improvement Board side (?prefill=&utm_source=sprint-metrics) shipped in
 * that repo; this sender half did not, so the receiver code was dead.
 */
export function buildImprovementBoardUrl(lastSprintName: string): string {
  const params = new URLSearchParams({
    prefill: `Velocity drop in ${lastSprintName}`,
    utm_source: 'sprint-metrics',
  })
  return `${IMPROVEMENT_BOARD_URL}?${params.toString()}`
}

export function parseCSV(text: string): SprintData[] {
  return text.split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const parts = line.split(',').map(p => p.trim())
      return {
        id: crypto.randomUUID(),
        name: parts[0] ?? 'Sprint',
        planned: Number(parts[1]) || 0,
        completed: Number(parts[2]) || 0,
        carriedOver: Number(parts[3]) || 0,
      }
    })
    .filter(s => s.name)
}

export function exportCSV(sprints: SprintData[], projectName: string): void {
  const header = 'Sprint Name,Planned SP,Completed SP,Carried Over,Goal,Mood,Retrospective,Milestone,To Do,In Progress,Done\n'
  const rows = sprints.map(s =>
    [s.name, s.planned, s.completed, s.carriedOver, s.goal ?? '', s.mood ?? '', `"${(s.retrospective ?? '').replace(/"/g, '""')}"`, s.milestone ?? '', s.todo ?? '', s.inProgress ?? '', s.done ?? ''].join(',')
  ).join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const date = new Date().toISOString().slice(0, 10)
  const safeName = (projectName || 'project').replace(/[^a-z0-9]/gi, '-').toLowerCase()
  a.download = `sprint-metrics-${safeName}-${date}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
