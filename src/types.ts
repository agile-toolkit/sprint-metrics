export type Screen = 'dashboard' | 'data' | 'learn' | 'portfolio' | 'cfd' | 'evm' | 'quarterly'

export interface SprintData {
  id: string
  name: string
  planned: number
  completed: number
  carriedOver: number
  goal?: string
  mood?: number
  teamSize?: number
  absenceDays?: number
  retrospective?: string
  milestone?: string
  todo?: number
  inProgress?: number
  done?: number
}

export interface ProjectConfig {
  name: string
  targetScope: number
  sprintLengthWeeks: number
  /**
   * Total sprints planned for the release — the schedule baseline AgileEVM
   * needs to compute Planned Value. Optional: the EVM view stays hidden
   * until this is set, since it has no honest answer without a baseline.
   */
  plannedSprints?: number
}

export interface ProjectRecord {
  id: string
  name: string
  config: ProjectConfig
  sprints: SprintData[]
  createdAt: string
}

export interface MotivatorSnapshot {
  date: string
  topMotivators: string[]
  shifts?: { name: string; delta: number }[]
}

export interface TeamIdentitySnapshot {
  teamName: string
  symbol: string
  valuesCount: number
  agreementsCount: number
  membersCount: number
  savedAt: number
}
