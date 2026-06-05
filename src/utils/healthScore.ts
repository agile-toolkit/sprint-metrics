import type { SprintData, ProjectConfig } from '../types'

export function computeNormVel(sp: SprintData, config: ProjectConfig): number | null {
  if (!sp.teamSize || sp.teamSize <= 0) return null
  const availDays = sp.teamSize * config.sprintLengthWeeks * 5 - (sp.absenceDays ?? 0)
  if (availDays <= 0) return null
  return sp.completed / availDays
}

export function computeHealthScore(
  sp: SprintData,
  maxNormVel: number | null,
  config: ProjectConfig,
): number {
  // Velocity component: 0–4 pts (ratio 0.5 → 0 pts, 1.0 → 4 pts, capped)
  let velPts = 0
  if (sp.planned > 0) {
    const ratio = sp.completed / sp.planned
    velPts = Math.min(4, Math.max(0, ((ratio - 0.5) / 0.5) * 4))
  }

  // Mood component: 0–3 pts (mood=1 → 0, mood=5 → 3, absent → 1.5)
  const moodPts = sp.mood !== undefined ? ((sp.mood - 1) / 4) * 3 : 1.5

  // Capacity component: 0–3 pts (normVel / maxNormVel × 3, absent → 1.5)
  let capPts = 1.5
  if (maxNormVel !== null && maxNormVel > 0) {
    const nv = computeNormVel(sp, config)
    if (nv !== null) {
      capPts = Math.min(3, (nv / maxNormVel) * 3)
    }
  }

  return Math.round((velPts + moodPts + capPts) * 10) / 10
}

export function buildMaxNormVel(sprints: SprintData[], config: ProjectConfig): number | null {
  const vals = sprints.map(sp => computeNormVel(sp, config)).filter((v): v is number => v !== null)
  return vals.length > 0 ? Math.max(...vals) : null
}

export type HealthColor = 'red' | 'amber' | 'green'

export function getHealthColor(score: number): HealthColor {
  if (score < 4) return 'red'
  if (score < 7) return 'amber'
  return 'green'
}

export const HEALTH_BADGE_CLASSES: Record<HealthColor, string> = {
  red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}
