export type Screen = 'dashboard' | 'data' | 'learn'

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
}

export interface ProjectConfig {
  name: string
  targetScope: number
  sprintLengthWeeks: number
}

export interface MotivatorSnapshot {
  date: string
  topMotivators: string[]
  shifts?: { name: string; delta: number }[]
}
