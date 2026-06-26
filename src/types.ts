export type Screen = 'dashboard' | 'data' | 'learn' | 'portfolio' | 'cfd'

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
