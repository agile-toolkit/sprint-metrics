import type { SprintData, ProjectConfig } from './types'

/**
 * AgileEVM — earned value management adapted to Scrum, per Sulaiman & Baham's
 * method (story points stand in for the traditional dollar-denominated
 * budget). Schedule side only: PV/EV/SPI and a schedule-derived forecast,
 * needing just `plannedSprints` — a release-length baseline. This is the
 * whole point of EVM over a plain velocity forecast: SPI flags schedule
 * slippage from the *baseline*, which can show trouble before a scope-only
 * forecast would.
 *
 * Deliberately no CPI/EAC/ETC (cost side): with cost modeled as a flat rate
 * per sprint (the only cost data this app could ask for without new
 * per-sprint tracking), AC is exactly proportional to elapsed sprints, same
 * as PV — so CPI = EV/AC collapses to EV/PV = SPI algebraically, every
 * time, regardless of the rate. That's not a second signal, it's SPI
 * wearing a cost label, and GOAL.md is explicit: never present a metric
 * without the context to read it honestly. A real CPI needs per-sprint
 * *actual* cost that can vary independently of the plan — worth a follow-up
 * feature once sprints can carry that field, not worth faking here.
 */

export interface AgileEvmPoint {
  name: string
  pv: number
  ev: number
}

export interface AgileEvmResult {
  points: AgileEvmPoint[]
  bacPoints: number
  plannedSprints: number
  elapsedSprints: number
  pv: number
  ev: number
  spi: number | null
  estimatedTotalSprints: number | null
}

/** Null when the release has no schedule baseline (`plannedSprints`) set — EVM has no honest answer without one. */
export function computeAgileEvm(sprints: SprintData[], config: ProjectConfig): AgileEvmResult | null {
  const plannedSprints = config.plannedSprints
  if (!plannedSprints || plannedSprints <= 0) return null

  const bacPoints = config.targetScope

  let cumulativeEv = 0
  const points: AgileEvmPoint[] = sprints.map((sp, i) => {
    const sprintIndex = i + 1
    cumulativeEv += sp.completed
    return {
      name: sp.name,
      pv: Math.round((sprintIndex / plannedSprints) * bacPoints * 10) / 10,
      ev: cumulativeEv,
    }
  })

  const elapsedSprints = sprints.length
  const pv = (elapsedSprints / plannedSprints) * bacPoints
  const ev = cumulativeEv
  const spi = pv > 0 ? ev / pv : null
  const estimatedTotalSprints = spi !== null && spi > 0 ? plannedSprints / spi : null

  return { points, bacPoints, plannedSprints, elapsedSprints, pv, ev, spi, estimatedTotalSprints }
}
