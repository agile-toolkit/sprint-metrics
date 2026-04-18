export type Screen = 'dashboard' | 'data' | 'learn'

export interface SprintData {
  id: string
  name: string
  planned: number
  completed: number
  carriedOver: number
}

export interface ProjectConfig {
  name: string
  targetScope: number
  sprintLengthWeeks: number
}
