import type { SprintData } from '../types'

export interface QuarterBucket {
  key: string
  label: string
  sprints: SprintData[]
  totalPlanned: number
  totalCompleted: number
  totalCarriedOver: number
  velocityPercent: number | null
  avgMood: number | null
  avgTeamSize: number | null
}

// Matches "2026-Q1", "2026 Q1", "Q1 2026" embedded anywhere in a sprint
// name, so a team that names sprints like "2026-Q1 Sprint 3" gets real
// calendar-quarter grouping instead of the insertion-order fallback.
const QUARTER_RE = /(\d{4})[\s-]*Q([1-4])|Q([1-4])[\s-]*(\d{4})/i

function parseQuarterKey(name: string): string | null {
  const m = name.match(QUARTER_RE)
  if (!m) return null
  const year = m[1] ?? m[4]
  const q = m[2] ?? m[3]
  return `${year}-Q${q}`
}

function average(values: number[]): number | null {
  return values.length > 0 ? values.reduce((s, v) => s + v, 0) / values.length : null
}

function summarize(key: string, label: string, sprints: SprintData[]): QuarterBucket {
  const totalPlanned = sprints.reduce((s, sp) => s + sp.planned, 0)
  const totalCompleted = sprints.reduce((s, sp) => s + sp.completed, 0)
  const totalCarriedOver = sprints.reduce((s, sp) => s + sp.carriedOver, 0)
  const moods = sprints.filter(sp => sp.mood !== undefined).map(sp => sp.mood as number)
  const teamSizes = sprints.filter(sp => sp.teamSize !== undefined).map(sp => sp.teamSize as number)
  return {
    key,
    label,
    sprints,
    totalPlanned,
    totalCompleted,
    totalCarriedOver,
    velocityPercent: totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : null,
    avgMood: average(moods),
    avgTeamSize: average(teamSizes),
  }
}

// Groups sprints by calendar quarter when every sprint name embeds one
// (per issue #53 question 1) — a partial match would produce a
// misleading mix of real and inferred quarters, so this only activates
// when *all* sprints agree. Otherwise falls back to insertion-order
// batching, sizing each batch to roughly one quarter (~13 weeks) worth
// of sprints given the project's sprint length.
export function groupSprintsIntoQuarters(sprints: SprintData[], sprintLengthWeeks: number): QuarterBucket[] {
  if (sprints.length === 0) return []

  const parsedKeys = sprints.map(sp => parseQuarterKey(sp.name))
  if (parsedKeys.every(k => k !== null)) {
    const order: string[] = []
    const byKey = new Map<string, SprintData[]>()
    sprints.forEach((sp, i) => {
      const key = parsedKeys[i] as string
      if (!byKey.has(key)) { byKey.set(key, []); order.push(key) }
      byKey.get(key)!.push(sp)
    })
    return order
      .sort()
      .map(key => summarize(key, key, byKey.get(key)!))
  }

  const sprintsPerQuarter = Math.max(1, Math.ceil(13 / Math.max(sprintLengthWeeks, 1)))
  const buckets: QuarterBucket[] = []
  for (let i = 0; i < sprints.length; i += sprintsPerQuarter) {
    const n = buckets.length + 1
    buckets.push(summarize(`Q${n}`, `Q${n}`, sprints.slice(i, i + sprintsPerQuarter)))
  }
  return buckets
}

// A separate download rather than folding these totals into the
// existing per-sprint CSV export (issue #53 question 2) — the per-sprint
// export's column schema is a stable contract other tools may already
// parse; a quarterly summary has a different shape entirely.
export function buildQuarterlyCsv(quarters: QuarterBucket[]): string {
  const header = 'Quarter,Sprint Count,Total Planned,Total Completed,Total Carried Over,Velocity %,Avg Mood,Avg Team Size\n'
  const rows = quarters.map(q => [
    q.label,
    q.sprints.length,
    q.totalPlanned,
    q.totalCompleted,
    q.totalCarriedOver,
    q.velocityPercent ?? '',
    q.avgMood !== null ? Math.round(q.avgMood * 10) / 10 : '',
    q.avgTeamSize !== null ? Math.round(q.avgTeamSize * 10) / 10 : '',
  ].join(',')).join('\n')
  return header + rows
}

export function downloadQuarterlyCsv(quarters: QuarterBucket[], projectName: string): void {
  const csv = buildQuarterlyCsv(quarters)
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const date = new Date().toISOString().slice(0, 10)
  const safeName = (projectName || 'project').replace(/[^a-z0-9]/gi, '-').toLowerCase()
  a.download = `sprint-metrics-${safeName}-quarterly-${date}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
